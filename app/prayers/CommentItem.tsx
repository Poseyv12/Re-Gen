"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { FiHeart } from "react-icons/fi";
import { likeComment, replyToComment } from "./actions";
import type { Comment } from "@/lib/types";

interface CommentItemProps {
	comment: Comment;
	prayerId: string;
	level?: number;
}

export default function CommentItem({ comment, prayerId, level = 0 }: CommentItemProps) {
	const { data: session } = useSession();
	const [showReplyForm, setShowReplyForm] = useState(false);
	const [replyContent, setReplyContent] = useState("");
	const [loading, setLoading] = useState(false);
	const [likeCount, setLikeCount] = useState(comment.likes?.length || 0);
	const [replies, setReplies] = useState(comment.replies || []);

	// Check if current user liked this comment
	const userLiked = session?.user?.id && comment.likes?.some((like) => like._id === session.user.id);
	const [isLiked, setIsLiked] = useState(userLiked || false);

	async function handleLike() {
		if (!session?.user) return;

		setLoading(true);
		try {
			const result = await likeComment(comment._id);
			if (result.success) {
				setIsLiked(result.liked);
				setLikeCount((prev) => (result.liked ? prev + 1 : prev - 1));
			}
		} catch (error) {
			console.error("Error liking comment:", error);
		} finally {
			setLoading(false);
		}
	}

	async function handleReply(e: React.FormEvent) {
		e.preventDefault();
		if (!replyContent.trim() || loading) return;

		setLoading(true);
		try {
			const result = await replyToComment(comment._id, prayerId, replyContent);
			if (result.success) {
				setReplies([...replies, result.reply]);
				setReplyContent("");
				setShowReplyForm(false);
			}
		} catch (error) {
			console.error("Error replying:", error);
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className={`${level > 0 ? "ml-6 mt-2 pl-4 border-l-2 border-[var(--border)]" : ""}`}>
			<div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3">
				<div className="flex items-start justify-between gap-2 mb-2">
					<div className="flex-1">
						<span className="text-sm font-bold text-[var(--neon-cyan)]">{comment.user.name}</span>
						<span className="text-xs text-[var(--muted)] ml-2">
							{new Date(comment.createdAt).toLocaleDateString("en-US", {
								month: "short",
								day: "numeric",
								year: comment.createdAt.includes(new Date().getFullYear().toString()) ? undefined : "numeric",
							})}
						</span>
					</div>
				</div>
				<p className="text-sm text-[var(--foreground)] mb-3">{comment.content}</p>

				<div className="flex items-center gap-4">
					<button
						onClick={handleLike}
						disabled={!session?.user || loading}
						className={`inline-flex items-center gap-1.5 rounded px-2 py-1 text-xs font-bold transition-all ${
							isLiked
								? "bg-[var(--neon-pink)]/20 text-[var(--neon-pink)] border border-[var(--neon-pink)]/30"
								: "bg-[var(--card)] text-[var(--muted)] border border-[var(--border)] hover:bg-[var(--neon-pink)]/10 hover:text-[var(--neon-pink)]"
						} disabled:opacity-50`}
					>
						<FiHeart className={`w-4 h-4 ${isLiked ? "fill-[var(--neon-pink)]" : ""}`} />
						<span>{likeCount}</span>
					</button>

					{session?.user && (
						<button
							onClick={() => setShowReplyForm(!showReplyForm)}
							className="text-xs text-[var(--neon-cyan)] hover:text-[var(--neon-pink)] font-bold transition-colors uppercase tracking-wider"
						>
							Reply
						</button>
					)}
				</div>

				{showReplyForm && (
					<form onSubmit={handleReply} className="mt-3 space-y-2">
						<textarea
							value={replyContent}
							onChange={(e) => setReplyContent(e.target.value)}
							placeholder={`Reply to ${comment.user.name}...`}
							rows={2}
							className="w-full rounded-lg border-2 border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] resize-none focus:border-[var(--neon-cyan)] focus:outline-none transition-all"
							required
							maxLength={500}
						/>
						<div className="flex gap-2">
							<button
								type="submit"
								disabled={loading || !replyContent.trim()}
								className="btn-retro-cyan flex-1 rounded-lg px-3 py-1.5 text-xs font-bold text-white uppercase tracking-wider disabled:opacity-50"
							>
								{loading ? "Posting..." : "Post Reply"}
							</button>
							<button
								type="button"
								onClick={() => {
									setShowReplyForm(false);
									setReplyContent("");
								}}
								className="rounded-lg border-2 border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-xs font-bold text-[var(--muted)] uppercase tracking-wider hover:bg-[var(--background)] transition-all"
							>
								Cancel
							</button>
						</div>
					</form>
				)}
			</div>

			{replies.length > 0 && (
				<div className="mt-3 space-y-2">
					{replies.map((reply) => (
						<CommentItem key={reply._id} comment={reply} prayerId={prayerId} level={level + 1} />
					))}
				</div>
			)}
		</div>
	);
}

