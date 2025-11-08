import { getCurrentUser } from "@/lib/auth";
import { readClient } from "@/lib/sanity.client";
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { id } = await params;
		const user = await getCurrentUser();

		if (!user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Get current user's following list
		const currentUser = await readClient.fetch<{ following?: Array<{ _ref: string }> }>(
			`*[_type == "user" && _id == $id][0]{following}`,
			{ id: user.id }
		);

		const isFollowing = currentUser?.following?.some((follow) => follow._ref === id) || false;

		return NextResponse.json({ isFollowing });
	} catch (error) {
		console.error("Error checking follow status:", error);
		return NextResponse.json({ error: "Failed to check follow status" }, { status: 500 });
	}
}




