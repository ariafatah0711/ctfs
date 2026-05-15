-- ==============================================
-- Migration: remove public preview RPC
-- Purpose: cleanup removed NXCTF preview feature
-- ==============================================

-- The preview system used a single RPC function and did not create preview
-- tables, views, triggers, or foreign keys. Dropping the function is safe for
-- relational integrity because it only read from existing public tables.
DROP FUNCTION IF EXISTS public.get_preview(integer, integer, uuid, text);
