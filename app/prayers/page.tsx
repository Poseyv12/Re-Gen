import { readClient } from "@/lib/sanity.client";
import { queryApprovedPrayers } from "@/lib/sanity.queries";
import type { PrayerRequestDoc } from "@/lib/types";
import { PortableText } from "@portabletext/react";
import type { Metadata } from "next";
import Link from "next/link";
import { FiHeart, FiHeart as FiPrayer, FiCheckCircle } from "react-icons/fi";
import PrayerButton from "./PrayerButton";
import UserAvatar from "./UserAvatar";

export async function generateMetadata(): Promise<Metadata> {
	return {
		title: "Prayer Wall | Re:Generation",
		description: "Lift up and pray for our group. Approved requests only.",
		openGraph: {
			title: "Prayer Wall | Re:Generation",
			description: "Lift up and pray for our group. Approved requests only.",
		},
	};
}

export default async function PrayerWallPage() {
	const prayers = await readClient.fetch<PrayerRequestDoc[]>(queryApprovedPrayers);

	return (
		<div className="mx-auto max-w-6xl px-4 py-6 sm:py-12 sm:px-6 lg:px-8">
			<div className="mb-6 sm:mb-10 text-center">
				<h1 className="text-3xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight mb-2 sm:mb-3 gradient-text">Prayer Wall</h1>
				<p className="text-sm sm:text-base lg:text-lg text-[var(--muted)] font-medium px-2">A peaceful place to share and lift one another up</p>
			</div>

			{prayers.length === 0 ? (
				<div className="text-center py-12 sm:py-16 rounded-2xl border-2 border-[var(--border)] bg-[var(--card)] px-4">
					<div className="flex justify-center mb-4">
						<FiPrayer className="w-16 h-16 sm:w-20 sm:h-20 text-[var(--neon-pink)]" />
					</div>
					<p className="text-[var(--muted)] text-base sm:text-lg font-medium">No prayer requests yet.</p>
					<p className="text-[var(--muted)] text-sm mt-2">Check back soon or submit a request.</p>
				</div>
			) : (
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
					{prayers.map((p) => (
						<Link
							key={p._id}
							href={`/prayers/${p._id}`}
							className="prayer-card card-hover group rounded-2xl border-2 border-[var(--border)] bg-[var(--card)] p-4 sm:p-6 shadow-lg transition-all block"
						>
							<header className="mb-3 sm:mb-4 flex items-start justify-between gap-2 sm:gap-3">
								<div className="flex-1 min-w-0">
									<div className="flex items-center gap-2 mb-2 flex-wrap">
										<h2 className="text-base sm:text-lg font-bold text-[var(--foreground)] group-hover:text-[var(--neon-cyan)] transition-colors line-clamp-2">
											{p.title || "Prayer Request"}
										</h2>
										{p.isAnswered && (
											<span className="inline-flex items-center gap-1 rounded-full bg-[var(--neon-yellow)]/20 px-2 py-0.5 text-xs font-bold text-[var(--neon-yellow)] border border-[var(--neon-yellow)]/30 flex-shrink-0">
												<FiCheckCircle className="w-3 h-3" />
												Answered
											</span>
										)}
									</div>
									<div className="flex flex-wrap items-center gap-2 text-xs text-[var(--muted)] font-medium">
										<span className="whitespace-nowrap">
											{new Date(p._createdAt).toLocaleDateString("en-US", {
												month: "short",
												day: "numeric",
												year: "numeric",
											})}
										</span>
										{p.group && (
											<span className="inline-flex items-center rounded-full bg-[var(--neon-pink)]/20 px-2 py-0.5 font-bold text-[var(--neon-pink)] border border-[var(--neon-pink)]/30 text-xs">
												{p.group}
											</span>
										)}
									</div>
								</div>
								<div className="flex-shrink-0">
									<FiHeart className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--neon-pink)] fill-[var(--neon-pink)]" />
								</div>
							</header>

							<div className="prose prose-zinc max-w-none mb-4 sm:mb-5 text-[var(--foreground)] leading-relaxed prose-invert prose-sm sm:prose-base line-clamp-3">
								<PortableText value={p.content} />
							</div>

							<footer className="flex items-center justify-between pt-3 sm:pt-4 border-t border-[var(--border)]">
								<div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
									<UserAvatar name={p.name || ""} isAnonymous={p.isAnonymous} userId={p.userId} noLink={true} size="sm" />
									<span className="text-xs sm:text-sm text-[var(--muted)] font-medium truncate">
										{p.isAnonymous ? "Anonymous" : p.name || "Member"}
									</span>
								</div>
								<div className="flex items-center gap-2 flex-shrink-0">
									{(p.prayedCount || 0) > 0 && (
										<span className="flex items-center gap-1 text-xs text-[var(--neon-yellow)] font-bold">
											<FiPrayer className="w-3 h-3" />
											{p.prayedCount}
										</span>
									)}
									<span className="text-xs text-[var(--muted)] font-medium">→</span>
								</div>
							</footer>
						</Link>
					))}
				</div>
			)}
		</div>
	);
}

export const dynamic = "force-dynamic";
