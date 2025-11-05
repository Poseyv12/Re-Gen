"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function SignInPage() {
	const router = useRouter();
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setLoading(true);
		setError("");

		const formData = new FormData(e.currentTarget);
		const email = formData.get("email") as string;
		const password = formData.get("password") as string;

		try {
			const result = await signIn("credentials", {
				email,
				password,
				redirect: false,
			});

			if (result?.error) {
				setError("Invalid email or password");
			} else if (result?.ok) {
				router.push("/prayers");
				router.refresh();
			}
		} catch (err: any) {
			setError("Something went wrong. Please try again.");
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="mx-auto max-w-sm px-4 py-20">
			<h1 className="mb-6 text-center text-4xl font-extrabold tracking-tight gradient-text">Sign In</h1>
			<form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border-2 border-[var(--border)] bg-[var(--card)] p-8 shadow-lg">
				{error && (
					<div className="rounded-lg bg-[var(--error)]/20 border border-[var(--error)] p-3 text-sm text-[var(--error)]">
						{error}
					</div>
				)}

				<div>
					<label htmlFor="email" className="mb-2 block text-sm font-bold text-[var(--foreground)] uppercase tracking-wider">
						Email
					</label>
					<input
						id="email"
						name="email"
						type="email"
						required
						className="w-full rounded-lg border-2 border-[var(--border)] bg-[var(--card)] px-4 py-3 text-[var(--foreground)] placeholder:text-[var(--muted)] transition-all"
						placeholder="your@email.com"
					/>
				</div>

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
						placeholder="Enter your password"
					/>
				</div>

				<button type="submit" disabled={loading} className="btn-retro w-full rounded-lg px-4 py-3 font-bold text-white uppercase tracking-wider disabled:opacity-50">
					{loading ? "Signing In..." : "Sign In"}
				</button>

				<p className="text-center text-sm text-[var(--muted)]">
					Don't have an account?{" "}
					<a href="/auth/signup" className="text-[var(--neon-cyan)] hover:text-[var(--neon-pink)] transition-colors font-bold">
						Sign Up
					</a>
				</p>
			</form>
		</div>
	);
}

