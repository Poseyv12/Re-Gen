import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { readClient } from "@/lib/sanity.client";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
	providers: [
		Credentials({
			credentials: {
				email: { label: "Email", type: "email" },
				password: { label: "Password", type: "password" },
			},
			async authorize(credentials) {
				if (!credentials?.email || !credentials?.password) {
					return null;
				}

				// Find user in Sanity
				const user = await readClient.fetch(
					`*[_type == "user" && email == $email][0]`,
					{ email: credentials.email }
				);

				if (!user || !user.password) {
					return null;
				}

				// Verify password
				const isValid = await bcrypt.compare(credentials.password as string, user.password);

				if (!isValid) {
					return null;
				}

				return {
					id: user._id,
					email: user.email,
					name: user.name,
					image: user.image,
				};
			},
		}),
	],
	callbacks: {
		async jwt({ token, user }) {
			if (user) {
				token.id = user.id;
			}
			return token;
		},
		async session({ session, token }) {
			if (session.user && token.id) {
				session.user.id = token.id as string;
			}
			return session;
		},
	},
	pages: {
		signIn: "/auth/signin",
	},
	session: {
		strategy: "jwt",
	},
	secret: process.env.NEXTAUTH_SECRET,
});

export const { GET, POST } = handlers;
