"use client";

import { useState } from "react";
import Link from "next/link";
import { PortableText } from "@portabletext/react";
import { FiHeart } from "react-icons/fi";
import type { PrayerRequestDoc } from "@/lib/types";
import PrayerButton from "../prayers/PrayerButton";
import ProfileTabs from "./ProfileTabs";
import SettingsSection from "./SettingsSection";

type Tab = "prayers" | "settings";

interface ProfileContentProps {
	prayers: PrayerRequestDoc[];
	profile: {
		name: string;
		email: string;
		image?: string;
	};
}

export default function ProfileContent({ prayers, profile }: ProfileContentProps) {
	const [activeTab, setActiveTab] = useState<Tab>("prayers");

	return (
		<>
			<ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />

			{activeTab === "prayers" ? (
				<>
					<div className="mb-4 sm:mb-6">
						<h2 className="text-xl sm:text-2xl font-bold text-[var(--foreground)] mb-3 sm:mb-4">My Prayer Requests</h2>
					</div>

					{prayers.length === 0 ? (
						<div className="text-center py-12 sm:py-16 rounded-2xl border-2 border-[var(--border)] bg-[var(--card)] px-4">
							<div className="flex justify-center mb-4">
								<FiHeart className="w-12 h-12 sm:w-16 sm:h-16 text-[var(--neon-pink)]" />
							</div>
							<p className="text-[var(--muted)] text-base sm:text-lg font-medium">No prayer requests yet.</p>
							<Link
								href="/submit"
								className="mt-4 inline-block btn-retro rounded-lg px-5 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-white uppercase tracking-wider"
							>
								Submit Your First Request
							</Link>
						</div>
					) : (
						<div className="space-y-4 sm:space-y-6">
							{prayers.map((prayer) => (
								<article
									key={prayer._id}
									className="prayer-card rounded-2xl border-2 border-[var(--border)] bg-[var(--card)] p-4 sm:p-6 shadow-lg"
								>
									<header className="mb-3 sm:mb-4 flex items-start justify-between gap-2 sm:gap-3">
										<div className="flex-1 min-w-0">
											<h3 className="text-lg sm:text-xl font-bold text-[var(--foreground)] mb-2 line-clamp-2">
												<Link href={`/prayers/${prayer._id}`} className="hover:text-[var(--neon-cyan)] transition-colors">
													{prayer.title || "Prayer Request"}
												</Link>
											</h3>
											<div className="flex flex-wrap items-center gap-2 text-xs text-[var(--muted)] font-medium">
												<span className="whitespace-nowrap">
													{new Date(prayer._createdAt).toLocaleDateString("en-US", {
														month: "short",
														day: "numeric",
														year: "numeric",
													})}
												</span>
												{prayer.group && (
													<span className="inline-flex items-center rounded-full bg-[var(--neon-pink)]/20 px-2 py-0.5 font-bold text-[var(--neon-pink)] border border-[var(--neon-pink)]/30 text-xs">
														{prayer.group}
													</span>
												)}
											</div>
										</div>
									</header>

									<div className="prose prose-zinc max-w-none mb-4 sm:mb-5 text-[var(--foreground)] leading-relaxed prose-invert prose-sm sm:prose-base line-clamp-3">
										<PortableText value={prayer.content} />
									</div>

									<footer className="flex items-center justify-between pt-3 sm:pt-4 border-t border-[var(--border)]">
										<PrayerButton prayerId={prayer._id} initialCount={prayer.prayedCount || 0} />
										<Link
											href={`/prayers/${prayer._id}`}
											className="text-xs sm:text-sm text-[var(--neon-cyan)] hover:text-[var(--neon-pink)] font-bold transition-colors uppercase tracking-wider"
										>
											View →
										</Link>
									</footer>
								</article>
							))}
						</div>
					)}
				</>
			) : (
				<SettingsSection initialName={profile.name} initialEmail={profile.email} initialImage={profile.image} />
			)}
		</>
	);
}

