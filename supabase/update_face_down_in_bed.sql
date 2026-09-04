-- Sync the FACE DOWN IN BED routine with the supplied reference video.
-- Sequence: gentle warm-up, rotational mobility, then back extension.
update public.exercises as exercise
set
  title = source.title,
  short_description = source.short_description,
  long_description = source.long_description,
  safety_alert = source.safety_alert,
  thumbnail_url = source.thumbnail_url,
  default_reps = 20,
  sort_order = source.sort_order,
  lottie_url = source.tutorial_url,
  updated_at = now()
from (
  values
    (
      'prone-lower-leg-swings',
      'PRONE LOWER-LEG SWINGS',
      'Bend both knees and swing the lower legs gently from side to side.',
      'Lie face-down with your arms resting comfortably. Bend both knees to about 90 degrees, keep your thighs relaxed on the bed, and slowly swing both lower legs from side to side as a gentle warm-up.',
      'Keep the movement small and easy. Stop if it causes knee pain, sharp lower-back pain, or cramping in the hamstrings.',
      'assets/images/face_down_in_bed_01_lower_leg_swings.jpg',
      10,
      'assets/videos/prone_lower_leg_swings_tutorial.mp4'
    ),
    (
      'prone-cross-body-leg-reaches',
      'PRONE CROSS-BODY LEG REACHES',
      'Reach one bent leg across behind your body, then alternate sides.',
      'Lie face-down with both legs long. Bend one knee, lift that leg gently, and reach the foot across behind your body toward the opposite side. Return to neutral, then alternate sides with control.',
      'Move slowly and keep most of your pelvis supported. Use a smaller reach if you feel pinching in the hip or pressure in the lower back.',
      'assets/images/face_down_in_bed_02_cross_body_leg_reaches.jpg',
      20,
      'assets/videos/prone_cross_body_leg_reaches_tutorial.mp4'
    ),
    (
      'frog-leg-prone-back-extension',
      'FROG-LEG PRONE BACK EXTENSION',
      'Open one knee to the side and gently lift your chest from the forearms.',
      'Lie face-down with one leg straight and the other knee comfortably opened out to the side. Place your forearms under your shoulders, gently lift and lengthen your chest, then lower with control. Switch the bent leg between sets.',
      'Keep the extension mild and your shoulders away from your ears. Stop if you feel pinching or sharp pain in your lower back or hip.',
      'assets/images/face_down_in_bed_03_frog_leg_back_extension.jpg',
      30,
      'assets/videos/frog_leg_prone_back_extension_tutorial.mp4'
    )
) as source(
  slug,
  title,
  short_description,
  long_description,
  safety_alert,
  thumbnail_url,
  sort_order,
  tutorial_url
)
where exercise.slug = source.slug
  and exercise.routine_id = (
    select id
    from public.routines
    where slug = 'face-down-in-bed'
  );
