import Link from "next/link";

interface UserAvatarProps {
	name: string;
	isAnonymous?: boolean;
	userId?: string;
	size?: "sm" | "md" | "lg";
	noLink?: boolean;
}

export default function UserAvatar({ name, isAnonymous, userId, size = "md", noLink = false }: UserAvatarProps) {
	const sizeClasses = {
		sm: "h-8 w-8 text-xs",
		md: "h-10 w-10 text-sm",
		lg: "h-12 w-12 text-lg",
	};

	const avatar = (
		<div
			className={`inline-flex items-center justify-center rounded-full bg-gradient-to-br from-[var(--neon-pink)] to-[var(--neon-cyan)] text-[var(--foreground)] font-bold shadow-lg ${sizeClasses[size]}`}
		>
			{(isAnonymous ? "A" : (name?.[0] || "M")).toUpperCase()}
		</div>
	);

	if (isAnonymous || !name || !userId || noLink) {
		return avatar;
	}

	return (
		<Link href={`/users/${userId}`} className="hover:scale-110 transition-transform">
			{avatar}
		</Link>
	);
}

