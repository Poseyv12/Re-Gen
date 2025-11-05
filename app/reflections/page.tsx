import { readClient } from "@/lib/sanity.client";
import { queryDailyReflections, queryTodayReflection } from "@/lib/sanity.queries";
import type { DailyReflectionDoc } from "@/lib/types";
import { portableTextToMarkdown } from "@/lib/portableTextToMarkdown";
import { marked } from "marked";
import type { Metadata } from "next";
import { FiBookOpen } from "react-icons/fi";

// Configure marked for safer rendering
marked.setOptions({
	breaks: false, // Use proper paragraph spacing instead of line breaks
	gfm: true,
} as any);

export async function generateMetadata(): Promise<Metadata> {
	return {
		title: "Daily Reflections | Re:Generation",
		description: "Daily reflections and spiritual guidance from Life Family Church",
	};
}

export default async function ReflectionsPage() {
	// Get today's date in YYYY-MM-DD format
	const today = new Date().toISOString().split("T")[0];
	
	// Get today's reflection if available
	const todayReflection = await readClient.fetch<DailyReflectionDoc | null>(queryTodayReflection, { date: today });
	
	// Get all published reflections
	const reflections = await readClient.fetch<DailyReflectionDoc[]>(queryDailyReflections);

	return (
		<div className="mx-auto max-w-4xl px-4 py-6 sm:py-12 sm:px-6 lg:px-8">
			<div className="mb-6 sm:mb-10 text-center">
				<h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-2 sm:mb-3 gradient-text">
					Daily Reflections
				</h1>
				<p className="text-sm sm:text-base lg:text-lg text-[var(--muted)] font-medium px-2">
					Spiritual guidance and reflections from Life Family Church
				</p>
			</div>

			{todayReflection && (
				<div className="mb-8 sm:mb-12">
					<div className="rounded-2xl border-2 border-[var(--neon-cyan)] bg-[var(--card)] p-6 sm:p-8 shadow-lg">
						<div className="mb-4 flex items-center gap-2">
							<FiBookOpen className="w-5 h-5 text-[var(--neon-cyan)]" />
							<span className="text-xs sm:text-sm font-bold text-[var(--neon-cyan)] uppercase tracking-wider">
								Today's Reflection
							</span>
						</div>
						<h2 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)] mb-3 sm:mb-4">
							{todayReflection.title}
						</h2>
						<div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-[var(--muted)]">
							<span>
								{new Date(todayReflection.date).toLocaleDateString("en-US", {
									weekday: "long",
									year: "numeric",
									month: "long",
									day: "numeric",
								})}
							</span>
							{todayReflection.author && (
								<span className="text-[var(--neon-cyan)] font-medium">• {todayReflection.author}</span>
							)}
							{todayReflection.scripture && (
								<span className="text-[var(--neon-pink)] font-medium">• {todayReflection.scripture}</span>
							)}
						</div>
						<div
							className="prose prose-zinc max-w-none text-[var(--foreground)] leading-relaxed prose-invert prose-sm sm:prose-base lg:prose-lg"
							dangerouslySetInnerHTML={{
								__html: marked.parse(portableTextToMarkdown(todayReflection.content)) as string,
							}}
						/>
					</div>
				</div>
			)}

			<div className="mb-6">
				<h2 className="text-xl sm:text-2xl font-bold text-[var(--foreground)] mb-4">
					{todayReflection ? "Past Reflections" : "Reflections"}
				</h2>
			</div>

			{reflections.length === 0 ? (
				<div className="text-center py-12 sm:py-16 rounded-2xl border-2 border-[var(--border)] bg-[var(--card)] px-4">
					<div className="flex justify-center mb-4">
						<FiBookOpen className="w-16 h-16 sm:w-20 sm:h-20 text-[var(--neon-cyan)]" />
					</div>
					<p className="text-[var(--muted)] text-base sm:text-lg font-medium">No reflections available yet.</p>
					<p className="text-[var(--muted)] text-sm mt-2">Check back soon for daily spiritual guidance.</p>
				</div>
			) : (
				<div className="space-y-4 sm:space-y-6">
					{reflections
						.filter((r) => !todayReflection || r._id !== todayReflection._id)
						.map((reflection) => (
							<article
								key={reflection._id}
								className="rounded-2xl border-2 border-[var(--border)] bg-[var(--card)] p-4 sm:p-6 shadow-lg"
							>
								<h3 className="text-lg sm:text-xl font-bold text-[var(--foreground)] mb-2 sm:mb-3">
									{reflection.title}
								</h3>
								<div className="mb-3 sm:mb-4 flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-[var(--muted)]">
									<span>
										{new Date(reflection.date).toLocaleDateString("en-US", {
											year: "numeric",
											month: "long",
											day: "numeric",
										})}
									</span>
									{reflection.author && (
										<span className="text-[var(--neon-cyan)] font-medium">• {reflection.author}</span>
									)}
									{reflection.scripture && (
										<span className="text-[var(--neon-pink)] font-medium">• {reflection.scripture}</span>
									)}
								</div>
								<div
									className="prose prose-zinc max-w-none text-[var(--foreground)] leading-relaxed prose-invert prose-sm sm:prose-base"
									dangerouslySetInnerHTML={{
										__html: marked.parse(portableTextToMarkdown(reflection.content)) as string,
									}}
								/>
							</article>
						))}
				</div>
			)}
		</div>
	);
}

export const dynamic = "force-dynamic";

