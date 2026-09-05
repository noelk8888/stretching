begin;

insert into public.routines (slug, title, sort_order, is_active)
values ('morning-warm-ups', 'MORNING WARM UPS', 60, true)
on conflict (slug) do update set
  title = excluded.title,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active,
  updated_at = now();

with source (
  slug,
  title,
  short_description,
  long_description,
  safety_alert,
  thumbnail_url,
  tutorial_url,
  default_reps,
  pace_seconds,
  sort_order
) as (
  values
    (
      'morning-hops',
      'HOPS',
      'Use small, light hops to wake up the body and raise your heart rate.',
      'Stand with your feet about hip-width apart and your knees soft. Make small, light hops in place, land quietly through the balls of your feet, and let your arms move naturally. Keep the rhythm easy and steady.',
      'Choose a brisk march instead if impact bothers your knees, hips, ankles, pelvic floor, or balance. Stop if you feel pain, dizziness, or unusual shortness of breath.',
      'assets/images/morning_warm_ups_01_hops.jpg',
      'assets/videos/morning_hops_tutorial.mp4',
      60,
      1,
      10
    ),
    (
      'morning-body-wave',
      'BODY WAVE',
      'Flow from a tall overhead reach into a soft whole-body wave.',
      'Stand with your feet comfortably apart. Sweep your arms forward and overhead as you lengthen upward, then soften your knees and let your chest, ribs, and hips flow through a gentle wave as your arms circle down. Return to standing and repeat smoothly.',
      'Keep the movement comfortable and controlled. Make the wave smaller if you feel strain in your neck, shoulders, or lower back.',
      'assets/images/morning_warm_ups_02_body_wave.jpg',
      'assets/videos/morning_body_wave_tutorial.mp4',
      12,
      5,
      20
    ),
    (
      'morning-arm-swings',
      'ARM SWINGS',
      'Alternate loose, sweeping arm arcs while standing tall.',
      'Stand tall with your knees relaxed. Swing one arm forward and overhead as the other travels down and back, then alternate sides in a loose continuous rhythm. Let the shoulders move freely without shrugging.',
      'Use smaller circles if your shoulders feel stiff or painful. Keep your ribs down and avoid forcing the arms overhead.',
      'assets/images/morning_warm_ups_03_arm_swings.jpg',
      'assets/videos/morning_arm_swings_tutorial.mp4',
      30,
      2,
      30
    ),
    (
      'morning-dead-arms',
      'DEAD ARMS',
      'Keep your arms relaxed and let them swing freely with gentle torso turns.',
      'Stand with your feet wider than your hips and keep your knees soft. Relax your shoulders and let both arms hang loosely, then turn your torso gently from side to side so the arms swing like pendulums around your body.',
      'Keep the movement loose rather than forceful. Reduce the twist if you feel dizziness, back pain, or discomfort in your shoulders.',
      'assets/images/morning_warm_ups_04_dead_arms.jpg',
      'assets/videos/morning_dead_arms_tutorial.mp4',
      30,
      2,
      40
    ),
    (
      'morning-march-slaps',
      'MARCH SLAPS',
      'March in place and lightly tap each lifted thigh with the opposite hand.',
      'March in place with a tall posture. Open your arms comfortably to the sides, then bring the opposite hand inward to lightly tap the thigh of the lifting leg. Alternate sides and keep an easy, steady rhythm.',
      'Tap gently rather than striking the leg. Hold a stable surface or keep the knees lower if balance is uncertain.',
      'assets/images/morning_warm_ups_05_march_slaps.jpg',
      'assets/videos/morning_march_slaps_tutorial.mp4',
      20,
      3,
      50
    ),
    (
      'morning-trunk-twists',
      'TRUNK TWISTS',
      'Use a soft wide stance and rotate your trunk smoothly from side to side.',
      'Take a comfortable wide stance, soften your knees, and hinge forward slightly with a long spine. Rotate your ribcage and arms smoothly from side to side while your hips and knees stay softly supported.',
      'Twist only through a pain-free range. Stay more upright if hinging forward causes back discomfort or dizziness.',
      'assets/images/morning_warm_ups_06_trunk_twists.jpg',
      'assets/videos/morning_trunk_twists_tutorial.mp4',
      20,
      3,
      60
    ),
    (
      'morning-windmill',
      'WINDMILL',
      'Reach toward the opposite leg while rotating through your upper body.',
      'Stand with your feet wide and knees softly bent. Hinge from your hips and rotate your torso as one hand reaches toward the opposite shin or foot while the other arm travels back. Return through centre and alternate sides.',
      'Reach only as low as you can while staying controlled. Keep your knees soft and skip the downward reach if it causes back pain or dizziness.',
      'assets/images/morning_warm_ups_07_windmill.jpg',
      'assets/videos/morning_windmill_tutorial.mp4',
      12,
      5,
      70
    ),
    (
      'morning-plie-squats',
      'PLIÉ SQUATS',
      'Lower into a wide plié squat, then stand and sweep your arms overhead.',
      'Step your feet wide and turn your toes out comfortably. Bend your knees in the same direction as your toes as you lower into a plié squat and sweep your arms down, then press through your feet to stand and reach your arms overhead.',
      'Keep your knees tracking over your toes and use a shallow squat if your hips or knees feel sensitive. Hold a stable surface if needed.',
      'assets/images/morning_warm_ups_08_plie_squats.jpg',
      'assets/videos/morning_plie_squats_tutorial.mp4',
      12,
      5,
      80
    )
)
insert into public.exercises (
  routine_id,
  slug,
  title,
  short_description,
  long_description,
  safety_alert,
  thumbnail_url,
  lottie_url,
  default_sets,
  default_reps,
  progressive_sets,
  progressive_reps,
  set_rest_seconds,
  pace_seconds,
  sort_order,
  is_active
)
select
  routine.id,
  source.slug,
  source.title,
  source.short_description,
  source.long_description,
  source.safety_alert,
  source.thumbnail_url,
  source.tutorial_url,
  1,
  source.default_reps,
  false,
  false,
  1.5,
  source.pace_seconds,
  source.sort_order,
  true
from source
cross join public.routines as routine
where routine.slug = 'morning-warm-ups'
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

delete from public.exercise_images
where exercise_id in (
  select id
  from public.exercises
  where slug in (
    'morning-hops',
    'morning-body-wave',
    'morning-arm-swings',
    'morning-dead-arms',
    'morning-march-slaps',
    'morning-trunk-twists',
    'morning-windmill',
    'morning-plie-squats'
  )
);

insert into public.exercise_images (exercise_id, image_url, sort_order)
select exercise.id, exercise.thumbnail_url, 10
from public.exercises as exercise
where exercise.slug in (
  'morning-hops',
  'morning-body-wave',
  'morning-arm-swings',
  'morning-dead-arms',
  'morning-march-slaps',
  'morning-trunk-twists',
  'morning-windmill',
  'morning-plie-squats'
);

commit;
