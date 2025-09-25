-- =========================
-- 4. Hapus semua data dummy (tanpa hapus data asli)
-- =========================
DELETE FROM public.solves WHERE id::text LIKE '20000000-%';
DELETE FROM public.challenges WHERE id::text LIKE '10000000-%';
DELETE FROM public.users WHERE id::text LIKE '00000000-%';

-- 5. RESTORE FK CONSTRAINT (BALIK KE NORMAL)
ALTER TABLE public.users
  ADD CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
