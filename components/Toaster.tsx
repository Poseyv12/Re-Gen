"use client";

import { Toaster as ReactHotToaster } from "react-hot-toast";

export default function Toaster() {
	return (
		<ReactHotToaster
			position="top-right"
			toastOptions={{
				duration: 3000,
				style: {
					background: "var(--card)",
					color: "var(--foreground)",
					border: "2px solid var(--border)",
					borderRadius: "12px",
					padding: "12px 16px",
					fontSize: "14px",
					fontWeight: "600",
				},
				success: {
					iconTheme: {
						primary: "var(--neon-cyan)",
						secondary: "var(--background)",
					},
					style: {
						border: "2px solid var(--neon-cyan)",
					},
				},
				error: {
					iconTheme: {
						primary: "#ef4444",
						secondary: "var(--background)",
					},
					style: {
						border: "2px solid #ef4444",
					},
				},
			}}
		/>
	);
}

