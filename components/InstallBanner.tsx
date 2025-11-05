"use client";

import { useState, useEffect } from "react";
import { FiSmartphone } from "react-icons/fi";

export default function InstallBanner() {
	const [showBanner, setShowBanner] = useState(false);
	const [isIOS, setIsIOS] = useState(false);
	const [isStandalone, setIsStandalone] = useState(false);

	useEffect(() => {
		// Check if already dismissed
		const dismissed = localStorage.getItem("install-banner-dismissed");
		if (dismissed === "true") {
			return;
		}

		// Detect iOS
		const userAgent = window.navigator.userAgent.toLowerCase();
		const isIOSDevice =
			/iphone|ipad|ipod/.test(userAgent) ||
			(/macintosh/.test(userAgent) && "ontouchend" in document);

		// Check if already installed (running as PWA)
		const isStandaloneMode =
			(window.navigator as any).standalone === true ||
			window.matchMedia("(display-mode: standalone)").matches ||
			document.referrer.includes("android-app://");

		setIsIOS(isIOSDevice);
		setIsStandalone(isStandaloneMode);

		// Show banner if iOS and not already installed
		if (isIOSDevice && !isStandaloneMode) {
			// Small delay for better UX
			setTimeout(() => {
				setShowBanner(true);
			}, 2000);
		}
	}, []);

	const handleDismiss = () => {
		setShowBanner(false);
		localStorage.setItem("install-banner-dismissed", "true");
	};

	if (!showBanner || !isIOS || isStandalone) {
		return null;
	}

	return (
		<div className="fixed bottom-16 md:bottom-0 left-0 right-0 z-50 p-4 install-banner-enter">
			<div className="mx-auto max-w-2xl rounded-2xl border-2 border-[var(--neon-cyan)] bg-[var(--card)] p-6 shadow-lg backdrop-blur-md">
				<div className="flex items-start gap-4">
					<div className="flex-shrink-0">
						<FiSmartphone className="w-10 h-10 text-[var(--neon-cyan)]" />
					</div>
					<div className="flex-1">
						<h3 className="text-lg font-bold text-[var(--foreground)] mb-2">Add to Home Screen</h3>
						<p className="text-sm text-[var(--muted)] mb-4">
							Install this app on your iPhone or iPad for quick access. Tap the{" "}
							<span className="font-bold text-[var(--neon-cyan)]">Share</span> button at the bottom, scroll down, and select{" "}
							<span className="font-bold text-[var(--neon-pink)]">"Add to Home Screen"</span>.
						</p>
						<div className="flex items-center gap-3">
							<button
								onClick={handleDismiss}
								className="flex-1 rounded-lg border-2 border-[var(--neon-cyan)] bg-[var(--card)] px-4 py-2 text-sm font-bold text-[var(--neon-cyan)] uppercase tracking-wider hover:bg-[var(--neon-cyan)] hover:text-[var(--background)] transition-all"
							>
								Got it
							</button>
							<button
								onClick={handleDismiss}
								className="rounded-lg border-2 border-[var(--border)] bg-[var(--card)] px-4 py-2 text-sm font-bold text-[var(--muted)] uppercase tracking-wider hover:border-[var(--neon-pink)] hover:text-[var(--neon-pink)] transition-all"
								aria-label="Close"
							>
								✕
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

