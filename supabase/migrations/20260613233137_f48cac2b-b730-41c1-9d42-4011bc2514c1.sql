
-- ============ ENUMS ============
DO $$ BEGIN
  CREATE TYPE public.coach_status AS ENUM ('pending', 'approved', 'rejected', 'disabled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.booking_status AS ENUM ('pending', 'confirmed', 'rejected', 'timeout', 'reassigned', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============ updated_at trigger fn ============
CREATE OR REPLACE FUNCTION public.tg_set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

-- ============ coach_whitelist ============
CREATE TABLE public.coach_whitelist (
  phone text PRIMARY KEY,
  suggested_name text,
  suggested_subject text,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.coach_whitelist TO authenticated;
GRANT ALL ON public.coach_whitelist TO service_role;
ALTER TABLE public.coach_whitelist ENABLE ROW LEVEL SECURITY;
-- 不开放任何 policy：仅 service_role 可访问（管理员后台用密码 + service role 操作）

-- ============ coaches ============
CREATE TABLE public.coaches (
  id text PRIMARY KEY,                       -- 与前端 COACHES[].id 对齐：chen / lv / ...
  user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  phone text UNIQUE,
  name text NOT NULL,
  en_name text,
  title text,
  subject text,
  mbti text,
  bio text,
  years_experience int,
  avatar_url text,
  highlights jsonb DEFAULT '[]'::jsonb,
  features jsonb DEFAULT '[]'::jsonb,
  status public.coach_status NOT NULL DEFAULT 'pending',
  display_order int NOT NULL DEFAULT 100,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_coaches_status ON public.coaches(status);
CREATE INDEX idx_coaches_user_id ON public.coaches(user_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.coaches TO authenticated;
GRANT ALL ON public.coaches TO service_role;
ALTER TABLE public.coaches ENABLE ROW LEVEL SECURITY;
-- 教练只能看/改自己的那一行
CREATE POLICY "coach can read own row" ON public.coaches
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "coach can update own row" ON public.coaches
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE TRIGGER trg_coaches_updated_at BEFORE UPDATE ON public.coaches
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- 种入现有 11 位教练（手机号留空，等他们自己登录补；状态先设为 approved 以保持现有展示不变）
INSERT INTO public.coaches (id, name, en_name, title, subject, status, display_order, highlights, features) VALUES
  ('chen','陈昱蓉','Dr. Chen','清华大学 博士后','数学 & 物理资深竞赛 / 高考教练','approved',10,
    '["跨学科基础学习力体系","ICF 专业教练认证 + 发展心理学背景","AI 智能赋能 + 高考精准提分双轮驱动","科研原生 · AI 原生复合型教研导师"]'::jsonb,
    '["深厚理科功底：工科+理学跨学科复合背景，数理逻辑严谨缜密。","顶尖教研实力：清华大学博士后科研经历，精通考点建模、命题规律提炼。","科学育人理念：融合 ICF 专业教练机制与发展心理学。","AI 高效智能教学：将 AI 全流程深度融入备课、授课、刷题、错题复盘。"]'::jsonb),
  ('lv','吕宁','Dr. Lv','清华大学 博士','英语 · 语言类 教练','approved',20,'[]'::jsonb,'[]'::jsonb),
  ('zhang','张馨鹏','Dr. Zhang','清华大学 博士','数学 教练','approved',30,'[]'::jsonb,'[]'::jsonb),
  ('zeng','曾远卓','Dr. Zeng','北京大学 博士','英语 教练','approved',40,'[]'::jsonb,'[]'::jsonb),
  ('guo','郭志勇','Dr. Guo','北京大学 博士','生物 · 数学 双学科教练','approved',50,'[]'::jsonb,'[]'::jsonb),
  ('li','李嘉欣','Dr. Li','北京大学 硕士','数学 · 物理教练','approved',60,'[]'::jsonb,'[]'::jsonb),
  ('lu','卢大伟','Dr. Lu','北京大学 博士','数学 · 物理 · 化学教练','approved',70,'[]'::jsonb,'[]'::jsonb),
  ('sun','孙博','Dr. Sun','清华大学 博士','数学 · 物理 · 化学教练','approved',80,'[]'::jsonb,'[]'::jsonb),
  ('wang','王禹澍','Dr. Wang','英国利兹大学 硕士','师训培训师 · 英语教练','approved',90,'[]'::jsonb,'[]'::jsonb),
  ('xu','许睿智','Dr. Xu','香港大学 硕士','数学 · 物理教练','approved',100,'[]'::jsonb,'[]'::jsonb),
  ('zhao','赵荣文','Dr. Zhao','北京大学','政治 · 历史教练','approved',110,'[]'::jsonb,'[]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- ============ coach_availability (每周固定模板) ============
CREATE TABLE public.coach_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id text NOT NULL REFERENCES public.coaches(id) ON DELETE CASCADE,
  weekday smallint NOT NULL CHECK (weekday BETWEEN 0 AND 6),  -- 0=周日 ... 6=周六
  start_hour smallint NOT NULL CHECK (start_hour BETWEEN 0 AND 23),
  end_hour smallint NOT NULL CHECK (end_hour BETWEEN 1 AND 24 AND end_hour > start_hour),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_avail_coach ON public.coach_availability(coach_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.coach_availability TO authenticated;
GRANT ALL ON public.coach_availability TO service_role;
ALTER TABLE public.coach_availability ENABLE ROW LEVEL SECURITY;
CREATE POLICY "coach manage own availability" ON public.coach_availability
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.coaches c WHERE c.id = coach_id AND c.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.coaches c WHERE c.id = coach_id AND c.user_id = auth.uid()));

-- ============ coach_time_off (临时屏蔽某天/某时段) ============
CREATE TABLE public.coach_time_off (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id text NOT NULL REFERENCES public.coaches(id) ON DELETE CASCADE,
  off_date date NOT NULL,
  start_hour smallint CHECK (start_hour BETWEEN 0 AND 23),  -- 空=整天屏蔽
  end_hour smallint CHECK (end_hour BETWEEN 1 AND 24),
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_timeoff_coach_date ON public.coach_time_off(coach_id, off_date);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.coach_time_off TO authenticated;
GRANT ALL ON public.coach_time_off TO service_role;
ALTER TABLE public.coach_time_off ENABLE ROW LEVEL SECURITY;
CREATE POLICY "coach manage own time_off" ON public.coach_time_off
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.coaches c WHERE c.id = coach_id AND c.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.coaches c WHERE c.id = coach_id AND c.user_id = auth.uid()));

-- ============ bookings (预约单) ============
CREATE TABLE public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id text NOT NULL REFERENCES public.coaches(id),
  reassigned_from_coach_id text REFERENCES public.coaches(id),
  parent_name text NOT NULL,
  parent_phone text NOT NULL,
  parent_email text,
  student_id uuid,
  subject text NOT NULL,
  score_range text,
  mbti text,
  scheduled_date date NOT NULL,
  scheduled_start_hour smallint NOT NULL CHECK (scheduled_start_hour BETWEEN 0 AND 23),
  duration_minutes smallint NOT NULL CHECK (duration_minutes IN (60, 90, 120)),
  status public.booking_status NOT NULL DEFAULT 'pending',
  deadline_at timestamptz NOT NULL DEFAULT (now() + interval '6 hours'),
  confirmed_at timestamptz,
  assigned_sales text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_bookings_coach_date ON public.bookings(coach_id, scheduled_date);
CREATE INDEX idx_bookings_status ON public.bookings(status);
CREATE INDEX idx_bookings_deadline ON public.bookings(deadline_at) WHERE status = 'pending';
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bookings TO authenticated;
GRANT ALL ON public.bookings TO service_role;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
-- 教练只能看到/操作自己名下的预约
CREATE POLICY "coach read own bookings" ON public.bookings
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.coaches c WHERE c.id = coach_id AND c.user_id = auth.uid()));
CREATE POLICY "coach update own bookings" ON public.bookings
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.coaches c WHERE c.id = coach_id AND c.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.coaches c WHERE c.id = coach_id AND c.user_id = auth.uid()));
CREATE TRIGGER trg_bookings_updated_at BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
