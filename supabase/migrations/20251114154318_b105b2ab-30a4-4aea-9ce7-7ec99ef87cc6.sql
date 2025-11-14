-- Fix function search path security issue
DROP TRIGGER IF EXISTS update_matches_timestamp ON public.matches;
DROP FUNCTION IF EXISTS public.update_matches_updated_at();

CREATE OR REPLACE FUNCTION public.update_matches_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recreate trigger
CREATE TRIGGER update_matches_timestamp
BEFORE UPDATE ON public.matches
FOR EACH ROW
EXECUTE FUNCTION public.update_matches_updated_at();