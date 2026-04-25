CREATE TABLE public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_name text NOT NULL,
  phone text NOT NULL,
  subject text NOT NULL,
  score_range text NOT NULL,
  mbti text,
  coach_id text NOT NULL,
  coach_name text NOT NULL,
  assigned_sales text NOT NULL,
  student_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone can insert leads"
ON public.leads
FOR INSERT
TO public
WITH CHECK (
  length(parent_name) BETWEEN 1 AND 30
  AND phone ~ '^1[3-9][0-9]{9}$'
  AND length(subject) BETWEEN 1 AND 20
  AND length(score_range) BETWEEN 1 AND 20
  AND (mbti IS NULL OR length(mbti) <= 10)
  AND length(coach_id) BETWEEN 1 AND 50
  AND length(coach_name) BETWEEN 1 AND 50
  AND assigned_sales IN ('lijing','zhengjiabao')
);

CREATE INDEX idx_leads_created_at ON public.leads(created_at DESC);