-- Apply the recommended exercise sequence to every Bend and Mend routine.
-- The order progresses from warm-up/mobility to strengthening or balance,
-- then finishes with the deepest stretch or most demanding movement.
update public.exercises as exercise
set sort_order = ordered.sort_order,
    updated_at = now()
from (
  values
    ('tennis-elbow', 'extensor-stretch', 10),
    ('tennis-elbow', 'flexor-stretch', 20),
    ('tennis-elbow', 'forearm-supination', 30),
    ('tennis-elbow', 'eccentric-wrist-extension', 40),
    ('tennis-elbow', 'wrist-extension', 50),
    ('tennis-elbow', 'wrist-flexion', 60),
    ('tennis-elbow', 'finger-extension', 70),
    ('tennis-elbow', 'grip-finger-opening', 80),
    ('cat-cow', 'cat-cow', 10),
    ('cat-cow', 'thread-needle', 20),
    ('cat-cow', 'bird-dog', 30),
    ('cat-cow', 'sphinx-pose', 40),
    ('cat-cow', 'childs-pose', 50),
    ('standing-exercises', 'standing-knee-raises', 10),
    ('standing-exercises', 'wall-supported-back-leg-kicks', 20),
    ('standing-exercises', 'standing-superman', 30),
    ('standing-exercises', 'stationary-lunges', 40),
    ('lying-in-bed', 'supine-hip-rotations', 10),
    ('lying-in-bed', 'supine-lumbar-rotations', 20),
    ('lying-in-bed', 'single-knee-to-chest', 30),
    ('lying-in-bed', 'supine-figure-four', 40),
    ('lying-in-bed', 'supine-spinal-twist', 50),
    ('lying-in-bed', 'side-lying-thoracic-rotation', 60),
    ('face-down-in-bed', 'prone-lower-leg-swings', 10),
    ('face-down-in-bed', 'prone-cross-body-leg-reaches', 20),
    ('face-down-in-bed', 'frog-leg-prone-back-extension', 30),
    ('tai-chi', 'ward-off', 10),
    ('tai-chi', 'cloud-hands', 20),
    ('tai-chi', 'golden-rooster', 30)
) as ordered(routine_slug, exercise_slug, sort_order)
join public.routines as routine
  on routine.slug = ordered.routine_slug
where exercise.routine_id = routine.id
  and exercise.slug = ordered.exercise_slug;
