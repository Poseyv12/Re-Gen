"use client";

import { useState, useRef, useEffect } from "react";
import { FiSend, FiMessageCircle } from "react-icons/fi";
import { marked } from "marked";
import Tooltip from "@/components/Tooltip";

// Configure marked for safer rendering
marked.setOptions({
	breaks: false,
	gfm: true,
} as any);

interface Message {
	id: string;
	role: "user" | "assistant";
	content: string;
	timestamp: Date;
}

export default function BibleChatPage() {
	const [messages, setMessages] = useState<Message[]>([]);
	const [input, setInput] = useState("");
	const [loading, setLoading] = useState(false);
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLTextAreaElement>(null);

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	};

	useEffect(() => {
		scrollToBottom();
	}, [messages]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!input.trim() || loading) return;

		const userMessageContent = input.trim();
		const userMessage: Message = {
			id: Date.now().toString(),
			role: "user",
			content: userMessageContent,
			timestamp: new Date(),
		};

		setMessages((prev) => [...prev, userMessage]);
		setInput("");
		setLoading(true);

		// Create assistant message placeholder
		const assistantMessageId = (Date.now() + 1).toString();
		const assistantMessage: Message = {
			id: assistantMessageId,
			role: "assistant",
			content: "",
			timestamp: new Date(),
		};

		setMessages((prev) => [...prev, assistantMessage]);
		setLoading(false); // Hide loading indicator since we're streaming

		try {
			const response = await fetch("/api/bible-chat", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ message: userMessageContent }),
			});

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				throw new Error(errorData.error || "Failed to get response");
			}

			if (!response.body) {
				throw new Error("No response body");
			}

			const reader = response.body.getReader();
			const decoder = new TextDecoder();
			let buffer = "";

			while (true) {
				const { done, value } = await reader.read();

				if (done) break;

				buffer += decoder.decode(value, { stream: true });
				const lines = buffer.split("\n\n");
				buffer = lines.pop() || "";

				for (const line of lines) {
					if (line.startsWith("data: ")) {
						const data = line.slice(6);
						if (data === "[DONE]") {
							inputRef.current?.focus();
							return;
						}

						try {
							const parsed = JSON.parse(data);
							if (parsed.error) {
								throw new Error(parsed.error);
							}
							if (parsed.content) {
								setMessages((prev) =>
									prev.map((msg) =>
										msg.id === assistantMessageId
											? { ...msg, content: msg.content + parsed.content }
											: msg
									)
								);
								// Auto-scroll as content streams in
								setTimeout(() => scrollToBottom(), 50);
							}
						} catch (parseError) {
							// Ignore JSON parse errors for incomplete chunks
						}
					}
				}
			}

			inputRef.current?.focus();
		} catch (error: any) {
			setMessages((prev) =>
				prev.map((msg) =>
					msg.id === assistantMessageId
						? {
								...msg,
								content: `Sorry, I encountered an error: ${error.message || "Please try again later."}`,
							}
						: msg
				)
			);
			inputRef.current?.focus();
		}
	};

	return (
		<div className="mx-auto max-w-4xl px-2 sm:px-4 py-3 sm:py-4 lg:px-8 flex flex-col" style={{ height: "calc(100vh - 8rem)" }}>
			<div className="mb-3 sm:mb-4 text-center flex-shrink-0 px-2">
				<h1 className="text-xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight mb-1 sm:mb-2 gradient-text">
					Re:Generation Chat
				</h1>
				<p className="text-xs sm:text-sm text-[var(--muted)] font-medium">
					Chat with a Re:Generation master mentor about the Bible, recovery, and the 12 steps
				</p>
			</div>

			<div className="flex-1 flex flex-col rounded-xl sm:rounded-2xl border-2 border-[var(--border)] bg-[var(--card)] shadow-lg overflow-hidden min-h-0">
				{/* Messages Area */}
				<div className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6 space-y-3 sm:space-y-4">
					{messages.length === 0 ? (
						<div className="flex flex-col items-center justify-center h-full text-center py-8 sm:py-12 px-4">
							<div className="flex justify-center mb-3 sm:mb-4">
								<FiMessageCircle className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 text-[var(--neon-cyan)]" />
							</div>
							<h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-[var(--foreground)] mb-2">Start a conversation</h2>
							<div className="rounded-lg border border-[var(--neon-yellow)]/30 bg-[var(--neon-yellow)]/10 px-3 py-2 max-w-md mb-3 sm:mb-4">
								<p className="text-xs text-[var(--muted)] leading-relaxed">
									<strong className="text-[var(--neon-yellow)]">AI Disclaimer:</strong> This is an AI assistant. While it strives for accuracy, responses may sometimes be incorrect. Always verify important biblical teachings and consult trusted Christian leaders for guidance.
								</p>
							</div>
							<p className="text-xs sm:text-sm text-[var(--muted)] mb-3 sm:mb-4 max-w-md">
								I'm a Re:Generation master mentor and biblical scholar. Ask me about the Bible, Re:Generation steps, foundation verses, recovery, or anything related to your journey. I'm here to help!
							</p>
							<div className="space-y-2 text-left max-w-md">
								<p className="text-xs text-[var(--muted)] font-medium">Example questions:</p>
								<ul className="text-xs sm:text-sm text-[var(--muted)] space-y-1 list-disc list-inside">
									<li>What is Step 1 about?</li>
									<li>Explain Romans 7:18 and how it relates to recovery</li>
									<li>Help me understand confession in Step 5</li>
									<li>What does regeneration mean in Step 12?</li>
									<li>How do I work through forgiveness in Step 8?</li>
								</ul>
							</div>
						</div>
					) : (
						messages.map((message) => (
							<div
								key={message.id}
								className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
							>
								<div
									className={`max-w-[90%] sm:max-w-[80%] lg:max-w-[75%] rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2 sm:py-3 ${
										message.role === "user"
											? "bg-[var(--neon-cyan)] text-[var(--background)]"
											: "bg-[var(--background)] border-2 border-[var(--border)] text-[var(--foreground)]"
									}`}
								>
									{message.role === "assistant" ? (
										message.content ? (
											<div
												className="prose prose-zinc max-w-none text-[var(--foreground)] leading-relaxed prose-invert prose-sm sm:prose-base prose-p:my-2 prose-p:first:mt-0 prose-p:last:mb-0 prose-headings:mt-3 prose-headings:mb-2 prose-headings:first:mt-0 prose-ul:my-2 prose-ol:my-2 prose-li:my-1 prose-strong:text-[var(--foreground)] prose-a:text-[var(--neon-cyan)] prose-a:underline prose-code:text-[var(--neon-pink)] prose-code:bg-[var(--card)] prose-code:px-1 prose-code:rounded prose-pre:bg-[var(--card)] prose-pre:border prose-pre:border-[var(--border)] prose-pre:rounded-lg prose-pre:overflow-x-auto"
												dangerouslySetInnerHTML={{
													__html: marked.parse(message.content) as string,
												}}
											/>
										) : (
											<div className="flex items-center gap-2 text-[var(--muted)]">
												<div className="w-2 h-2 bg-[var(--neon-cyan)] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
												<div className="w-2 h-2 bg-[var(--neon-cyan)] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
												<div className="w-2 h-2 bg-[var(--neon-cyan)] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
											</div>
										)
									) : (
										<div className="text-sm sm:text-base whitespace-pre-wrap leading-relaxed">{message.content}</div>
									)}
									<div
										className={`text-xs mt-2 sm:mt-2 ${
											message.role === "user" ? "text-[var(--background)]/70" : "text-[var(--muted)]"
										}`}
									>
										{message.timestamp.toLocaleTimeString("en-US", {
											hour: "numeric",
											minute: "2-digit",
										})}
									</div>
								</div>
							</div>
						))
					)}
					{loading && (
						<div className="flex justify-start">
							<div className="bg-[var(--background)] border-2 border-[var(--border)] rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2 sm:py-3">
								<div className="flex items-center gap-2 text-[var(--muted)]">
									<div className="w-2 h-2 bg-[var(--neon-cyan)] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
									<div className="w-2 h-2 bg-[var(--neon-cyan)] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
									<div className="w-2 h-2 bg-[var(--neon-cyan)] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
								</div>
							</div>
						</div>
					)}
					<div ref={messagesEndRef} />
				</div>

				{/* Input Area */}
				<div className="border-t-2 border-[var(--border)] p-3 sm:p-4 lg:p-6 bg-[var(--card)] flex-shrink-0">
					<form onSubmit={handleSubmit} className="flex gap-2 sm:gap-3">
						<textarea
							ref={inputRef}
							value={input}
							onChange={(e) => setInput(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === "Enter" && !e.shiftKey) {
									e.preventDefault();
									handleSubmit(e);
								}
							}}
							placeholder="Ask about Re:Generation, the Bible, or recovery..."
							rows={1}
							className="flex-1 rounded-lg border-2 border-[var(--border)] bg-[var(--background)] px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-[var(--foreground)] placeholder:text-[var(--muted)] resize-none focus:border-[var(--neon-cyan)] focus:outline-none max-h-32"
							disabled={loading}
						/>
						<Tooltip content={loading ? "Sending..." : !input.trim() ? "Enter a message to send" : "Send your message"} position="top">
							<button
								type="submit"
								disabled={loading || !input.trim()}
								className="rounded-lg border-2 border-[var(--neon-cyan)] bg-[var(--neon-cyan)] px-3 sm:px-4 lg:px-6 py-2.5 sm:py-3 text-white text-xs sm:text-sm font-bold uppercase tracking-wider hover:bg-[var(--neon-cyan)]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1 sm:gap-2 flex-shrink-0"
							>
								<FiSend className="w-4 h-4 sm:w-5 sm:h-5" />
								<span className="hidden sm:inline">Send</span>
							</button>
						</Tooltip>
					</form>
					<div className="mt-2 text-center">
						<p className="text-xs text-[var(--muted)]">
							Press Enter to send, Shift+Enter for new line
						</p>
						<p className="text-xs text-[var(--muted)] opacity-75 italic mt-1">
							AI responses may contain errors. Verify important information.
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}

