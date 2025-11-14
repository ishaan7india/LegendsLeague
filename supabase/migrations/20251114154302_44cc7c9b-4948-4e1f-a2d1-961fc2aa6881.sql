-- Create matches table for tournament data
CREATE TABLE public.matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_number INTEGER NOT NULL,
  team_a TEXT NOT NULL,
  team_b TEXT NOT NULL,
  team_a_runs INTEGER,
  team_a_wickets INTEGER,
  team_a_overs DECIMAL,
  team_b_runs INTEGER,
  team_b_wickets INTEGER,
  team_b_overs DECIMAL,
  winner TEXT,
  is_walkover BOOLEAN DEFAULT false,
  is_no_result BOOLEAN DEFAULT false,
  is_playoff BOOLEAN DEFAULT false,
  playoff_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access
CREATE POLICY "Anyone can view matches"
ON public.matches
FOR SELECT
USING (true);

-- Create policy to allow public write access (required for client-side admin)
CREATE POLICY "Anyone can insert matches"
ON public.matches
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update matches"
ON public.matches
FOR UPDATE
USING (true);

CREATE POLICY "Anyone can delete matches"
ON public.matches
FOR DELETE
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_matches_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_matches_timestamp
BEFORE UPDATE ON public.matches
FOR EACH ROW
EXECUTE FUNCTION public.update_matches_updated_at();