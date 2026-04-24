-- ==============================================
-- 04 - Simulate Challenge Solves
-- Simulates real solve flow using submit_flag RPC.
-- ==============================================

-- Event used by dummy challenges.
INSERT INTO public.events (id, name, description, start_time, end_time, always_show_challenges, image_url)
VALUES (
  '00000000-0000-0000-0000-000000000301',
  'Dummy Event',
  'Event for db/dummy_testing flow',
  now() - interval '1 day',
  now() + interval '7 days',
  true,
  NULL
)
ON CONFLICT (id) DO UPDATE
SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  start_time = EXCLUDED.start_time,
  end_time = EXCLUDED.end_time,
  always_show_challenges = EXCLUDED.always_show_challenges,
  image_url = EXCLUDED.image_url,
  updated_at = now();

-- Create dummy challenges.
INSERT INTO public.challenges (
  id, event_id, title, description, category, points,
  max_points, hint, difficulty, attachments,
  is_active, is_maintenance, is_dynamic, min_points, decay_per_solve
)
VALUES
  (
    '00000000-0000-0000-0000-000000000401',
    '00000000-0000-0000-0000-000000000301',
    'Dummy Web 1',
    'Basic web challenge',
    'web',
    100,
    NULL,
    NULL,
    'easy',
    '[]'::jsonb,
    true,
    false,
    false,
    0,
    0
  ),
  (
    '00000000-0000-0000-0000-000000000402',
    '00000000-0000-0000-0000-000000000301',
    'Dummy Crypto 1',
    'Basic crypto challenge',
    'crypto',
    200,
    NULL,
    NULL,
    'medium',
    '[]'::jsonb,
    true,
    false,
    false,
    0,
    0
  ),
  (
    '00000000-0000-0000-0000-000000000403',
    '00000000-0000-0000-0000-000000000301',
    'Dummy Pwn 1',
    'Basic pwn challenge',
    'pwn',
    300,
    NULL,
    NULL,
    'hard',
    '[]'::jsonb,
    true,
    false,
    false,
    0,
    0
  )
ON CONFLICT (id) DO UPDATE
SET
  event_id = EXCLUDED.event_id,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  points = EXCLUDED.points,
  difficulty = EXCLUDED.difficulty,
  is_active = true,
  is_maintenance = false,
  updated_at = now();

-- Flags for submit_flag.
INSERT INTO public.challenge_flags (challenge_id, flag, flag_hash)
VALUES
  (
    '00000000-0000-0000-0000-000000000401',
    'flag{dummy_web_1}',
    encode(digest('flag{dummy_web_1}', 'sha256'), 'hex')
  ),
  (
    '00000000-0000-0000-0000-000000000402',
    'flag{dummy_crypto_1}',
    encode(digest('flag{dummy_crypto_1}', 'sha256'), 'hex')
  ),
  (
    '00000000-0000-0000-0000-000000000403',
    'flag{dummy_pwn_1}',
    encode(digest('flag{dummy_pwn_1}', 'sha256'), 'hex')
  )
ON CONFLICT (challenge_id) DO UPDATE
SET
  flag = EXCLUDED.flag,
  flag_hash = EXCLUDED.flag_hash;

-- Reset existing solves for deterministic run.
DELETE FROM public.solves
WHERE challenge_id IN (
  '00000000-0000-0000-0000-000000000401',
  '00000000-0000-0000-0000-000000000402',
  '00000000-0000-0000-0000-000000000403'
)
AND user_id IN (
  '00000000-0000-0000-0000-000000000101',
  '00000000-0000-0000-0000-000000000102',
  '00000000-0000-0000-0000-000000000103'
);

-- Simulate solve flow via app RPC.
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000101', true);
SELECT submit_flag('00000000-0000-0000-0000-000000000401', 'flag{dummy_web_1}');

SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000102', true);
SELECT submit_flag('00000000-0000-0000-0000-000000000402', 'flag{dummy_crypto_1}');
SELECT submit_flag('00000000-0000-0000-0000-000000000401', 'flag{dummy_web_1}');

SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000103', true);
SELECT submit_flag('00000000-0000-0000-0000-000000000403', 'wrong_flag');
SELECT submit_flag('00000000-0000-0000-0000-000000000403', 'flag{dummy_pwn_1}');

SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000101', true);

SELECT s.user_id, u.username, s.challenge_id, c.title, c.points, s.created_at
FROM public.solves s
JOIN public.users u ON u.id = s.user_id
JOIN public.challenges c ON c.id = s.challenge_id
WHERE s.challenge_id IN (
  '00000000-0000-0000-0000-000000000401',
  '00000000-0000-0000-0000-000000000402',
  '00000000-0000-0000-0000-000000000403'
)
ORDER BY s.created_at ASC;
