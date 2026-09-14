import { supabase } from "../admin/services/supabaseClient";

export type TicketPriority = "low" | "normal" | "high";

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderType: "customer" | "admin";
  senderName: string;
  body: string;
  createdAt: string;
}

export interface ChatConversation {
  id: string;
  ticketNumber: string;
  customerId: string;
  customerName: string;
  status: "open" | "closed";
  priority: TicketPriority;
  unreadByAdmin: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ConversationRow {
  id: string;
  ticket_number: string;
  customer_id: string;
  customer_name: string;
  status: "open" | "closed";
  priority: TicketPriority;
  unread_by_admin: boolean;
  created_at: string;
  updated_at: string;
}

interface MessageRow {
  id: string;
  conversation_id: string;
  sender_type: "customer" | "admin";
  sender_name: string;
  body: string;
  created_at: string;
}

function mapConversation(row: ConversationRow): ChatConversation {
  return {
    id: row.id,
    ticketNumber: row.ticket_number,
    customerId: row.customer_id,
    customerName: row.customer_name,
    status: row.status,
    priority: row.priority,
    unreadByAdmin: row.unread_by_admin,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapMessage(row: MessageRow): ChatMessage {
  return {
    id: row.id,
    conversationId: row.conversation_id,
    senderType: row.sender_type,
    senderName: row.sender_name,
    body: row.body,
    createdAt: row.created_at,
  };
}

function generateTicketNumber(): string {
  return `TCK-${Math.floor(10000 + Math.random() * 90000)}`;
}

// Every customer has at most one conversation — fetch it, or create it on
// their first message.
export async function getOrCreateConversation(customerId: string, customerName: string): Promise<ChatConversation> {
  const { data: existing } = await supabase.from("chat_conversations").select("*").eq("customer_id", customerId).maybeSingle();
  if (existing) return mapConversation(existing as ConversationRow);

  const { data, error } = await supabase
    .from("chat_conversations")
    .insert({ customer_id: customerId, customer_name: customerName, ticket_number: generateTicketNumber() })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return mapConversation(data as ConversationRow);
}

export async function listMessages(conversationId: string): Promise<ChatMessage[]> {
  const { data, error } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return (data as MessageRow[]).map(mapMessage);
}

export async function sendMessage(
  conversationId: string,
  senderType: "customer" | "admin",
  senderName: string,
  body: string
): Promise<void> {
  const { error } = await supabase
    .from("chat_messages")
    .insert({ conversation_id: conversationId, sender_type: senderType, sender_name: senderName, body });
  if (error) throw new Error(error.message);

  // A customer message re-flags the ticket unread for admin; an admin reply
  // clears it. Also bumps updated_at so the inbox sorts by latest activity.
  await supabase
    .from("chat_conversations")
    .update({ updated_at: new Date().toISOString(), unread_by_admin: senderType === "customer" })
    .eq("id", conversationId);
}

export function subscribeToMessages(conversationId: string, onInsert: (message: ChatMessage) => void): () => void {
  const channel = supabase
    .channel(`chat_messages:${conversationId}`)
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "chat_messages", filter: `conversation_id=eq.${conversationId}` },
      (payload) => onInsert(mapMessage(payload.new as MessageRow))
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

// ── Admin-side ──────────────────────────────────────────────────────────

export async function listConversations(): Promise<ChatConversation[]> {
  const { data, error } = await supabase.from("chat_conversations").select("*").order("updated_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data as ConversationRow[]).map(mapConversation);
}

export function subscribeToConversations(onChange: () => void): () => void {
  const channel = supabase
    .channel("chat_conversations:admin")
    .on("postgres_changes", { event: "*", schema: "public", table: "chat_conversations" }, onChange)
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export async function setConversationStatus(conversationId: string, status: "open" | "closed"): Promise<void> {
  const { error } = await supabase.from("chat_conversations").update({ status }).eq("id", conversationId);
  if (error) throw new Error(error.message);
}

export async function setConversationPriority(conversationId: string, priority: TicketPriority): Promise<void> {
  const { error } = await supabase.from("chat_conversations").update({ priority }).eq("id", conversationId);
  if (error) throw new Error(error.message);
}

export async function markConversationRead(conversationId: string): Promise<void> {
  const { error } = await supabase.from("chat_conversations").update({ unread_by_admin: false }).eq("id", conversationId);
  if (error) throw new Error(error.message);
}

export async function getUnreadTicketCount(): Promise<number> {
  const { count, error } = await supabase
    .from("chat_conversations")
    .select("id", { count: "exact", head: true })
    .eq("unread_by_admin", true);
  if (error) throw new Error(error.message);
  return count ?? 0;
}
