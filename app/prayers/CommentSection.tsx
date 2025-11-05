"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { addComment } from "./actions";
import CommentItem from "./CommentItem";
import type { Comment } from "@/lib/types";

interface CommentSectionProps {
	prayerId: string;
	initialComments: Comment[];
}

export default function CommentSection({ prayerId, initialComments }: CommentSectionProps) {
	const { data: session } = useSession();
	const [comments, setComments] = useState(initialComments);
	const [newComment, setNewComment] = useState("");
	const [loading, setLoading] = useState(false);
	const [showForm, setShowForm] = useState(false);

	if (!session?.user) {
		return (
			<div className="mt-4 rounded-lg border-2 border-[var(--neon-cyan)]/30 bg-[var(--card)]/50 p-4 text-center">
				<p className="text-sm text-[var(--muted)] mb-2">
					<a href="/auth/signin" className="text-[var(--neon-cyan)] hover:text-[var(--neon-pink)] font-bold transition-colors">
						Sign in
					</a>{" "}
					to leave an encouraging comment
				</p>
			</div>
		);
	}

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (!newComment.trim() || loading) return;

		setLoading(true);
		try {
			const result = await addComment(prayerId, newComment);
			if (result.success) {
				setComments([...comments, result.comment]);
				setNewComment("");
				setShowForm(false);
			}
		} catch (error) {
			console.error("Error adding comment:", error);
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="mt-4 space-y-3">
			{comments.length > 0 && (
				<div className="space-y-3">
					{comments.map((comment) => (
						<CommentItem key={comment._id} comment={comment} prayerId={prayerId} />
					))}
				</div>
			)}

			{!showForm ? (
				<button
					onClick={() => setShowForm(true)}
					className="w-full rounded-lg border-2 border-[var(--neon-cyan)] bg-[var(--card)] px-4 py-2 text-xs font-bold text-[var(--neon-cyan)] uppercase tracking-wider hover:bg-[var(--neon-cyan)] hover:text-[var(--background)] transition-all"
				>
					+ Add Comment
				</button>
			) : (
				<form onSubmit={handleSubmit} className="space-y-2">
					<textarea
						value={newComment}
						onChange={(e) => setNewComment(e.target.value)}
						placeholder="Leave an encouraging comment..."
						rows={3}
						className="w-full rounded-lg border-2 border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] resize-none focus:border-[var(--neon-cyan)] focus:outline-none transition-all"
						required
						maxLength={500}
					/>
					<div className="flex gap-2">
						<button
							type="submit"
							disabled={loading || !newComment.trim()}
							className="btn-retro-cyan flex-1 rounded-lg px-4 py-2 text-xs font-bold text-white uppercase tracking-wider disabled:opacity-50"
						>
							{loading ? "Posting..." : "Post Comment"}
						</button>
						<button
							type="button"
							onClick={() => {
								setShowForm(false);
								setNewComment("");
							}}
							className="rounded-lg border-2 border-[var(--border)] bg-[var(--card)] px-4 py-2 text-xs font-bold text-[var(--muted)] uppercase tracking-wider hover:bg-[var(--background)] transition-all"
						>
							Cancel
						</button>
					</div>
				</form>
			)}
		</div>
	);
}
