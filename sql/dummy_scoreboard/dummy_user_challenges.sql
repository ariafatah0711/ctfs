-- 0. DROP FK CONSTRAINT SEMENTARA (HANYA UNTUK TESTING!)
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_id_fkey;

DELETE FROM public.solves WHERE id::text LIKE '20000000-%';
DELETE FROM public.challenges WHERE id::text LIKE '10000000-%';
DELETE FROM public.users WHERE id::text LIKE '00000000-%';

-- =========================
-- 1. tambah banyak dummy users (28 total)
-- =========================
INSERT INTO public.users (id, username, created_at) VALUES
  ('00000000-0000-0000-0000-000000000001', 'alya23', '2025-08-26 11:40:19'),
  ('00000000-0000-0000-0000-000000000002', 'bintangx', '2025-08-20 11:40:19'),
  ('00000000-0000-0000-0000-000000000003', 'dimas_dev', '2025-09-02 11:40:19'),
  ('00000000-0000-0000-0000-000000000004', 'salsaa', '2025-07-27 11:40:19'),
  ('00000000-0000-0000-0000-000000000005', 'indra7', '2025-09-02 11:40:19'),
  ('00000000-0000-0000-0000-000000000006', 'naufaljs', '2025-08-19 11:40:19'),
  ('00000000-0000-0000-0000-000000000007', 'putri.codes', '2025-08-27 11:40:19'),
  ('00000000-0000-0000-0000-000000000008', 'ramadhanx', '2025-09-01 11:40:19'),
  ('00000000-0000-0000-0000-000000000009', 'zahra98', '2025-09-02 11:40:19'),
  ('00000000-0000-0000-0000-000000000010', 'fikri_h', '2025-08-11 11:40:19'),
  ('00000000-0000-0000-0000-000000000011', 'rizkiyy', '2025-08-28 11:40:19'),
  ('00000000-0000-0000-0000-000000000012', 'ananda_r', '2025-07-27 11:40:19'),
  ('00000000-0000-0000-0000-000000000013', 'syifa_dev', '2025-08-01 11:40:19'),
  ('00000000-0000-0000-0000-000000000014', 'dwianto', '2025-08-27 11:40:19'),
  ('00000000-0000-0000-0000-000000000015', 'hanifx', '2025-08-04 11:40:19'),
  ('00000000-0000-0000-0000-000000000016', 'lutfia', '2025-09-03 11:40:19'),
  ('00000000-0000-0000-0000-000000000017', 'kevinh', '2025-07-30 11:40:19'),
  ('00000000-0000-0000-0000-000000000018', 'marcello', '2025-08-18 11:40:19'),
  ('00000000-0000-0000-0000-000000000019', 'tiara_s', '2025-08-12 11:40:19'),
  ('00000000-0000-0000-0000-000000000020', 'akbar99', '2025-08-28 11:40:19'),
  ('00000000-0000-0000-0000-000000000021', 'gilang', '2025-07-26 11:40:19'),
  ('00000000-0000-0000-0000-000000000022', 'saskia', '2025-08-08 11:40:19'),
  ('00000000-0000-0000-0000-000000000023', 'farhan.id', '2025-08-23 11:40:19'),
  ('00000000-0000-0000-0000-000000000024', 'nadine_07', '2025-08-06 11:40:19'),
  ('00000000-0000-0000-0000-000000000025', 'arya.codes', '2025-08-31 11:40:19'),
  ('00000000-0000-0000-0000-000000000026', 'novita', '2025-08-11 11:40:19'),
  ('00000000-0000-0000-0000-000000000027', 'fauzanx', '2025-07-28 11:40:19'),
  ('00000000-0000-0000-0000-000000000028', 'yusril_dev', '2025-07-27 11:40:19');

