import { useEffect, useRef, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { MessageCircle, X, Send } from "lucide-react";
import { useCustomerAuth } from "../../context/CustomerAuthContext";
import * as chatService from "../../services/chat.service";
import type { ChatMessage } from "../../services/chat.service";

export default function ChatWidget() {
  const { customer, openAuthModal } = useCustomerAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const handleToggle = () => {
    if (!customer) {
      openAuthModal();
      return;
    }
    setIsOpen((v) => !v);
  };

  // Load (or start) the conversation the first time a logged-in customer
  // opens the widget, then keep it live via Realtime while it's open.
  useEffect(() => {
    if (!isOpen || !customer) return;

    let unsubscribe = () => {};
    setIsLoading(true);
    chatService
      .getOrCreateConversation(customer.id, customer.name)
      .then(async (conversation) => {
        setConversationId(conversation.id);
        const history = await chatService.listMessages(conversation.id);
        setMessages(history);
        unsubscribe = chatService.subscribeToMessages(conversation.id, (message) => {
          setMessages((prev) => (prev.some((m) => m.id === message.id) ? prev : [...prev, message]));
        });
      })
      .finally(() => setIsLoading(false));

    return () => unsubscribe();
  }, [isOpen, customer]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    const body = draft.trim();
    if (!body || !conversationId || !customer || isSending) return;

    setIsSending(true);
    setDraft("");
    try {
      await chatService.sendMessage(conversationId, "customer", customer.name, body);
    } catch {
      setDraft(body);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      <button
        onClick={handleToggle}
        aria-label="Open chat with customer service"
        className="fixed bottom-5 right-5 z-40 w-14 h-14 rounded-full bg-black text-white shadow-xl flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
      >
        <AnimatePresence mode="wait" initial={false}>
          {isOpen ? (
            <motion.span key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X className="w-6 h-6" />
            </motion.span>
          ) : (
            <motion.span key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <MessageCircle className="w-6 h-6" />
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {isOpen && customer && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-24 right-5 z-40 w-[92vw] max-w-sm h-[65vh] max-h-[520px] bg-white rounded-2xl shadow-2xl border border-neutral-200 flex flex-col overflow-hidden"
          >
            <div className="bg-black text-white px-4 py-3.5 flex items-center justify-between shrink-0">
              <div>
                <p className="font-bold text-sm tracking-wide">Customer Service</p>
                <p className="text-[11px] text-white/60">We usually reply within a few hours</p>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white/60 hover:text-white cursor-pointer" aria-label="Close chat">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-3.5 py-3 flex flex-col gap-2.5 bg-neutral-50">
              {isLoading && <p className="text-xs text-neutral-400 text-center py-4">Loading conversation…</p>}
              {!isLoading && messages.length === 0 && (
                <p className="text-xs text-neutral-400 text-center py-4">
                  Send us a message — order questions, sizing, returns, anything.
                </p>
              )}
              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.senderType === "customer" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm ${
                      m.senderType === "customer" ? "bg-black text-white rounded-br-sm" : "bg-white border border-neutral-200 text-neutral-900 rounded-bl-sm"
                    }`}
                  >
                    {m.senderType === "admin" && <p className="text-[10px] font-bold text-teal-600 mb-0.5">{m.senderName}</p>}
                    <p className="whitespace-pre-wrap break-words">{m.body}</p>
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            <form onSubmit={handleSend} className="p-2.5 border-t border-neutral-200 flex items-center gap-2 shrink-0">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Type a message…"
                className="flex-1 border border-neutral-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-400"
              />
              <button
                type="submit"
                disabled={!draft.trim() || isSending}
                className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center shrink-0 disabled:opacity-30 cursor-pointer"
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
