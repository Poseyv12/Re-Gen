import { readClient } from "@/lib/sanity.client";
import { queryPendingPrayers, queryAllPrayers } from "@/lib/sanity.queries";
import type { PrayerRequestDoc } from "@/lib/types";
import AdminPageClient from "./AdminPageClient";

export default async function AdminPage() {
	const pending = await readClient.fetch<PrayerRequestDoc[]>(queryPendingPrayers);
	const all = await readClient.fetch<PrayerRequestDoc[]>(queryAllPrayers);

	return <AdminPageClient pending={pending} all={all} />;
}

export const dynamic = "force-dynamic";
