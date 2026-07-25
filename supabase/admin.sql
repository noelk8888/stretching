create extension if not exists "pgcrypto";

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.app_users (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users(id) on delete set null,
  email text not null unique,
  display_name text not null default '',
  login_count integer not null default 0 check (login_count >= 0),
  last_login timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;
alter table public.app_users enable row level security;

drop policy if exists "Users can read their own admin row" on public.admin_users;
create policy "Users can read their own admin row"
on public.admin_users for select
using (auth.uid() = user_id);

drop policy if exists "Admins can read app users" on public.app_users;
create policy "Admins can read app users"
on public.app_users for select
using (exists (select 1 from public.admin_users where user_id = auth.uid()));

drop policy if exists "Users can read their own app user row" on public.app_users;
create policy "Users can read their own app user row"
on public.app_users for select
using (
  user_id = auth.uid()
  or lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
);

drop policy if exists "Admins can insert app users" on public.app_users;
create policy "Admins can insert app users"
on public.app_users for insert
with check (exists (select 1 from public.admin_users where user_id = auth.uid()));

drop policy if exists "Users can insert their own app user row" on public.app_users;
create policy "Users can insert their own app user row"
on public.app_users for insert
with check (
  user_id = auth.uid()
  and lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
);

drop policy if exists "Admins can update app users" on public.app_users;
create policy "Admins can update app users"
on public.app_users for update
using (exists (select 1 from public.admin_users where user_id = auth.uid()))
with check (exists (select 1 from public.admin_users where user_id = auth.uid()));

drop policy if exists "Users can update their own app user row" on public.app_users;
create policy "Users can update their own app user row"
on public.app_users for update
using (
  user_id = auth.uid()
  or (
    user_id is null
    and lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  )
)
with check (
  user_id = auth.uid()
  and lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
);

drop policy if exists "Admins can delete app users" on public.app_users;
create policy "Admins can delete app users"
on public.app_users for delete
using (exists (select 1 from public.admin_users where user_id = auth.uid()));

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

drop policy if exists "Admins can insert exercises" on public.exercises;
create policy "Admins can insert exercises"
on public.exercises for insert
with check (exists (select 1 from public.admin_users where user_id = auth.uid()));

drop policy if exists "Admins can delete exercises" on public.exercises;
create policy "Admins can delete exercises"
on public.exercises for delete
using (exists (select 1 from public.admin_users where user_id = auth.uid()));

drop policy if exists "Admins can update exercise images" on public.exercise_images;
create policy "Admins can update exercise images"
on public.exercise_images for update
using (exists (select 1 from public.admin_users where user_id = auth.uid()))
with check (exists (select 1 from public.admin_users where user_id = auth.uid()));

drop policy if exists "Admins can insert exercise images" on public.exercise_images;
create policy "Admins can insert exercise images"
on public.exercise_images for insert
with check (exists (select 1 from public.admin_users where user_id = auth.uid()));

drop policy if exists "Admins can delete exercise images" on public.exercise_images;
create policy "Admins can delete exercise images"
on public.exercise_images for delete
using (exists (select 1 from public.admin_users where user_id = auth.uid()));

insert into storage.buckets (id, name, public)
values ('exercise-media', 'exercise-media', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "Anyone can view exercise media" on storage.objects;
create policy "Anyone can view exercise media" on storage.objects for select
using (bucket_id = 'exercise-media');

drop policy if exists "Admins can upload exercise media" on storage.objects;
create policy "Admins can upload exercise media" on storage.objects for insert
with check (
  bucket_id = 'exercise-media'
  and exists (select 1 from public.admin_users where user_id = auth.uid())
);

insert into public.admin_users (user_id, email)
select id, email
from auth.users
where lower(email) = 'noelkiu@gmail.com'
on conflict (user_id) do update set email = excluded.email;

insert into public.app_users (user_id, email, display_name, is_active)
select id, lower(email), coalesce(raw_user_meta_data ->> 'full_name', raw_user_meta_data ->> 'name', split_part(email, '@', 1)), true
from auth.users
where lower(email) = 'noelkiu@gmail.com'
on conflict (email) do update
set user_id = excluded.user_id,
    display_name = coalesce(nullif(public.app_users.display_name, ''), excluded.display_name),
    is_active = true,
    updated_at = now();

create index if not exists app_users_email_idx on public.app_users(lower(email));
create index if not exists app_users_last_login_idx on public.app_users(last_login desc);
