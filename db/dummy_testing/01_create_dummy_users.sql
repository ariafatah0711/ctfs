-- ==============================================
-- 01 - Create Dummy Users
-- Creates deterministic dummy users for scenario testing.
-- ==============================================

-- Fixed UUIDs used across all dummy_testing scripts:
-- user1: 00000000-0000-0000-0000-000000000101 (admin)
-- user2: 00000000-0000-0000-0000-000000000102
-- user3: 00000000-0000-0000-0000-000000000103
-- user4: 00000000-0000-0000-0000-000000000104
-- user5: 00000000-0000-0000-0000-000000000105
-- user6: 00000000-0000-0000-0000-000000000106

INSERT INTO public.users (id, username, is_admin, bio, sosmed, profile_picture_url)
VALUES
  ('00000000-0000-0000-0000-000000000101', 'dummy_user1', true,  'admin test user', '{}'::jsonb, NULL),
  ('00000000-0000-0000-0000-000000000102', 'dummy_user2', false, 'team member 1', '{}'::jsonb, NULL),
  ('00000000-0000-0000-0000-000000000103', 'dummy_user3', false, 'team member 2', '{}'::jsonb, NULL),
  ('00000000-0000-0000-0000-000000000104', 'dummy_user4', false, 'captain team 2', '{}'::jsonb, NULL),
  ('00000000-0000-0000-0000-000000000105', 'dummy_user5', false, 'extra user for tests', '{}'::jsonb, NULL),
  ('00000000-0000-0000-0000-000000000106', 'dummy_user6', false, 'extra user for tests', '{}'::jsonb, NULL)
ON CONFLICT (id) DO UPDATE
SET
  username = EXCLUDED.username,
  bio = EXCLUDED.bio,
  sosmed = EXCLUDED.sosmed,
  profile_picture_url = EXCLUDED.profile_picture_url;

-- Keep user1 as admin for admin-only RPC smoke tests.
UPDATE public.users
SET is_admin = true
WHERE id = '00000000-0000-0000-0000-000000000101';

SELECT id, username, is_admin
FROM public.users
WHERE id IN (
  '00000000-0000-0000-0000-000000000101',
  '00000000-0000-0000-0000-000000000102',
  '00000000-0000-0000-0000-000000000103',
  '00000000-0000-0000-0000-000000000104',
  '00000000-0000-0000-0000-000000000105',
  '00000000-0000-0000-0000-000000000106'
)
ORDER BY username;
