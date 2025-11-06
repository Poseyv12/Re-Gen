import { readClient, writeClient } from "@/lib/sanity.client";
import { queryAllReflections } from "@/lib/sanity.queries";
import type { DailyReflectionDoc } from "@/lib/types";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { FiBookOpen, FiEdit, FiEye, FiEyeOff, FiPlus, FiTrash2 } from "react-icons/fi";
import ReflectionForm from "./ReflectionForm";
import ReflectionActions from "./ReflectionActions";

async function togglePublish(id: string, isPublished: boolean) {
	"use server";
	await writeClient.patch(id).set({ isPublished: !isPublished }).commit();
	revalidatePath("/admin/reflections");
	revalidatePath("/reflections");
}

async function deleteReflection(id: string) {
	"use server";
	await writeClient.delete(id);
	revalidatePath("/admin/reflections");
	revalidatePath("/reflections");
}

export default async function AdminReflectionsPage() {
	// Check admin authentication
	const cookieStore = await cookies();
	const adminCookie = cookieStore.get("admin");
	if (!adminCookie || adminCookie.value !== "1") {
		redirect("/admin/login");
	}

	const reflections = await readClient.fetch<DailyReflectionDoc[]>(queryAllReflections);
	const today = new Date().toISOString().split("T")[0];

	return (
		<div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
			<div className="mb-8 flex items-center justify-between flex-wrap gap-4">
				<div>
					<h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-3 gradient-text">
						Daily Reflections
					</h1>
					<p className="text-base sm:text-lg text-[var(--muted)] font-medium">
						Create and manage daily reflections for Life Family Church
					</p>
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

			<div className="mb-8">
				<ReflectionForm today={today} />
			</div>

			<div className="mb-6">
				<h2 className="text-2xl font-bold text-[var(--foreground)] mb-4">All Reflections</h2>
			</div>

			{reflections.length === 0 ? (
				<div className="text-center py-16 rounded-2xl border-2 border-[var(--border)] bg-[var(--card)]">
					<div className="flex justify-center mb-4">
						<FiBookOpen className="w-16 h-16 text-[var(--neon-cyan)]" />
					</div>
					<p className="text-[var(--muted)] text-lg font-bold">No reflections yet</p>
					<p className="text-[var(--muted)] text-sm mt-2">Create your first daily reflection above.</p>
				</div>
			) : (
				<div className="space-y-4">
					{reflections.map((reflection) => (
						<div
							key={reflection._id}
							className={`rounded-2xl border-2 bg-[var(--card)] p-6 shadow-lg ${
								reflection.isPublished
									? "border-[var(--neon-cyan)]"
									: "border-[var(--border)] opacity-75"
							}`}
						>
							<div className="mb-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
								<div className="flex-1">
									<div className="flex items-center gap-3 mb-2">
										{reflection.isPublished ? (
											<span className="inline-flex items-center rounded-full bg-[var(--neon-cyan)]/20 px-3 py-1 text-xs font-bold text-[var(--neon-cyan)] border border-[var(--neon-cyan)]/30 uppercase tracking-wider">
												<FiEye className="w-3 h-3 mr-1" />
												Published
											</span>
										) : (
											<span className="inline-flex items-center rounded-full bg-[var(--muted)]/20 px-3 py-1 text-xs font-bold text-[var(--muted)] border border-[var(--border)] uppercase tracking-wider">
												<FiEyeOff className="w-3 h-3 mr-1" />
												Draft
											</span>
										)}
										{reflection.date === today && (
											<span className="inline-flex items-center rounded-full bg-[var(--neon-yellow)]/20 px-3 py-1 text-xs font-bold text-[var(--neon-yellow)] border border-[var(--neon-yellow)]/30 uppercase tracking-wider">
												Today
											</span>
										)}
									</div>
									<h3 className="text-xl font-bold text-[var(--foreground)] mb-2">{reflection.title}</h3>
									<div className="flex flex-wrap items-center gap-3 text-sm text-[var(--muted)]">
										<span>
											{new Date(reflection.date).toLocaleDateString("en-US", {
												year: "numeric",
												month: "long",
												day: "numeric",
											})}
										</span>
										{reflection.author && (
											<span className="text-[var(--neon-cyan)] font-medium">• {reflection.author}</span>
										)}
										{reflection.scripture && (
											<span className="text-[var(--neon-pink)] font-medium">• {reflection.scripture}</span>
										)}
									</div>
								</div>
							</div>

							<ReflectionActions
								reflectionId={reflection._id}
								isPublished={reflection.isPublished}
								onTogglePublish={togglePublish.bind(null, reflection._id, reflection.isPublished)}
								onDelete={deleteReflection.bind(null, reflection._id)}
							/>
						</div>
					))}
				</div>
			)}
		</div>
	);
}

export const dynamic = "force-dynamic";

