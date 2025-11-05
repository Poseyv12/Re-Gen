import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./sanity/schemas";

export default defineConfig({
	name: "default",
	title: "Re:Generation Prayer Wall",

	projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.SANITY_PROJECT_ID || "",
	dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || process.env.SANITY_DATASET || "production",

	basePath: "/studio",

	plugins: [structureTool(), visionTool()],

	schema: {
		types: schemaTypes,
	},
});

