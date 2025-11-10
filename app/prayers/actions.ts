"use server";

import { writeClient } from "@/lib/sanity.client";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";

export async function incrementPrayer(prayerId: string) {
	try {
		// Get current count or default to 0
		const doc = await writeClient.fetch<{ prayedCount?: number }>(
			`*[_id == $id][0]{prayedCount}`,
			{ id: prayerId }
		);

		const currentCount = doc?.prayedCount || 0;
		const newCount = currentCount + 1;

		await writeClient.patch(prayerId).set({ prayedCount: newCount }).commit();

		revalidatePath("/prayers");
	} catch (error) {
		console.error("Error incrementing prayer count:", error);
		throw new Error("Failed to update prayer count");
	}
}

export async function addComment(prayerId: string, content: string) {
	try {
		const user = await getCurrentUser();
		if (!user?.id) {
			throw new Error("Unauthorized");
		}

		// Get user document from Sanity
		const userDoc = await writeClient.fetch(
			`*[_type == "user" && _id == $userId][0]`,
			{ userId: user.id }
		);

		if (!userDoc) {
			throw new Error("User not found");
		}

		// Create comment
		const comment = await writeClient.create({
			_type: "comment",
			prayerRequest: {
				_type: "reference",
				_ref: prayerId,
			},
			user: {
				_type: "reference",
				_ref: user.id,
			},
			content: content.trim(),
			createdAt: new Date().toISOString(),
		});

		// Fetch the created comment with user data
		const commentWithUser = await writeClient.fetch(
			`*[_id == $id][0]{
				_id,
				content,
				createdAt,
				user->{
					_id,
					name
				}
			}`,
			{ id: comment._id }
		);

		revalidatePath("/prayers");

		return {
			success: true,
			comment: commentWithUser,
		};
	} catch (error) {
		console.error("Error adding comment:", error);
		throw new Error("Failed to add comment");
	}
}

export async function likeComment(commentId: string) {
	try {
		const user = await getCurrentUser();
		if (!user?.id) {
			throw new Error("Unauthorized");
		}

		// Get current comment with likes
		const comment = await writeClient.fetch<{ likes?: Array<{ _ref?: string; _type?: string; _id?: string }> }>(
			`*[_id == $id][0]{likes}`,
			{ id: commentId }
		);

		if (!comment) {
			throw new Error("Comment not found");
		}

		const currentLikes = comment.likes || [];
		// Check if user already liked (handle both reference format and expanded format)
		const userLiked = currentLikes.some((like) => like._ref === user.id || (like as any)._id === user.id);

		if (userLiked) {
			// Unlike: remove user from likes
			const newLikes = currentLikes.filter((like) => like._ref !== user.id && (like as any)._id !== user.id);
			await writeClient.patch(commentId).set({ likes: newLikes }).commit();
		} else {
			// Like: add user to likes
			const newLikes = [
				...currentLikes,
				{
					_type: "reference",
					_ref: user.id,
				},
			];
			await writeClient.patch(commentId).set({ likes: newLikes }).commit();
		}

		revalidatePath("/prayers");

		return { success: true, liked: !userLiked };
	} catch (error) {
		console.error("Error liking comment:", error);
		throw new Error("Failed to like comment");
	}
}

export async function replyToComment(commentId: string, prayerId: string, content: string) {
	try {
		const user = await getCurrentUser();
		if (!user?.id) {
			throw new Error("Unauthorized");
		}

		// Get user document from Sanity
		const userDoc = await writeClient.fetch(`*[_type == "user" && _id == $userId][0]`, { userId: user.id });

		if (!userDoc) {
			throw new Error("User not found");
		}

		// Create reply comment
		const reply = await writeClient.create({
			_type: "comment",
			prayerRequest: {
				_type: "reference",
				_ref: prayerId,
			},
			user: {
				_type: "reference",
				_ref: user.id,
			},
			parentComment: {
				_type: "reference",
				_ref: commentId,
			},
			content: content.trim(),
			createdAt: new Date().toISOString(),
		});

		// Fetch the created reply with user data
		const replyWithUser = await writeClient.fetch(
			`*[_id == $id][0]{
				_id,
				content,
				createdAt,
				user->{
					_id,
					name
				}
			}`,
			{ id: reply._id }
		);

		revalidatePath("/prayers");

		return {
			success: true,
			reply: replyWithUser,
		};
	} catch (error) {
		console.error("Error replying to comment:", error);
		throw new Error("Failed to reply to comment");
	}
}

export async function markPrayerAsAnswered(prayerId: string) {
	try {
		const user = await getCurrentUser();
		if (!user?.id) {
			throw new Error("Unauthorized");
		}

		// Get the prayer request to verify ownership
		const prayer = await writeClient.fetch<{ user?: { _ref?: string }; userId?: string }>(
			`*[_id == $id][0]{
				user,
				"userId": user._ref
			}`,
			{ id: prayerId }
		);

		if (!prayer) {
			throw new Error("Prayer request not found");
		}

		// Check if user is the owner
		const isOwner = prayer.userId === user.id;

		if (!isOwner) {
			throw new Error("Only the prayer request owner can mark it as answered");
		}

		// Mark as answered
		await writeClient
			.patch(prayerId)
			.set({
				isAnswered: true,
				answeredAt: new Date().toISOString(),
			})
			.commit();

		revalidatePath("/prayers");
		revalidatePath(`/prayers/${prayerId}`);
		revalidatePath("/profile");

		return { success: true };
	} catch (error: any) {
		console.error("Error marking prayer as answered:", error);
		throw new Error(error.message || "Failed to mark prayer as answered");
	}
}
