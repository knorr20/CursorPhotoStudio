-- Security hardening for bookings/contact access and admin role boundaries.
-- This migration keeps public calendar visibility via a sanitized view only.

create or replace function public.is_admin_user()
returns boolean
language sql
stable
as $$
  select
    coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin'
    or lower(coalesce(auth.jwt() ->> 'email', '')) in (
      'la23production@gmail.com'
    );
$$;

revoke all on function public.is_admin_user() from public;
grant execute on function public.is_admin_user() to authenticated;

drop policy if exists "Anyone can view bookings" on public.bookings;
drop policy if exists "Anyone can create bookings" on public.bookings;
drop policy if exists "Authenticated users can update bookings" on public.bookings;
drop policy if exists "Authenticated users can delete bookings" on public.bookings;

create policy "Admins can view bookings"
  on public.bookings
  for select
  to authenticated
  using (public.is_admin_user());

create policy "Admins can create bookings"
  on public.bookings
  for insert
  to authenticated
  with check (public.is_admin_user());

create policy "Admins can update bookings"
  on public.bookings
  for update
  to authenticated
  using (public.is_admin_user())
  with check (public.is_admin_user());

create policy "Admins can delete bookings"
  on public.bookings
  for delete
  to authenticated
  using (public.is_admin_user());

create or replace view public.bookings_public_calendar as
select
  id,
  date,
  start_time,
  end_time,
  duration,
  status,
  created_at
from public.bookings;

grant select on public.bookings_public_calendar to anon, authenticated;

drop policy if exists "Authenticated users can read all messages" on public.contact_messages;
drop policy if exists "Authenticated users can update message status" on public.contact_messages;
drop policy if exists "Authenticated users can delete messages" on public.contact_messages;

create policy "Admins can read contact messages"
  on public.contact_messages
  for select
  to authenticated
  using (public.is_admin_user());

create policy "Admins can update contact messages"
  on public.contact_messages
  for update
  to authenticated
  using (public.is_admin_user())
  with check (public.is_admin_user());

create policy "Admins can delete contact messages"
  on public.contact_messages
  for delete
  to authenticated
  using (public.is_admin_user());
