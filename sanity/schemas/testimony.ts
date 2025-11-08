import { defineField, defineType } from "sanity";

export default defineType({
	name: "testimony",
	title: "Testimony",
	type: "document",
	preview: {
		select: {
			title: "title",
			name: "name",
			status: "status",
			anonymous: "isAnonymous",
		},
		prepare({ title, name, status, anonymous }) {
			return {
				title: title || "Testimony",
				subtitle: `${anonymous ? "Anonymous" : name || "Unknown"} • ${status || "pending"}`,
			};
		},
	},
	fields: [
		defineField({
			name: "title",
			type: "string",
			title: "Title",
			description: "Title of your testimony (optional)",
		}),
		defineField({
			name: "name",
			type: "string",
			title: "Name",
			description: "Your name (optional)",
		}),
		defineField({
			name: "user",
			type: "reference",
			to: [{ type: "user" }],
			title: "User",
			description: "User account (if submitted by logged-in user)",
		}),
		defineField({
			name: "isAnonymous",
			type: "boolean",
			title: "Post as Anonymous",
			description: "If checked, your name will not be displayed publicly",
			initialValue: false,
		}),
		defineField({
			name: "group",
			type: "string",
			title: "Group",
			description: "Optional group name (e.g., Re:Gen Monday)",
		}),
		defineField({
			name: "content",
			type: "array",
			title: "Testimony Content",
			description: "Share how God has worked in your life",
			of: [{ type: "block" }],
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: "status",
			title: "Status",
			type: "string",
			description: "Current moderation status",
			options: {
				list: [
					{ title: "Pending", value: "pending" },
					{ title: "Approved", value: "approved" },
					{ title: "Rejected", value: "rejected" },
				],
				layout: "radio",
			},
			initialValue: "pending",
		}),
		defineField({
			name: "encouragedCount",
			type: "number",
			title: "Encouraged Count",
			description: "Number of times people have been encouraged by this testimony",
			initialValue: 0,
			validation: (Rule) => Rule.min(0).integer(),
		}),
	],
});

