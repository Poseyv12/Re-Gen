import { FiHeart, FiHome, FiBookOpen, FiMessageCircle } from "react-icons/fi";

export default function Home() {
	return (
		<div className="mx-auto max-w-6xl px-4 py-8 sm:py-12 lg:px-8">
			<div className="text-center mb-8 sm:mb-12">
				<h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight mb-4 sm:mb-6">
					<span className="gradient-text">Re:Generation</span>
					<br />
					<span className="gradient-text">Prayer Wall</span>
				</h1>
				<p className="text-base sm:text-lg lg:text-xl text-[var(--muted)] max-w-2xl mx-auto font-medium px-2">
					Share your prayer requests, lift up others in prayer, and find encouragement in our community.
				</p>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-5xl mx-auto">
				<a
					href="/submit"
					className="card-hover group rounded-2xl border-2 border-[var(--border)] bg-[var(--card)] p-6 sm:p-8 shadow-lg text-center transition-all min-h-[160px] flex flex-col justify-center"
				>
					<div className="mb-3 sm:mb-4 flex justify-center">
						<FiHeart className="w-12 h-12 sm:w-16 sm:h-16 text-[var(--neon-pink)] group-hover:scale-110 transition-transform" />
					</div>
					<h3 className="font-bold text-base sm:text-lg mb-2 group-hover:text-[var(--neon-pink)] transition-colors uppercase tracking-wider">
						Submit Request
					</h3>
					<p className="text-xs sm:text-sm text-[var(--muted)]">Share your prayer need with the community</p>
				</a>

				<a
					href="/prayers"
					className="card-hover group rounded-2xl border-2 border-[var(--border)] bg-[var(--card)] p-6 sm:p-8 shadow-lg text-center transition-all min-h-[160px] flex flex-col justify-center"
				>
					<div className="mb-3 sm:mb-4 flex justify-center">
						<FiHome className="w-12 h-12 sm:w-16 sm:h-16 text-[var(--neon-cyan)] group-hover:scale-110 transition-transform" />
					</div>
					<h3 className="font-bold text-base sm:text-lg mb-2 group-hover:text-[var(--neon-cyan)] transition-colors uppercase tracking-wider">
						Prayer Wall
					</h3>
					<p className="text-xs sm:text-sm text-[var(--muted)]">View and pray for approved requests</p>
				</a>

				<a
					href="/reflections"
					className="card-hover group rounded-2xl border-2 border-[var(--border)] bg-[var(--card)] p-6 sm:p-8 shadow-lg text-center transition-all min-h-[160px] flex flex-col justify-center"
				>
					<div className="mb-3 sm:mb-4 flex justify-center">
						<FiBookOpen className="w-12 h-12 sm:w-16 sm:h-16 text-[var(--neon-yellow)] group-hover:scale-110 transition-transform" />
					</div>
					<h3 className="font-bold text-base sm:text-lg mb-2 group-hover:text-[var(--neon-yellow)] transition-colors uppercase tracking-wider">
						Testimonies
					</h3>
					<p className="text-xs sm:text-sm text-[var(--muted)]">Stories of God's work in our lives</p>
				</a>

				<a
					href="/bible-chat"
					className="card-hover group rounded-2xl border-2 border-[var(--border)] bg-[var(--card)] p-6 sm:p-8 shadow-lg text-center transition-all min-h-[160px] flex flex-col justify-center"
				>
					<div className="mb-3 sm:mb-4 flex justify-center">
						<FiMessageCircle className="w-12 h-12 sm:w-16 sm:h-16 text-[var(--neon-cyan)] group-hover:scale-110 transition-transform" />
					</div>
					<h3 className="font-bold text-base sm:text-lg mb-2 group-hover:text-[var(--neon-cyan)] transition-colors uppercase tracking-wider">
						Bible Chat
					</h3>
					<p className="text-xs sm:text-sm text-[var(--muted)]">Ask questions about the Bible with AI</p>
				</a>
			</div>

			<div className="mt-12 sm:mt-16 text-center px-4">
				<p className="text-sm sm:text-base text-[var(--muted)] italic font-medium leading-relaxed">
					"Therefore, confess your sins to one another and pray for one another, that you may be healed."
					<br />
					<span className="text-xs sm:text-sm mt-2 block text-[var(--neon-cyan)]">— James 5:16</span>
				</p>
			</div>
		</div>
	);
}
