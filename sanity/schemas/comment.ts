import { defineField, defineType } from "sanity";

export default defineType({
	name: "comment",
	title: "Comment",
	type: "document",
	fields: [
		defineField({
			name: "prayerRequest",
			type: "reference",
			to: [{ type: "prayerRequest" }],
			title: "Prayer Request",
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: "user",
			type: "reference",
			to: [{ type: "user" }],
			title: "User",
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: "content",
			type: "text",
			title: "Comment",
			validation: (Rule) => Rule.required().min(1).max(500),
		}),
		defineField({
			name: "parentComment",
			type: "reference",
			to: [{ type: "comment" }],
			title: "Parent Comment",
			description: "If this is a reply to another comment",
		}),
		defineField({
			name: "likes",
			type: "array",
			title: "Likes",
			of: [{ type: "reference", to: [{ type: "user" }] }],
			description: "Users who liked this comment",
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
			author: "user.name",
			comment: "content",
			prayer: "prayerRequest.title",
		},
		prepare({ author, comment, prayer }) {
			return {
				title: `${author || "Anonymous"} on ${prayer || "Prayer Request"}`,
				subtitle: comment?.substring(0, 50) || "",
			};
		},
	},
});

