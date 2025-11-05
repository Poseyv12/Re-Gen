import { getCurrentUser } from "@/lib/auth";
import { readClient } from "@/lib/sanity.client";
import { queryUserPrayers, queryUserProfile } from "@/lib/sanity.queries";
import type { PrayerRequestDoc } from "@/lib/types";
import { PortableText } from "@portabletext/react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { FiHeart } from "react-icons/fi";
import FollowButton from "./FollowButton";
import PrayerButton from "../../prayers/PrayerButton";

type Props = {
	params: Promise<{ id: string }>;
};

export default async function UserProfilePage({ params }: Props) {
	const { id } = await params;
	const currentUser = await getCurrentUser();

	const profile = await readClient.fetch(queryUserProfile, { userId: id });

	if (!profile) {
		notFound();
	}

	const prayers = await readClient.fetch<PrayerRequestDoc[]>(queryUserPrayers, { userId: id, name: profile.name });

	const isOwnProfile = currentUser?.id === id;

	return (
		<div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
			<div className="mb-8 rounded-2xl border-2 border-[var(--border)] bg-[var(--card)] p-8 shadow-lg">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-4">
						<div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[var(--neon-pink)] to-[var(--neon-cyan)] text-2xl font-bold text-[var(--foreground)] shadow-lg">
							{profile.name?.[0]?.toUpperCase() || "U"}
						</div>
						<div>
							<h1 className="text-3xl font-extrabold gradient-text">{profile.name}</h1>
							<div className="mt-2 flex items-center gap-4 text-sm">
								<span className="text-[var(--muted)]">
									<span className="font-bold text-[var(--neon-cyan)]">{profile.prayerCount || 0}</span> Prayers
								</span>
								<span className="text-[var(--muted)]">
									<span className="font-bold text-[var(--neon-pink)]">{profile.followers?.length || 0}</span> Followers
								</span>
								<span className="text-[var(--muted)]">
									<span className="font-bold text-[var(--neon-yellow)]">{profile.following?.length || 0}</span> Following
								</span>
							</div>
						</div>
					</div>
					{!isOwnProfile && currentUser && <FollowButton userId={id} currentUserId={currentUser.id} />}
				</div>
			</div>

			<div className="mb-6">
				<h2 className="text-2xl font-bold text-[var(--foreground)] mb-4">{profile.name}'s Prayer Requests</h2>
			</div>

			{prayers.length === 0 ? (
				<div className="text-center py-16 rounded-2xl border-2 border-[var(--border)] bg-[var(--card)]">
					<div className="flex justify-center mb-4">
						<FiHeart className="w-16 h-16 text-[var(--neon-pink)]" />
					</div>
					<p className="text-[var(--muted)] text-lg font-medium">No prayer requests yet.</p>
				</div>
			) : (
				<div className="space-y-6">
					{prayers.map((prayer) => (
						<article
							key={prayer._id}
							className="prayer-card rounded-2xl border-2 border-[var(--border)] bg-[var(--card)] p-6 shadow-lg"
						>
							<header className="mb-4 flex items-start justify-between gap-3">
								<div className="flex-1">
									<h3 className="text-xl font-bold text-[var(--foreground)] mb-2">
										<Link href={`/prayers/${prayer._id}`} className="hover:text-[var(--neon-cyan)] transition-colors">
											{prayer.title || "Prayer Request"}
										</Link>
									</h3>
									<div className="flex items-center gap-2 text-xs text-[var(--muted)] font-medium">
										<span>
											{new Date(prayer._createdAt).toLocaleDateString("en-US", {
												month: "short",
												day: "numeric",
												year: "numeric",
											})}
										</span>
										{prayer.group && (
											<span className="inline-flex items-center rounded-full bg-[var(--neon-pink)]/20 px-2.5 py-0.5 font-bold text-[var(--neon-pink)] border border-[var(--neon-pink)]/30">
												{prayer.group}
											</span>
										)}
									</div>
								</div>
							</header>

							<div className="prose prose-zinc max-w-none mb-5 text-[var(--foreground)] leading-relaxed prose-invert line-clamp-3">
								<PortableText value={prayer.content} />
							</div>

							<footer className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
								<PrayerButton prayerId={prayer._id} initialCount={prayer.prayedCount || 0} />
								<Link
									href={`/prayers/${prayer._id}`}
									className="text-sm text-[var(--neon-cyan)] hover:text-[var(--neon-pink)] font-bold transition-colors uppercase tracking-wider"
								>
									View →
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

