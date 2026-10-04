# Stretching

A mobile-first guided stretching and exercise timer with configurable routines, sets, repetitions, pace, sound cues, and voice guidance.

Open `index.html` through a local web server to run the app.

## Install on iPhone for offline use

1. Open the deployed HTTPS site in Safari while connected to the internet.
2. Keep the app open until the landing page says **OFFLINE READY**. The first download is about 90 MB because it includes every tutorial image and video.
3. Tap **Share**, choose **Add to Home Screen**, enable **Open as Web App**, and tap **Add**.
4. Launch Bend and Mend from the Home Screen. Routines, timers, images, videos, sounds, and local settings work without internet access.

Account sign-in, cloud synchronization, and administrator editing still require an internet connection. When new app files or media are deployed, update the cache version in `sw.js` and refresh `offline-assets.js` so installed copies download the new release.

## Morning Stretches source

The 13-exercise Morning Stretches routine uses short, cropped demonstrations from the [DEMIC and Futusion exercise video](https://www.facebook.com/watch/?v=990213229349053). Its initial three-set counts and hold times follow the recommendations shown in that video. Timed stretches use one hold for a single position or two holds for left and right sides. The foam roller and massage-ball movements need that equipment; users can deselect individual exercises before starting.

For an existing Supabase database, run `supabase/add_morning_stretches.sql` in the SQL editor to make the new routine editable through the administrator interface. The bundled routine also works without this migration, including offline.
