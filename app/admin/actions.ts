"use server";

import { writeClient, readClient } from "@/lib/sanity.client";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";

export async function approve(id: string) {
	await writeClient.patch(id).set({ status: "approved" }).commit();
	revalidatePath("/prayers");
	revalidatePath("/admin");
}

export async function reject(id: string) {
	await writeClient.patch(id).set({ status: "rejected" }).commit();
	revalidatePath("/admin");
}

export async function deletePrayer(id: string) {
	// Find all comments associated with this prayer request
	const comments = await readClient.fetch<Array<{ _id: string }>>(
		`*[_type == "comment" && prayerRequest._ref == $prayerId]`,
		{ prayerId: id }
	);

	// Delete all associated comments
	for (const comment of comments) {
		await writeClient.delete(comment._id);
	}

	// Delete the prayer request
	await writeClient.delete(id);

	revalidatePath("/prayers");
	revalidatePath("/admin");
}

export async function approveTestimony(id: string) {
	await writeClient.patch(id).set({ status: "approved" }).commit();
	revalidatePath("/reflections");
	revalidatePath("/admin/testimonies");
}

export async function rejectTestimony(id: string) {
	await writeClient.patch(id).set({ status: "rejected" }).commit();
	revalidatePath("/admin/testimonies");
}

export async function deleteTestimony(id: string) {
	await writeClient.delete(id);
	revalidatePath("/reflections");
	revalidatePath("/admin/testimonies");
}

export async function logout() {
	const store = await cookies();
	store.delete("admin");
	redirect("/");
}

async function checkAdminAuth() {
	const store = await cookies();
	const adminCookie = store.get("admin");
	if (!adminCookie || adminCookie.value !== "1") {
		throw new Error("Unauthorized: Admin access required");
	}
}

function generateSecurePassword(): string {
	const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
	const lowercase = "abcdefghijklmnopqrstuvwxyz";
	const numbers = "0123456789";
	const symbols = "!@#$%^&*";
	const allChars = uppercase + lowercase + numbers + symbols;

	// Generate 12-character password with at least one of each type
	const password = [
		uppercase[Math.floor(Math.random() * uppercase.length)],
		lowercase[Math.floor(Math.random() * lowercase.length)],
		numbers[Math.floor(Math.random() * numbers.length)],
		symbols[Math.floor(Math.random() * symbols.length)],
	];

	// Fill remaining 8 characters randomly
	for (let i = password.length; i < 12; i++) {
		password.push(allChars[Math.floor(Math.random() * allChars.length)]);
	}

	// Shuffle the password array
	for (let i = password.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[password[i], password[j]] = [password[j], password[i]];
	}

	return password.join("");
}

export async function resetUserPassword(userId: string): Promise<{ success: boolean; password?: string; error?: string }> {
	try {
		// Check admin authentication
		await checkAdminAuth();

		// Verify user exists
		const user = await readClient.fetch(`*[_type == "user" && _id == $userId][0]`, { userId });
		if (!user) {
			return { success: false, error: "User not found" };
		}

		// Generate secure random password
		const newPassword = generateSecurePassword();

		// Hash the password
		const hashedPassword = await bcrypt.hash(newPassword, 10);

		// Update user in Sanity
		await writeClient.patch(userId).set({ password: hashedPassword }).commit();

		return { success: true, password: newPassword };
	} catch (error: any) {
		console.error("Error resetting password:", error);
		return { success: false, error: error.message || "Failed to reset password" };
	}
}

