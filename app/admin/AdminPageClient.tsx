"use client";

import { useState } from "react";
import Link from "next/link";
import AdminPrayersList from "./AdminPrayersList";
import type { PrayerRequestDoc } from "@/lib/types";
import { logout } from "./actions";

interface AdminPageClientProps {
	pending: PrayerRequestDoc[];
	all: PrayerRequestDoc[];
}

export default function AdminPageClient({ pending, all }: AdminPageClientProps) {
	const [activeTab, setActiveTab] = useState<"pending" | "all">("pending");

	return (
		<div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
			<div className="mb-8 flex items-center justify-between flex-wrap gap-4">
				<div>
					<h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-3 gradient-text">Admin: Prayer Requests</h1>
					<p className="text-base sm:text-lg text-[var(--muted)] font-medium">Review and manage prayer requests.</p>
				</div>
				<div className="flex gap-3 flex-wrap">
					<Link
						href="/admin/reflections"
						className="rounded-lg border-2 border-[var(--neon-cyan)] bg-[var(--card)] px-4 py-2 text-sm font-bold text-[var(--neon-cyan)] uppercase tracking-wider hover:bg-[var(--neon-cyan)] hover:text-[var(--background)] transition-all shadow-lg"
					>
						Daily Reflections
					</Link>
					<Link
						href="/admin/users"
						className="rounded-lg border-2 border-[var(--neon-yellow)] bg-[var(--card)] px-4 py-2 text-sm font-bold text-[var(--neon-yellow)] uppercase tracking-wider hover:bg-[var(--neon-yellow)] hover:text-[var(--background)] transition-all shadow-lg"
					>
						User Management
					</Link>
					<form action={logout}>
						<button className="rounded-lg border-2 border-[var(--neon-pink)] bg-[var(--card)] px-4 py-2 text-sm font-bold text-[var(--neon-pink)] uppercase tracking-wider hover:bg-[var(--neon-pink)] hover:text-[var(--background)] transition-all shadow-lg">
							Log out
						</button>
					</form>
				</div>
			</div>

			{/* Tabs */}
			<div className="mb-6 flex gap-2 border-b-2 border-[var(--border)]">
				<button
					onClick={() => setActiveTab("pending")}
					className={`px-6 py-3 font-bold uppercase tracking-wider transition-all border-b-2 -mb-[2px] ${
						activeTab === "pending"
							? "border-[var(--neon-yellow)] text-[var(--neon-yellow)]"
							: "border-transparent text-[var(--muted)] hover:text-[var(--foreground)]"
					}`}
				>
					Pending Review ({pending.length})
				</button>
				<button
					onClick={() => setActiveTab("all")}
					className={`px-6 py-3 font-bold uppercase tracking-wider transition-all border-b-2 -mb-[2px] ${
						activeTab === "all"
							? "border-[var(--neon-cyan)] text-[var(--neon-cyan)]"
							: "border-transparent text-[var(--muted)] hover:text-[var(--foreground)]"
					}`}
				>
					All Prayers ({all.length})
				</button>
			</div>

			{/* Content */}
			{activeTab === "pending" ? (
				<AdminPrayersList prayers={pending} showModerationActions={true} />
			) : (
				<AdminPrayersList prayers={all} showModerationActions={false} />
			)}
		</div>
	);
}

