import { writeClient } from "@/lib/sanity.client";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
	try {
		const { name, email, password } = await request.json();

		if (!name || !email || !password) {
			return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
		}

		if (password.length < 6) {
			return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
		}

		// Check if user already exists
		const existingUser = await writeClient.fetch(
			`*[_type == "user" && email == $email][0]`,
			{ email }
		);

		if (existingUser) {
			return NextResponse.json({ error: "User with this email already exists" }, { status: 400 });
		}

		// Hash password
		const hashedPassword = await bcrypt.hash(password, 10);

		// Create user
		const user = await writeClient.create({
			_type: "user",
			name,
			email,
			password: hashedPassword,
			createdAt: new Date().toISOString(),
		});

		return NextResponse.json({ success: true, userId: user._id });
	} catch (error: any) {
		console.error("Signup error:", error);
		return NextResponse.json({ error: error.message || "Failed to create account" }, { status: 500 });
	}
}




