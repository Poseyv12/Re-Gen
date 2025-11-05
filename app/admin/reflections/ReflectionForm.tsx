"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FiPlus } from "react-icons/fi";

interface ReflectionFormProps {
	today: string;
}

export default function ReflectionForm({ today }: ReflectionFormProps) {
	const router = useRouter();
	const [isOpen, setIsOpen] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [formData, setFormData] = useState({
		title: "",
		date: today,
		author: "",
		scripture: "",
		content: "",
		isPublished: false,
	});

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setLoading(true);
		setError("");

		try {
			const response = await fetch("/api/admin/reflections", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(formData),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Failed to create reflection");
			}

			// Reset form
			setFormData({
				title: "",
				date: today,
				author: "",
				scripture: "",
				content: "",
				isPublished: false,
			});
			setIsOpen(false);
			router.refresh();
		} catch (err: any) {
			setError(err.message || "Something went wrong");
		} finally {
			setLoading(false);
		}
	}

	if (!isOpen) {
		return (
			<button
				onClick={() => setIsOpen(true)}
				className="w-full rounded-lg border-2 border-[var(--neon-cyan)] bg-[var(--card)] px-6 py-4 text-base font-bold text-[var(--neon-cyan)] uppercase tracking-wider hover:bg-[var(--neon-cyan)] hover:text-[var(--background)] transition-all flex items-center justify-center gap-2 shadow-lg"
			>
				<FiPlus className="w-5 h-5" />
				Create New Reflection
			</button>
		);
	}

	return (
		<div className="rounded-2xl border-2 border-[var(--neon-cyan)] bg-[var(--card)] p-6 shadow-lg">
			<div className="mb-6 flex items-center justify-between">
				<h2 className="text-2xl font-bold text-[var(--foreground)]">Create Daily Reflection</h2>
				<button
					onClick={() => {
						setIsOpen(false);
						setError("");
					}}
					className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
				>
					✕
				</button>
			</div>

			{error && (
				<div className="mb-4 rounded-lg border-2 border-red-500 bg-red-500/10 p-3 text-red-500 text-sm font-bold">
					{error}
				</div>
			)}

			<form onSubmit={handleSubmit} className="space-y-4">
				<div>
					<label htmlFor="title" className="block text-sm font-bold text-[var(--foreground)] mb-2 uppercase tracking-wider">
						Title *
					</label>
					<input
						type="text"
						id="title"
						value={formData.title}
						onChange={(e) => setFormData({ ...formData, title: e.target.value })}
						required
						className="w-full rounded-lg border-2 border-[var(--border)] bg-[var(--background)] px-4 py-3 text-base text-[var(--foreground)] focus:border-[var(--neon-cyan)] focus:outline-none"
					/>
				</div>

				<div>
					<label htmlFor="date" className="block text-sm font-bold text-[var(--foreground)] mb-2 uppercase tracking-wider">
						Date *
					</label>
					<input
						type="date"
						id="date"
						value={formData.date}
						onChange={(e) => setFormData({ ...formData, date: e.target.value })}
						required
						className="w-full rounded-lg border-2 border-[var(--border)] bg-[var(--background)] px-4 py-3 text-base text-[var(--foreground)] focus:border-[var(--neon-cyan)] focus:outline-none"
					/>
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<div>
						<label htmlFor="author" className="block text-sm font-bold text-[var(--foreground)] mb-2 uppercase tracking-wider">
							Author (Optional)
						</label>
						<input
							type="text"
							id="author"
							value={formData.author}
							onChange={(e) => setFormData({ ...formData, author: e.target.value })}
							className="w-full rounded-lg border-2 border-[var(--border)] bg-[var(--background)] px-4 py-3 text-base text-[var(--foreground)] focus:border-[var(--neon-cyan)] focus:outline-none"
						/>
					</div>

					<div>
						<label htmlFor="scripture" className="block text-sm font-bold text-[var(--foreground)] mb-2 uppercase tracking-wider">
							Scripture (Optional)
						</label>
						<input
							type="text"
							id="scripture"
							value={formData.scripture}
							onChange={(e) => setFormData({ ...formData, scripture: e.target.value })}
							placeholder="John 3:16"
							className="w-full rounded-lg border-2 border-[var(--border)] bg-[var(--background)] px-4 py-3 text-base text-[var(--foreground)] focus:border-[var(--neon-cyan)] focus:outline-none"
						/>
					</div>
				</div>

				<div>
					<label htmlFor="content" className="block text-sm font-bold text-[var(--foreground)] mb-2 uppercase tracking-wider">
						Content (Markdown) *
					</label>
					<textarea
						id="content"
						value={formData.content}
						onChange={(e) => setFormData({ ...formData, content: e.target.value })}
						required
						rows={12}
						className="w-full rounded-lg border-2 border-[var(--border)] bg-[var(--background)] px-4 py-3 text-base text-[var(--foreground)] placeholder:text-[var(--muted)] resize-none focus:border-[var(--neon-cyan)] focus:outline-none font-mono text-sm"
						placeholder="Write your daily reflection in Markdown format...

# Heading
## Subheading

**Bold text** and *italic text*

- Bullet points
- Work great

1. Numbered lists
2. Also supported

[Links](https://example.com) work too!"
					/>
					<p className="mt-2 text-xs text-[var(--muted)]">
						Supports Markdown: **bold**, *italic*, # headings, - lists, [links](url)
					</p>
				</div>

				<div className="flex items-center gap-2">
					<input
						type="checkbox"
						id="isPublished"
						checked={formData.isPublished}
						onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
						className="w-4 h-4 rounded border-2 border-[var(--border)] text-[var(--neon-cyan)] focus:ring-[var(--neon-cyan)]"
					/>
					<label htmlFor="isPublished" className="text-sm font-medium text-[var(--foreground)]">
						Publish immediately (visible on public page)
					</label>
				</div>

				<div className="flex gap-3 pt-4">
					<button
						type="submit"
						disabled={loading}
						className="flex-1 rounded-lg border-2 border-[var(--neon-cyan)] bg-[var(--card)] px-4 py-3 text-sm font-bold text-[var(--neon-cyan)] uppercase tracking-wider hover:bg-[var(--neon-cyan)] hover:text-[var(--background)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{loading ? "Creating..." : "Create Reflection"}
					</button>
					<button
						type="button"
						onClick={() => {
							setIsOpen(false);
							setError("");
						}}
						className="rounded-lg border-2 border-[var(--border)] bg-[var(--card)] px-4 py-3 text-sm font-bold text-[var(--muted)] uppercase tracking-wider hover:border-[var(--muted)] hover:text-[var(--foreground)] transition-all"
					>
						Cancel
					</button>
				</div>
			</form>
		</div>
	);
}

