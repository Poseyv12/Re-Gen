"use client";

import { FiEye, FiEyeOff, FiTrash2 } from "react-icons/fi";
import Tooltip from "@/components/Tooltip";

interface ReflectionActionsProps {
	reflectionId: string;
	isPublished: boolean;
	onTogglePublish: () => void;
	onDelete: () => void;
}

export default function ReflectionActions({ reflectionId, isPublished, onTogglePublish, onDelete }: ReflectionActionsProps) {
	return (
		<div className="flex gap-3 pt-4 border-t border-[var(--border)]">
			<Tooltip content={isPublished ? "Unpublish this reflection (hide it from the public)" : "Publish this reflection (make it visible to everyone)"} position="top">
				<form action={onTogglePublish} className="flex-1">
					<button
						type="submit"
						className={`w-full rounded-lg px-4 py-2.5 text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
							isPublished
								? "border-2 border-[var(--border)] bg-[var(--card)] text-[var(--muted)] hover:border-[var(--muted)]"
								: "btn-retro-cyan text-white"
						}`}
					>
						{isPublished ? (
							<>
								<FiEyeOff className="w-4 h-4" />
								Unpublish
							</>
						) : (
							<>
								<FiEye className="w-4 h-4" />
								Publish
							</>
						)}
					</button>
				</form>
			</Tooltip>
			<Tooltip content="Permanently delete this reflection" position="top">
				<form action={onDelete} className="flex-1">
					<button
						type="submit"
						className="w-full rounded-lg border-2 border-red-500/50 bg-[var(--card)] px-4 py-2.5 text-sm font-bold text-red-500 uppercase tracking-wider hover:bg-red-500/10 hover:border-red-500 transition-all flex items-center justify-center gap-2"
					>
						<FiTrash2 className="w-4 h-4" />
						Delete
					</button>
				</form>
			</Tooltip>
		</div>
	);
}

