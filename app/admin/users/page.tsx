import { readClient } from "@/lib/sanity.client";
import { queryAllUsers } from "@/lib/sanity.queries";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import UsersList from "./UsersList";

interface UserDoc {
	_id: string;
	name: string;
	email: string;
	image?: string;
	createdAt?: string;
	_createdAt: string;
}

export default async function AdminUsersPage() {
	// Check admin authentication
	const cookieStore = await cookies();
	const adminCookie = cookieStore.get("admin");
	if (!adminCookie || adminCookie.value !== "1") {
		redirect("/admin/login");
	}

	const users = await readClient.fetch<UserDoc[]>(queryAllUsers);

	return <UsersList users={users} />;
}

export const dynamic = "force-dynamic";

