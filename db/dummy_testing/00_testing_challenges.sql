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
    '["Gunakan base64 decode.", "Periksa bagian comment di file."]',
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
    'Challenge ini berisi dua file yang harus dianalisis. <br>Flag: flag{test_file}',
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
SELECT id, 'flag{test_file}', encode(digest('flag{test_file}', 'sha256'), 'hex')
FROM ins;


-- =========================
-- Reset chall_test_url
-- =========================
DELETE FROM public.solves
WHERE challenge_id IN (SELECT id FROM public.challenges WHERE title = 'chall_test_url');
DELETE FROM public.challenge_flags
WHERE challenge_id IN (SELECT id FROM public.challenges WHERE title = 'chall_test_url');
DELETE FROM public.challenge_flags
WHERE flag_hash = encode(digest('flag{test_url}', 'sha256'), 'hex');
DELETE FROM public.challenges WHERE title = 'chall_test_url';

WITH ins AS (
  INSERT INTO public.challenges (title, description, category, points, hint, difficulty, attachments)
  VALUES (
    'chall_test_url',
    'Challenge ini berisi dua link yang perlu dicek. <br>Flag: flag{test_url}',
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
SELECT id, 'flag{test_url}', encode(digest('flag{test_url}', 'sha256'), 'hex')
FROM ins;

-- =========================
-- Reset chall_test_markdown
-- =========================
DELETE FROM public.solves
WHERE challenge_id IN (SELECT id FROM public.challenges WHERE title = 'chall_test_markdown');
DELETE FROM public.challenge_flags
WHERE challenge_id IN (SELECT id FROM public.challenges WHERE title = 'chall_test_markdown');
DELETE FROM public.challenge_flags
WHERE flag_hash = encode(digest('flag{test_markdown}', 'sha256'), 'hex');
DELETE FROM public.challenges WHERE title = 'chall_test_markdown';

WITH ins AS (
  INSERT INTO public.challenges (title, description, category, points, hint, difficulty, attachments)
  VALUES (
    'chall_test_markdown',
    $$
# Markdown Challenge

**Bold Text**, *Italic Text*, ~~Strikethrough~~

- List item 1
- List item 2
- [Link ke Google](https://google.com)

> Blockquote test

```bash
echo "hello markdown"
```

Flag: `flag{test_markdown}`
    $$,
    'Misc',
    50,
    '["Coba lihat apakah markdown render dengan baik."]',
    'Easy',
    '[]'::jsonb
  )
  RETURNING id
)
INSERT INTO public.challenge_flags (challenge_id, flag, flag_hash)
SELECT id, 'flag{test_markdown}', encode(digest('flag{test_markdown}', 'sha256'), 'hex')
FROM ins;

-- =========================
-- Reset chall_test_dynamic
-- =========================
DELETE FROM public.solves
WHERE challenge_id IN (SELECT id FROM public.challenges WHERE title = 'chall_test_dynamic');
DELETE FROM public.challenge_flags
WHERE challenge_id IN (SELECT id FROM public.challenges WHERE title = 'chall_test_dynamic');
DELETE FROM public.challenge_flags
WHERE flag_hash = encode(digest('flag{test_dynamic}', 'sha256'), 'hex');
DELETE FROM public.challenges WHERE title = 'chall_test_dynamic';

WITH ins AS (
  INSERT INTO public.challenges (
    title, description, category, points, max_points, hint, difficulty, attachments, is_dynamic, min_points, decay_per_solve
  )
  VALUES (
    'chall_test_dynamic',
    'Challenge ini pakai dynamic scoring. Nilai awal 500 poin, turun 50 poin tiap solve, minimal 200 poin.\nFlag: flag{test_dynamic}',
    'Crypto',
    500,    -- points (akan diupdate setiap solve)
    500,    -- max_points (nilai awal)
    '["Perhatikan pola ciphertext.", "Ada kaitan dengan base64 juga."]',
    'Hard',
    '[]'::jsonb,
    true,   -- is_dynamic
    100,    -- min_points
    10      -- decay_per_solve
  )
  RETURNING id
)
INSERT INTO public.challenge_flags (challenge_id, flag, flag_hash)
SELECT id, 'flag{test_dynamic}', encode(digest('flag{test_dynamic}', 'sha256'), 'hex')
FROM ins;
