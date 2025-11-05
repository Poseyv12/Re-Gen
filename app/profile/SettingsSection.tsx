"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

interface SettingsSectionProps {
	initialName: string;
	initialEmail: string;
	initialImage?: string;
}

export default function SettingsSection({ initialName, initialEmail, initialImage }: SettingsSectionProps) {
	const { update } = useSession();
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [deleteConfirm, setDeleteConfirm] = useState("");
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

	const [formData, setFormData] = useState({
		name: initialName,
		email: initialEmail,
		image: initialImage || "",
		currentPassword: "",
		newPassword: "",
		confirmPassword: "",
	});

	useEffect(() => {
		setFormData({
			name: initialName,
			email: initialEmail,
			image: initialImage || "",
			currentPassword: "",
			newPassword: "",
			confirmPassword: "",
		});
	}, [initialName, initialEmail, initialImage]);

	async function handleUpdateProfile(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setLoading(true);
		setError("");
		setSuccess("");

		try {
			const updateData: any = {
				name: formData.name,
				email: formData.email,
			};

			if (formData.image) {
				updateData.image = formData.image;
			}

			const res = await fetch("/api/account/update", {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(updateData),
			});

			const data = await res.json();

			if (!res.ok) {
				throw new Error(data.error || "Failed to update profile");
			}

			setSuccess("Profile updated successfully!");
			// Update session to reflect changes
			await update();
			// Clear password fields
			setFormData((prev) => ({
				...prev,
				currentPassword: "",
				newPassword: "",
				confirmPassword: "",
			}));
			// Reload page to show updated data
			router.refresh();
		} catch (err: any) {
			setError(err.message || "Something went wrong");
		} finally {
			setLoading(false);
		}
	}

	async function handleUpdatePassword(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setLoading(true);
		setError("");
		setSuccess("");

		if (formData.newPassword !== formData.confirmPassword) {
			setError("New passwords do not match");
			setLoading(false);
			return;
		}

		if (formData.newPassword.length < 6) {
			setError("Password must be at least 6 characters");
			setLoading(false);
			return;
		}

		try {
			const res = await fetch("/api/account/update", {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					currentPassword: formData.currentPassword,
					newPassword: formData.newPassword,
				}),
			});

			const data = await res.json();

			if (!res.ok) {
				throw new Error(data.error || "Failed to update password");
			}

			setSuccess("Password updated successfully!");
			// Clear password fields
			setFormData((prev) => ({
				...prev,
				currentPassword: "",
				newPassword: "",
				confirmPassword: "",
			}));
		} catch (err: any) {
			setError(err.message || "Something went wrong");
		} finally {
			setLoading(false);
		}
	}

	async function handleDeleteAccount() {
		if (deleteConfirm !== "DELETE") {
			setError("Please type 'DELETE' to confirm");
			return;
		}

		setLoading(true);
		setError("");
		setSuccess("");

		try {
			const res = await fetch("/api/account/delete", {
				method: "DELETE",
			});

			const data = await res.json();

			if (!res.ok) {
				throw new Error(data.error || "Failed to delete account");
			}

			// Sign out and redirect
			await signOut({ callbackUrl: "/auth/signin" });
		} catch (err: any) {
			setError(err.message || "Something went wrong");
			setLoading(false);
		}
	}

	return (
		<div className="space-y-4 sm:space-y-6">
			{error && (
				<div className="rounded-lg border-2 border-red-500 bg-red-500/10 p-3 sm:p-4 text-red-500">
					<p className="font-bold text-sm sm:text-base">{error}</p>
				</div>
			)}

			{success && (
				<div className="rounded-lg border-2 border-green-500 bg-green-500/10 p-3 sm:p-4 text-green-500">
					<p className="font-bold text-sm sm:text-base">{success}</p>
				</div>
			)}

			{/* Profile Update Form */}
			<div className="rounded-2xl border-2 border-[var(--border)] bg-[var(--card)] p-4 sm:p-6 shadow-lg">
				<h2 className="text-xl sm:text-2xl font-bold text-[var(--foreground)] mb-3 sm:mb-4">Profile Information</h2>
				<form onSubmit={handleUpdateProfile} className="space-y-3 sm:space-y-4">
					<div>
						<label htmlFor="name" className="block text-xs sm:text-sm font-bold text-[var(--foreground)] mb-2 uppercase tracking-wider">
							Name
						</label>
						<input
							type="text"
							id="name"
							value={formData.name}
							onChange={(e) => setFormData({ ...formData, name: e.target.value })}
							required
							className="w-full rounded-lg border-2 border-[var(--border)] bg-[var(--background)] px-4 py-3 text-base text-[var(--foreground)] focus:border-[var(--neon-cyan)] focus:outline-none"
						/>
					</div>

					<div>
						<label htmlFor="email" className="block text-xs sm:text-sm font-bold text-[var(--foreground)] mb-2 uppercase tracking-wider">
							Email
						</label>
						<input
							type="email"
							id="email"
							value={formData.email}
							onChange={(e) => setFormData({ ...formData, email: e.target.value })}
							required
							className="w-full rounded-lg border-2 border-[var(--border)] bg-[var(--background)] px-4 py-3 text-base text-[var(--foreground)] focus:border-[var(--neon-cyan)] focus:outline-none"
						/>
					</div>

					<div>
						<label htmlFor="image" className="block text-xs sm:text-sm font-bold text-[var(--foreground)] mb-2 uppercase tracking-wider">
							Image URL (Optional)
						</label>
						<input
							type="url"
							id="image"
							value={formData.image}
							onChange={(e) => setFormData({ ...formData, image: e.target.value })}
							placeholder="https://example.com/image.jpg"
							className="w-full rounded-lg border-2 border-[var(--border)] bg-[var(--background)] px-4 py-3 text-base text-[var(--foreground)] focus:border-[var(--neon-cyan)] focus:outline-none"
						/>
					</div>

					<button
						type="submit"
						disabled={loading}
						className="w-full rounded-lg border-2 border-[var(--neon-cyan)] bg-[var(--card)] px-4 py-3 text-sm font-bold text-[var(--neon-cyan)] uppercase tracking-wider hover:bg-[var(--neon-cyan)] hover:text-[var(--background)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{loading ? "Updating..." : "Update Profile"}
					</button>
				</form>
			</div>

			{/* Password Update Form */}
			<div className="rounded-2xl border-2 border-[var(--border)] bg-[var(--card)] p-4 sm:p-6 shadow-lg">
				<h2 className="text-xl sm:text-2xl font-bold text-[var(--foreground)] mb-3 sm:mb-4">Change Password</h2>
				<form onSubmit={handleUpdatePassword} className="space-y-3 sm:space-y-4">
					<div>
						<label htmlFor="currentPassword" className="block text-xs sm:text-sm font-bold text-[var(--foreground)] mb-2 uppercase tracking-wider">
							Current Password
						</label>
						<input
							type="password"
							id="currentPassword"
							value={formData.currentPassword}
							onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
							required
							className="w-full rounded-lg border-2 border-[var(--border)] bg-[var(--background)] px-4 py-3 text-base text-[var(--foreground)] focus:border-[var(--neon-cyan)] focus:outline-none"
						/>
					</div>

					<div>
						<label htmlFor="newPassword" className="block text-xs sm:text-sm font-bold text-[var(--foreground)] mb-2 uppercase tracking-wider">
							New Password
						</label>
						<input
							type="password"
							id="newPassword"
							value={formData.newPassword}
							onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
							required
							minLength={6}
							className="w-full rounded-lg border-2 border-[var(--border)] bg-[var(--background)] px-4 py-3 text-base text-[var(--foreground)] focus:border-[var(--neon-cyan)] focus:outline-none"
						/>
					</div>

					<div>
						<label htmlFor="confirmPassword" className="block text-xs sm:text-sm font-bold text-[var(--foreground)] mb-2 uppercase tracking-wider">
							Confirm New Password
						</label>
						<input
							type="password"
							id="confirmPassword"
							value={formData.confirmPassword}
							onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
							required
							minLength={6}
							className="w-full rounded-lg border-2 border-[var(--border)] bg-[var(--background)] px-4 py-3 text-base text-[var(--foreground)] focus:border-[var(--neon-cyan)] focus:outline-none"
						/>
					</div>

					<button
						type="submit"
						disabled={loading}
						className="w-full rounded-lg border-2 border-[var(--neon-yellow)] bg-[var(--card)] px-4 py-3 text-sm font-bold text-[var(--neon-yellow)] uppercase tracking-wider hover:bg-[var(--neon-yellow)] hover:text-[var(--background)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{loading ? "Updating..." : "Update Password"}
					</button>
				</form>
			</div>

			{/* Delete Account Section */}
			<div className="rounded-2xl border-2 border-red-500/50 bg-[var(--card)] p-4 sm:p-6 shadow-lg">
				<h2 className="text-xl sm:text-2xl font-bold text-red-500 mb-2">Danger Zone</h2>
				<p className="text-sm sm:text-base text-[var(--muted)] mb-4">
					Once you delete your account, there is no going back. This will permanently delete your account and all associated data including your prayer requests and comments.
				</p>

				{!showDeleteConfirm ? (
					<button
						type="button"
						onClick={() => setShowDeleteConfirm(true)}
						className="rounded-lg border-2 border-red-500 bg-[var(--card)] px-4 py-2 text-sm font-bold text-red-500 uppercase tracking-wider hover:bg-red-500 hover:text-white transition-all"
					>
						Delete Account
					</button>
				) : (
					<div className="space-y-4">
						<div>
							<label htmlFor="deleteConfirm" className="block text-sm font-bold text-red-500 mb-2 uppercase tracking-wider">
								Type "DELETE" to confirm
							</label>
							<input
								type="text"
								id="deleteConfirm"
								value={deleteConfirm}
								onChange={(e) => setDeleteConfirm(e.target.value)}
								placeholder="DELETE"
								className="w-full rounded-lg border-2 border-red-500 bg-[var(--background)] px-4 py-2 text-[var(--foreground)] focus:border-red-600 focus:outline-none"
							/>
						</div>
						<div className="flex gap-4">
							<button
								type="button"
								onClick={handleDeleteAccount}
								disabled={loading || deleteConfirm !== "DELETE"}
								className="flex-1 rounded-lg border-2 border-red-500 bg-red-500 px-4 py-2 text-sm font-bold text-white uppercase tracking-wider hover:bg-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{loading ? "Deleting..." : "Confirm Delete"}
							</button>
							<button
								type="button"
								onClick={() => {
									setShowDeleteConfirm(false);
									setDeleteConfirm("");
								}}
								disabled={loading}
								className="flex-1 rounded-lg border-2 border-[var(--border)] bg-[var(--card)] px-4 py-2 text-sm font-bold text-[var(--muted)] uppercase tracking-wider hover:border-[var(--neon-cyan)] hover:text-[var(--neon-cyan)] transition-all disabled:opacity-50"
							>
								Cancel
							</button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

