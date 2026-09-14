import { useEffect, useRef, useState, type FormEvent } from "react";
import { MessageCircle, Send, CheckCircle2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import EmptyState from "../../components/EmptyState";
import Spinner from "../../components/Spinner";
import * as chatService from "../../../services/chat.service";
import type { ChatConversation, ChatMessage } from "../../../services/chat.service";

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return new Date(iso).toLocaleDateString("en-PH", { month: "short", day: "numeric" });
}

export default function ChatInbox() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoadingThread, setIsLoadingThread] = useState(false);
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadConversations = () => {
    chatService.listConversations().then((data) => {
      setConversations(data);
      setIsLoadingList(false);
    });
  };

  useEffect(() => {
    loadConversations();
    const unsubscribe = chatService.subscribeToConversations(loadConversations);
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    setIsLoadingThread(true);
    chatService.listMessages(selectedId).then((data) => {
      setMessages(data);
      setIsLoadingThread(false);
    });
    const unsubscribe = chatService.subscribeToMessages(selectedId, (message) => {
      setMessages((prev) => (prev.some((m) => m.id === message.id) ? prev : [...prev, message]));
    });
    return unsubscribe;
  }, [selectedId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const selected = conversations.find((c) => c.id === selectedId) ?? null;

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    const body = draft.trim();
    if (!body || !selectedId || !user || isSending) return;

    setIsSending(true);
    setDraft("");
    try {
      await chatService.sendMessage(selectedId, "admin", user.name, body);
    } catch {
      setDraft(body);
    } finally {
      setIsSending(false);
    }
  };

  const handleResolve = async () => {
    if (!selectedId) return;
    await chatService.setConversationStatus(selectedId, "closed");
    loadConversations();
  };

  if (isLoadingList) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner className="w-6 h-6" />
      </div>
    );
  }

  if (conversations.length === 0) {
    return <EmptyState icon={MessageCircle} title="No customer messages yet" description="Conversations started from the storefront chat widget will show up here." />;
  }

  return (
    <div className="flex h-[calc(100vh-140px)] rounded-2xl border border-white/10 overflow-hidden bg-white/[0.02]">
      <aside className="w-72 shrink-0 border-r border-white/10 overflow-y-auto">
        {conversations.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedId(c.id)}
            className={`w-full text-left px-4 py-3.5 border-b border-white/5 transition-colors cursor-pointer ${
              selectedId === c.id ? "bg-teal-400/10" : "hover:bg-white/5"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <p className="font-medium text-sm text-white truncate">{c.customerName}</p>
              {c.status === "closed" && <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />}
            </div>
            <p className="text-[11px] text-white/40 mt-0.5">{timeAgo(c.updatedAt)}</p>
          </button>
        ))}
      </aside>

      <section className="flex-1 flex flex-col min-w-0">
        {!selected ? (
          <div className="flex-1 flex items-center justify-center text-white/40 text-sm">Select a conversation</div>
        ) : (
          <>
            <div className="px-5 py-3.5 border-b border-white/10 flex items-center justify-between shrink-0">
              <div>
                <p className="font-bold text-sm text-white">{selected.customerName}</p>
                <p className="text-[11px] text-white/40 capitalize">{selected.status}</p>
              </div>
              {selected.status === "open" && (
                <button
                  onClick={handleResolve}
                  className="text-xs font-medium text-teal-300 border border-teal-400/30 rounded-lg px-3 py-1.5 hover:bg-teal-400/10 cursor-pointer"
                >
                  Mark Resolved
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
              {isLoadingThread ? (
                <Spinner className="w-5 h-5 mx-auto mt-8" />
              ) : (
                messages.map((m) => (
                  <div key={m.id} className={`flex ${m.senderType === "admin" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[70%] rounded-2xl px-3.5 py-2 text-sm ${
                        m.senderType === "admin" ? "bg-teal-400/15 text-teal-100 rounded-br-sm" : "bg-white/5 text-white rounded-bl-sm"
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">{m.body}</p>
                    </div>
                  </div>
                ))
              )}
              <div ref={bottomRef} />
            </div>

            <form onSubmit={handleSend} className="p-3.5 border-t border-white/10 flex items-center gap-2 shrink-0">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Reply to customer…"
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-teal-400/20 focus:border-teal-400/40"
              />
              <button
                type="submit"
                disabled={!draft.trim() || isSending}
                className="w-10 h-10 rounded-xl bg-teal-400 text-black flex items-center justify-center shrink-0 disabled:opacity-30 cursor-pointer"
                aria-label="Send reply"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </>
        )}
      </section>
    </div>
  );
}
