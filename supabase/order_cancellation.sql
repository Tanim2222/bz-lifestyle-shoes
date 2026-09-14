-- Lets a signed-in customer cancel their OWN order, but only while it's
-- still 'pending' or 'paid' (not once it's already being packed/shipped),
-- and only ever change it TO 'cancelled' — never to any other status. Run
-- this once in the Supabase SQL Editor, AFTER customer_accounts.sql.

create policy "customers cancel own order" on orders for update
  using (
    customer_id in (select id from customers where auth_user_id = auth.uid())
    and status in ('pending', 'paid')
  )
  with check (
    customer_id in (select id from customers where auth_user_id = auth.uid())
    and status = 'cancelled'
  );
