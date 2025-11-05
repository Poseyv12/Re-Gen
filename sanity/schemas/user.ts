import { defineField, defineType } from "sanity";

export default defineType({
	name: "user",
	title: "User",
	type: "document",
	fields: [
		defineField({
			name: "name",
			type: "string",
			title: "Name",
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: "email",
			type: "string",
			title: "Email",
			validation: (Rule) => Rule.required().email(),
		}),
		defineField({
			name: "password",
			type: "string",
			title: "Password Hash",
			hidden: true,
		}),
		defineField({
			name: "image",
			type: "url",
			title: "Image URL",
			description: "Optional profile image URL",
		}),
		defineField({
			name: "following",
			type: "array",
			title: "Following",
			description: "Users this user follows",
			of: [{ type: "reference", to: [{ type: "user" }] }],
		}),
		defineField({
			name: "followers",
			type: "array",
			title: "Followers",
			description: "Users who follow this user",
			of: [{ type: "reference", to: [{ type: "user" }] }],
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
			title: "name",
			subtitle: "email",
		},
	},
});

