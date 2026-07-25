create extension if not exists "pgcrypto";

create table if not exists public.routines (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.exercises (
  id uuid primary key default gen_random_uuid(),
  routine_id uuid not null references public.routines(id) on delete cascade,
  slug text not null unique,
  title text not null,
  short_description text not null default '',
  long_description text not null default '',
  safety_alert text not null default '',
  thumbnail_url text not null default '',
  lottie_url text not null default '',
  default_sets integer not null default 1 check (default_sets > 0),
  default_reps integer not null default 1 check (default_reps > 0),
  progressive_sets boolean not null default false,
  progressive_reps boolean not null default false,
  set_rest_seconds numeric not null default 1.5 check (set_rest_seconds >= 0.25 and set_rest_seconds <= 60),
  pace_seconds numeric not null default 3.0 check (pace_seconds >= 0.25 and pace_seconds <= 60),
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.exercise_images (
  id uuid primary key default gen_random_uuid(),
  exercise_id uuid not null references public.exercises(id) on delete cascade,
  image_url text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  avatar_url text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

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

create table if not exists public.user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  app_state jsonb not null default '{}'::jsonb,
  exercise_settings jsonb not null default '{}'::jsonb,
  routine_order text[] not null default '{}'::text[],
  updated_at timestamptz not null default now()
);

alter table public.routines enable row level security;
alter table public.exercises enable row level security;
alter table public.exercise_images enable row level security;
alter table public.profiles enable row level security;
alter table public.admin_users enable row level security;
alter table public.app_users enable row level security;
alter table public.user_settings enable row level security;

drop policy if exists "Anyone can read active routines" on public.routines;
create policy "Anyone can read active routines"
on public.routines for select
using (is_active = true);

drop policy if exists "Admins can read all routines" on public.routines;
create policy "Admins can read all routines"
on public.routines for select
using (exists (select 1 from public.admin_users where user_id = auth.uid()));

drop policy if exists "Admins can update routines" on public.routines;
create policy "Admins can update routines"
on public.routines for update
using (exists (select 1 from public.admin_users where user_id = auth.uid()))
with check (exists (select 1 from public.admin_users where user_id = auth.uid()));

drop policy if exists "Anyone can read active exercises" on public.exercises;
create policy "Anyone can read active exercises"
on public.exercises for select
using (is_active = true);

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

drop policy if exists "Anyone can read exercise images" on public.exercise_images;
create policy "Anyone can read exercise images"
on public.exercise_images for select
using (true);

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

drop policy if exists "Admins can update exercise media" on storage.objects;
create policy "Admins can update exercise media" on storage.objects for update
using (
  bucket_id = 'exercise-media'
  and exists (select 1 from public.admin_users where user_id = auth.uid())
)
with check (
  bucket_id = 'exercise-media'
  and exists (select 1 from public.admin_users where user_id = auth.uid())
);

drop policy if exists "Admins can delete exercise media" on storage.objects;
create policy "Admins can delete exercise media" on storage.objects for delete
using (
  bucket_id = 'exercise-media'
  and exists (select 1 from public.admin_users where user_id = auth.uid())
);

drop policy if exists "Users can read their own profile" on public.profiles;
create policy "Users can read their own profile"
on public.profiles for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
on public.profiles for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
on public.profiles for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

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

drop policy if exists "Users can read their own settings" on public.user_settings;
create policy "Users can read their own settings"
on public.user_settings for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert their own settings" on public.user_settings;
create policy "Users can insert their own settings"
on public.user_settings for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update their own settings" on public.user_settings;
create policy "Users can update their own settings"
on public.user_settings for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create index if not exists routines_sort_order_idx on public.routines(sort_order);
create index if not exists exercises_routine_sort_idx on public.exercises(routine_id, sort_order);
create index if not exists exercise_images_exercise_sort_idx on public.exercise_images(exercise_id, sort_order);
create index if not exists app_users_email_idx on public.app_users(lower(email));
create index if not exists app_users_last_login_idx on public.app_users(last_login desc);
