"use server";

import { writeClient, readClient } from "@/lib/sanity.client";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

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

export async function logout() {
	const store = await cookies();
	store.delete("admin");
	redirect("/");
}

