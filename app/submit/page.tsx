import { writeClient } from "@/lib/sanity.client";
import { getCurrentUser } from "@/lib/auth";
import type { Metadata } from "next";
import { revalidatePath } from "next/cache";
import { PortableTextBlock } from "sanity";
import { redirect } from "next/navigation";

export async function generateMetadata(): Promise<Metadata> {
	return {
		title: "Submit a Prayer Request",
		description: "Share your request. It will be reviewed before publishing.",
	};
}

async function createPrayer(formData: FormData) {
	"use server";
	const user = await getCurrentUser();
	const name = (formData.get("name") as string) || "";
	const isAnonymous = (formData.get("isAnonymous") as string) === "on";
	const title = (formData.get("title") as string) || "";
	const content = (formData.get("content") as string) || "";
	const group = (formData.get("group") as string) || "";

	if (!content.trim()) {
		throw new Error("Content is required");
	}

	const prayerData: any = {
		_type: "prayerRequest",
		name: name || undefined,
		isAnonymous: !!isAnonymous,
		title: title || undefined,
		content: [{ _type: "block", children: [{ _type: "span", text: content }] }] as PortableTextBlock[],
		group: group || undefined,
		status: "pending",
	};

	// Link user if logged in and not anonymous
	if (user?.id && !isAnonymous) {
		prayerData.user = {
			_type: "reference",
			_ref: user.id,
		};
		// Use logged-in user's name if name field is empty
		if (!name && user.name) {
			prayerData.name = user.name;
		}
	}

	await writeClient.create(prayerData);

	revalidatePath("/prayers");
	redirect("/thanks");
}

export default async function SubmitPage() {
	return (
		<div className="mx-auto max-w-2xl px-4 py-6 sm:py-12 sm:px-6 lg:px-8">
			<div className="mb-6 sm:mb-8 text-center">
				<h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-2 sm:mb-3 gradient-text">Share a Prayer Request</h1>
				<p className="text-sm sm:text-base lg:text-lg text-[var(--muted)] font-medium px-2">Your request will be reviewed by an admin before it appears on the wall.</p>
			</div>

			<div className="rounded-2xl border-2 border-[var(--border)] bg-[var(--card)] p-4 sm:p-8 shadow-lg">
				<form action={createPrayer} className="space-y-4 sm:space-y-6">
					<div>
						<label htmlFor="name" className="block text-xs sm:text-sm font-bold text-[var(--foreground)] mb-2 uppercase tracking-wider">
							Your name <span className="text-[var(--muted)] font-normal normal-case">(optional)</span>
						</label>
						<input
							id="name"
							name="name"
							type="text"
							className="w-full rounded-lg border-2 border-[var(--border)] bg-[var(--card)] px-4 py-3 text-base text-[var(--foreground)] placeholder:text-[var(--muted)] transition-all"
							placeholder="John Doe"
						/>
					</div>

					<div className="flex items-center gap-3">
						<input
							id="anon"
							type="checkbox"
							name="isAnonymous"
							className="h-5 w-5 sm:h-6 sm:w-6 rounded border-2 border-[var(--border)] text-[var(--neon-pink)] focus:ring-2 focus:ring-[var(--neon-pink)] cursor-pointer"
						/>
						<label htmlFor="anon" className="text-xs sm:text-sm font-bold text-[var(--foreground)] cursor-pointer uppercase tracking-wider">
							Post as Anonymous
						</label>
					</div>

					<div>
						<label htmlFor="title" className="block text-xs sm:text-sm font-bold text-[var(--foreground)] mb-2 uppercase tracking-wider">
							Title <span className="text-[var(--muted)] font-normal normal-case">(optional)</span>
						</label>
						<input
							id="title"
							name="title"
							type="text"
							className="w-full rounded-lg border-2 border-[var(--border)] bg-[var(--card)] px-4 py-3 text-base text-[var(--foreground)] placeholder:text-[var(--muted)] transition-all"
							placeholder="e.g., Health concerns, Job situation, Family needs"
						/>
					</div>

					<div>
						<label htmlFor="group" className="block text-xs sm:text-sm font-bold text-[var(--foreground)] mb-2 uppercase tracking-wider">
							Group <span className="text-[var(--muted)] font-normal normal-case">(optional)</span>
						</label>
						<input
							id="group"
							name="group"
							type="text"
							className="w-full rounded-lg border-2 border-[var(--border)] bg-[var(--card)] px-4 py-3 text-base text-[var(--foreground)] placeholder:text-[var(--muted)] transition-all"
							placeholder="e.g., Re:Gen Monday"
						/>
					</div>

					<div>
						<label htmlFor="content" className="block text-xs sm:text-sm font-bold text-[var(--foreground)] mb-2 uppercase tracking-wider">
							Prayer Request <span className="text-[var(--neon-pink)]">*</span>
						</label>
						<textarea
							id="content"
							name="content"
							required
							rows={6}
							className="w-full rounded-lg border-2 border-[var(--border)] bg-[var(--card)] px-4 py-3 text-base text-[var(--foreground)] placeholder:text-[var(--muted)] transition-all resize-y min-h-[120px]"
							placeholder="Share your prayer request here..."
						/>
					</div>

					<button type="submit" className="btn-retro w-full rounded-lg px-6 py-3 sm:py-4 text-sm sm:text-base font-bold uppercase tracking-wider">
						Submit for Review
					</button>
				</form>
			</div>
		</div>
	);
}
