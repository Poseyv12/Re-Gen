import Link from "next/link";
import { FiHeart } from "react-icons/fi";

export default function ThanksPage() {
	return (
		<div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8 text-center">
			<div className="mb-8">
				<div className="flex justify-center mb-6">
					<FiHeart className="w-16 h-16 sm:w-20 sm:h-20 text-[var(--neon-pink)]" />
				</div>
				<h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight mb-4 gradient-text">Thank You</h1>
				<p className="text-lg text-[var(--muted)] mb-2 font-medium">Your prayer request has been submitted and is awaiting review.</p>
				<p className="text-sm text-[var(--muted)]">An admin will review it shortly before it appears on the prayer wall.</p>
			</div>

			<div className="mt-8 space-y-4">
				<Link href="/prayers" className="btn-retro-cyan inline-block rounded-lg px-8 py-4 font-bold text-white uppercase tracking-wider shadow-lg">
					View Prayer Wall
				</Link>
				<div>
					<Link href="/" className="text-sm text-[var(--neon-cyan)] hover:text-[var(--neon-pink)] transition-colors font-medium">
						← Back to Home
					</Link>
				</div>
			</div>
		</div>
	);
}
