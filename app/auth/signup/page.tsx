"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
	const router = useRouter();
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setLoading(true);
		setError("");

		const formData = new FormData(e.currentTarget);
		const name = formData.get("name") as string;
		const email = formData.get("email") as string;
		const password = formData.get("password") as string;
		const confirmPassword = formData.get("confirmPassword") as string;

		if (password !== confirmPassword) {
			setError("Passwords do not match");
			setLoading(false);
			return;
		}

		if (password.length < 6) {
			setError("Password must be at least 6 characters");
			setLoading(false);
			return;
		}

		try {
			const res = await fetch("/api/auth/signup", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ name, email, password }),
			});

			const data = await res.json();

			if (!res.ok) {
				throw new Error(data.error || "Failed to create account");
			}

			// Sign in after successful signup
			const result = await signIn("credentials", {
				email,
				password,
				redirect: false,
			});

			if (result?.ok) {
				router.push("/prayers");
			} else {
				setError("Account created but sign in failed. Please try signing in.");
			}
		} catch (err: any) {
			setError(err.message || "Something went wrong");
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="mx-auto max-w-sm px-4 py-20">
			<h1 className="mb-6 text-center text-4xl font-extrabold tracking-tight gradient-text">Sign Up</h1>
			<form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border-2 border-[var(--border)] bg-[var(--card)] p-8 shadow-lg">
				{error && (
					<div className="rounded-lg bg-[var(--error)]/20 border border-[var(--error)] p-3 text-sm text-[var(--error)]">
						{error}
					</div>
				)}

				<div>
					<label htmlFor="name" className="mb-2 block text-sm font-bold text-[var(--foreground)] uppercase tracking-wider">
						Name
					</label>
					<input
						id="name"
						name="name"
						type="text"
						required
						className="w-full rounded-lg border-2 border-[var(--border)] bg-[var(--card)] px-4 py-3 text-[var(--foreground)] placeholder:text-[var(--muted)] transition-all"
						placeholder="Your name"
					/>
				</div>

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
						minLength={6}
						className="w-full rounded-lg border-2 border-[var(--border)] bg-[var(--card)] px-4 py-3 text-[var(--foreground)] placeholder:text-[var(--muted)] transition-all"
						placeholder="At least 6 characters"
					/>
				</div>

				<div>
					<label htmlFor="confirmPassword" className="mb-2 block text-sm font-bold text-[var(--foreground)] uppercase tracking-wider">
						Confirm Password
					</label>
					<input
						id="confirmPassword"
						name="confirmPassword"
						type="password"
						required
						className="w-full rounded-lg border-2 border-[var(--border)] bg-[var(--card)] px-4 py-3 text-[var(--foreground)] placeholder:text-[var(--muted)] transition-all"
						placeholder="Confirm password"
					/>
				</div>

				<button type="submit" disabled={loading} className="btn-retro w-full rounded-lg px-4 py-3 font-bold text-white uppercase tracking-wider disabled:opacity-50">
					{loading ? "Creating Account..." : "Sign Up"}
				</button>

				<p className="text-center text-sm text-[var(--muted)]">
					Already have an account?{" "}
					<a href="/auth/signin" className="text-[var(--neon-cyan)] hover:text-[var(--neon-pink)] transition-colors font-bold">
						Sign In
					</a>
				</p>
			</form>
		</div>
	);
}




