"use client";

import { useState } from "react";

type Tab = "prayers" | "settings";

interface ProfileTabsProps {
	activeTab: Tab;
	onTabChange: (tab: Tab) => void;
}

export default function ProfileTabs({ activeTab, onTabChange }: ProfileTabsProps) {
	return (
		<div className="mb-4 sm:mb-6 flex gap-2 sm:gap-4 border-b-2 border-[var(--border)] pb-3 sm:pb-4">
			<button
				type="button"
				onClick={() => onTabChange("prayers")}
				className={`rounded-lg border-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all flex-1 sm:flex-none ${
					activeTab === "prayers"
						? "border-[var(--neon-cyan)] bg-[var(--card)] text-[var(--neon-cyan)]"
						: "border-[var(--border)] bg-[var(--card)] text-[var(--muted)] hover:border-[var(--neon-pink)] hover:text-[var(--neon-pink)]"
				}`}
			>
				My Prayers
			</button>
			<button
				type="button"
				onClick={() => onTabChange("settings")}
				className={`rounded-lg border-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all flex-1 sm:flex-none ${
					activeTab === "settings"
						? "border-[var(--neon-cyan)] bg-[var(--card)] text-[var(--neon-cyan)]"
						: "border-[var(--border)] bg-[var(--card)] text-[var(--muted)] hover:border-[var(--neon-pink)] hover:text-[var(--neon-pink)]"
				}`}
			>
				Settings
			</button>
		</div>
	);
}

