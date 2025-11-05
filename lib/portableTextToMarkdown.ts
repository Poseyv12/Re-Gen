/**
 * Convert Portable Text blocks to markdown string
 */
export function portableTextToMarkdown(blocks: any[]): string {
	if (!blocks || !Array.isArray(blocks)) return "";

	return blocks
		.map((block) => {
			if (block._type !== "block") return "";

			const text = block.children
				?.map((child: any) => {
					if (child._type === "span") {
						let text = child.text || "";
						const marks = child.marks || [];

						// Apply marks in reverse order (inner to outer)
						marks.forEach((mark: any) => {
							if (typeof mark === "string") {
								if (mark === "strong") text = `**${text}**`;
								if (mark === "em") text = `*${text}*`;
							} else if (mark._type === "link") {
								text = `[${text}](${mark.href || ""})`;
							}
						});

						return text;
					}
					return "";
				})
				.join("");

			if (!text) return "";

			// Apply block-level formatting
			if (block.style === "h1") return `# ${text}`;
			if (block.style === "h2") return `## ${text}`;
			if (block.style === "h3") return `### ${text}`;
			if (block.style === "h4") return `#### ${text}`;
			if (block.listItem === "bullet") return `- ${text}`;
			if (block.listItem === "number") return `1. ${text}`;

			return text;
		})
		.filter((line) => line.length > 0)
		.join("\n\n");
}

