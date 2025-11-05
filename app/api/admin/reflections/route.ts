import { writeClient } from "@/lib/sanity.client";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { marked } from "marked";

// Configure marked for safer rendering
marked.setOptions({
	breaks: false, // Use proper paragraph spacing instead of line breaks
	gfm: true,
} as any);

function markdownToPortableText(markdown: string) {
	// Parse markdown into Portable Text blocks
	const lines = markdown.split("\n");
	const blocks: any[] = [];
	let currentBlock: any | null = null;

	for (const line of lines) {
		const trimmedLine = line.trim();

		// Headings
		if (trimmedLine.startsWith("# ")) {
			if (currentBlock) blocks.push(currentBlock);
			currentBlock = {
				_type: "block",
				style: "h1",
				children: [{ _type: "span", text: trimmedLine.substring(2) }],
			};
		} else if (trimmedLine.startsWith("## ")) {
			if (currentBlock) blocks.push(currentBlock);
			currentBlock = {
				_type: "block",
				style: "h2",
				children: [{ _type: "span", text: trimmedLine.substring(3) }],
			};
		} else if (trimmedLine.startsWith("### ")) {
			if (currentBlock) blocks.push(currentBlock);
			currentBlock = {
				_type: "block",
				style: "h3",
				children: [{ _type: "span", text: trimmedLine.substring(4) }],
			};
		} else if (trimmedLine.startsWith("#### ")) {
			if (currentBlock) blocks.push(currentBlock);
			currentBlock = {
				_type: "block",
				style: "h4",
				children: [{ _type: "span", text: trimmedLine.substring(5) }],
			};
		} else if (trimmedLine.startsWith("- ") || trimmedLine.startsWith("* ")) {
			// Bullet lists
			if (currentBlock) blocks.push(currentBlock);
			currentBlock = {
				_type: "block",
				listItem: "bullet",
				style: "normal",
				level: 1,
				children: [{ _type: "span", text: trimmedLine.substring(2) }],
			};
		} else if (/^\d+\. /.test(trimmedLine)) {
			// Numbered lists
			if (currentBlock) blocks.push(currentBlock);
			currentBlock = {
				_type: "block",
				listItem: "number",
				style: "normal",
				level: 1,
				children: [{ _type: "span", text: trimmedLine.replace(/^\d+\. /, "") }],
			};
		} else if (trimmedLine === "") {
			// Empty line - end current block
			if (currentBlock) {
				blocks.push(currentBlock);
				currentBlock = null;
			}
		} else {
			// Regular paragraph
			if (!currentBlock) {
				currentBlock = {
					_type: "block",
					style: "normal",
					children: [],
				};
			}
			// Handle inline formatting (bold, italic, links)
			let text = trimmedLine;
			const children: any[] = [];
			let currentIndex = 0;

			// Simple regex for bold **text**
			const boldRegex = /\*\*([^*]+)\*\*/g;
			const italicRegex = /\*([^*]+)\*/g;
			const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;

			// Process bold
			let match;
			let lastIndex = 0;
			const allMatches: Array<{ type: string; start: number; end: number; text: string; url?: string }> = [];

			// Find all formatting matches
			while ((match = boldRegex.exec(text)) !== null) {
				allMatches.push({ type: "bold", start: match.index, end: match.index + match[0].length, text: match[1] });
			}
			while ((match = italicRegex.exec(text)) !== null) {
				allMatches.push({ type: "italic", start: match.index, end: match.index + match[0].length, text: match[1] });
			}
			while ((match = linkRegex.exec(text)) !== null) {
				allMatches.push({
					type: "link",
					start: match.index,
					end: match.index + match[0].length,
					text: match[1],
					url: match[2],
				});
			}

			// Sort matches by position
			allMatches.sort((a, b) => a.start - b.start);

			// Build children array
			lastIndex = 0;
			for (const match of allMatches) {
				// Add text before match
				if (match.start > lastIndex) {
					children.push({ _type: "span", text: text.substring(lastIndex, match.start) });
				}
				// Add formatted text
				if (match.type === "bold") {
					children.push({ _type: "span", text: match.text, marks: ["strong"] });
				} else if (match.type === "italic") {
					children.push({ _type: "span", text: match.text, marks: ["em"] });
				} else if (match.type === "link") {
					children.push({
						_type: "span",
						text: match.text,
						marks: ["link"],
					});
					// Note: Portable Text links need to be handled differently
					// For now, we'll store the link info in the mark
				}
				lastIndex = match.end;
			}
			// Add remaining text
			if (lastIndex < text.length) {
				children.push({ _type: "span", text: text.substring(lastIndex) });
			}

			// If no formatting found, just add plain text
			if (children.length === 0) {
				children.push({ _type: "span", text: trimmedLine });
			}

			currentBlock.children = children;
			blocks.push(currentBlock);
			currentBlock = null;
		}
	}

	if (currentBlock) {
		blocks.push(currentBlock);
	}

	// If no blocks created, create a default one
	if (blocks.length === 0) {
		return [
			{
				_type: "block",
				style: "normal",
				children: [{ _type: "span", text: markdown }],
			},
		];
	}

	return blocks;
}

export async function POST(request: Request) {
	try {
		// Check admin authentication
		const cookieStore = await cookies();
		const adminCookie = cookieStore.get("admin");
		if (!adminCookie || adminCookie.value !== "1") {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const body = await request.json();
		const { title, date, author, scripture, content, isPublished } = body;

		if (!title || !date || !content) {
			return NextResponse.json({ error: "Title, date, and content are required" }, { status: 400 });
		}

		// Convert markdown content to Portable Text format
		const portableTextContent = markdownToPortableText(content);

		const doc = {
			_type: "dailyReflection",
			title,
			date,
			content: portableTextContent,
			isPublished: isPublished || false,
			createdAt: new Date().toISOString(),
		};

		if (author) {
			(doc as any).author = author;
		}
		if (scripture) {
			(doc as any).scripture = scripture;
		}

		const result = await writeClient.create(doc);

		revalidatePath("/reflections");
		revalidatePath("/admin/reflections");

		return NextResponse.json({ success: true, id: result._id });
	} catch (error: any) {
		console.error("Error creating reflection:", error);
		return NextResponse.json({ error: error.message || "Failed to create reflection" }, { status: 500 });
	}
}

