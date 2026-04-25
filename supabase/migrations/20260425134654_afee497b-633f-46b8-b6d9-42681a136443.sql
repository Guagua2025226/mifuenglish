-- 学生档案（轻量身份，不依赖 auth）
CREATE TABLE public.students (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  grade TEXT NOT NULL,
  district TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone can read students"
ON public.students FOR SELECT
USING (true);

CREATE POLICY "anyone can insert students"
ON public.students FOR INSERT
WITH CHECK (
  length(name) BETWEEN 1 AND 30
  AND length(grade) BETWEEN 1 AND 20
  AND length(district) BETWEEN 1 AND 30
);

-- 学习记录（每次打卡）
CREATE TABLE public.study_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  mode TEXT NOT NULL,
  words_studied INTEGER NOT NULL DEFAULT 0,
  correct_count INTEGER NOT NULL DEFAULT 0,
  score INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.study_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone can read study logs"
ON public.study_logs FOR SELECT
USING (true);

CREATE POLICY "anyone can insert study logs"
ON public.study_logs FOR INSERT
WITH CHECK (
  words_studied BETWEEN 0 AND 1000
  AND correct_count BETWEEN 0 AND 1000
  AND score BETWEEN 0 AND 100000
);

CREATE INDEX idx_study_logs_student ON public.study_logs(student_id);
CREATE INDEX idx_study_logs_created ON public.study_logs(created_at DESC);