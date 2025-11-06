"use client";

import { useState, useEffect } from "react";
import { followUser, unfollowUser } from "./actions";
import Tooltip from "@/components/Tooltip";

interface FollowButtonProps {
	userId: string;
	currentUserId: string;
}

export default function FollowButton({ userId, currentUserId }: FollowButtonProps) {
	const [isFollowing, setIsFollowing] = useState(false);
	const [loading, setLoading] = useState(false);
	const [isChecking, setIsChecking] = useState(true);

	useEffect(() => {
		async function checkFollowStatus() {
			try {
				const response = await fetch(`/api/users/${userId}/follow-status`);
				const data = await response.json();
				setIsFollowing(data.isFollowing || false);
			} catch (error) {
				console.error("Error checking follow status:", error);
			} finally {
				setIsChecking(false);
			}
		}
		checkFollowStatus();
	}, [userId]);

	async function handleFollow() {
		setLoading(true);
		try {
			if (isFollowing) {
				const result = await unfollowUser(userId);
				if (result.success) {
					setIsFollowing(false);
				}
			} else {
				const result = await followUser(userId);
				if (result.success) {
					setIsFollowing(true);
				}
			}
		} catch (error) {
			console.error("Error following/unfollowing:", error);
		} finally {
			setLoading(false);
		}
	}

	if (isChecking) {
		return (
			<button disabled className="rounded-lg border-2 border-[var(--border)] bg-[var(--card)] px-4 py-2 text-sm font-bold text-[var(--muted)] uppercase tracking-wider opacity-50">
				Loading...
			</button>
		);
	}

	return (
		<Tooltip content={loading ? "Processing..." : isFollowing ? "Stop following this user" : "Follow this user to see their posts in your feed"} position="top">
			<button
				onClick={handleFollow}
				disabled={loading}
				className={`rounded-lg border-2 px-4 py-2 text-sm font-bold uppercase tracking-wider transition-all disabled:opacity-50 ${
					isFollowing
						? "border-[var(--neon-pink)] bg-[var(--neon-pink)]/20 text-[var(--neon-pink)] hover:bg-[var(--neon-pink)]/30"
						: "border-[var(--neon-cyan)] bg-[var(--card)] text-[var(--neon-cyan)] hover:bg-[var(--neon-cyan)] hover:text-[var(--background)]"
				}`}
			>
				{loading ? "..." : isFollowing ? "Following" : "Follow"}
			</button>
		</Tooltip>
	);
}

