-- ==============================================
-- Table: notifications
-- ==============================================

CREATE TABLE public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  level TEXT DEFAULT 'info',
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER PUBLICATION supabase_realtime
ADD TABLE public.notifications;
