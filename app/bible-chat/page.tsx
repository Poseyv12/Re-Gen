"use client";

import { useState, useRef, useEffect } from "react";
import { FiSend, FiMessageCircle, FiMenu, FiX, FiPlus, FiTrash2, FiChevronDown } from "react-icons/fi";
import { marked } from "marked";
import Tooltip from "@/components/Tooltip";
import { CHAT_MODES, getDefaultChatMode, type ChatMode } from "@/lib/chat-modes";

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

interface Chat {
	id: string;
	title: string;
	messages: Message[];
	mode: string;
	createdAt: Date;
	updatedAt: Date;
}

const STORAGE_KEY = "bible-chat-history";

export default function BibleChatPage() {
	const [messages, setMessages] = useState<Message[]>([]);
	const [input, setInput] = useState("");
	const [loading, setLoading] = useState(false);
	const [currentChatId, setCurrentChatId] = useState<string | null>(null);
	const [chatHistory, setChatHistory] = useState<Chat[]>([]);
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const [selectedMode, setSelectedMode] = useState<string>(getDefaultChatMode().id);
	const [modeDropdownOpen, setModeDropdownOpen] = useState(false);
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLTextAreaElement>(null);
	const sidebarRef = useRef<HTMLDivElement>(null);
	const modeDropdownRef = useRef<HTMLDivElement>(null);

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	};

	// Load chat history from localStorage
	useEffect(() => {
		try {
			const stored = localStorage.getItem(STORAGE_KEY);
			if (stored) {
				const history: Chat[] = JSON.parse(stored).map((chat: any) => ({
					...chat,
					mode: chat.mode || getDefaultChatMode().id, // Default to Re:Generation Mentor if mode not set
					messages: chat.messages.map((msg: any) => ({
						...msg,
						timestamp: new Date(msg.timestamp),
					})),
					createdAt: new Date(chat.createdAt),
					updatedAt: new Date(chat.updatedAt),
				}));
				setChatHistory(history);
			}
		} catch (error) {
			console.error("Error loading chat history:", error);
		}
	}, []);

	// Save chat to localStorage whenever messages change
	useEffect(() => {
		if (messages.length === 0) return;

		try {
			const chatTitle = messages.find((m) => m.role === "user")?.content.slice(0, 50) || "New Chat";
			const chatId = currentChatId || Date.now().toString();
			const existingChat = chatHistory.find((c) => c.id === chatId);
			
			const chat: Chat = {
				id: chatId,
				title: chatTitle,
				messages,
				mode: selectedMode,
				createdAt: existingChat?.createdAt || new Date(),
				updatedAt: new Date(),
			};

			let updatedHistory: Chat[];
			if (currentChatId && existingChat) {
				updatedHistory = chatHistory.map((c) => (c.id === currentChatId ? chat : c));
			} else {
				updatedHistory = [chat, ...chatHistory.filter((c) => c.id !== chatId)];
				setCurrentChatId(chat.id);
			}

			// Keep only last 50 chats
			updatedHistory = updatedHistory.slice(0, 50);
			setChatHistory(updatedHistory);
			localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
		} catch (error) {
			console.error("Error saving chat:", error);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [messages, currentChatId, selectedMode]);

	useEffect(() => {
		scrollToBottom();
	}, [messages, loading]);

	// Close sidebar when clicking outside on mobile
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (sidebarOpen && sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
				setSidebarOpen(false);
			}
		};

		if (sidebarOpen) {
			document.addEventListener("mousedown", handleClickOutside);
			document.body.style.overflow = "hidden";
		}

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
			document.body.style.overflow = "unset";
		};
	}, [sidebarOpen]);

	// Close mode dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (modeDropdownOpen && modeDropdownRef.current && !modeDropdownRef.current.contains(event.target as Node)) {
				setModeDropdownOpen(false);
			}
		};

		if (modeDropdownOpen) {
			document.addEventListener("mousedown", handleClickOutside);
		}

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [modeDropdownOpen]);

	const startNewChat = () => {
		setMessages([]);
		setCurrentChatId(null);
		setSelectedMode(getDefaultChatMode().id);
		setSidebarOpen(false);
		inputRef.current?.focus();
	};

	const loadChat = (chatId: string) => {
		const chat = chatHistory.find((c) => c.id === chatId);
		if (chat) {
			setMessages(chat.messages);
			setCurrentChatId(chat.id);
			setSelectedMode(chat.mode || getDefaultChatMode().id);
			setSidebarOpen(false);
			inputRef.current?.focus();
		}
	};

	const selectMode = (modeId: string) => {
		setSelectedMode(modeId);
		setModeDropdownOpen(false);
	};

	const currentMode = CHAT_MODES.find((m) => m.id === selectedMode) || getDefaultChatMode();

	const deleteChat = (chatId: string, e: React.MouseEvent) => {
		e.stopPropagation();
		const updatedHistory = chatHistory.filter((c) => c.id !== chatId);
		setChatHistory(updatedHistory);
		localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));

		if (currentChatId === chatId) {
			startNewChat();
		}
	};

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

		try {
			const response = await fetch("/api/bible-chat", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ message: userMessageContent, mode: selectedMode }),
			});

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				throw new Error(errorData.error || "Failed to get response");
			}

			const data = await response.json();

			if (data.error) {
				throw new Error(data.error);
			}

			const assistantMessage: Message = {
				id: Date.now().toString(),
				role: "assistant",
				content: data.content || "Sorry, I couldn't generate a response.",
				timestamp: new Date(),
			};

			setMessages((prev) => [...prev, assistantMessage]);
			inputRef.current?.focus();
		} catch (error: any) {
			const errorMessage: Message = {
				id: Date.now().toString(),
				role: "assistant",
				content: `Sorry, I encountered an error: ${error.message || "Please try again later."}`,
				timestamp: new Date(),
			};
			setMessages((prev) => [...prev, errorMessage]);
			inputRef.current?.focus();
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="relative flex" style={{ height: "calc(100vh - 8rem)" }}>
			{/* Sidebar - Mobile: Slide in, Desktop: Persistent */}
			<>
			{sidebarOpen && (
				<div
					className="fixed inset-0 bg-black/50 z-[60]"
					onClick={() => setSidebarOpen(false)}
				/>
			)}
				<div
					ref={sidebarRef}
					className={`fixed top-16 sm:top-20 bottom-0 left-0 w-80 bg-[var(--card)] border-r-2 border-[var(--border)] z-[60] transform transition-transform duration-300 ease-in-out overflow-hidden flex flex-col ${
						sidebarOpen ? "translate-x-0" : "-translate-x-full"
					}`}
				>
					{/* Sidebar Header */}
					<div className="flex items-center justify-between p-4 border-b-2 border-[var(--border)] flex-shrink-0">
						<h2 className="text-lg font-bold text-[var(--foreground)]">Chat History</h2>
						<button
							onClick={() => setSidebarOpen(false)}
							className="rounded-lg p-2 text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--background)] transition-all"
							aria-label="Close sidebar"
						>
							<FiX className="w-5 h-5" />
						</button>
					</div>

					{/* Chat List */}
					<div className="flex-1 overflow-y-auto p-2">
						{chatHistory.length === 0 ? (
							<div className="text-center py-8 px-4">
								<FiMessageCircle className="w-12 h-12 text-[var(--muted)] mx-auto mb-3" />
								<p className="text-sm text-[var(--muted)]">No chat history yet</p>
								<p className="text-xs text-[var(--muted)] mt-2">Start a conversation to save it here</p>
							</div>
						) : (
							<div className="space-y-2">
								{chatHistory.map((chat) => (
									<div
										key={chat.id}
										onClick={() => loadChat(chat.id)}
										className={`group relative rounded-lg border-2 p-3 cursor-pointer transition-all ${
											currentChatId === chat.id
												? "border-[var(--neon-cyan)] bg-[var(--neon-cyan)]/10"
												: "border-[var(--border)] bg-[var(--background)] hover:border-[var(--neon-cyan)]/50"
										}`}
									>
										<div className="flex items-start justify-between gap-2">
											<div className="flex-1 min-w-0">
												<div className="flex items-center gap-2 mb-1">
													<h3 className="text-sm font-bold text-[var(--foreground)] truncate">
														{chat.title}
													</h3>
													{CHAT_MODES.find((m) => m.id === chat.mode) && (
														<span className="text-xs flex-shrink-0">
															{CHAT_MODES.find((m) => m.id === chat.mode)?.icon}
														</span>
													)}
												</div>
												<p className="text-xs text-[var(--muted)]">
													{new Date(chat.updatedAt).toLocaleDateString("en-US", {
														month: "short",
														day: "numeric",
														hour: "numeric",
														minute: "2-digit",
													})}
												</p>
												<p className="text-xs text-[var(--muted)] mt-1">
													{chat.messages.length} message{chat.messages.length !== 1 ? "s" : ""}
												</p>
											</div>
											<button
												onClick={(e) => deleteChat(chat.id, e)}
												className="opacity-100 md:opacity-0 md:group-hover:opacity-100 rounded p-1.5 text-red-500 hover:bg-red-500/10 transition-all flex-shrink-0"
												aria-label="Delete chat"
											>
												<FiTrash2 className="w-4 h-4" />
											</button>
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				</div>
			</>

			{/* Main Chat Area */}
			<div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${sidebarOpen ? "md:ml-80" : ""}`}>
				<div className="mx-auto w-full max-w-4xl px-2 sm:px-4 py-3 sm:py-4 lg:px-8 flex flex-col h-full">
					{/* Header with controls */}
					<div className="mb-3 sm:mb-4 flex-shrink-0 px-2">
						<div className="flex items-center justify-between gap-3 mb-2">
							<button
								onClick={() => setSidebarOpen(!sidebarOpen)}
								className="rounded-lg border-2 border-[var(--border)] bg-[var(--card)] p-2 text-[var(--foreground)] hover:border-[var(--neon-cyan)] hover:text-[var(--neon-cyan)] transition-all flex-shrink-0"
								aria-label="Toggle chat history"
							>
								{sidebarOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
							</button>
							<div className="flex-1 text-center">
								<h1 className="text-xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight mb-1 sm:mb-2 gradient-text">
									Re:Generation Chat
								</h1>
								<p className="text-xs sm:text-sm text-[var(--muted)] font-medium">
									Chat with a Re:Generation master mentor about the Bible, recovery, and the 12 steps
								</p>
							</div>
							<button
								onClick={startNewChat}
								className="rounded-lg border-2 border-[var(--neon-cyan)] bg-[var(--card)] px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold text-[var(--neon-cyan)] uppercase tracking-wider hover:bg-[var(--neon-cyan)] hover:text-[var(--background)] transition-all flex items-center gap-1.5 sm:gap-2 flex-shrink-0"
								aria-label="Start new chat"
							>
								<FiPlus className="w-4 h-4" />
								<span className="hidden sm:inline">New</span>
							</button>
						</div>
						{/* Mode Selector */}
						<div className="relative" ref={modeDropdownRef}>
							<button
								onClick={() => setModeDropdownOpen(!modeDropdownOpen)}
								className="w-full rounded-lg border-2 border-[var(--border)] bg-[var(--card)] px-3 sm:px-4 py-2 text-left flex items-center justify-between hover:border-[var(--neon-cyan)] transition-all"
								aria-label="Select chat mode"
							>
								<div className="flex items-center gap-2 sm:gap-3">
									<span className="text-lg sm:text-xl">{currentMode.icon}</span>
									<div className="flex-1 text-left">
										<p className="text-xs sm:text-sm font-bold text-[var(--foreground)]">{currentMode.name}</p>
										<p className="text-xs text-[var(--muted)] truncate">{currentMode.description}</p>
									</div>
								</div>
								<FiChevronDown className={`w-4 h-4 sm:w-5 sm:h-5 text-[var(--muted)] transition-transform ${modeDropdownOpen ? "rotate-180" : ""}`} />
							</button>
							{modeDropdownOpen && (
								<div className="absolute top-full left-0 right-0 mt-2 rounded-lg border-2 border-[var(--border)] bg-[var(--card)] shadow-lg z-50 max-h-64 overflow-y-auto">
									{CHAT_MODES.map((mode) => (
										<button
											key={mode.id}
											onClick={() => selectMode(mode.id)}
											className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 text-left flex items-center gap-2 sm:gap-3 transition-all ${
												selectedMode === mode.id
													? "bg-[var(--neon-cyan)]/10 border-l-2 border-[var(--neon-cyan)]"
													: "hover:bg-[var(--background)]"
											}`}
										>
											<span className="text-lg sm:text-xl flex-shrink-0">{mode.icon}</span>
											<div className="flex-1 min-w-0">
												<p className="text-xs sm:text-sm font-bold text-[var(--foreground)]">{mode.name}</p>
												<p className="text-xs text-[var(--muted)]">{mode.description}</p>
											</div>
											{selectedMode === mode.id && (
												<div className="w-2 h-2 rounded-full bg-[var(--neon-cyan)] flex-shrink-0" />
											)}
										</button>
									))}
								</div>
							)}
						</div>
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
								{currentMode.id === "regen-mentor" 
									? "I'm a Re:Generation master mentor and biblical scholar. Ask me about the Bible, Re:Generation steps, foundation verses, recovery, or anything related to your journey. I'm here to help!"
									: `I'm here to help you with ${currentMode.name.toLowerCase()}. ${currentMode.description}. Ask me anything!`}
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
										<div
											className="prose prose-zinc max-w-none text-[var(--foreground)] leading-relaxed prose-invert prose-sm sm:prose-base prose-p:my-2 prose-p:first:mt-0 prose-p:last:mb-0 prose-headings:mt-3 prose-headings:mb-2 prose-headings:first:mt-0 prose-ul:my-2 prose-ol:my-2 prose-li:my-1 prose-strong:text-[var(--foreground)] prose-a:text-[var(--neon-cyan)] prose-a:underline prose-code:text-[var(--neon-pink)] prose-code:bg-[var(--card)] prose-code:px-1 prose-code:rounded prose-pre:bg-[var(--card)] prose-pre:border prose-pre:border-[var(--border)] prose-pre:rounded-lg prose-pre:overflow-x-auto"
											dangerouslySetInnerHTML={{
												__html: marked.parse(message.content) as string,
											}}
										/>
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
							<div className="bg-[var(--background)] border-2 border-[var(--border)] rounded-xl sm:rounded-2xl px-4 sm:px-5 py-3 sm:py-4 max-w-[90%] sm:max-w-[80%] lg:max-w-[75%]">
								<div className="flex items-center gap-3">
									<div className="flex items-center gap-1.5">
										<div 
											className="w-2.5 h-2.5 bg-[var(--neon-cyan)] rounded-full loading-dot" 
											style={{ animationDelay: "0ms" }}
										/>
										<div 
											className="w-2.5 h-2.5 bg-[var(--neon-cyan)] rounded-full loading-dot" 
											style={{ animationDelay: "0.2s" }}
										/>
										<div 
											className="w-2.5 h-2.5 bg-[var(--neon-cyan)] rounded-full loading-dot" 
											style={{ animationDelay: "0.4s" }}
										/>
									</div>
									<span className="text-xs sm:text-sm text-[var(--muted)] font-medium">Thinking...</span>
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
							placeholder={`Ask about ${currentMode.name.toLowerCase()}...`}
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
			</div>
		</div>
	);
}

