import { defineField, defineType } from "sanity";

export default defineType({
	name: "dailyReflection",
	title: "Daily Reflection",
	type: "document",
	fields: [
		defineField({
			name: "title",
			type: "string",
			title: "Title",
			description: "Title of the daily reflection",
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: "date",
			type: "date",
			title: "Date",
			description: "Date for this reflection (one per day)",
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: "content",
			type: "array",
			title: "Reflection Content",
			description: "The main reflection text",
			of: [{ type: "block" }],
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: "author",
			type: "string",
			title: "Author",
			description: "Name of the author (optional)",
		}),
		defineField({
			name: "scripture",
			type: "string",
			title: "Scripture Reference",
			description: "Optional scripture reference (e.g., 'John 3:16')",
		}),
		defineField({
			name: "isPublished",
			type: "boolean",
			title: "Published",
			description: "If checked, this reflection will be visible on the public page",
			initialValue: false,
		}),
		defineField({
			name: "createdAt",
			type: "datetime",
			title: "Created At",
			initialValue: () => new Date().toISOString(),
		}),
	],
	preview: {
		select: {
			title: "title",
			date: "date",
			published: "isPublished",
		},
		prepare({ title, date, published }) {
			return {
				title: title || "Daily Reflection",
				subtitle: `${date || "No date"} • ${published ? "Published" : "Draft"}`,
			};
		},
	},
	orderings: [
		{
			title: "Date, Newest",
			name: "dateDesc",
			by: [{ field: "date", direction: "desc" }],
		},
		{
			title: "Date, Oldest",
			name: "dateAsc",
			by: [{ field: "date", direction: "asc" }],
		},
	],
});




