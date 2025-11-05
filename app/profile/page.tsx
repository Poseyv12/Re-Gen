import { getCurrentUser } from "@/lib/auth";
import { readClient } from "@/lib/sanity.client";
import { queryUserPrayers, queryUserProfile } from "@/lib/sanity.queries";
import type { PrayerRequestDoc } from "@/lib/types";
import { redirect } from "next/navigation";
import ProfileContent from "./ProfileContent";

export default async function ProfilePage() {
	const user = await getCurrentUser();
	if (!user) {
		redirect("/auth/signin");
	}

	const profile = await readClient.fetch(queryUserProfile, { userId: user.id });

	if (!profile) {
		redirect("/auth/signin");
	}

	const prayers = await readClient.fetch<PrayerRequestDoc[]>(queryUserPrayers, { userId: user.id, name: profile.name });

	return (
		<div className="mx-auto max-w-4xl px-4 py-6 sm:py-12 sm:px-6 lg:px-8">
			<div className="mb-6 sm:mb-8 rounded-2xl border-2 border-[var(--border)] bg-[var(--card)] p-4 sm:p-8 shadow-lg">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
						<div className="inline-flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-gradient-to-br from-[var(--neon-pink)] to-[var(--neon-cyan)] text-lg sm:text-2xl font-bold text-[var(--foreground)] shadow-lg flex-shrink-0">
							{profile.name?.[0]?.toUpperCase() || "U"}
						</div>
						<div className="min-w-0 flex-1">
							<h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold gradient-text truncate">{profile.name}</h1>
							<p className="text-xs sm:text-sm text-[var(--muted)] truncate">{profile.email}</p>
							<div className="mt-2 flex items-center gap-3 sm:gap-4 text-xs sm:text-sm flex-wrap">
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
				</div>
			</div>

			<ProfileContent prayers={prayers} profile={profile} />
		</div>
	);
}

export const dynamic = "force-dynamic";

