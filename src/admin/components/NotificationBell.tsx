import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, MessageCircle, AlertTriangle } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import * as chatService from "../../services/chat.service";
import type { ChatConversation } from "../../services/chat.service";
import * as inventoryService from "../services/inventory.service";
import type { InventoryRow } from "../services/inventory.service";

export default function NotificationBell() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [unreadTickets, setUnreadTickets] = useState<ChatConversation[]>([]);
  const [lowStock, setLowStock] = useState<InventoryRow[]>([]);

  const load = () => {
    chatService.listConversations().then((all) => setUnreadTickets(all.filter((c) => c.unreadByAdmin)));
    inventoryService.getInventory().then((rows) => setLowStock(rows.filter((r) => r.lowStock)));
  };

  useEffect(() => {
    load();
    const unsubscribe = chatService.subscribeToConversations(load);
    // Stock changes aren't as time-critical as a new message — a periodic
    // refresh is enough rather than wiring up its own realtime channel.
    const interval = setInterval(load, 60000);
    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const total = unreadTickets.length + lowStock.length;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="relative w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4" />
        {total > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
            {total > 9 ? "9+" : total}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 mt-2 w-80 max-h-[70vh] overflow-y-auto bg-neutral-950 border border-white/10 rounded-2xl shadow-2xl p-2 z-20"
            >
              {total === 0 ? (
                <p className="text-center text-white/40 text-sm py-8">You're all caught up.</p>
              ) : (
                <>
                  {unreadTickets.length > 0 && (
                    <div className="mb-1">
                      <p className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-white/40">New Messages</p>
                      {unreadTickets.map((t) => (
                        <button
                          key={t.id}
                          onClick={() => {
                            setIsOpen(false);
                            navigate("/admin/support");
                          }}
                          className="w-full flex items-start gap-2.5 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors cursor-pointer text-left"
                        >
                          <MessageCircle className="w-4 h-4 text-teal-300 mt-0.5 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm text-white font-medium truncate">{t.customerName}</p>
                            <p className="text-[11px] text-white/40 font-mono">{t.ticketNumber}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {lowStock.length > 0 && (
                    <div>
                      <p className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-white/40">Low Stock</p>
                      {lowStock.slice(0, 8).map((r, i) => (
                        <button
                          key={`${r.productId}-${r.size}-${i}`}
                          onClick={() => {
                            setIsOpen(false);
                            navigate("/admin/inventory");
                          }}
                          className="w-full flex items-start gap-2.5 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors cursor-pointer text-left"
                        >
                          <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm text-white font-medium truncate">
                              {r.productName} {r.colorway}
                            </p>
                            <p className="text-[11px] text-white/40">
                              Size {r.size} — {r.stock} left
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
