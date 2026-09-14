-- Upgrades the live chat conversations into proper support tickets: a
-- human-readable ticket number, a priority an admin can triage by, and an
-- unread flag that drives the admin notification bell. Run this once in the
-- Supabase SQL Editor, AFTER chat.sql.

alter table chat_conversations add column if not exists ticket_number text;
alter table chat_conversations add column if not exists priority text not null default 'normal' check (priority in ('low', 'normal', 'high'));
alter table chat_conversations add column if not exists unread_by_admin boolean not null default true;

-- Backfill a ticket number for any conversations created before this column
-- existed, using the same short-random-number style as order_number.
update chat_conversations
set ticket_number = 'TCK-' || lpad(floor(random() * 90000 + 10000)::text, 5, '0')
where ticket_number is null;

alter table chat_conversations alter column ticket_number set not null;
