"use server";

import { writeClient } from "@/lib/sanity.client";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";

export async function followUser(userId: string) {
	try {
		const user = await getCurrentUser();
		if (!user?.id) {
			throw new Error("Unauthorized");
		}

		if (user.id === userId) {
			throw new Error("Cannot follow yourself");
		}

		// Get current user's following list
		const currentUser = await writeClient.fetch<{ following?: Array<{ _ref: string }> }>(
			`*[_type == "user" && _id == $id][0]{following}`,
			{ id: user.id }
		);

		const currentFollowing = currentUser?.following || [];
		const alreadyFollowing = currentFollowing.some((follow) => follow._ref === userId);

		if (alreadyFollowing) {
			return { success: true, following: true };
		}

		// Add to current user's following
		const newFollowing = [
			...currentFollowing,
			{
				_type: "reference",
				_ref: userId,
			},
		];
		await writeClient.patch(user.id).set({ following: newFollowing }).commit();

		// Add to target user's followers
		const targetUser = await writeClient.fetch<{ followers?: Array<{ _ref: string }> }>(
			`*[_type == "user" && _id == $id][0]{followers}`,
			{ id: userId }
		);

		const currentFollowers = targetUser?.followers || [];
		const newFollowers = [
			...currentFollowers,
			{
				_type: "reference",
				_ref: user.id,
			},
		];
		await writeClient.patch(userId).set({ followers: newFollowers }).commit();

		revalidatePath("/users");
		revalidatePath("/profile");
		revalidatePath("/feed");

		return { success: true, following: true };
	} catch (error) {
		console.error("Error following user:", error);
		throw new Error("Failed to follow user");
	}
}

export async function unfollowUser(userId: string) {
	try {
		const user = await getCurrentUser();
		if (!user?.id) {
			throw new Error("Unauthorized");
		}

		// Get current user's following list
		const currentUser = await writeClient.fetch<{ following?: Array<{ _ref: string }> }>(
			`*[_type == "user" && _id == $id][0]{following}`,
			{ id: user.id }
		);

		const currentFollowing = currentUser?.following || [];
		const newFollowing = currentFollowing.filter((follow) => follow._ref !== userId);
		await writeClient.patch(user.id).set({ following: newFollowing }).commit();

		// Remove from target user's followers
		const targetUser = await writeClient.fetch<{ followers?: Array<{ _ref: string }> }>(
			`*[_type == "user" && _id == $id][0]{followers}`,
			{ id: userId }
		);

		const currentFollowers = targetUser?.followers || [];
		const newFollowers = currentFollowers.filter((follower) => follower._ref !== user.id);
		await writeClient.patch(userId).set({ followers: newFollowers }).commit();

		revalidatePath("/users");
		revalidatePath("/profile");
		revalidatePath("/feed");

		return { success: true, following: false };
	} catch (error) {
		console.error("Error unfollowing user:", error);
		throw new Error("Failed to unfollow user");
	}
}




