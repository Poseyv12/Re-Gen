import { createClient } from "@sanity/client";

const projectId = process.env.SANITY_PROJECT_ID!;
const dataset = process.env.SANITY_DATASET || "production";
const apiVersion = process.env.SANITY_API_VERSION || "2025-11-01";

export const readClient = createClient({
	projectId,
	dataset,
	apiVersion,
	useCdn: true,
});

export const writeClient = createClient({
	projectId,
	dataset,
	apiVersion,
	useCdn: false,
	token: process.env.SANITY_WRITE_TOKEN || process.env.SANITY_READ_TOKEN,
});


