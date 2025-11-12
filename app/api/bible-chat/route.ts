import { NextResponse } from "next/server";
import OpenAI from "openai";
import { getChatModeById, getDefaultChatMode } from "@/lib/chat-modes";

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
	try {
		const { message, mode } = await request.json();

		if (!message || typeof message !== "string" || message.trim().length === 0) {
			return NextResponse.json({ error: "Message is required" }, { status: 400 });
		}

		if (!process.env.OPENAI_API_KEY) {
			console.error("OPENAI_API_KEY is not set");
			return NextResponse.json({ error: "AI service is not configured" }, { status: 500 });
		}

		// Get the chat mode (default to Re:Generation Mentor if not provided or invalid)
		const chatMode = mode ? getChatModeById(mode) : getDefaultChatMode();
		const systemPrompt = chatMode?.prompt || getDefaultChatMode().prompt;

		const completion = await openai.chat.completions.create({
			model: "gpt-5-mini-2025-08-07",
			messages: [
				{ role: "system", content: systemPrompt },
				{ role: "user", content: message.trim() },
			],
			temperature: 1,
			max_completion_tokens: 5000,
		});

		const content = completion.choices[0]?.message?.content || "";

		if (!content) {
			return NextResponse.json({ error: "No response from AI" }, { status: 500 });
		}

		return NextResponse.json({ content });
	} catch (error: any) {
		console.error("Bible chat error:", error);
		
		if (error instanceof OpenAI.APIError) {
			return NextResponse.json(
				{ error: `OpenAI API Error: ${error.message}` },
				{ status: error.status || 500 }
			);
		}

		return NextResponse.json(
			{ error: error.message || "Failed to process your question. Please try again." },
			{ status: 500 }
		);
	}
}

