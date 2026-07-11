create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

drop policy if exists "Users can read their own admin row" on public.admin_users;
create policy "Users can read their own admin row"
on public.admin_users for select
using (auth.uid() = user_id);

drop policy if exists "Admins can read all routines" on public.routines;
create policy "Admins can read all routines"
on public.routines for select
using (exists (select 1 from public.admin_users where user_id = auth.uid()));

drop policy if exists "Admins can update routines" on public.routines;
create policy "Admins can update routines"
on public.routines for update
using (exists (select 1 from public.admin_users where user_id = auth.uid()))
with check (exists (select 1 from public.admin_users where user_id = auth.uid()));

drop policy if exists "Admins can read all exercises" on public.exercises;
create policy "Admins can read all exercises"
on public.exercises for select
using (exists (select 1 from public.admin_users where user_id = auth.uid()));

drop policy if exists "Admins can update exercises" on public.exercises;
create policy "Admins can update exercises"
on public.exercises for update
using (exists (select 1 from public.admin_users where user_id = auth.uid()))
with check (exists (select 1 from public.admin_users where user_id = auth.uid()));

drop policy if exists "Admins can update exercise images" on public.exercise_images;
create policy "Admins can update exercise images"
on public.exercise_images for update
using (exists (select 1 from public.admin_users where user_id = auth.uid()))
with check (exists (select 1 from public.admin_users where user_id = auth.uid()));

insert into public.admin_users (user_id, email)
select id, email
from auth.users
where lower(email) = 'noelkiu@gmail.com'
on conflict (user_id) do update set email = excluded.email;
