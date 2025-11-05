"use client";

export default function ErrorPage({ error }: { error: Error & { digest?: string } }) {
	return (
		<div className="mx-auto max-w-4xl px-4 py-10">
			<h1 className="text-2xl font-semibold">Something went wrong</h1>
			<p className="mt-2 text-sm text-zinc-600">{error.message || "Failed to load admin view."}</p>
		</div>
	);
}


