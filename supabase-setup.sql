-- MyTracker HR Cloud v1. Run in Supabase SQL Editor.
create table if not exists public.hr_profiles (
 user_id uuid primary key references auth.users(id) on delete cascade,
 display_name text not null default '',
 role text not null default 'employee' check(role in ('admin','employee')),
 created_at timestamptz default now()
);
create table if not exists public.hr_records (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null references auth.users(id),
 kind text not null check(kind in ('employee','attendance','leave')),
 data jsonb not null,
 updated_at timestamptz not null default now()
);
create index if not exists hr_records_owner_kind on public.hr_records(owner_id,kind);
alter table public.hr_profiles enable row level security;
alter table public.hr_records enable row level security;
create or replace function public.hr_is_admin() returns boolean language sql stable security definer set search_path = '' as $$
 select exists(select 1 from public.hr_profiles p where p.user_id = (select auth.uid()) and p.role='admin')
$$;
revoke all on function public.hr_is_admin() from public;
grant execute on function public.hr_is_admin() to authenticated;
drop policy if exists "profile self or admin read" on public.hr_profiles;
create policy "profile self or admin read" on public.hr_profiles for select to authenticated
using (user_id=(select auth.uid()) or public.hr_is_admin());
drop policy if exists "hr admin read" on public.hr_records;
create policy "hr admin read" on public.hr_records for select to authenticated using (public.hr_is_admin());
drop policy if exists "hr admin insert" on public.hr_records;
create policy "hr admin insert" on public.hr_records for insert to authenticated with check (public.hr_is_admin() and owner_id=(select auth.uid()));
drop policy if exists "hr admin update" on public.hr_records;
create policy "hr admin update" on public.hr_records for update to authenticated using (public.hr_is_admin()) with check (public.hr_is_admin());
drop policy if exists "hr admin delete" on public.hr_records;
create policy "hr admin delete" on public.hr_records for delete to authenticated using (public.hr_is_admin());
create or replace function public.hr_new_user() returns trigger language plpgsql security definer set search_path = '' as $$
begin insert into public.hr_profiles(user_id,display_name) values(new.id,coalesce(new.raw_user_meta_data->>'full_name','')); return new; end $$;
drop trigger if exists hr_new_user_trigger on auth.users;
create trigger hr_new_user_trigger after insert on auth.users for each row execute function public.hr_new_user();
-- After you register your own account, promote it safely in SQL Editor:
-- update public.hr_profiles set role='admin' where user_id=(select id from auth.users where email='YOUR_EMAIL');
