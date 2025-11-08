"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import type { TestimonyDoc } from "@/lib/types";
import { FiCheck, FiX, FiTrash2 } from "react-icons/fi";
import { approveTestimony, rejectTestimony, deleteTestimony } from "../actions";
import Tooltip from "@/components/Tooltip";

interface AdminTestimoniesListProps {
	testimonies: TestimonyDoc[];
	showModerationActions?: boolean;
}

export default function AdminTestimoniesList({ testimonies: initialTestimonies, showModerationActions = false }: AdminTestimoniesListProps) {
	const [testimonies, setTestimonies] = useState<TestimonyDoc[]>(initialTestimonies);
	const [isPending, setIsPending] = useState(false);
	const router = useRouter();

	const handleApprove = async (id: string) => {
		if (isPending) return;
		setIsPending(true);
		const previousTestimonies = testimonies;
		setTestimonies((prev) => prev.filter((t) => t._id !== id));
		const toastId = toast.loading("Approving testimony...", { id: `approve-${id}` });

		try {
			await approveTestimony(id);
			toast.success("Testimony approved!", { id: toastId });
			setTimeout(() => {
				router.refresh();
			}, 500);
		} catch (error) {
			setTestimonies(previousTestimonies);
			toast.error("Failed to approve testimony", { id: toastId });
		} finally {
			setIsPending(false);
		}
	};

	const handleReject = async (id: string) => {
		if (isPending) return;
		setIsPending(true);
		const previousTestimonies = testimonies;
		setTestimonies((prev) => prev.filter((t) => t._id !== id));
		const toastId = toast.loading("Rejecting testimony...", { id: `reject-${id}` });

		try {
			await rejectTestimony(id);
			toast.success("Testimony rejected", { id: toastId });
			setTimeout(() => {
				router.refresh();
			}, 500);
		} catch (error) {
			setTestimonies(previousTestimonies);
			toast.error("Failed to reject testimony", { id: toastId });
		} finally {
			setIsPending(false);
		}
	};

	const handleDelete = async (id: string) => {
		if (isPending) return;
		setIsPending(true);
		const previousTestimonies = testimonies;
		setTestimonies((prev) => prev.filter((t) => t._id !== id));
		const toastId = toast.loading("Deleting testimony...", { id: `delete-${id}` });

		try {
			await deleteTestimony(id);
			toast.success("Testimony deleted", { id: toastId });
			setTimeout(() => {
				router.refresh();
			}, 500);
		} catch (error) {
			setTestimonies(previousTestimonies);
			toast.error("Failed to delete testimony", { id: toastId });
		} finally {
			setIsPending(false);
		}
	};

	useEffect(() => {
		setTestimonies(initialTestimonies);
	}, [initialTestimonies]);

	if (testimonies.length === 0) {
		return (
			<div className="text-center py-16 rounded-2xl border-2 border-[var(--border)] bg-[var(--card)]">
				<div className="text-5xl mb-4">⭐</div>
				<p className="text-[var(--muted)] text-lg font-bold">No testimonies</p>
			</div>
		);
	}

	const getStatusBadge = (status: string) => {
		switch (status) {
			case "pending":
				return (
					<span className="inline-flex items-center rounded-full bg-[var(--neon-yellow)]/20 px-3 py-1 text-xs font-bold text-[var(--neon-yellow)] border border-[var(--neon-yellow)]/30 uppercase tracking-wider">
						Pending Review
					</span>
				);
			case "approved":
				return (
					<span className="inline-flex items-center rounded-full bg-[var(--neon-cyan)]/20 px-3 py-1 text-xs font-bold text-[var(--neon-cyan)] border border-[var(--neon-cyan)]/30 uppercase tracking-wider">
						Approved
					</span>
				);
			case "rejected":
				return (
					<span className="inline-flex items-center rounded-full bg-[var(--muted)]/20 px-3 py-1 text-xs font-bold text-[var(--muted)] border border-[var(--border)] uppercase tracking-wider">
						Rejected
					</span>
				);
			default:
				return null;
		}
	};

	return (
		<div className="space-y-6">
			{testimonies.map((t) => (
				<div
					key={t._id}
					className={`rounded-2xl border-2 bg-[var(--card)] p-6 shadow-lg ${
						t.status === "pending" ? "border-[var(--neon-yellow)] retro-border-animate" : "border-[var(--border)]"
					}`}
				>
					<div className="mb-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
						<div className="flex-1">
							<div className="flex items-center gap-3 mb-2 flex-wrap">
								{getStatusBadge(t.status)}
								{t.group && (
									<span className="inline-flex items-center rounded-full bg-[var(--neon-pink)]/20 px-3 py-1 text-xs font-bold text-[var(--neon-pink)] border border-[var(--neon-pink)]/30">
										{t.group}
									</span>
								)}
							</div>
							<h2 className="text-xl font-bold text-[var(--foreground)] mb-2">{t.title || "Testimony"}</h2>
							<p className="text-sm text-[var(--muted)] font-medium">
								<span className="text-[var(--neon-cyan)]">From:</span> {t.isAnonymous ? "Anonymous" : t.name || "Member"}
							</p>
						</div>
						<time className="text-xs text-[var(--muted)] font-medium whitespace-nowrap">
							{new Date(t._createdAt).toLocaleString("en-US", {
								month: "short",
								day: "numeric",
								year: "numeric",
								hour: "numeric",
								minute: "2-digit",
							})}
						</time>
					</div>

					<div className="mb-6 rounded-lg bg-[var(--background)] p-4 border border-[var(--border)]">
						<p className="whitespace-pre-wrap text-[var(--foreground)] leading-relaxed">
							{Array.isArray(t.content) ? t.content.map((b: any) => (b.children?.map((c: any) => c.text).join(""))).join("\n\n") : ""}
						</p>
					</div>

					<div className="flex gap-3 pt-4 border-t border-[var(--border)]">
						{showModerationActions && t.status === "pending" && (
							<>
								<Tooltip content="Approve this testimony to publish it on the testimonies page" position="top">
									<button
										onClick={() => handleApprove(t._id)}
										disabled={isPending}
										className="btn-retro-cyan flex-1 w-full rounded-lg px-4 py-2.5 font-bold text-white uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
									>
										<FiCheck className="w-4 h-4" />
										Approve
									</button>
								</Tooltip>
								<Tooltip content="Reject this testimony (it will not be published)" position="top">
									<button
										onClick={() => handleReject(t._id)}
										disabled={isPending}
										className="btn-retro flex-1 w-full rounded-lg px-4 py-2.5 font-bold text-white uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
									>
										<FiX className="w-4 h-4" />
										Reject
									</button>
								</Tooltip>
							</>
						)}
						<Tooltip content="Permanently delete this testimony" position="top">
							<button
								onClick={() => handleDelete(t._id)}
								disabled={isPending}
								className={`w-full rounded-lg border-2 border-red-500/50 bg-[var(--card)] px-4 py-2.5 font-bold text-red-500 uppercase tracking-wider hover:bg-red-500/10 hover:border-red-500 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
									showModerationActions && t.status === "pending" ? "" : "flex-1"
								}`}
							>
								<FiTrash2 className="w-4 h-4" />
								Delete
							</button>
						</Tooltip>
					</div>
				</div>
			))}
		</div>
	);
}

