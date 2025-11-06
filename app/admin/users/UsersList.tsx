"use client";

import { useState } from "react";
import Link from "next/link";
import { FiRefreshCw, FiCopy, FiCheck, FiSearch, FiUser } from "react-icons/fi";
import toast from "react-hot-toast";
import { resetUserPassword } from "../actions";
import Tooltip from "@/components/Tooltip";

interface UserDoc {
	_id: string;
	name: string;
	email: string;
	image?: string;
	createdAt?: string;
	_createdAt: string;
}

interface UsersListProps {
	users: UserDoc[];
}

export default function UsersList({ users: initialUsers }: UsersListProps) {
	const [users] = useState<UserDoc[]>(initialUsers);
	const [searchTerm, setSearchTerm] = useState("");
	const [loading, setLoading] = useState<string | null>(null);
	const [newPasswords, setNewPasswords] = useState<Record<string, string>>({});
	const [copiedPassword, setCopiedPassword] = useState<string | null>(null);

	const filteredUsers = users.filter((user) => {
		const search = searchTerm.toLowerCase();
		return user.name.toLowerCase().includes(search) || user.email.toLowerCase().includes(search);
	});

	const handleResetPassword = async (userId: string, userName: string) => {
		if (!confirm(`Are you sure you want to reset the password for ${userName}?`)) {
			return;
		}

		setLoading(userId);
		const toastId = toast.loading("Resetting password...", { id: `reset-${userId}` });

		try {
			const result = await resetUserPassword(userId);
			if (result.success && result.password) {
				setNewPasswords({ ...newPasswords, [userId]: result.password });
				toast.success(
					`Password reset for ${userName}! Copy the new password below.`,
					{
						id: toastId,
						duration: 10000,
					}
				);
			} else {
				toast.error(result.error || "Failed to reset password", { id: toastId });
			}
		} catch (error: any) {
			toast.error(error.message || "Failed to reset password", { id: toastId });
		} finally {
			setLoading(null);
		}
	};

	const handleCopyPassword = async (password: string, userId: string) => {
		try {
			await navigator.clipboard.writeText(password);
			setCopiedPassword(userId);
			toast.success("Password copied to clipboard!");
			setTimeout(() => setCopiedPassword(null), 2000);
		} catch (error) {
			toast.error("Failed to copy password");
		}
	};

	return (
		<div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
			<div className="mb-8 flex items-center justify-between flex-wrap gap-4">
				<div>
					<h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-3 gradient-text">User Management</h1>
					<p className="text-base sm:text-lg text-[var(--muted)] font-medium">View and manage users. Reset passwords when needed.</p>
				</div>
				<div className="flex gap-3">
					<Link
						href="/admin"
						className="rounded-lg border-2 border-[var(--border)] bg-[var(--card)] px-4 py-2 text-sm font-bold text-[var(--foreground)] uppercase tracking-wider hover:border-[var(--neon-cyan)] hover:text-[var(--neon-cyan)] transition-all"
					>
						Back to Admin
					</Link>
				</div>
			</div>

			{/* Search */}
			<div className="mb-6">
				<div className="relative">
					<FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted)]" />
					<input
						type="text"
						placeholder="Search by name or email..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="w-full rounded-lg border-2 border-[var(--border)] bg-[var(--card)] px-10 py-3 text-[var(--foreground)] placeholder:text-[var(--muted)] transition-all focus:border-[var(--neon-cyan)] focus:outline-none"
					/>
				</div>
			</div>

			{/* Users List */}
			{filteredUsers.length === 0 ? (
				<div className="text-center py-16 rounded-2xl border-2 border-[var(--border)] bg-[var(--card)]">
					<div className="flex justify-center mb-4">
						<FiUser className="w-16 h-16 text-[var(--neon-cyan)]" />
					</div>
					<p className="text-[var(--muted)] text-lg font-bold">No users found</p>
					<p className="text-[var(--muted)] text-sm mt-2">
						{searchTerm ? "Try a different search term." : "No users registered yet."}
					</p>
				</div>
			) : (
				<div className="space-y-4">
					{filteredUsers.map((user) => {
						const newPassword = newPasswords[user._id];
						return (
							<div
								key={user._id}
								className="rounded-2xl border-2 border-[var(--border)] bg-[var(--card)] p-6 shadow-lg"
							>
								<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
									<div className="flex-1">
										<div className="flex items-center gap-3 mb-2">
											<h3 className="text-xl font-bold text-[var(--foreground)]">{user.name}</h3>
										</div>
										<p className="text-sm text-[var(--neon-cyan)] font-medium mb-1">{user.email}</p>
										<p className="text-xs text-[var(--muted)]">
											Joined: {new Date(user.createdAt || user._createdAt).toLocaleDateString("en-US", {
												year: "numeric",
												month: "long",
												day: "numeric",
											})}
										</p>
									</div>

									<div className="flex flex-col gap-3">
										{newPassword ? (
											<div className="rounded-lg border-2 border-[var(--neon-yellow)] bg-[var(--neon-yellow)]/10 p-4">
												<p className="text-xs font-bold text-[var(--muted)] mb-2 uppercase tracking-wider">
													New Password (Share this securely with the user):
												</p>
												<div className="flex items-center gap-2 mb-2">
													<code className="flex-1 font-mono text-sm font-bold text-[var(--neon-yellow)] bg-[var(--background)] px-3 py-2 rounded border border-[var(--border)]">
														{newPassword}
													</code>
													<Tooltip content={copiedPassword === user._id ? "Copied!" : "Copy password"} position="top">
														<button
															onClick={() => handleCopyPassword(newPassword, user._id)}
															className="rounded-lg border-2 border-[var(--neon-yellow)] bg-[var(--card)] p-2 text-[var(--neon-yellow)] hover:bg-[var(--neon-yellow)] hover:text-[var(--background)] transition-all"
														>
															{copiedPassword === user._id ? (
																<FiCheck className="w-5 h-5" />
															) : (
																<FiCopy className="w-5 h-5" />
															)}
														</button>
													</Tooltip>
												</div>
												<p className="text-xs text-[var(--muted)]">
													⚠️ User must change this password after signing in for security.
												</p>
											</div>
										) : null}
										<Tooltip content="Reset this user's password. A new secure password will be generated." position="left">
											<button
												onClick={() => handleResetPassword(user._id, user.name)}
												disabled={loading === user._id}
												className="rounded-lg border-2 border-[var(--neon-cyan)] bg-[var(--card)] px-4 py-2 text-sm font-bold text-[var(--neon-cyan)] uppercase tracking-wider hover:bg-[var(--neon-cyan)] hover:text-[var(--background)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
											>
												{loading === user._id ? (
													<>
														<FiRefreshCw className="w-4 h-4 animate-spin" />
														Resetting...
													</>
												) : (
													<>
														<FiRefreshCw className="w-4 h-4" />
														Reset Password
													</>
												)}
											</button>
										</Tooltip>
									</div>
								</div>
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
}

