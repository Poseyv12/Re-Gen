import { NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { writeClient, readClient } from "@/lib/sanity.client";
import bcrypt from "bcryptjs";

export async function PATCH(request: Request) {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const body = await request.json();
		const { name, email, image, currentPassword, newPassword } = body;

		// Get current user
		const user = await readClient.fetch(`*[_type == "user" && _id == $userId][0]`, {
			userId: session.user.id,
		});

		if (!user) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		const updateData: any = {};

		// Update profile fields
		if (name !== undefined) {
			updateData.name = name;
		}

		if (email !== undefined) {
			// Check if email is already taken by another user
			const existingUser = await readClient.fetch(`*[_type == "user" && email == $email && _id != $userId][0]`, {
				email,
				userId: session.user.id,
			});

			if (existingUser) {
				return NextResponse.json({ error: "Email is already taken" }, { status: 400 });
			}

			updateData.email = email;
		}

		if (image !== undefined) {
			updateData.image = image || null;
		}

		// Update password if provided
		if (currentPassword && newPassword) {
			// Verify current password
			if (!user.password) {
				return NextResponse.json({ error: "Current password is required" }, { status: 400 });
			}

			const isValid = await bcrypt.compare(currentPassword, user.password);
			if (!isValid) {
				return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
			}

			if (newPassword.length < 6) {
				return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
			}

			// Hash new password
			updateData.password = await bcrypt.hash(newPassword, 10);
		}

		// Update user
		await writeClient.patch(session.user.id).set(updateData).commit();

		return NextResponse.json({ success: true, message: "Account updated successfully" });
	} catch (error: any) {
		console.error("Account update error:", error);
		return NextResponse.json({ error: error.message || "Failed to update account" }, { status: 500 });
	}
}