-- =========================
-- 2. Tambah banyak dummy challenges (20 total)
-- =========================
INSERT INTO public.challenges (id, title, description, category, points, hint, difficulty, is_active)
VALUES
  ('10000000-0000-0000-0000-000000000001', 'Dummy Challenge 1', 'deskripsi: flag{dummy1}', 'Web', 100, '["Hint dummy 1"]', 'Easy', true),
  ('10000000-0000-0000-0000-000000000002', 'Dummy Challenge 2', 'deskripsi: flag{dummy2}', 'Crypto', 200, '["Hint dummy 2"]', 'Medium', true),
  ('10000000-0000-0000-0000-000000000003', 'Dummy Challenge 3', 'deskripsi: flag{dummy3}', 'Forensics', 300, '["Hint dummy 3"]', 'Hard', true),
  ('10000000-0000-0000-0000-000000000004', 'Dummy Challenge 4', 'deskripsi: flag{dummy4}', 'PWN', 400, '["Hint dummy 4"]', 'Medium', true),
  ('10000000-0000-0000-0000-000000000005', 'Dummy Challenge 5', 'deskripsi: flag{dummy5}', 'Reverse', 500, '["Hint dummy 5"]', 'Hard', true),
  ('10000000-0000-0000-0000-000000000006', 'Dummy Challenge 6', 'deskripsi: flag{dummy6}', 'Web', 150, '["Hint dummy 6"]', 'Easy', true),
  ('10000000-0000-0000-0000-000000000007', 'Dummy Challenge 7', 'deskripsi: flag{dummy7}', 'Crypto', 250, '["Hint dummy 7"]', 'Medium', true),
  ('10000000-0000-0000-0000-000000000008', 'Dummy Challenge 8', 'deskripsi: flag{dummy8}', 'Forensics', 350, '["Hint dummy 8"]', 'Hard', true),
  ('10000000-0000-0000-0000-000000000009', 'Dummy Challenge 9', 'deskripsi: flag{dummy9}', 'PWN', 450, '["Hint dummy 9"]', 'Medium', true),
  ('10000000-0000-0000-0000-000000000010', 'Dummy Challenge 10', 'deskripsi: flag{dummy10}', 'Reverse', 550, '["Hint dummy 10"]', 'Hard', true),
  ('10000000-0000-0000-0000-000000000011', 'Dummy Challenge 11', 'deskripsi: flag{dummy11}', 'Web', 120, '["Hint dummy 11"]', 'Easy', true),
  ('10000000-0000-0000-0000-000000000012', 'Dummy Challenge 12', 'deskripsi: flag{dummy12}', 'Crypto', 220, '["Hint dummy 12"]', 'Medium', true),
  ('10000000-0000-0000-0000-000000000013', 'Dummy Challenge 13', 'deskripsi: flag{dummy13}', 'Forensics', 320, '["Hint dummy 13"]', 'Hard', true),
  ('10000000-0000-0000-0000-000000000014', 'Dummy Challenge 14', 'deskripsi: flag{dummy14}', 'PWN', 420, '["Hint dummy 14"]', 'Medium', true),
  ('10000000-0000-0000-0000-000000000015', 'Dummy Challenge 15', 'deskripsi: flag{dummy15}', 'Reverse', 520, '["Hint dummy 15"]', 'Hard', true),
  ('10000000-0000-0000-0000-000000000016', 'Dummy Challenge 16', 'deskripsi: flag{dummy16}', 'Web', 180, '["Hint dummy 16"]', 'Easy', true),
  ('10000000-0000-0000-0000-000000000017', 'Dummy Challenge 17', 'deskripsi: flag{dummy17}', 'Crypto', 280, '["Hint dummy 17"]', 'Medium', true),
  ('10000000-0000-0000-0000-000000000018', 'Dummy Challenge 18', 'deskripsi: flag{dummy18}', 'Forensics', 380, '["Hint dummy 18"]', 'Hard', true),
  ('10000000-0000-0000-0000-000000000019', 'Dummy Challenge 19', 'deskripsi: flag{dummy19}', 'PWN', 480, '["Hint dummy 19"]', 'Medium', true),
  ('10000000-0000-0000-0000-000000000020', 'Dummy Challenge 20', 'deskripsi: flag{dummy20}', 'Reverse', 580, '["Hint dummy 20"]', 'Hard', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.challenge_flags (challenge_id, flag)
VALUES
  ('10000000-0000-0000-0000-000000000001', 'flag{dummy1}'),
  ('10000000-0000-0000-0000-000000000002', 'flag{dummy2}'),
  ('10000000-0000-0000-0000-000000000003', 'flag{dummy3}'),
  ('10000000-0000-0000-0000-000000000004', 'flag{dummy4}'),
  ('10000000-0000-0000-0000-000000000005', 'flag{dummy5}'),
  ('10000000-0000-0000-0000-000000000006', 'flag{dummy6}'),
  ('10000000-0000-0000-0000-000000000007', 'flag{dummy7}'),
  ('10000000-0000-0000-0000-000000000008', 'flag{dummy8}'),
  ('10000000-0000-0000-0000-000000000009', 'flag{dummy9}'),
  ('10000000-0000-0000-0000-000000000010', 'flag{dummy10}'),
  ('10000000-0000-0000-0000-000000000011', 'flag{dummy11}'),
  ('10000000-0000-0000-0000-000000000012', 'flag{dummy12}'),
  ('10000000-0000-0000-0000-000000000013', 'flag{dummy13}'),
  ('10000000-0000-0000-0000-000000000014', 'flag{dummy14}'),
  ('10000000-0000-0000-0000-000000000015', 'flag{dummy15}'),
  ('10000000-0000-0000-0000-000000000016', 'flag{dummy16}'),
  ('10000000-0000-0000-0000-000000000017', 'flag{dummy17}'),
  ('10000000-0000-0000-0000-000000000018', 'flag{dummy18}'),
  ('10000000-0000-0000-0000-000000000019', 'flag{dummy19}'),
  ('10000000-0000-0000-0000-000000000020', 'flag{dummy20}')
ON CONFLICT (challenge_id) DO NOTHING;
