"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { markPrayerAsAnswered } from "./actions";
import { FiCheckCircle } from "react-icons/fi";
import toast from "react-hot-toast";

interface MarkAnsweredButtonProps {
	prayerId: string;
	isAnswered: boolean;
	answeredAt?: string;
}

export default function MarkAnsweredButton({ prayerId, isAnswered, answeredAt }: MarkAnsweredButtonProps) {
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();

	const handleMarkAnswered = async () => {
		if (isLoading || isAnswered) return;

		const confirmed = window.confirm("Mark this prayer as answered? This action cannot be undone.");
		if (!confirmed) return;

		setIsLoading(true);
		const toastId = toast.loading("Marking prayer as answered...");

		try {
			await markPrayerAsAnswered(prayerId);
			toast.success("Prayer marked as answered! 🙌", { id: toastId });
			router.refresh();
		} catch (error: any) {
			toast.error(error.message || "Failed to mark prayer as answered", { id: toastId });
		} finally {
			setIsLoading(false);
		}
	};

	if (isAnswered) {
		return (
			<div className="inline-flex items-center gap-2 rounded-lg border-2 border-[var(--neon-yellow)] bg-[var(--neon-yellow)]/20 px-4 py-2.5 text-sm font-bold text-[var(--neon-yellow)]">
				<FiCheckCircle className="w-5 h-5" />
				<span>Prayer Answered</span>
				{answeredAt && (
					<span className="text-xs font-normal opacity-75">
						{new Date(answeredAt).toLocaleDateString("en-US", {
							month: "short",
							day: "numeric",
							year: "numeric",
						})}
					</span>
				)}
			</div>
		);
	}

	return (
		<button
			onClick={handleMarkAnswered}
			disabled={isLoading}
			className="inline-flex items-center gap-2 rounded-lg border-2 border-[var(--neon-yellow)] bg-[var(--card)] px-4 py-2.5 text-sm font-bold text-[var(--neon-yellow)] uppercase tracking-wider hover:bg-[var(--neon-yellow)] hover:text-[var(--background)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
		>
			<FiCheckCircle className="w-5 h-5" />
			{isLoading ? "Marking..." : "Mark as Answered"}
		</button>
	);
}

