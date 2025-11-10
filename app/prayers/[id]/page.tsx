import { readClient } from "@/lib/sanity.client";
import { queryPrayerById } from "@/lib/sanity.queries";
import type { PrayerRequestDoc } from "@/lib/types";
import { PortableText } from "@portabletext/react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { FiHeart, FiMessageCircle, FiCheckCircle } from "react-icons/fi";
import PrayerButton from "../PrayerButton";
import CommentSection from "../CommentSection";
import UserAvatar from "../UserAvatar";

type Props = {
	params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { id } = await params;
	const prayer = await readClient.fetch<PrayerRequestDoc>(queryPrayerById, { id });

	if (!prayer) {
		return {
			title: "Prayer Request Not Found",
		};
	}

	return {
		title: `${prayer.title || "Prayer Request"} | Re:Generation`,
		description: "View prayer request details and leave encouraging comments",
	};
}

export default async function PrayerDetailPage({ params }: Props) {
	const { id } = await params;
	const prayer = await readClient.fetch<PrayerRequestDoc>(queryPrayerById, { id });

	if (!prayer) {
		notFound();
	}

	return (
		<div className="mx-auto max-w-4xl px-4 py-6 sm:py-12 sm:px-6 lg:px-8">
			<Link
				href="/prayers"
				className="mb-4 sm:mb-6 inline-flex items-center gap-2 text-xs sm:text-sm text-[var(--neon-cyan)] hover:text-[var(--neon-pink)] transition-colors font-bold uppercase tracking-wider"
			>
				← Back to Prayer Wall
			</Link>

			<article className="prayer-card rounded-2xl border-2 border-[var(--border)] bg-[var(--card)] p-4 sm:p-8 shadow-lg">
				<header className="mb-4 sm:mb-6 flex items-start justify-between gap-3 sm:gap-4">
					<div className="flex-1 min-w-0">
						<div className="flex items-center gap-3 mb-2 sm:mb-3 flex-wrap">
							<h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[var(--foreground)] gradient-text">
								{prayer.title || "Prayer Request"}
							</h1>
							{prayer.isAnswered && (
								<span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--neon-yellow)]/20 px-3 py-1 text-xs sm:text-sm font-bold text-[var(--neon-yellow)] border border-[var(--neon-yellow)]/30">
									<FiCheckCircle className="w-4 h-4" />
									Answered
								</span>
							)}
						</div>
						<div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-[var(--muted)] font-medium">
							<span className="whitespace-nowrap">
								{new Date(prayer._createdAt).toLocaleDateString("en-US", {
									month: "long",
									day: "numeric",
									year: "numeric",
								})}
							</span>
							{prayer.group && (
								<span className="inline-flex items-center rounded-full bg-[var(--neon-pink)]/20 px-2 sm:px-3 py-0.5 sm:py-1 text-xs font-bold text-[var(--neon-pink)] border border-[var(--neon-pink)]/30">
									{prayer.group}
								</span>
							)}
						</div>
					</div>
					<div className="flex-shrink-0">
						<FiHeart className="w-8 h-8 sm:w-10 sm:h-10 text-[var(--neon-pink)] fill-[var(--neon-pink)]" />
					</div>
				</header>

				<div className="prose prose-zinc max-w-none mb-4 sm:mb-6 text-[var(--foreground)] leading-relaxed prose-invert prose-sm sm:prose-base lg:prose-lg">
					<PortableText value={prayer.content} />
				</div>

				<footer className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 sm:pt-6 border-t border-[var(--border)] mb-4 sm:mb-6">
					<div className="flex items-center gap-3 sm:gap-4">
						<UserAvatar name={prayer.name || ""} isAnonymous={prayer.isAnonymous} userId={prayer.userId} size="md" />
						<div>
							<p className="text-xs sm:text-sm text-[var(--muted)] font-medium">Requested by</p>
							{prayer.userId ? (
								<Link
									href={`/users/${prayer.userId}`}
									className="text-sm sm:text-base font-bold text-[var(--foreground)] hover:text-[var(--neon-cyan)] transition-colors"
								>
									{prayer.isAnonymous ? "Anonymous" : prayer.name || "Member"}
								</Link>
							) : (
								<p className="text-sm sm:text-base font-bold text-[var(--foreground)]">
									{prayer.isAnonymous ? "Anonymous" : prayer.name || "Member"}
								</p>
							)}
						</div>
					</div>
					<div className="flex items-center gap-3">
						<PrayerButton prayerId={prayer._id} initialCount={prayer.prayedCount || 0} />
					</div>
				</footer>

				<div className="pt-4 sm:pt-6 border-t border-[var(--border)]">
					<h2 className="text-lg sm:text-xl font-bold text-[var(--foreground)] mb-3 sm:mb-4 flex items-center gap-2">
						<FiMessageCircle className="w-5 h-5 text-[var(--neon-cyan)]" />
						Comments ({prayer.comments?.length || 0})
					</h2>
					<CommentSection prayerId={prayer._id} initialComments={prayer.comments || []} />
				</div>
			</article>
		</div>
	);
}

export const dynamic = "force-dynamic";

