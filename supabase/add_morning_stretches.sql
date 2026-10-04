-- Add the 13 demonstrations and source dosages from the supplied video.
-- Run after schema.sql and seed.sql on an existing Supabase project.
begin;

insert into public.routines (slug, title, sort_order, is_active)
values ('morning-stretches', 'MORNING STRETCHES', 65, true)
on conflict (slug) do update set
  title = excluded.title,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active,
  updated_at = now();

with source (
  slug, title, short_description, long_description, safety_alert,
  thumbnail_url, tutorial_url, default_reps, pace_seconds, sort_order
) as (
  values
    (
      'morning-stretches-knee-to-chest', 'KNEE TO CHEST',
      'Draw both knees gently toward your chest; hold each rep for 20 seconds.',
      'Lie on your back, bend both knees, and draw them comfortably toward your chest. Release between holds. The video prescribes 3 sets of 10 repetitions, holding each for 20 seconds.',
      'Hold behind your thighs if your knees are sensitive. Ease off if the position increases back or hip pain.',
      'assets/images/morning_stretches_01_knee_to_chest.jpg',
      'assets/videos/morning_stretches_knee_to_chest.mp4', 10, 20, 10
    ),
    (
      'morning-stretches-knee-rotations', 'KNEE ROTATIONS',
      'Let both bent knees move gently to each side; hold 15 seconds per side.',
      'Lie on your back with knees bent. Lower both knees to one side, return to centre, then move to the other side. One counted rep includes both sides, held for 15 seconds each. The video prescribes 3 sets of 10 reps per side.',
      'Keep the range small. Stop if the rotation causes sharp pain or symptoms down a leg.',
      'assets/images/morning_stretches_02_knee_rotations.jpg',
      'assets/videos/morning_stretches_knee_rotations.mp4', 10, 30, 20
    ),
    (
      'morning-stretches-back-extensions', 'BACK EXTENSIONS',
      'Press your chest gently up from your stomach; hold for 5 seconds.',
      'Lie face down with hands near the ribs. Press lightly to raise your chest while keeping the hips supported, then lower with control. The video prescribes 3 sets of 10 extensions, holding each for 5 seconds.',
      'Use a modest lift and keep your neck long. Stop if you feel pinching or sharp lower-back pain.',
      'assets/images/morning_stretches_03_back_extensions.jpg',
      'assets/videos/morning_stretches_back_extensions.mp4', 10, 5, 30
    ),
    (
      'morning-stretches-lower-back-rotations', 'LOWER BACK ROTATIONS',
      'Guide one bent knee across your body; hold 15 seconds per side.',
      'Lie on your back and guide one bent knee across your body while the opposite leg stays long. Switch sides. One counted rep includes both sides, held for 15 seconds each. The video prescribes 3 sets of 10 reps per side.',
      'Do not force the knee to the floor. Reduce the twist if it causes discomfort.',
      'assets/images/morning_stretches_04_lower_back_rotations.jpg',
      'assets/videos/morning_stretches_lower_back_rotations.mp4', 10, 30, 40
    ),
    (
      'morning-stretches-cat-cow', 'CAT & COW',
      'Alternate a rounded back and a gentle arch, holding each for 5 seconds.',
      'From hands and knees, round your back for Cat, then lower the belly and lift the chest for Cow. One counted rep includes both positions, held for 5 seconds each. The video prescribes 3 sets of 10 cycles.',
      'Move through a comfortable range. Add knee padding or use forearms if wrists are sensitive.',
      'assets/images/morning_stretches_05_cat_cow.jpg',
      'assets/videos/morning_stretches_cat_cow.mp4', 10, 10, 50
    ),
    (
      'morning-stretches-childs-pose', 'CHILD''S POSE',
      'Sit back toward your heels and reach forward for a 30-second hold.',
      'From hands and knees, sit your hips back toward your heels and reach your arms forward. Breathe steadily for 30 seconds. The video prescribes 3 sets of one 30-second hold.',
      'Place a towel behind the knees or shorten the reach if uncomfortable.',
      'assets/images/morning_stretches_06_childs_pose.jpg',
      'assets/videos/morning_stretches_childs_pose.mp4', 1, 30, 60
    ),
    (
      'morning-stretches-foam-roller', 'FOAM ROLLER BACK RELEASE',
      'Roll gently under the upper or middle back for one minute per area.',
      'Place a foam roller across the upper or middle back and make small controlled rolls over one area for one minute. The video prescribes 3 sets of one minute per area; increase the hold count if working on more than one area.',
      'Avoid rolling directly over the neck or low back, and skip pressure that is painful.',
      'assets/images/morning_stretches_07_foam_roller.jpg',
      'assets/videos/morning_stretches_foam_roller.mp4', 1, 60, 70
    ),
    (
      'morning-stretches-bridge-lifts', 'BRIDGE LIFTS',
      'Lift your hips from a bent-knee position and lower with control.',
      'Lie on your back with knees bent and feet flat. Press through your feet to raise the hips, then lower slowly. The video prescribes 3 sets of 10 repetitions.',
      'Keep your knees aligned with your feet and reduce the lift if uncomfortable.',
      'assets/images/morning_stretches_08_bridge_lifts.jpg',
      'assets/videos/morning_stretches_bridge_lifts.mp4', 10, 4, 80
    ),
    (
      'morning-stretches-spiky-ball-glutes', 'SPIKY BALL GLUTE RELEASE',
      'Use a small ball under one glute for one minute per side.',
      'Sit with hands behind you and a massage ball under one buttock. Make small gentle shifts for one minute, then change sides. The video prescribes 3 sets of one minute per side.',
      'Keep pressure away from the tailbone and bony hip. Stop if it causes sharp pain or tingling.',
      'assets/images/morning_stretches_09_spiky_ball_glutes.jpg',
      'assets/videos/morning_stretches_spiky_ball_glutes.mp4', 2, 60, 90
    ),
    (
      'morning-stretches-hip-flexor-stretch', 'HIP FLEXOR STRETCH',
      'Hold a gentle half-kneeling hip stretch for 30 seconds per side.',
      'Kneel with one foot in front, keep your torso upright, and gently shift the hips forward. Hold 30 seconds and switch legs. The video prescribes 3 sets per side.',
      'Pad the back knee, keep the front knee above the foot, and avoid lower-back pain.',
      'assets/images/morning_stretches_10_hip_flexor_stretch.jpg',
      'assets/videos/morning_stretches_hip_flexor_stretch.mp4', 2, 30, 100
    ),
    (
      'morning-stretches-piriformis-stretch', 'PIRIFORMIS STRETCH',
      'Cross one ankle over the other knee for a 30-second seated glute stretch.',
      'Sit with hands behind you, cross one ankle over the opposite thigh, and draw the supporting leg gently toward you. Hold 30 seconds and switch sides. The video prescribes 3 sets per side.',
      'Keep the crossed foot flexed and do not press directly on the knee.',
      'assets/images/morning_stretches_11_piriformis_stretch.jpg',
      'assets/videos/morning_stretches_piriformis_stretch.mp4', 2, 30, 110
    ),
    (
      'morning-stretches-thread-the-needle', 'THREAD THE NEEDLE',
      'Reach one arm beneath your body for 30 seconds on each side.',
      'From hands and knees, slide one arm under your chest and reach the other forward. Hold 30 seconds, then change sides. The video prescribes 3 sets per side.',
      'Keep pressure off your neck and stop if the position causes pain or numbness.',
      'assets/images/morning_stretches_12_thread_the_needle.jpg',
      'assets/videos/morning_stretches_thread_the_needle.mp4', 2, 30, 120
    ),
    (
      'morning-stretches-hamstring-stretch', 'HAMSTRING STRETCH',
      'Raise one leg with a strap and hold gently for 30 seconds per side.',
      'Lie on your back, loop a strap around one foot, and raise that leg until you feel a gentle stretch behind the thigh. Hold 30 seconds and switch sides. The video prescribes 3 sets per side.',
      'Keep the lifted knee slightly bent if needed and do not pull through sharp pain.',
      'assets/images/morning_stretches_13_hamstring_stretch.jpg',
      'assets/videos/morning_stretches_hamstring_stretch.mp4', 2, 30, 130
    )
)
insert into public.exercises (
  routine_id, slug, title, short_description, long_description, safety_alert,
  thumbnail_url, lottie_url, default_sets, default_reps, progressive_sets,
  progressive_reps, set_rest_seconds, pace_seconds, sort_order, is_active
)
select
  routine.id, source.slug, source.title, source.short_description,
  source.long_description, source.safety_alert, source.thumbnail_url,
  source.tutorial_url, 3, source.default_reps, false, false, 1.5,
  source.pace_seconds, source.sort_order, true
from source
cross join public.routines as routine
where routine.slug = 'morning-stretches'
on conflict (slug) do update set
  routine_id = excluded.routine_id,
  title = excluded.title,
  short_description = excluded.short_description,
  long_description = excluded.long_description,
  safety_alert = excluded.safety_alert,
  thumbnail_url = excluded.thumbnail_url,
  lottie_url = excluded.lottie_url,
  default_sets = excluded.default_sets,
  default_reps = excluded.default_reps,
  progressive_sets = excluded.progressive_sets,
  progressive_reps = excluded.progressive_reps,
  set_rest_seconds = excluded.set_rest_seconds,
  pace_seconds = excluded.pace_seconds,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active,
  updated_at = now();

insert into public.exercise_images (exercise_id, image_url, sort_order)
select exercise.id, exercise.thumbnail_url, 10
from public.exercises as exercise
join public.routines as routine on routine.id = exercise.routine_id
where routine.slug = 'morning-stretches'
  and not exists (
    select 1 from public.exercise_images as image
    where image.exercise_id = exercise.id
      and image.image_url = exercise.thumbnail_url
  );

commit;
