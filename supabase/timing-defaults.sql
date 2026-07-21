alter table public.exercises
  alter column set_rest_seconds set default 1.5,
  alter column pace_seconds set default 3.0;

update public.exercises
set
  set_rest_seconds = 1.5,
  pace_seconds = 3.0
where set_rest_seconds = 1.0
   or set_rest_seconds = 3.0
   or pace_seconds = 1.0;
