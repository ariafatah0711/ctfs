-- =========================
-- Reset chall_test_file
-- =========================
DELETE FROM public.solves
WHERE challenge_id IN (SELECT id FROM public.challenges WHERE title = 'chall_test_file');
DELETE FROM public.challenge_flags
WHERE challenge_id IN (SELECT id FROM public.challenges WHERE title = 'chall_test_file');
DELETE FROM public.challenge_flags
WHERE flag_hash = encode(digest('flag{test_file}', 'sha256'), 'hex');
DELETE FROM public.challenges WHERE title = 'chall_test_file';

WITH ins AS (
  INSERT INTO public.challenges (title, description, category, points, hint, difficulty, attachments)
  VALUES (
    'chall_test_file',
    'Download file ini dan cari flag di dalamnya.
     Flag: flag{test_file}',
    'Misc',
    50,
    '["Flag ada di dalam metadata file."]',
    'Easy',
    '[{"url":"https://ariaf.my.id/assets/images/profile2-128.avif","name":"profile2-128.avif","type":"file"}]'::jsonb
  )
  RETURNING id
)
INSERT INTO public.challenge_flags (challenge_id, flag, flag_hash)
SELECT id, 'flag{test_file}', encode(digest('flag{test_file}', 'sha256'), 'hex')
FROM ins;


-- =========================
-- Reset chall_test_link
-- =========================
DELETE FROM public.solves
WHERE challenge_id IN (SELECT id FROM public.challenges WHERE title = 'chall_test_link');
DELETE FROM public.challenge_flags
WHERE challenge_id IN (SELECT id FROM public.challenges WHERE title = 'chall_test_link');
DELETE FROM public.challenge_flags
WHERE flag_hash = encode(digest('flag{test_link}', 'sha256'), 'hex');
DELETE FROM public.challenges WHERE title = 'chall_test_link';

WITH ins AS (
  INSERT INTO public.challenges (title, description, category, points, hint, difficulty, attachments)
  VALUES (
    'chall_test_link',
    'Akses link berikut dan temukan flag di halaman.
     Flag: flag{test_link}',
    'Misc',
    75,
    '["Flag tersembunyi di halaman web yang diberikan."]',
    'Easy',
    '[{"url":"https://ariaf.my.id","name":"https://ariaf.my.id","type":"link"}]'::jsonb
  )
  RETURNING id
)
INSERT INTO public.challenge_flags (challenge_id, flag, flag_hash)
SELECT id, 'flag{test_link}', encode(digest('flag{test_link}', 'sha256'), 'hex')
FROM ins;


-- =========================
-- Reset chall_test_hint
-- =========================
DELETE FROM public.solves
WHERE challenge_id IN (SELECT id FROM public.challenges WHERE title = 'chall_test_hint');
DELETE FROM public.challenge_flags
WHERE challenge_id IN (SELECT id FROM public.challenges WHERE title = 'chall_test_hint');
DELETE FROM public.challenge_flags
WHERE flag_hash = encode(digest('flag{test_hint}', 'sha256'), 'hex');
DELETE FROM public.challenges WHERE title = 'chall_test_hint';

WITH ins AS (
  INSERT INTO public.challenges (title, description, category, points, hint, difficulty, attachments)
  VALUES (
    'chall_test_hint',
    'Challenge ini memiliki beberapa hint untuk membantumu.
     Flag: flag{test_hint}',
    'Misc',
    100,
    '["Gunakan base64 decode.", "Periksa bagian comment di file."]',
    'Medium',
    '[]'::jsonb
  )
  RETURNING id
)
INSERT INTO public.challenge_flags (challenge_id, flag, flag_hash)
SELECT id, 'flag{test_hint}', encode(digest('flag{test_hint}', 'sha256'), 'hex')
FROM ins;


