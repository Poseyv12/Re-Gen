import { NextResponse } from "next/server";
import { auth, signOut } from "@/app/api/auth/[...nextauth]/route";
import { writeClient, readClient } from "@/lib/sanity.client";

export async function DELETE(request: Request) {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const userId = session.user.id;

		// Get user document
		const user = await readClient.fetch(`*[_type == "user" && _id == $userId][0]`, {
			userId,
		});

		if (!user) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		// Find all prayer requests by this user
		const prayers = await readClient.fetch(`*[_type == "prayerRequest" && user._ref == $userId]`, {
			userId,
		});

		// Delete all prayer requests
		for (const prayer of prayers) {
			await writeClient.delete(prayer._id);
		}

		// Find all comments by this user
		const comments = await readClient.fetch(`*[_type == "comment" && user._ref == $userId]`, {
			userId,
		});

		// Delete all comments
		for (const comment of comments) {
			await writeClient.delete(comment._id);
		}

		// Remove user from other users' following arrays
		// Find all users who have this user in their following array
		const allUsers = await readClient.fetch<Array<{ _id: string; following?: Array<{ _ref: string }> }>>(
			`*[_type == "user" && defined(following)]{_id, following}`,
			{}
		);

		for (const otherUser of allUsers) {
			if (otherUser.following?.some((ref) => ref._ref === userId)) {
				const updatedFollowing = (otherUser.following || []).filter(
					(ref) => ref._ref !== userId
				);
				await writeClient.patch(otherUser._id).set({ following: updatedFollowing }).commit();
			}
		}

		// Remove user from other users' followers arrays
		// Find all users who have this user in their followers array
		const allUsersWithFollowers = await readClient.fetch<Array<{ _id: string; followers?: Array<{ _ref: string }> }>>(
			`*[_type == "user" && defined(followers)]{_id, followers}`,
			{}
		);

		for (const otherUser of allUsersWithFollowers) {
			if (otherUser.followers?.some((ref) => ref._ref === userId)) {
				const updatedFollowers = (otherUser.followers || []).filter(
					(ref) => ref._ref !== userId
				);
				await writeClient.patch(otherUser._id).set({ followers: updatedFollowers }).commit();
			}
		}

		// Remove user from comment likes arrays
		// Find all comments that have this user in their likes array
		const allComments = await readClient.fetch<Array<{ _id: string; likes?: Array<{ _ref: string }> }>>(
			`*[_type == "comment" && defined(likes)]{_id, likes}`,
			{}
		);

		for (const comment of allComments) {
			if (comment.likes?.some((ref) => ref._ref === userId)) {
				const updatedLikes = (comment.likes || []).filter(
					(ref) => ref._ref !== userId
				);
				await writeClient.patch(comment._id).set({ likes: updatedLikes }).commit();
			}
		}

		// Delete the user document
		await writeClient.delete(userId);

		return NextResponse.json({ success: true, message: "Account and all associated data deleted successfully" });
	} catch (error: any) {
		console.error("Account deletion error:", error);
		return NextResponse.json({ error: error.message || "Failed to delete account" }, { status: 500 });
	}
}

