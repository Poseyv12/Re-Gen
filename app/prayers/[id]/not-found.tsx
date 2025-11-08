import Link from "next/link";

export default function NotFound() {
	return (
		<div className="mx-auto max-w-2xl px-4 py-16 text-center">
			<h1 className="text-4xl font-extrabold mb-4 gradient-text">Prayer Request Not Found</h1>
			<p className="text-lg text-[var(--muted)] mb-8">The prayer request you're looking for doesn't exist or has been removed.</p>
			<Link
				href="/prayers"
				className="btn-retro-cyan inline-block rounded-lg px-6 py-3 font-bold text-white uppercase tracking-wider shadow-lg"
			>
				Back to Prayer Wall
			</Link>
		</div>
	);
}