-- =========================
-- Reset chall_test_combination
-- =========================
DELETE FROM public.solves
WHERE challenge_id IN (SELECT id FROM public.challenges WHERE title = 'chall_test_combination');
DELETE FROM public.challenge_flags
WHERE challenge_id IN (SELECT id FROM public.challenges WHERE title = 'chall_test_combination');
DELETE FROM public.challenge_flags
WHERE flag_hash = encode(digest('flag{test_combination}', 'sha256'), 'hex');
DELETE FROM public.challenges WHERE title = 'chall_test_combination';

WITH ins AS (
  INSERT INTO public.challenges (title, description, category, points, hint, difficulty, attachments)
  VALUES (
    'chall_test_combination',
    'Challenge ini kombinasi: ada file dan link.
    Flag: flag{test_combination}',
    'Misc',
    150,
    '["Clue ada di file, jawaban ada di link."]',
    'Hard',
    '[{"url":"https://ariaf.my.id/assets/images/profile2-128.avif","name":"profile2-128.avif","type":"file"},
      {"url":"https://ariaf.my.id","name":"https://ariaf.my.id","type":"link"}]'::jsonb
  )
  RETURNING id
)
INSERT INTO public.challenge_flags (challenge_id, flag, flag_hash)
SELECT id, 'flag{test_combination}', encode(digest('flag{test_combination}', 'sha256'), 'hex')
FROM ins;

-- =========================
-- Reset chall_test_file2
-- =========================
DELETE FROM public.solves
WHERE challenge_id IN (SELECT id FROM public.challenges WHERE title = 'chall_test_file2');
DELETE FROM public.challenge_flags
WHERE challenge_id IN (SELECT id FROM public.challenges WHERE title = 'chall_test_file2');
DELETE FROM public.challenge_flags
WHERE flag_hash = encode(digest('flag{test_file2}', 'sha256'), 'hex');
DELETE FROM public.challenges WHERE title = 'chall_test_file2';

WITH ins AS (
  INSERT INTO public.challenges (title, description, category, points, hint, difficulty, attachments)
  VALUES (
    'chall_test_file2',
    'Challenge ini berisi dua file yang harus dianalisis. <br>Flag: flag{test_file2}',
    'Misc',
    120,
    '["Kedua file mengandung bagian dari flag."]',
    'Medium',
    '[{"url":"https://ariaf.my.id/assets/images/profile2-128.avif","name":"profile2-128.avif","type":"file"},
      {"url":"https://ariaf.my.id/assets/images/profile2-128.avif","name":"profile2-128-copy.avif","type":"file"}]'::jsonb
  )
  RETURNING id
)
INSERT INTO public.challenge_flags (challenge_id, flag, flag_hash)
SELECT id, 'flag{test_file2}', encode(digest('flag{test_file2}', 'sha256'), 'hex')
FROM ins;


-- =========================
-- Reset chall_test_url2
-- =========================
DELETE FROM public.solves
WHERE challenge_id IN (SELECT id FROM public.challenges WHERE title = 'chall_test_url2');
DELETE FROM public.challenge_flags
WHERE challenge_id IN (SELECT id FROM public.challenges WHERE title = 'chall_test_url2');
DELETE FROM public.challenge_flags
WHERE flag_hash = encode(digest('flag{test_url2}', 'sha256'), 'hex');
DELETE FROM public.challenges WHERE title = 'chall_test_url2';

WITH ins AS (
  INSERT INTO public.challenges (title, description, category, points, hint, difficulty, attachments)
  VALUES (
    'chall_test_url2',
    'Challenge ini berisi dua link yang perlu dicek. <br>Flag: flag{test_url2}',
    'Misc',
    90,
    '["Flag bisa muncul di salah satu halaman."]',
    'Easy',
    '[{"url":"https://ariaf.my.id","name":"https://ariaf.my.id","type":"link"},
      {"url":"https://ariaf.my.id/galery","name":"https://ariaf.my.id/galery","type":"link"}]'::jsonb
  )
  RETURNING id
)
INSERT INTO public.challenge_flags (challenge_id, flag, flag_hash)
SELECT id, 'flag{test_url2}', encode(digest('flag{test_url2}', 'sha256'), 'hex')
FROM ins;
