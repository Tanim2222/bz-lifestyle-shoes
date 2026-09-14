-- Live chat between signed-in customers and admin/staff. Run this once in
-- the Supabase SQL Editor, AFTER customer_accounts.sql (needs is_active_admin()
-- and the customers.auth_user_id column it adds).

-- One open conversation per customer — created on first message.
create table if not exists chat_conversations (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id) on delete cascade,
  customer_name text not null,
  status text not null default 'open' check (status in ('open', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (customer_id)
);

create table if not exists chat_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references chat_conversations(id) on delete cascade,
  sender_type text not null check (sender_type in ('customer', 'admin')),
  sender_name text not null,
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists chat_messages_conversation_idx on chat_messages(conversation_id, created_at);

alter table chat_conversations enable row level security;
alter table chat_messages enable row level security;

-- Customers can see/create/update only their own conversation.
create policy "customers manage own conversation" on chat_conversations for all
  using (customer_id in (select id from customers where auth_user_id = auth.uid()))
  with check (customer_id in (select id from customers where auth_user_id = auth.uid()));

-- Customers can read and send messages only within their own conversation.
create policy "customers read own messages" on chat_messages for select
  using (
    conversation_id in (
      select cc.id from chat_conversations cc
      join customers c on c.id = cc.customer_id
      where c.auth_user_id = auth.uid()
    )
  );

create policy "customers send own messages" on chat_messages for insert
  with check (
    sender_type = 'customer'
    and conversation_id in (
      select cc.id from chat_conversations cc
      join customers c on c.id = cc.customer_id
      where c.auth_user_id = auth.uid()
    )
  );

-- Admin/staff can manage every conversation and message.
create policy "admin manage chat_conversations" on chat_conversations for all
  using (is_active_admin()) with check (is_active_admin());

create policy "admin manage chat_messages" on chat_messages for all
  using (is_active_admin()) with check (is_active_admin());

-- Live updates for both the customer widget and the admin inbox.
alter publication supabase_realtime add table chat_conversations;
alter publication supabase_realtime add table chat_messages;
