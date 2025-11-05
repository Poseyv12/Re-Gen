"use client";

import { useState, useTransition } from "react";
import { FiHeart, FiCheck } from "react-icons/fi";
import { incrementPrayer } from "./actions";

interface PrayerButtonProps {
	prayerId: string;
	initialCount: number;
}

export default function PrayerButton({ prayerId, initialCount }: PrayerButtonProps) {
	const [count, setCount] = useState(initialCount || 0);
	const [isPending, startTransition] = useTransition();
	const [hasPrayed, setHasPrayed] = useState(false);

	const handleClick = () => {
		if (hasPrayed) return;

		// Optimistic update
		setCount((prev) => prev + 1);
		setHasPrayed(true);

		startTransition(async () => {
			try {
				await incrementPrayer(prayerId);
			} catch (error) {
				// Revert on error
				setCount((prev) => prev - 1);
				setHasPrayed(false);
			}
		});
	};

	return (
		<button
			type="button"
			onClick={handleClick}
			disabled={hasPrayed || isPending}
			className={`inline-flex items-center gap-2 rounded-full border-2 px-4 py-2 text-xs font-bold shadow-lg transition-all uppercase tracking-wider ${
				hasPrayed
					? "border-[var(--neon-yellow)] bg-[var(--neon-yellow)] text-[var(--background)] cursor-default"
					: "border-[var(--neon-cyan)] bg-[var(--card)] text-[var(--neon-cyan)] hover:bg-[var(--neon-cyan)] hover:text-[var(--background)] hover:shadow-[0_0_20px_rgba(107,163,74,0.5)]"
			}`}
			aria-label="Mark as prayed"
		>
			{hasPrayed ? <FiCheck className="w-4 h-4" /> : <FiHeart className="w-4 h-4" />}
			<span>{hasPrayed ? `Prayed (${count})` : `I prayed${count > 0 ? ` (${count})` : ""}`}</span>
		</button>
	);
}

