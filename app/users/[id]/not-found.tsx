import Link from "next/link";

export default function NotFound() {
	return (
		<div className="mx-auto max-w-xl px-4 py-20 text-center">
			<h1 className="text-6xl font-extrabold gradient-text mb-4">404</h1>
			<p className="text-xl text-[var(--foreground)] mb-4">User Not Found</p>
			<p className="text-[var(--muted)] mb-8">We couldn't find the user you were looking for.</p>
			<Link
				href="/prayers"
				className="inline-block rounded-lg bg-[var(--neon-cyan)] px-6 py-3 font-semibold text-white shadow-md hover:bg-[var(--neon-cyan)]/80 transition-all uppercase tracking-wider"
			>
				Go to Prayer Wall
			</Link>
		</div>
	);
}




