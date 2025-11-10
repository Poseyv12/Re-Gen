import { readClient } from "@/lib/sanity.client";
import { queryApprovedTestimonies } from "@/lib/sanity.queries";
import type { TestimonyDoc } from "@/lib/types";
import { PortableText } from "@portabletext/react";
import type { Metadata } from "next";
import Link from "next/link";
import { FiStar, FiPlus } from "react-icons/fi";
import UserAvatar from "../prayers/UserAvatar";

export async function generateMetadata(): Promise<Metadata> {
	return {
		title: "Testimonies | Re:Generation",
		description: "Stories of God's work in our lives. Share your testimony and be encouraged by others.",
		openGraph: {
			title: "Testimonies | Re:Generation",
			description: "Stories of God's work in our lives. Share your testimony and be encouraged by others.",
		},
	};
}

export default async function TestimoniesPage() {
	const testimonies = await readClient.fetch<TestimonyDoc[]>(queryApprovedTestimonies);

	return (
		<div className="mx-auto max-w-6xl px-4 py-6 sm:py-12 sm:px-6 lg:px-8">
			<div className="mb-6 sm:mb-10 text-center">
				<h1 className="text-3xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight mb-2 sm:mb-3 gradient-text">Testimonies</h1>
				<p className="text-sm sm:text-base lg:text-lg text-[var(--muted)] font-medium px-2">Stories of God's work in our lives</p>
			</div>

			<div className="mb-6 sm:mb-8 flex justify-center">
				<Link
					href="/testimonies/submit"
					className="inline-flex items-center gap-2 rounded-lg border-2 border-[var(--neon-pink)] bg-[var(--neon-pink)] px-5 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-bold text-white uppercase tracking-wider hover:bg-[var(--neon-pink)]/90 hover:scale-105 transition-all shadow-lg"
				>
					<FiPlus className="w-4 h-4 sm:w-5 sm:h-5" />
					Share Your Testimony
				</Link>
			</div>

			{testimonies.length === 0 ? (
				<div className="text-center py-12 sm:py-16 rounded-2xl border-2 border-[var(--border)] bg-[var(--card)] px-4">
					<div className="flex justify-center mb-4">
						<FiStar className="w-16 h-16 sm:w-20 sm:h-20 text-[var(--neon-yellow)]" />
					</div>
					<p className="text-[var(--muted)] text-base sm:text-lg font-medium">No testimonies yet.</p>
					<p className="text-[var(--muted)] text-sm mt-2">Be the first to share how God has worked in your life!</p>
				</div>
			) : (
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
					{testimonies.map((testimony) => (
							<article
							key={testimony._id}
							className="testimony-card card-hover group rounded-2xl border-2 border-[var(--border)] bg-[var(--card)] p-4 sm:p-6 shadow-lg transition-all"
							>
							<header className="mb-3 sm:mb-4 flex items-start justify-between gap-2 sm:gap-3">
								<div className="flex-1 min-w-0">
									<h2 className="text-base sm:text-lg font-bold text-[var(--foreground)] group-hover:text-[var(--neon-yellow)] transition-colors mb-2 line-clamp-2">
										{testimony.title || "Testimony"}
									</h2>
									<div className="flex flex-wrap items-center gap-2 text-xs text-[var(--muted)] font-medium">
										<span className="whitespace-nowrap">
											{new Date(testimony._createdAt).toLocaleDateString("en-US", {
												month: "short",
												day: "numeric",
											year: "numeric",
											})}
										</span>
										{testimony.group && (
											<span className="inline-flex items-center rounded-full bg-[var(--neon-yellow)]/20 px-2 py-0.5 font-bold text-[var(--neon-yellow)] border border-[var(--neon-yellow)]/30 text-xs">
												{testimony.group}
											</span>
										)}
									</div>
								</div>
								<div className="flex-shrink-0">
									<FiStar className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--neon-yellow)] fill-[var(--neon-yellow)]" />
								</div>
							</header>

							<div className="prose prose-zinc max-w-none mb-4 sm:mb-5 text-[var(--foreground)] leading-relaxed prose-invert prose-sm sm:prose-base line-clamp-4">
								<PortableText value={testimony.content} />
							</div>

							<footer className="flex items-center justify-between pt-3 sm:pt-4 border-t border-[var(--border)]">
								<div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
									<UserAvatar name={testimony.name || ""} isAnonymous={testimony.isAnonymous} userId={testimony.userId} noLink={true} size="sm" />
									<span className="text-xs sm:text-sm text-[var(--muted)] font-medium truncate">
										{testimony.isAnonymous ? "Anonymous" : testimony.name || "Member"}
									</span>
								</div>
								{(testimony.encouragedCount || 0) > 0 && (
									<span className="flex items-center gap-1 text-xs text-[var(--neon-yellow)] font-bold flex-shrink-0">
										<FiStar className="w-3 h-3" />
										{testimony.encouragedCount}
									</span>
								)}
							</footer>
							</article>
						))}
				</div>
			)}
		</div>
	);
}

export const dynamic = "force-dynamic";

