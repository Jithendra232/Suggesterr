import { useAuth } from "@clerk/clerk-react";
import { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import Button from "../ui/Button.jsx";
import { chatWithProject } from "../../services/api.js";
import { MessageCircle, Send, Trash2 } from "lucide-react";
import React from "react";

const suggestedQuestions = [
  "Explain this architecture.",
  "Why was this tech stack chosen?",
  "How can I scale this project?",
  "How should I deploy it?",
  "What interview questions can be asked?",
  "How would I implement authentication?",
];

export default function AIMentorPanel({ projectId }) {
  const { getToken } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(messageText) {
    const text = (messageText ?? input).trim();
    if (!text || sending) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setSending(true);

    try {
      const data = await chatWithProject(projectId, text, getToken);
      setMessages((prev) => [...prev, { role: "ai", content: data.response }]);
    } catch (err) {
      toast.error(err.message || "Failed to get AI response");
      setMessages((prev) => [...prev, { role: "ai", content: "Sorry, I couldn't process that. Please try again." }]);
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function clearChat() {
    setMessages([]);
  }

  if (messages.length === 0) {
    return (
      <div className="flex min-h-48 flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-600 dark:bg-slate-900">
        <MessageCircle className="mb-3 h-8 w-8 text-indigo-500" />
        <h3 className="font-semibold text-slate-900 dark:text-white">AI Mentor</h3>
        <p className="mt-2 max-w-md text-sm text-slate-600 dark:text-slate-400">
          Ask any question about this project. The AI has full context of the architecture, tech stack, features, and more.
        </p>

        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {suggestedQuestions.map((q) => (
            <button
              key={q}
              onClick={() => handleSend(q)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-indigo-500 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-400"
            >
              {q}
            </button>
          ))}
        </div>

        <div className="mt-6 flex w-full max-w-lg gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about this project..."
            className="focus-ring min-h-10 flex-1 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
          />
          <Button onClick={() => handleSend()} disabled={!input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          {messages.length} message{messages.length !== 1 ? "s" : ""} in session
        </p>
        <Button variant="secondary" onClick={clearChat}>
          <Trash2 className="h-4 w-4" />
          Clear
        </Button>
      </div>

      {/* Messages */}
      <div className="max-h-[500px] space-y-4 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-indigo-600 text-white"
                  : "border border-slate-200 bg-white text-slate-800 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
              }`}
            >
              {msg.role === "ai" && (
                <p className="mb-1 text-xs font-bold text-indigo-600 dark:text-indigo-400">AI Mentor</p>
              )}
              <div className="whitespace-pre-wrap">{msg.content}</div>
            </div>
          </div>
        ))}

        {sending && (
          <div className="flex justify-start">
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-600 dark:bg-slate-900">
              <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <div className="h-2 w-2 animate-bounce rounded-full bg-indigo-500" style={{ animationDelay: "0ms" }} />
                <div className="h-2 w-2 animate-bounce rounded-full bg-indigo-500" style={{ animationDelay: "150ms" }} />
                <div className="h-2 w-2 animate-bounce rounded-full bg-indigo-500" style={{ animationDelay: "300ms" }} />
                <span className="ml-1">Thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested follow-ups */}
      {messages.length > 0 && messages.length <= 2 && (
        <div className="flex flex-wrap gap-2">
          {suggestedQuestions.slice(0, 3).map((q) => (
            <button
              key={q}
              onClick={() => handleSend(q)}
              disabled={sending}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-600 transition hover:border-indigo-300 hover:text-indigo-600 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-indigo-500 dark:hover:text-indigo-400"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a follow-up question..."
          disabled={sending}
          className="focus-ring min-h-10 flex-1 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
        />
        <Button onClick={() => handleSend()} disabled={!input.trim() || sending}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
