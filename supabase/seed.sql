insert into public.routines (slug, title, sort_order, is_active) values
  ('tennis-elbow', 'TENNIS ELBOW', 10, true),
  ('cat-cow', 'CAT & COW', 20, true),
  ('standing-exercises', 'STANDING EXERCISES', 30, true),
  ('lying-in-bed', 'LYING IN BED', 40, true),
  ('face-down-in-bed', 'FACE DOWN IN BED', 50, true),
  ('tai-chi', 'TAI-CHI', 60, false),
  ('neck-relief', 'NECK RELIEF', 70, false),
  ('lower-back', 'LOWER BACK', 80, false)
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
    40,
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
    50,
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
    60,
    true
  ),
  (
    (select id from public.routines where slug = 'tennis-elbow'),
    'forearm-supination',
    'SUPINATION AND PRONATION',
    'Rotate the palm upward and downward while keeping the elbow bent and tucked.',
    'Bend your elbow to 90 degrees and keep it tucked against your side. Holding a light hammer or small weight, slowly rotate your forearm until your palm faces upward, then reverse the movement until your palm faces downward.',
    'Keep your upper arm and shoulder still. Use a small, comfortable range and stop if symptoms increase.',
    'assets/images/tennis_elbow_06_supination.png',
    3,
    10,
    30,
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
    false
  ),
  (
    (select id from public.routines where slug = 'tennis-elbow'),
    'finger-extension',
    'FINGER EXTENSION',
    'Open the fingers against a light elastic band, then return slowly.',
    'Place a light elastic band around your fingers and thumb. Slowly spread your fingers apart against the band, pause briefly, then return with control.',
    'Use light resistance and keep the wrist neutral. Stop if the movement increases elbow or finger pain.',
    'assets/images/tennis_elbow_08_finger_extension.png',
    3,
    10,
    70,
    true
  ),
  (
    (select id from public.routines where slug = 'tennis-elbow'),
    'grip-finger-opening',
    'GRIP EXERCISE',
    'Squeeze a soft ball or rolled towel, then release slowly.',
    'Hold a soft ball or rolled towel and squeeze gently. Pause briefly, then release slowly without letting the wrist bend.',
    'Use a comfortable grip effort. Do not squeeze hard enough to increase elbow pain.',
    'assets/images/tennis_elbow_08_grip_exercise.png',
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
    50,
    true
  ),
  (
    (select id from public.routines where slug = 'cat-cow'),
    'thread-needle',
    'THREAD THE NEEDLE',
    'Slide one arm under your body, resting your shoulder and head on the floor.',
    'From all fours, slide your right arm under your left arm, dropping your right shoulder and the right side of your head gently to the floor. Keep your hips high and your left hand planted for support. Hold, then switch sides.',
    'Do not force the twist. Keep the weight gently on your shoulder, not your neck.',
    'assets/images/cat_cow_routine_03_thread_needle_inhale_exhale.png',
    2,
    5,
    20,
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
    30,
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
    40,
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
  ),
  (
    (select id from public.routines where slug = 'standing-exercises'),
    'wall-supported-back-leg-kicks',
    'WALL SUPPORTED BACK LEG KICKS',
    'Hold a sturdy support and kick one leg gently back without arching your low back.',
    'Stand facing a wall, counter, or sturdy support with both hands resting lightly on it. Keep your torso tall, brace gently, then kick one leg straight back behind you without arching your lower back. Return with control and switch sides as needed.',
    'Keep the kick low and controlled. Stop if your lower back pinches or you feel pain traveling down your leg.',
    'assets/images/standing_exercises_01_back_leg_kick_end.png',
    2,
    10,
    20,
    true
  ),
  (
    (select id from public.routines where slug = 'standing-exercises'),
    'standing-superman',
    'STANDING SUPERMAN',
    'Reach long through the arms and one back leg, then return upright with control.',
    'Stand tall, reach both arms overhead, and extend one leg back as you lengthen through your body. Return upright with arms forward at shoulder height, then repeat slowly and alternate sides.',
    'Use a wall or counter nearby if balance feels uncertain. Keep the movement smooth, not fast.',
    'assets/images/standing_exercises_02_standing_superman_start.png',
    2,
    8,
    30,
    true
  ),
  (
    (select id from public.routines where slug = 'standing-exercises'),
    'stationary-lunges',
    'STATIONARY LUNGES',
    'Lower from a split stance into a controlled stationary lunge, then press back up.',
    'Step into a split stance with hands on hips. Lower straight down by bending both knees, keeping your chest tall and your front knee tracking over your ankle. Press through your front foot to return to the start.',
    'Keep the range comfortable. Use a smaller dip or hold a stable surface if your knees or balance feel sensitive.',
    'assets/images/standing_exercises_03_stationary_lunge_end.png',
    2,
    8,
    40,
    true
  ),
  (
    (select id from public.routines where slug = 'standing-exercises'),
    'standing-knee-raises',
    'STANDING KNEE RAISES',
    'Stand tall and lift one knee toward hip height, alternating sides slowly.',
    'Stand tall with your hands on your hips. Lift one knee toward hip height while keeping your torso upright, then lower the foot with control and repeat on the other side.',
    'Do not lean backward as the knee lifts. Keep the supporting knee soft and move slowly.',
    'assets/images/standing_exercises_04_knee_raise_end.png',
    2,
    10,
    10,
    true
  ),
  (
    (select id from public.routines where slug = 'lying-in-bed'),
    'supine-lumbar-rotations',
    'SUPINE LUMBAR ROTATIONS',
    'Lower both bent knees side to side while your shoulders stay relaxed on the bed.',
    'Lie on your back with your knees bent, feet together, and arms open at shoulder height. Keeping your shoulders relaxed on the bed, slowly lower both knees to one side. Return to centre, then repeat to the other side.',
    'Use a small, comfortable range. Stop if the movement causes sharp back pain, tingling, or pain traveling into a leg.',
    'assets/images/lying_in_bed_01_lumbar_rotations.jpg',
    2,
    10,
    20,
    true
  ),
  (
    (select id from public.routines where slug = 'lying-in-bed'),
    'supine-hip-rotations',
    'SUPINE HIP ROTATIONS',
    'With feet wide and planted, gently move the bent knees inward and outward.',
    'Lie on your back with your knees bent and feet wider than your hips. Gently let both knees move inward toward each other, then open them outward again while keeping your feet planted and your pelvis relaxed.',
    'Keep the motion easy and controlled. Reduce the range if you feel pinching in the hips or strain in the groin.',
    'assets/images/lying_in_bed_02_hip_rotations.jpg',
    2,
    10,
    10,
    true
  ),
  (
    (select id from public.routines where slug = 'lying-in-bed'),
    'supine-figure-four',
    'SUPINE FIGURE-FOUR STRETCH',
    'Cross one ankle over the opposite thigh and draw the legs gently toward you.',
    'Lie on your back with both knees bent. Cross one ankle over the opposite thigh just above the knee. Thread your hands behind the supporting thigh and gently draw both legs toward your chest. Release and switch sides.',
    'Keep the crossed foot flexed and never press directly on the knee. Ease off if you feel knee pain or hip pinching.',
    'assets/images/lying_in_bed_03_figure_four.jpg',
    2,
    12,
    40,
    true
  ),
  (
    (select id from public.routines where slug = 'lying-in-bed'),
    'single-knee-to-chest',
    'SINGLE KNEE TO CHEST',
    'Draw one knee toward your chest while the other leg stays long and relaxed.',
    'Lie on your back with one leg extended. Hold the other leg just below the knee and gently draw it toward your chest while keeping your head and shoulders relaxed. Lower with control and switch sides.',
    'Hold behind the thigh instead of over the kneecap if your knee is sensitive. Keep the extended leg relaxed.',
    'assets/images/lying_in_bed_04_knee_to_chest.jpg',
    2,
    12,
    30,
    true
  ),
  (
    (select id from public.routines where slug = 'lying-in-bed'),
    'supine-spinal-twist',
    'SUPINE SPINAL TWIST',
    'Guide one bent knee across the body while keeping both shoulders relaxed.',
    'Lie on your back and draw one knee across your body with the opposite hand. Extend the other arm at shoulder height and turn your head gently toward that hand. Return to centre and switch sides.',
    'Keep both shoulders as relaxed as possible. Do not force the knee down or twist through pain.',
    'assets/images/lying_in_bed_05_spinal_twist.jpg',
    2,
    10,
    50,
    true
  ),
  (
    (select id from public.routines where slug = 'lying-in-bed'),
    'side-lying-thoracic-rotation',
    'THORACIC OPEN-BOOK ROTATION',
    'Keep your knees stacked and sweep the top arm open to rotate your upper back.',
    'Lie on your side with your hips and knees bent and stacked. Reach both arms forward, then sweep the top arm open across your body as your chest rotates toward the bed behind you. Bring the arm back and repeat before switching sides.',
    'Keep your knees together so the movement comes from your upper back. Use a pillow under your head if needed.',
    'assets/images/lying_in_bed_06_thoracic_rotation.jpg',
    2,
    10,
    60,
    true
  ),
  (
    (select id from public.routines where slug = 'face-down-in-bed'),
    'prone-lower-leg-swings',
    'PRONE LOWER-LEG SWINGS',
    'Bend both knees and swing the lower legs gently from side to side.',
    'Lie face-down with your forehead resting on folded arms. Bend both knees to about 90 degrees and keep your feet together. Slowly swing both lower legs from side to side while keeping your thighs and pelvis relaxed on the bed.',
    'Keep the movement small and easy. Stop if it causes knee pain, sharp lower-back pain, or cramping in the hamstrings.',
    'assets/images/face_down_in_bed_01_lower_leg_swings.jpg',
    2,
    20,
    10,
    true
  ),
  (
    (select id from public.routines where slug = 'face-down-in-bed'),
    'prone-cross-body-leg-reaches',
    'PRONE CROSS-BODY LEG REACHES',
    'Reach one bent leg across behind your body, then alternate sides.',
    'Lie face-down with both legs long. Bend one knee and gently reach that foot across behind your body toward the opposite side. Return the leg to neutral, then repeat with the other leg.',
    'Move slowly and keep most of your pelvis supported. Use a smaller reach if you feel pinching in the hip or pressure in the lower back.',
    'assets/images/face_down_in_bed_02_cross_body_leg_reaches.jpg',
    2,
    20,
    20,
    true
  ),
  (
    (select id from public.routines where slug = 'face-down-in-bed'),
    'frog-leg-prone-back-extension',
    'FROG-LEG PRONE BACK EXTENSION',
    'Open one knee to the side and gently lift your chest from the forearms.',
    'Lie face-down with one leg straight and the other knee comfortably opened out to the side. Place your forearms under your shoulders, then gently lift your chest while keeping your pelvis supported. Lower with control and switch the bent leg between sets.',
    'Keep the extension mild and your shoulders away from your ears. Stop if you feel pinching or sharp pain in your lower back or hip.',
    'assets/images/face_down_in_bed_03_frog_leg_back_extension.jpg',
    2,
    20,
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
where slug in (
  'forearm-rotation',
  'grip-squeeze',
  'standing-side-reach',
  'standing-back-extension',
  'standing-hip-hinge',
  'standing-trunk-rotation'
);

delete from public.exercise_images
where exercise_id in (select id from public.exercises);

insert into public.exercise_images (exercise_id, image_url, sort_order) values
  ((select id from public.exercises where slug = 'extensor-stretch'), 'assets/images/tennis_elbow_01_extensor_stretch.png', 10),
  ((select id from public.exercises where slug = 'flexor-stretch'), 'assets/images/tennis_elbow_02_flexor_stretch.png', 10),
  ((select id from public.exercises where slug = 'eccentric-wrist-extension'), 'assets/images/tennis_elbow_03_eccentric_wrist_extension.png', 10),
  ((select id from public.exercises where slug = 'wrist-extension'), 'assets/images/tennis_elbow_04_wrist_extension.png', 10),
  ((select id from public.exercises where slug = 'wrist-flexion'), 'assets/images/tennis_elbow_05_wrist_flexion.png', 10),
  ((select id from public.exercises where slug = 'forearm-supination'), 'assets/images/tennis_elbow_06_supination.png', 10),
  ((select id from public.exercises where slug = 'forearm-supination'), 'assets/images/tennis_elbow_07_pronation.png', 20),
  ((select id from public.exercises where slug = 'forearm-pronation'), 'assets/images/tennis_elbow_07_pronation.png', 10),
  ((select id from public.exercises where slug = 'finger-extension'), 'assets/images/tennis_elbow_08_finger_extension.png', 10),
  ((select id from public.exercises where slug = 'grip-finger-opening'), 'assets/images/tennis_elbow_08_grip_exercise.png', 10),
  ((select id from public.exercises where slug = 'cat-cow'), 'assets/images/cat_cow_routine_01_cat_cow.png', 10),
  ((select id from public.exercises where slug = 'childs-pose'), 'assets/images/cat_cow_routine_02_childs_pose.png', 10),
  ((select id from public.exercises where slug = 'thread-needle'), 'assets/images/cat_cow_routine_03_thread_needle_inhale_exhale.png', 10),
  ((select id from public.exercises where slug = 'bird-dog'), 'assets/images/cat_cow_routine_04_bird_dog.png', 10),
  ((select id from public.exercises where slug = 'sphinx-pose'), 'assets/images/cat_cow_routine_05_sphinx_pose.png', 10),
  ((select id from public.exercises where slug = 'wall-supported-back-leg-kicks'), 'assets/images/standing_exercises_01_back_leg_kick_start.png', 10),
  ((select id from public.exercises where slug = 'wall-supported-back-leg-kicks'), 'assets/images/standing_exercises_01_back_leg_kick_end.png', 20),
  ((select id from public.exercises where slug = 'standing-superman'), 'assets/images/standing_exercises_02_standing_superman_start.png', 10),
  ((select id from public.exercises where slug = 'standing-superman'), 'assets/images/standing_exercises_02_standing_superman_end.png', 20),
  ((select id from public.exercises where slug = 'stationary-lunges'), 'assets/images/standing_exercises_03_stationary_lunge_start.png', 10),
  ((select id from public.exercises where slug = 'stationary-lunges'), 'assets/images/standing_exercises_03_stationary_lunge_end.png', 20),
  ((select id from public.exercises where slug = 'standing-knee-raises'), 'assets/images/standing_exercises_04_knee_raise_start.png', 10),
  ((select id from public.exercises where slug = 'standing-knee-raises'), 'assets/images/standing_exercises_04_knee_raise_end.png', 20),
  ((select id from public.exercises where slug = 'supine-lumbar-rotations'), 'assets/images/lying_in_bed_01_lumbar_rotations.jpg', 10),
  ((select id from public.exercises where slug = 'supine-hip-rotations'), 'assets/images/lying_in_bed_02_hip_rotations.jpg', 10),
  ((select id from public.exercises where slug = 'supine-figure-four'), 'assets/images/lying_in_bed_03_figure_four.jpg', 10),
  ((select id from public.exercises where slug = 'single-knee-to-chest'), 'assets/images/lying_in_bed_04_knee_to_chest.jpg', 10),
  ((select id from public.exercises where slug = 'supine-spinal-twist'), 'assets/images/lying_in_bed_05_spinal_twist.jpg', 10),
  ((select id from public.exercises where slug = 'side-lying-thoracic-rotation'), 'assets/images/lying_in_bed_06_thoracic_rotation.jpg', 10),
  ((select id from public.exercises where slug = 'prone-lower-leg-swings'), 'assets/images/face_down_in_bed_01_lower_leg_swings.jpg', 10),
  ((select id from public.exercises where slug = 'prone-cross-body-leg-reaches'), 'assets/images/face_down_in_bed_02_cross_body_leg_reaches.jpg', 10),
  ((select id from public.exercises where slug = 'frog-leg-prone-back-extension'), 'assets/images/face_down_in_bed_03_frog_leg_back_extension.jpg', 10);

update public.exercises
set lottie_url = null,
    updated_at = now()
where slug in (
  'supine-lumbar-rotations',
  'supine-hip-rotations',
  'supine-figure-four',
  'single-knee-to-chest',
  'supine-spinal-twist',
  'side-lying-thoracic-rotation',
  'prone-lower-leg-swings'
);

update public.exercises
set lottie_url = case slug
    when 'flexor-stretch' then 'assets/videos/wrist_flexor_stretch.mp4'
    when 'extensor-stretch' then 'assets/videos/wrist_extensor_stretch.mp4'
    when 'eccentric-wrist-extension' then 'assets/videos/eccentric_wrist_extension_v2.mp4'
    when 'wrist-flexion' then 'assets/videos/wrist_flexion_tutorial.mp4'
    when 'forearm-supination' then 'assets/videos/supination_pronation_tutorial.mp4'
    when 'finger-extension' then 'assets/videos/finger_extension_tutorial.mp4'
    when 'grip-finger-opening' then 'assets/videos/grip_exercise_tutorial.mp4'
    when 'supine-lumbar-rotations' then 'assets/videos/supine_lumbar_rotations_tutorial.mp4'
    when 'supine-hip-rotations' then 'assets/videos/supine_hip_rotations_tutorial.mp4'
    when 'supine-figure-four' then 'assets/videos/supine_figure_four_stretch_tutorial.mp4'
    when 'single-knee-to-chest' then 'assets/videos/single_knee_to_chest_tutorial.mp4'
    when 'supine-spinal-twist' then 'assets/videos/supine_spinal_twist_tutorial.mp4'
    when 'side-lying-thoracic-rotation' then 'assets/videos/thoracic_open_book_rotation_tutorial.mp4'
  end,
  updated_at = now()
where slug in ('flexor-stretch', 'extensor-stretch', 'eccentric-wrist-extension', 'wrist-flexion', 'forearm-supination', 'finger-extension', 'grip-finger-opening', 'supine-lumbar-rotations', 'supine-hip-rotations', 'supine-figure-four', 'single-knee-to-chest', 'supine-spinal-twist', 'side-lying-thoracic-rotation');
