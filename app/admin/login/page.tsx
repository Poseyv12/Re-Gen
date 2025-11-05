import { cookies } from "next/headers";
import { redirect } from "next/navigation";

async function login(formData: FormData) {
	"use server";
	const password = (formData.get("password") as string) || "";
	const expected = process.env.ADMIN_PASSWORD || "";
	if (!expected) throw new Error("ADMIN_PASSWORD is not set on the server");
	if (password !== expected) {
		throw new Error("Invalid password");
	}
	const cookieStore = await cookies();
	cookieStore.set("admin", "1", {
		path: "/",
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
		maxAge: 60 * 60 * 8, // 8 hours
	});
	redirect("/admin");
}

export default async function AdminLoginPage() {
	return (
		<div className="mx-auto max-w-sm px-4 py-20">
			<h1 className="mb-6 text-center text-4xl font-extrabold tracking-tight gradient-text">Admin Login</h1>
			<form action={login} className="space-y-4 rounded-2xl border-2 border-[var(--border)] bg-[var(--card)] p-8 shadow-lg">
				<div>
					<label htmlFor="password" className="mb-2 block text-sm font-bold text-[var(--foreground)] uppercase tracking-wider">
						Password
					</label>
					<input
						id="password"
						name="password"
						type="password"
						required
						className="w-full rounded-lg border-2 border-[var(--border)] bg-[var(--card)] px-4 py-3 text-[var(--foreground)] placeholder:text-[var(--muted)] transition-all"
						placeholder="Enter admin password"
					/>
				</div>
				<button type="submit" className="btn-retro w-full rounded-lg px-4 py-3 font-bold text-white uppercase tracking-wider">
					Sign in
				</button>
				<p className="text-center text-xs text-[var(--muted)] font-medium">Access is restricted to leaders.</p>
			</form>
		</div>
	);
}
