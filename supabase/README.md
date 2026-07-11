# Supabase Setup

1. Create a Supabase project.
2. Open the SQL editor and run `schema.sql`.
3. Run `seed.sql` to load the current routines and exercises.
4. After signing in once with `noelkiu@gmail.com`, run `admin.sql` to make that account an app admin.
5. Copy your project URL and public anon key into `supabase-config.js`.
6. In Supabase Auth, enable the providers you want to use:
   - Email magic links
   - Google
   - Apple
7. Add your app URL to the Auth redirect URLs.

Images can stay as the existing local `assets/images/...` paths while testing. For ongoing content management, upload new exercise images to Supabase Storage and paste their public URLs into `exercise_images.image_url` and `exercises.thumbnail_url`.

User settings are stored in `user_settings`. Each signed-in user can only read and write their own row because row-level security is enabled.

Admins are stored in `admin_users`. Admin users can edit existing routines and exercises from the in-app Admin editor. The first admin account is `noelkiu@gmail.com`.
