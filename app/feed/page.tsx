import { getCurrentUser } from "@/lib/auth";
import { readClient } from "@/lib/sanity.client";
import { queryFeedPrayers } from "@/lib/sanity.queries";
import type { PrayerRequestDoc } from "@/lib/types";
import { PortableText } from "@portabletext/react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { FiUsers } from "react-icons/fi";
import PrayerButton from "../prayers/PrayerButton";
import UserAvatar from "../prayers/UserAvatar";

export default async function FeedPage() {
	const user = await getCurrentUser();
	if (!user) {
		redirect("/auth/signin");
	}

	const prayers = await readClient.fetch<PrayerRequestDoc[]>(queryFeedPrayers, { userId: user.id });

	return (
		<div className="mx-auto max-w-4xl px-4 py-6 sm:py-12 sm:px-6 lg:px-8">
			<div className="mb-6 sm:mb-10 text-center">
				<h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-2 sm:mb-3 gradient-text">Prayer Feed</h1>
				<p className="text-sm sm:text-base lg:text-lg text-[var(--muted)] font-medium px-2">Prayers from people you follow</p>
			</div>

			{prayers.length === 0 ? (
				<div className="text-center py-12 sm:py-20 rounded-2xl border-2 border-[var(--border)] bg-[var(--card)] shadow-lg px-4">
					<div className="flex justify-center mb-4 sm:mb-6">
						<FiUsers className="w-16 h-16 sm:w-20 sm:h-20 text-[var(--neon-cyan)]" />
					</div>
					<h2 className="text-xl sm:text-2xl font-bold text-[var(--foreground)] mb-2">No prayers yet</h2>
					<p className="text-[var(--muted)] text-base sm:text-lg font-medium mb-2">Follow people to see their prayer requests here!</p>
					<p className="text-[var(--muted)] text-sm mb-4 sm:mb-6">Discover prayer requests from the community and connect with others.</p>
					<Link
						href="/prayers"
						className="inline-block btn-retro-cyan rounded-lg px-5 sm:px-6 py-2.5 sm:py-3 text-sm font-bold text-white uppercase tracking-wider hover:scale-105 transition-transform"
					>
						Browse Prayer Wall
					</Link>
				</div>
			) : (
				<div className="space-y-4 sm:space-y-8">
					{prayers.map((prayer) => (
						<article
							key={prayer._id}
							className="prayer-card rounded-2xl border-2 border-[var(--border)] bg-[var(--card)] p-4 sm:p-8 shadow-lg hover:shadow-xl transition-all hover:border-[var(--neon-cyan)]/50"
						>
							<header className="mb-4 sm:mb-6">
								<div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
									<UserAvatar name={prayer.name || ""} isAnonymous={prayer.isAnonymous} userId={prayer.userId} size="sm" />
									<div className="flex-1 min-w-0">
										<div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
											{prayer.userId ? (
												<Link
													href={`/users/${prayer.userId}`}
													className="text-sm sm:text-base font-bold text-[var(--neon-cyan)] hover:text-[var(--neon-pink)] transition-colors truncate"
												>
													{prayer.userName || prayer.name || "Member"}
												</Link>
											) : (
												<span className="text-sm sm:text-base font-bold text-[var(--neon-cyan)] truncate">{prayer.name || "Member"}</span>
											)}
											<span className="text-xs text-[var(--muted)]">•</span>
											<span className="text-xs text-[var(--muted)] font-medium whitespace-nowrap">
												{new Date(prayer._createdAt).toLocaleDateString("en-US", {
													month: "short",
													day: "numeric",
													year: "numeric",
												})}
											</span>
										</div>
										{prayer.group && (
											<span className="inline-flex items-center rounded-full bg-[var(--neon-pink)]/20 px-2 sm:px-3 py-0.5 sm:py-1 text-xs font-bold text-[var(--neon-pink)] border border-[var(--neon-pink)]/30">
												{prayer.group}
											</span>
										)}
									</div>
								</div>
								<h3 className="text-lg sm:text-2xl font-bold text-[var(--foreground)] mb-2 sm:mb-3">
									<Link href={`/prayers/${prayer._id}`} className="hover:text-[var(--neon-cyan)] transition-colors line-clamp-2">
										{prayer.title || "Prayer Request"}
									</Link>
								</h3>
							</header>

							<div className="prose prose-zinc max-w-none mb-4 sm:mb-6 text-[var(--foreground)] leading-relaxed prose-invert prose-sm sm:prose-base prose-p:mb-3 sm:prose-p:mb-4 line-clamp-4">
								<PortableText value={prayer.content} />
							</div>

							<footer className="flex items-center justify-between pt-4 sm:pt-6 border-t-2 border-[var(--border)]">
								<PrayerButton prayerId={prayer._id} initialCount={prayer.prayedCount || 0} />
								<Link
									href={`/prayers/${prayer._id}`}
									className="text-xs sm:text-sm font-bold text-[var(--neon-cyan)] hover:text-[var(--neon-pink)] transition-colors uppercase tracking-wider flex items-center gap-1 sm:gap-2"
								>
									Read More
									<span className="text-base sm:text-lg">→</span>
								</Link>
							</footer>
						</article>
					))}
				</div>
			)}
		</div>
	);
}

export const dynamic = "force-dynamic";

