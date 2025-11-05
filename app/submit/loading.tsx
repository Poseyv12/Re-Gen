export default function Loading() {
	return (
		<div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
			<div className="mb-8">
				<div className="h-10 w-64 bg-[var(--border)] rounded-lg animate-pulse mb-3"></div>
				<div className="h-6 w-96 bg-[var(--border)] rounded-lg animate-pulse"></div>
			</div>
			<div className="rounded-xl border border-[var(--border)] bg-white p-8 shadow-lg space-y-6">
				{[1, 2, 3, 4, 5].map((i) => (
					<div key={i} className="space-y-2">
						<div className="h-4 w-24 bg-[var(--border)] rounded animate-pulse"></div>
						<div className="h-10 w-full bg-[var(--border)] rounded-lg animate-pulse"></div>
					</div>
				))}
			</div>
		</div>
	);
}


