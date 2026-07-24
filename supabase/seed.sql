insert into public.routines (slug, title, sort_order, is_active) values
  ('tennis-elbow', 'TENNIS ELBOW', 10, true),
  ('cat-cow', 'CAT & COW', 20, true),
  ('tai-chi', 'TAI-CHI', 30, true),
  ('neck-relief', 'NECK RELIEF', 40, true),
  ('lower-back', 'LOWER BACK', 50, true)
on conflict (slug) do update set
  title = excluded.title,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active,
  updated_at = now();

insert into public.exercises (
  routine_id,
  slug,
  title,
  short_description,
  long_description,
  safety_alert,
  thumbnail_url,
  default_sets,
  default_reps,
  sort_order,
  is_active
) values
  (
    (select id from public.routines where slug = 'tennis-elbow'),
    'extensor-stretch',
    'WRIST EXTENSOR STRETCH',
    'Gently lower the wrist to stretch the top of the forearm.',
    'Extend your arm in front of you with your palm facing down. With your other hand, gently bend your wrist and fingers downward until you feel a stretch along the top of your forearm. Hold without forcing.',
    'Keep your elbow straight but do not lock it forcefully.',
    'assets/images/tennis_elbow_01_extensor_stretch.png',
    2,
    8,
    10,
    true
  ),
  (
    (select id from public.routines where slug = 'tennis-elbow'),
    'flexor-stretch',
    'WRIST FLEXOR STRETCH',
    'Gently pull the wrist back to stretch the underside of the forearm.',
    'Extend your arm in front of you with your palm facing up. Use your other hand to gently pull your fingers and wrist back until you feel a stretch along the underside of your forearm.',
    'Keep the stretch gentle. Stop if you feel sharp pain, tingling, or numbness.',
    'assets/images/tennis_elbow_02_flexor_stretch.png',
    2,
    8,
    20,
    true
  ),
  (
    (select id from public.routines where slug = 'tennis-elbow'),
    'eccentric-wrist-extension',
    'ECCENTRIC WRIST EXTENSION',
    'Help the wrist lift, then slowly lower a light weight.',
    'Support your forearm on a table with your palm facing down and a light weight in your hand. Use your other hand to help lift the wrist, then slowly lower the weight using the affected side.',
    'Use very light resistance. The lowering phase should be slow and controlled, not painful.',
    'assets/images/tennis_elbow_03_eccentric_wrist_extension.png',
    3,
    10,
    30,
    true
  ),
  (
    (select id from public.routines where slug = 'tennis-elbow'),
    'wrist-extension',
    'WRIST EXTENSION',
    'Raise the wrist, then lower it slowly with the forearm supported.',
    'Hold a light weight, or just use the weight of your hand. Support your forearm on a table or your thigh with your hand hanging off the edge, palm facing down. Slowly lift your wrist up, then slowly lower it back down.',
    'Perform this movement slowly. If you feel sharp pain, stop immediately.',
    'assets/images/tennis_elbow_04_wrist_extension.png',
    3,
    10,
    40,
    true
  ),
  (
    (select id from public.routines where slug = 'tennis-elbow'),
    'wrist-flexion',
    'WRIST FLEXION',
    'Curl the wrist upward with the palm facing up and forearm supported.',
    'Support your forearm with your palm facing up and your hand over the edge. Holding a very light weight, curl your wrist upward, pause briefly, then lower with control.',
    'Keep your forearm supported and avoid gripping the weight too tightly.',
    'assets/images/tennis_elbow_05_wrist_flexion.png',
    3,
    10,
    50,
    true
  ),
  (
    (select id from public.routines where slug = 'tennis-elbow'),
    'forearm-supination',
    'FOREARM SUPINATION',
    'Rotate the palm upward while keeping the elbow bent and tucked.',
    'Bend your elbow to 90 degrees and keep it close to your side. Holding a light hammer or small weight, slowly rotate your forearm so your palm turns upward.',
    'Keep your upper arm still. Use a small range if rotation feels sensitive.',
    'assets/images/tennis_elbow_06_supination.png',
    3,
    10,
    60,
    true
  ),
  (
    (select id from public.routines where slug = 'tennis-elbow'),
    'forearm-pronation',
    'FOREARM PRONATION',
    'Rotate the palm downward while keeping the elbow bent and tucked.',
    'Bend your elbow to 90 degrees and keep it close to your side. Holding a light hammer or small weight, slowly rotate your forearm so your palm turns downward.',
    'Move from the forearm, not the shoulder. Stop if symptoms increase.',
    'assets/images/tennis_elbow_07_pronation.png',
    3,
    10,
    70,
    true
  ),
  (
    (select id from public.routines where slug = 'tennis-elbow'),
    'grip-finger-opening',
    'GRIP & FINGER OPENING',
    'Squeeze a soft ball, then open the fingers against a light band.',
    'Squeeze a soft ball or rolled towel, then open your fingers gently against an elastic band. Move slowly and keep the effort comfortable.',
    'Do not squeeze or open against so much resistance that it causes elbow pain.',
    'assets/images/tennis_elbow_08_grip_finger_opening.png',
    3,
    10,
    80,
    true
  ),
  (
    (select id from public.routines where slug = 'cat-cow'),
    'cat-cow',
    'CAT & COW',
    'Gently arch your back up like a cat, then let your stomach drop down like a cow.',
    'Start on your hands and knees. Inhale and let your belly drop towards the floor, lifting your chest and tailbone towards the ceiling (Cow Pose). Exhale and arch your back towards the ceiling, tucking your chin to your chest (Cat Pose). Move slowly and breathe deeply with each movement.',
    'If you experience wrist pain, you can perform this stretch resting on your forearms instead of your hands.',
    'assets/images/cat_cow_routine_01_cat_cow.png',
    2,
    8,
    10,
    true
  ),
  (
    (select id from public.routines where slug = 'cat-cow'),
    'childs-pose',
    'CHILD''S POSE',
    'Sit back on your heels, walk your hands forward, resting your forehead on the floor.',
    'Kneel on the floor with your toes together and your knees hip-width apart. Slowly sit back on your heels, walk your hands forward, and gently rest your forehead on the floor. Allow your spine to lengthen and your shoulders to relax.',
    'If you have knee pain, place a rolled-up towel behind your knees or skip this stretch if it causes sharp discomfort.',
    'assets/images/cat_cow_routine_02_childs_pose.png',
    2,
    6,
    20,
    true
  ),
  (
    (select id from public.routines where slug = 'cat-cow'),
    'thread-needle',
    'THREAD THE NEEDLE',
    'Slide one arm under your body, resting your shoulder and head on the floor.',
    'From all fours, slide your right arm under your left arm, dropping your right shoulder and the right side of your head gently to the floor. Keep your hips high and your left hand planted for support. Hold, then switch sides.',
    'Do not force the twist. Keep the weight gently on your shoulder, not your neck.',
    'assets/images/cat_cow_routine_03_thread_needle.png',
    2,
    5,
    30,
    true
  ),
  (
    (select id from public.routines where slug = 'cat-cow'),
    'bird-dog',
    'BIRD-DOG',
    'Extend one arm forward and opposite leg backward. Keep back flat.',
    'From all fours, slowly extend your right arm forward and your left leg backward simultaneously. Keep your back completely flat and your core engaged. Hold for a moment, return to start, and switch sides.',
    'If you feel unsteady, extend only your arm or only your leg until you build more balance.',
    'assets/images/cat_cow_routine_04_bird_dog.png',
    2,
    8,
    40,
    true
  ),
  (
    (select id from public.routines where slug = 'cat-cow'),
    'sphinx-pose',
    'SPHINX POSE',
    'Lie flat, prop yourself up on forearms, lifting chest to create a mild lower back arch.',
    'Lie flat on your stomach. Prop yourself up on your forearms, keeping your elbows directly under your shoulders. Press your forearms into the floor and gently lift your chest to create a mild lower back arch. Relax your shoulders away from your ears.',
    'If you feel any pinching in your lower spine, lower your chest slightly or skip the movement.',
    'assets/images/cat_cow_routine_05_sphinx_pose.png',
    2,
    6,
    50,
    true
  ),
  (
    (select id from public.routines where slug = 'tai-chi'),
    'ward-off',
    'WARD OFF',
    'Shift weight to one leg, raise arms in a rounded arc as if embracing a ball.',
    'Shift your weight onto one leg and raise both arms in a gentle rounded arc, as if you are holding a large ball. Turn your waist slowly as you complete the movement. Return to centre and repeat on the other side.',
    'Keep a slight bend in your knees at all times. Never lock your joints.',
    '',
    3,
    8,
    10,
    true
  ),
  (
    (select id from public.routines where slug = 'tai-chi'),
    'cloud-hands',
    'CLOUD HANDS',
    'Shift side to side sweeping hands in slow overlapping circles at chest height.',
    'Stand with feet shoulder-width apart. Shift your weight from side to side while sweeping both hands in slow, overlapping horizontal circles at chest height. Let your waist lead the movement, eyes following your top hand.',
    'Move slowly and breathe continuously. Avoid holding your breath.',
    '',
    3,
    10,
    20,
    true
  ),
  (
    (select id from public.routines where slug = 'tai-chi'),
    'golden-rooster',
    'GOLDEN ROOSTER',
    'Stand on one leg, lift the opposite knee and arm slowly to build balance.',
    'Stand tall, shift your weight to one leg, then slowly lift the opposite knee to hip height while raising the same-side arm upward. Hold for a breath, then lower with control and switch sides.',
    'Use a wall or chair nearby if you need extra support while building your balance.',
    '',
    2,
    6,
    30,
    true
  )
