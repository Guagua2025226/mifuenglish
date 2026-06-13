import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { bootstrapCoach } from "@/lib/coach-bootstrap.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/coach")({
  component: CoachDashboard,
});

const MBTIS = [
  "INTJ","INTP","ENTJ","ENTP","INFJ","INFP","ENFJ","ENFP",
  "ISTJ","ISFJ","ESTJ","ESFJ","ISTP","ISFP","ESTP","ESFP",
];

const SUBJECTS = ["英语", "数学", "语文", "物理", "化学", "生物", "政治", "历史", "全科"];

interface Coach {
  id: string;
  name: string;
  en_name: string | null;
  title: string | null;
  subject: string | null;
  mbti: string | null;
  bio: string | null;
  years_experience: number | null;
  phone: string | null;
  status: "pending" | "approved" | "rejected" | "disabled";
}

const STATUS_LABEL: Record<Coach["status"], { text: string; cls: string }> = {
  pending: { text: "待审核", cls: "bg-yellow-500/20 text-yellow-500" },
  approved: { text: "已通过", cls: "bg-green-500/20 text-green-500" },
  rejected: { text: "已拒绝", cls: "bg-red-500/20 text-red-500" },
  disabled: { text: "已停用", cls: "bg-muted text-muted-foreground" },
};

function CoachDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [coach, setCoach] = useState<Coach | null>(null);
  const [error, setError] = useState<string | null>(null);

  // form
  const [name, setName] = useState("");
  const [enName, setEnName] = useState("");
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [mbti, setMbti] = useState("");
  const [years, setYears] = useState<string>("");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);

  const loadCoach = async () => {
    setLoading(true);
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;
    if (!token) {
      navigate({ to: "/coach/login" });
      return;
    }
    const res = await bootstrapCoach({ data: { accessToken: token } });
    if (!res.ok) {
      setError(res.error);
      setLoading(false);
      return;
    }
    const c = res.coach as Coach;
    setCoach(c);
    setName(c.name === "待完善" ? "" : c.name ?? "");
    setEnName(c.en_name ?? "");
    setTitle(c.title ?? "");
    setSubject(c.subject ?? "");
    setMbti(c.mbti ?? "");
    setYears(c.years_experience?.toString() ?? "");
    setBio(c.bio ?? "");
    setLoading(false);
  };

  useEffect(() => {
    loadCoach();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const save = async () => {
    if (!coach) return;
    if (!name.trim()) {
      toast.error("请填写姓名");
      return;
    }
    setSaving(true);
    // 已通过审核的资料修改也会回到 pending（再审核）
    const nextStatus =
      coach.status === "approved" ? "pending" : coach.status;
    const { error } = await supabase
      .from("coaches")
      .update({
        name: name.trim(),
        en_name: enName.trim() || null,
        title: title.trim() || null,
        subject: subject || null,
        mbti: mbti || null,
        years_experience: years ? Number(years) : null,
        bio: bio.trim() || null,
        status: nextStatus,
      })
      .eq("id", coach.id);
    setSaving(false);
    if (error) {
      toast.error("保存失败：" + error.message);
      return;
    }
    toast.success(
      coach.status === "approved"
        ? "已提交修改，等待管理员重新审核"
        : "已保存，等待管理员审核"
    );
    loadCoach();
  };

  const logout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/coach/login" });
  };

  if (loading) {
    return <div className="p-20 text-center text-muted-foreground">加载中...</div>;
  }
  if (error) {
    return (
      <div className="mx-auto max-w-md p-10 text-center">
        <div className="glass-card rounded-2xl p-8">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={logout} variant="outline">退出登录</Button>
        </div>
      </div>
    );
  }
  if (!coach) return null;

  const s = STATUS_LABEL[coach.status];

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gradient-gold">教练后台</h1>
          <p className="text-sm text-muted-foreground mt-1">
            手机号 {coach.phone} ·{" "}
            <span className={`inline-block px-2 py-0.5 rounded-full text-xs ${s.cls}`}>
              {s.text}
            </span>
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={logout}>退出</Button>
      </div>

      {coach.status === "pending" && (
        <div className="mb-6 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4 text-sm">
          您的资料正在审核中。完整填写下方信息可加快审核速度。
        </div>
      )}

      <div className="glass-card rounded-2xl p-6 space-y-4">
        <h2 className="font-semibold">个人资料</h2>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">中文姓名 *</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} maxLength={20} />
          </div>
          <div>
            <label className="text-sm font-medium">英文名</label>
            <Input
              value={enName}
              onChange={(e) => setEnName(e.target.value)}
              maxLength={40}
              placeholder="Dr. Chen"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">头衔</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={60}
            placeholder="清华大学 博士后"
          />
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium">主教学科</label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">请选择</option>
              {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">MBTI</label>
            <select
              value={mbti}
              onChange={(e) => setMbti(e.target.value)}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">未填写</option>
              {MBTIS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">教龄（年）</label>
            <Input
              type="number"
              min={0}
              max={50}
              value={years}
              onChange={(e) => setYears(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">个人简介</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={500}
            rows={4}
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder="教学经历、擅长方向、教学风格等"
          />
          <p className="text-[11px] text-muted-foreground mt-1">{bio.length} / 500</p>
        </div>

        <Button onClick={save} disabled={saving} className="w-full">
          {saving ? "保存中..." : "保存资料"}
        </Button>
      </div>

      <div className="mt-6 rounded-xl border border-border bg-card/50 p-4 text-sm text-muted-foreground">
        🔜 下一步将在这里加上「每周可约时段」「临时屏蔽某天」「我的预约」三个模块。
      </div>
    </div>
  );
}
