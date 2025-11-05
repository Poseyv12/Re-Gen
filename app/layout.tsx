import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Navigation from "@/components/Navigation";
import SessionProvider from "@/components/SessionProvider";
import InstallBanner from "@/components/InstallBanner";
import Toaster from "@/components/Toaster";
import "./globals.css";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Re:Generation Prayer Wall",
	description: "Share prayer requests, pray for others, and be encouraged in community.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
				<SessionProvider>
					<Navigation />
					<main className="min-h-screen pb-16 md:pb-0">{children}</main>
					<InstallBanner />
					<Toaster />
				</SessionProvider>
			</body>
		</html>
	);
}