on conflict (slug) do update set
  routine_id = excluded.routine_id,
  title = excluded.title,
  short_description = excluded.short_description,
  long_description = excluded.long_description,
  safety_alert = excluded.safety_alert,
  thumbnail_url = excluded.thumbnail_url,
  default_sets = excluded.default_sets,
  default_reps = excluded.default_reps,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active,
  updated_at = now();

update public.exercises
set is_active = false,
    updated_at = now()
where slug in ('forearm-rotation', 'grip-squeeze');

delete from public.exercise_images
where exercise_id in (select id from public.exercises);

insert into public.exercise_images (exercise_id, image_url, sort_order) values
  ((select id from public.exercises where slug = 'extensor-stretch'), 'assets/images/tennis_elbow_01_extensor_stretch.png', 10),
  ((select id from public.exercises where slug = 'flexor-stretch'), 'assets/images/tennis_elbow_02_flexor_stretch.png', 10),
  ((select id from public.exercises where slug = 'eccentric-wrist-extension'), 'assets/images/tennis_elbow_03_eccentric_wrist_extension.png', 10),
  ((select id from public.exercises where slug = 'wrist-extension'), 'assets/images/tennis_elbow_04_wrist_extension.png', 10),
  ((select id from public.exercises where slug = 'wrist-flexion'), 'assets/images/tennis_elbow_05_wrist_flexion.png', 10),
  ((select id from public.exercises where slug = 'forearm-supination'), 'assets/images/tennis_elbow_06_supination.png', 10),
  ((select id from public.exercises where slug = 'forearm-pronation'), 'assets/images/tennis_elbow_07_pronation.png', 10),
  ((select id from public.exercises where slug = 'grip-finger-opening'), 'assets/images/tennis_elbow_08_grip_finger_opening.png', 10),
  ((select id from public.exercises where slug = 'cat-cow'), 'assets/images/cat_cow_routine_01_cat_cow.png', 10),
  ((select id from public.exercises where slug = 'childs-pose'), 'assets/images/cat_cow_routine_02_childs_pose.png', 10),
  ((select id from public.exercises where slug = 'thread-needle'), 'assets/images/cat_cow_routine_03_thread_needle.png', 10),
  ((select id from public.exercises where slug = 'bird-dog'), 'assets/images/cat_cow_routine_04_bird_dog.png', 10),
  ((select id from public.exercises where slug = 'sphinx-pose'), 'assets/images/cat_cow_routine_05_sphinx_pose.png', 10);
