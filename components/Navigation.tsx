"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { FiHome, FiSmartphone, FiUser, FiSettings, FiEdit, FiLock, FiMenu, FiX, FiBookOpen, FiMessageCircle } from "react-icons/fi";
import Tooltip from "@/components/Tooltip";

export default function Navigation() {
	const { data: session } = useSession();
	const pathname = usePathname();
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

	// Close menu when route changes
	useEffect(() => {
		setMobileMenuOpen(false);
	}, [pathname]);

	// Prevent body scroll when menu is open
	useEffect(() => {
		if (mobileMenuOpen) {
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "unset";
		}
		return () => {
			document.body.style.overflow = "unset";
		};
	}, [mobileMenuOpen]);

	const isActive = (path: string) => pathname === path;

	return (
		<>
			{/* Top Navigation Bar */}
			<nav className="border-b-2 border-[var(--border)] bg-[var(--card)]/80 backdrop-blur-md sticky top-0 z-50 retro-pattern">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="flex h-16 sm:h-20 items-center justify-between">
						<Link href="/" className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity">
							<div className="flex flex-col items-center justify-center">
								<Image
									src="/logo2.webp"
									alt="Re:Generation Logo"
									width={120}
									height={120}
									className="h-12 w-auto sm:h-16 object-contain mb-0.5"
									priority
								/>
								<span className="pl-3 mt-[-20px] text-xs sm:text-sm font-medium text-[var(--muted)] leading-tight">
									Life Family Church
								</span>
							</div>
						</Link>
						<div className="flex items-center gap-3">
							{/* Desktop Navigation */}
							<div className="hidden md:flex items-center gap-6">
								<Link href="/prayers" className="text-sm font-semibold text-[var(--foreground)] hover:text-[var(--neon-cyan)] transition-colors uppercase tracking-wider">
									Prayer Wall
								</Link>
								<Link href="/reflections" className="text-sm font-semibold text-[var(--foreground)] hover:text-[var(--neon-yellow)] transition-colors uppercase tracking-wider">
									Testimonies
								</Link>
								<Link href="/bible-chat" className="text-sm font-semibold text-[var(--foreground)] hover:text-[var(--neon-cyan)] transition-colors uppercase tracking-wider">
									Re:Gen Chat
								</Link>
								{session?.user && (
									<>
										<Link href="/feed" className="text-sm font-semibold text-[var(--foreground)] hover:text-[var(--neon-pink)] transition-colors uppercase tracking-wider">
											Feed
										</Link>
										<Link href="/profile" className="text-sm font-semibold text-[var(--foreground)] hover:text-[var(--neon-yellow)] transition-colors uppercase tracking-wider">
											Profile
										</Link>
										<Link href="/admin" className="text-sm font-semibold text-[var(--foreground)] hover:text-[var(--neon-yellow)] transition-colors uppercase tracking-wider">
											Admin
										</Link>
									</>
								)}
								<Link href="/submit" className="text-sm font-semibold text-[var(--foreground)] hover:text-[var(--neon-pink)] transition-colors uppercase tracking-wider">
									Submit Request
								</Link>
							</div>

							{session?.user ? (
								<div className="hidden md:flex items-center gap-3">
									<span className="text-sm text-[var(--muted)] font-medium">{session.user.name}</span>
									<Tooltip content="Sign out of your account" position="bottom">
										<button
											onClick={() => signOut({ callbackUrl: "/" })}
											className="rounded-lg border-2 border-[var(--neon-pink)] bg-[var(--card)] px-3 py-1.5 text-xs font-bold text-[var(--neon-pink)] uppercase tracking-wider hover:bg-[var(--neon-pink)] hover:text-[var(--background)] transition-all"
										>
											Sign Out
										</button>
									</Tooltip>
								</div>
							) : (
								<Tooltip content="Sign in to access your profile and feed" position="bottom">
									<Link
										href="/auth/signin"
										className="hidden md:block rounded-lg border-2 border-[var(--neon-cyan)] bg-[var(--card)] px-4 py-2 text-xs font-bold text-[var(--neon-cyan)] uppercase tracking-wider hover:bg-[var(--neon-cyan)] hover:text-[var(--background)] transition-all"
									>
										Sign In
									</Link>
								</Tooltip>
							)}

							{/* Mobile Menu Button */}
							<button
								onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
								className="md:hidden p-2 rounded-lg border-2 border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] hover:border-[var(--neon-cyan)] transition-all"
								aria-label="Toggle menu"
							>
								{mobileMenuOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
							</button>
						</div>
					</div>
				</div>
			</nav>

			{/* Mobile Menu Drawer */}
			<div
				className={`fixed inset-0 z-40 md:hidden transition-opacity duration-300 ${
					mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
				}`}
			>
				<div
					className={`fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
						mobileMenuOpen ? "opacity-100" : "opacity-0"
					}`}
					onClick={() => setMobileMenuOpen(false)}
				/>
				<div
					className={`fixed top-16 left-0 right-0 w-full max-h-[calc(100vh-8rem)] bg-[var(--card)] border-b-2 border-[var(--border)] shadow-2xl overflow-y-auto transition-transform duration-300 ease-out ${
						mobileMenuOpen ? "translate-y-0" : "-translate-y-full"
					}`}
				>
					<div className="p-4 sm:p-6 pb-20">
						{/* Header */}
						{/* <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-[var(--border)]">
							<div className="flex items-center gap-3">
								<Image
									src="/logo2.webp"
									alt="Re:Generation Logo"
									width={40}
									height={40}
									className="h-8 w-auto object-contain"
									priority
								/>
								<div>
									<h2 className="text-lg font-bold text-[var(--foreground)]">Menu</h2>
									<p className="text-xs text-[var(--muted)]">Life Family Church</p>
								</div>
							</div>
							<button
								onClick={() => setMobileMenuOpen(false)}
								className="p-2 rounded-lg border-2 border-[var(--border)] text-[var(--foreground)] hover:border-[var(--neon-cyan)] hover:bg-[var(--neon-cyan)]/10 transition-all active:scale-95"
								aria-label="Close menu"
							>
								<FiX className="w-5 h-5" />
							</button>
						</div> */}

						{/* User Info */}
						{session?.user && (
							<div className="mb-6 p-4 rounded-xl border-2 border-[var(--border)] bg-[var(--background)]">
								<p className="text-sm font-medium text-[var(--foreground)] mb-1">{session.user.name}</p>
								<p className="text-xs text-[var(--muted)]">{session.user.email}</p>
							</div>
						)}

						{/* Main Navigation */}
						<div className="space-y-2 mb-6">
								<Link
									href="/prayers"
									onClick={() => setMobileMenuOpen(false)}
									className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 transition-all active:scale-95 ${
										isActive("/prayers")
											? "border-[var(--neon-cyan)] bg-[var(--neon-cyan)]/20 text-[var(--neon-cyan)] shadow-lg shadow-[var(--neon-cyan)]/20"
											: "border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] hover:border-[var(--neon-cyan)] hover:bg-[var(--neon-cyan)]/5"
									}`}
								>
									<FiHome className={`w-5 h-5 flex-shrink-0 ${isActive("/prayers") ? "text-[var(--neon-cyan)]" : ""}`} />
									<span className="font-semibold">Prayer Wall</span>
								</Link>
								<Link
									href="/reflections"
									onClick={() => setMobileMenuOpen(false)}
									className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 transition-all active:scale-95 ${
										isActive("/reflections")
											? "border-[var(--neon-yellow)] bg-[var(--neon-yellow)]/20 text-[var(--neon-yellow)] shadow-lg shadow-[var(--neon-yellow)]/20"
											: "border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] hover:border-[var(--neon-yellow)] hover:bg-[var(--neon-yellow)]/5"
									}`}
								>
									<FiBookOpen className={`w-5 h-5 flex-shrink-0 ${isActive("/reflections") ? "text-[var(--neon-yellow)]" : ""}`} />
									<span className="font-semibold">Testimonies</span>
								</Link>
								<Link
									href="/bible-chat"
									onClick={() => setMobileMenuOpen(false)}
									className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 transition-all active:scale-95 ${
										isActive("/bible-chat")
											? "border-[var(--neon-cyan)] bg-[var(--neon-cyan)]/20 text-[var(--neon-cyan)] shadow-lg shadow-[var(--neon-cyan)]/20"
											: "border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] hover:border-[var(--neon-cyan)] hover:bg-[var(--neon-cyan)]/5"
									}`}
								>
									<FiMessageCircle className={`w-5 h-5 flex-shrink-0 ${isActive("/bible-chat") ? "text-[var(--neon-cyan)]" : ""}`} />
									<span className="font-semibold">Re:Gen Chat</span>
								</Link>
								{session?.user && (
									<>
										<Link
											href="/feed"
											onClick={() => setMobileMenuOpen(false)}
											className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 transition-all active:scale-95 ${
												isActive("/feed")
													? "border-[var(--neon-pink)] bg-[var(--neon-pink)]/20 text-[var(--neon-pink)] shadow-lg shadow-[var(--neon-pink)]/20"
													: "border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] hover:border-[var(--neon-pink)] hover:bg-[var(--neon-pink)]/5"
											}`}
										>
											<FiSmartphone className={`w-5 h-5 flex-shrink-0 ${isActive("/feed") ? "text-[var(--neon-pink)]" : ""}`} />
											<span className="font-semibold">Feed</span>
										</Link>
										<Link
											href="/profile"
											onClick={() => setMobileMenuOpen(false)}
											className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 transition-all active:scale-95 ${
												isActive("/profile")
													? "border-[var(--neon-yellow)] bg-[var(--neon-yellow)]/20 text-[var(--neon-yellow)] shadow-lg shadow-[var(--neon-yellow)]/20"
													: "border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] hover:border-[var(--neon-yellow)] hover:bg-[var(--neon-yellow)]/5"
											}`}
										>
											<FiUser className={`w-5 h-5 flex-shrink-0 ${isActive("/profile") ? "text-[var(--neon-yellow)]" : ""}`} />
											<span className="font-semibold">Profile</span>
										</Link>
										<Link
											href="/admin"
											onClick={() => setMobileMenuOpen(false)}
											className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 transition-all active:scale-95 ${
												isActive("/admin")
													? "border-[var(--neon-yellow)] bg-[var(--neon-yellow)]/20 text-[var(--neon-yellow)] shadow-lg shadow-[var(--neon-yellow)]/20"
													: "border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] hover:border-[var(--neon-yellow)] hover:bg-[var(--neon-yellow)]/5"
											}`}
										>
											<FiSettings className={`w-5 h-5 flex-shrink-0 ${isActive("/admin") ? "text-[var(--neon-yellow)]" : ""}`} />
											<span className="font-semibold">Admin</span>
										</Link>
									</>
								)}
								<Link
									href="/submit"
									onClick={() => setMobileMenuOpen(false)}
									className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 transition-all active:scale-95 ${
										isActive("/submit")
											? "border-[var(--neon-pink)] bg-[var(--neon-pink)]/20 text-[var(--neon-pink)] shadow-lg shadow-[var(--neon-pink)]/20"
											: "border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] hover:border-[var(--neon-pink)] hover:bg-[var(--neon-pink)]/5"
									}`}
								>
									<FiEdit className={`w-5 h-5 flex-shrink-0 ${isActive("/submit") ? "text-[var(--neon-pink)]" : ""}`} />
									<span className="font-semibold">Submit Request</span>
								</Link>
						</div>

						{/* Footer Actions */}
						<div className="pt-4 mb-10 border-t-2 border-[var(--border)]">
							{session?.user ? (
								<button
									onClick={() => {
										setMobileMenuOpen(false);
										signOut({ callbackUrl: "/" });
									}}
									className="w-full px-4 py-3.5 rounded-xl border-2 border-[var(--neon-pink)] bg-[var(--neon-pink)]/10 text-[var(--neon-pink)] font-bold uppercase tracking-wider hover:bg-[var(--neon-pink)] hover:text-[var(--background)] transition-all active:scale-95"
								>
									Sign Out
								</button>
							) : (
								<Link
									href="/auth/signin"
									onClick={() => setMobileMenuOpen(false)}
									className="block px-4 py-3.5 rounded-xl border-2 border-[var(--neon-cyan)] bg-[var(--neon-cyan)]/10 text-[var(--neon-cyan)] font-bold uppercase tracking-wider hover:bg-[var(--neon-cyan)] hover:text-[var(--background)] transition-all text-center active:scale-95"
								>
									Sign In
								</Link>
							)}
						</div>
					</div>
				</div>
			</div>

			{/* Bottom Navigation Bar (Mobile Only) */}
			<div className="fixed bottom-0 left-0 right-0 z-40 md:hidden border-t-2 border-[var(--border)] bg-[var(--card)]/95 backdrop-blur-md safe-area-bottom">
				<div className="flex items-center justify-around h-16 px-1 sm:px-2">
					<Link
						href="/prayers"
						className={`flex flex-col items-center justify-center flex-1 h-full transition-all active:scale-95 ${
							isActive("/prayers")
								? "text-[var(--neon-cyan)]"
								: "text-[var(--muted)] hover:text-[var(--foreground)]"
						}`}
					>
						<div className={`relative ${isActive("/prayers") ? "scale-110" : ""}`}>
							<FiHome className="w-6 h-6 mb-0.5" />
							{isActive("/prayers") && (
								<div className="absolute -top-1 -right-1 w-2 h-2 bg-[var(--neon-cyan)] rounded-full animate-pulse" />
							)}
						</div>
						<span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">Wall</span>
					</Link>
					{session?.user && (
						<Link
							href="/feed"
							className={`flex flex-col items-center justify-center flex-1 h-full transition-all active:scale-95 ${
								isActive("/feed")
									? "text-[var(--neon-pink)]"
									: "text-[var(--muted)] hover:text-[var(--foreground)]"
							}`}
						>
							<div className={`relative ${isActive("/feed") ? "scale-110" : ""}`}>
								<FiSmartphone className="w-6 h-6 mb-0.5" />
								{isActive("/feed") && (
									<div className="absolute -top-1 -right-1 w-2 h-2 bg-[var(--neon-pink)] rounded-full animate-pulse" />
								)}
							</div>
							<span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">Feed</span>
						</Link>
					)}
					<Link
						href="/submit"
						className={`flex flex-col items-center justify-center flex-1 h-full transition-all active:scale-95 ${
							isActive("/submit")
								? "text-[var(--neon-pink)]"
								: "text-[var(--muted)] hover:text-[var(--foreground)]"
						}`}
					>
						<div className={`relative ${isActive("/submit") ? "scale-110" : ""}`}>
							<FiEdit className="w-6 h-6 mb-0.5" />
							{isActive("/submit") && (
								<div className="absolute -top-1 -right-1 w-2 h-2 bg-[var(--neon-pink)] rounded-full animate-pulse" />
							)}
						</div>
						<span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">Submit</span>
					</Link>
					{session?.user ? (
						<Link
							href="/profile"
							className={`flex flex-col items-center justify-center flex-1 h-full transition-all active:scale-95 ${
								isActive("/profile")
									? "text-[var(--neon-yellow)]"
									: "text-[var(--muted)] hover:text-[var(--foreground)]"
							}`}
						>
							<div className={`relative ${isActive("/profile") ? "scale-110" : ""}`}>
								<FiUser className="w-6 h-6 mb-0.5" />
								{isActive("/profile") && (
									<div className="absolute -top-1 -right-1 w-2 h-2 bg-[var(--neon-yellow)] rounded-full animate-pulse" />
								)}
							</div>
							<span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">Profile</span>
						</Link>
					) : (
						<Link
							href="/auth/signin"
							className="flex flex-col items-center justify-center flex-1 h-full text-[var(--muted)] transition-all hover:text-[var(--foreground)] active:scale-95"
						>
							<FiLock className="w-6 h-6 mb-0.5" />
							<span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">Sign In</span>
						</Link>
					)}
				</div>
			</div>
		</>
	);
}
