ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS email text;

-- 更新INSERT策略，要求邮箱必填且格式合法
DROP POLICY IF EXISTS "anyone can insert leads" ON public.leads;

CREATE POLICY "anyone can insert leads"
ON public.leads
FOR INSERT
TO public
WITH CHECK (
  length(parent_name) >= 1 AND length(parent_name) <= 30
  AND phone ~ '^1[3-9][0-9]{9}$'
  AND email IS NOT NULL
  AND length(email) >= 5 AND length(email) <= 100
  AND email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  AND length(subject) >= 1 AND length(subject) <= 20
  AND length(score_range) >= 1 AND length(score_range) <= 20
  AND (mbti IS NULL OR length(mbti) <= 10)
  AND length(coach_id) >= 1 AND length(coach_id) <= 50
  AND length(coach_name) >= 1 AND length(coach_name) <= 50
  AND assigned_sales = ANY (ARRAY['lijing'::text, 'zhengjiabao'::text])
);