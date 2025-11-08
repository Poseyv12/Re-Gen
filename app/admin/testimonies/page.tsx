import { readClient } from "@/lib/sanity.client";
import { queryPendingTestimonies, queryAllTestimonies } from "@/lib/sanity.queries";
import type { TestimonyDoc } from "@/lib/types";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { FiStar } from "react-icons/fi";
import AdminTestimoniesList from "./AdminTestimoniesList";

async function toggleStatus(id: string, currentStatus: string) {
	"use server";
	const newStatus = currentStatus === "approved" ? "rejected" : "approved";
	await readClient.fetch(`*[_id == $id][0]`, { id }).then(async (testimony) => {
		if (testimony) {
			const { writeClient } = await import("@/lib/sanity.client");
			await writeClient.patch(id).set({ status: newStatus }).commit();
			revalidatePath("/admin/testimonies");
			revalidatePath("/reflections");
		}
	});
}

async function deleteTestimony(id: string) {
	"use server";
	const { writeClient } = await import("@/lib/sanity.client");
	await writeClient.delete(id);
	revalidatePath("/admin/testimonies");
	revalidatePath("/reflections");
}

export default async function AdminTestimoniesPage() {
	// Check admin authentication
	const cookieStore = await cookies();
	const adminCookie = cookieStore.get("admin");
	if (!adminCookie || adminCookie.value !== "1") {
		redirect("/admin/login");
	}

	const pending = await readClient.fetch<TestimonyDoc[]>(queryPendingTestimonies);
	const all = await readClient.fetch<TestimonyDoc[]>(queryAllTestimonies);

	return (
		<div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
			<div className="mb-8 flex items-center justify-between flex-wrap gap-4">
				<div>
					<h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-3 gradient-text">Testimonies</h1>
					<p className="text-base sm:text-lg text-[var(--muted)] font-medium">Review and manage user-submitted testimonies</p>
				</div>
				<div className="flex gap-3">
					<Link
						href="/admin"
						className="rounded-lg border-2 border-[var(--border)] bg-[var(--card)] px-4 py-2 text-sm font-bold text-[var(--foreground)] uppercase tracking-wider hover:border-[var(--neon-cyan)] hover:text-[var(--neon-cyan)] transition-all"
					>
						Back to Admin
					</Link>
					<form
						action={async () => {
							"use server";
							const store = await cookies();
							store.delete("admin");
							redirect("/");
						}}
					>
						<button className="rounded-lg border-2 border-[var(--neon-pink)] bg-[var(--card)] px-4 py-2 text-sm font-bold text-[var(--neon-pink)] uppercase tracking-wider hover:bg-[var(--neon-pink)] hover:text-[var(--background)] transition-all shadow-lg">
							Log out
						</button>
					</form>
				</div>
			</div>

			{pending.length > 0 && (
				<div className="mb-8">
					<h2 className="text-2xl font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
						<FiStar className="w-5 h-5 text-[var(--neon-yellow)]" />
						Pending Review ({pending.length})
					</h2>
					<AdminTestimoniesList testimonies={pending} showModerationActions={true} />
				</div>
			)}

			<div className="mb-6">
				<h2 className="text-2xl font-bold text-[var(--foreground)] mb-4">All Testimonies ({all.length})</h2>
			</div>

			{all.length === 0 ? (
				<div className="text-center py-16 rounded-2xl border-2 border-[var(--border)] bg-[var(--card)]">
					<div className="flex justify-center mb-4">
						<FiStar className="w-16 h-16 text-[var(--neon-yellow)]" />
					</div>
					<p className="text-[var(--muted)] text-lg font-bold">No testimonies yet</p>
					<p className="text-[var(--muted)] text-sm mt-2">Testimonies submitted by users will appear here.</p>
				</div>
			) : (
				<AdminTestimoniesList testimonies={all} showModerationActions={false} />
			)}
		</div>
	);
}

export const dynamic = "force-dynamic";

