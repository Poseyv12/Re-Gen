export default function Loading() {
	return (
		<div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
			<div className="mb-8">
				<div className="h-10 w-64 bg-[var(--border)] rounded-lg animate-pulse mb-3"></div>
				<div className="h-6 w-96 bg-[var(--border)] rounded-lg animate-pulse"></div>
			</div>
			<div className="space-y-6">
				{[1, 2].map((i) => (
					<div key={i} className="rounded-xl border-2 border-[var(--warning)]/30 bg-white p-6 shadow-md animate-pulse">
						<div className="h-6 w-32 bg-[var(--border)] rounded-full mb-4"></div>
						<div className="h-6 w-3/4 bg-[var(--border)] rounded mb-4"></div>
						<div className="space-y-2 mb-6">
							<div className="h-4 w-full bg-[var(--border)] rounded"></div>
							<div className="h-4 w-full bg-[var(--border)] rounded"></div>
							<div className="h-4 w-5/6 bg-[var(--border)] rounded"></div>
						</div>
						<div className="flex gap-3">
							<div className="h-10 flex-1 bg-[var(--border)] rounded-lg"></div>
							<div className="h-10 flex-1 bg-[var(--border)] rounded-lg"></div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}


