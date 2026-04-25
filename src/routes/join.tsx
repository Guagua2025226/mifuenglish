import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useStudent, BJ_DISTRICTS, GRADES } from "@/lib/student-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export const Route = createFileRoute("/join")({
  head: () => ({ meta: [{ title: "加入打卡 — 米赋AI教育" }] }),
  component: Join,
});

const schema = z.object({
  name: z.string().trim().min(1, "请输入姓名").max(20, "姓名最多 20 个字"),
  grade: z.string().min(1, "请选择年级"),
  district: z.string().min(1, "请选择区域"),
});

function Join() {
  const navigate = useNavigate();
  const { setStudent } = useStudent();
  const [name, setName] = useState("");
  const [grade, setGrade] = useState("初三");
  const [district, setDistrict] = useState("海淀区");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    const parsed = schema.safeParse({ name, grade, district });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("students")
      .insert(parsed.data)
      .select("id,name,grade,district")
      .single();
    setLoading(false);
    if (error || !data) {
      toast.error("加入失败，请重试");
      return;
    }
    setStudent(data);
    toast.success(`欢迎 ${data.name}！开始今日打卡 🚀`);
    navigate({ to: "/practice" });
  };

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="glass-card rounded-2xl p-8">
        <h1 className="text-2xl font-bold text-gradient-gold text-center">加入米赋打卡</h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          无需注册 · 输入信息即可开始打卡，并登上封神榜
        </p>

        <div className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-medium">姓名</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="例如：张小明" maxLength={20} />
          </div>
          <div>
            <label className="text-sm font-medium">年级</label>
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {GRADES.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">北京区域</label>
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {BJ_DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <Button
            onClick={submit}
            disabled={loading}
            className="w-full bg-gradient-to-r from-[oklch(0.82_0.14_85)] to-[oklch(0.72_0.16_70)] text-[oklch(0.20_0.05_290)] font-bold"
          >
            {loading ? "加入中..." : "加入打卡 →"}
          </Button>
          <p className="text-[11px] text-muted-foreground text-center">
            点击即表示同意将姓名、年级、所在区域用于封神榜展示
          </p>
        </div>
      </div>
    </div>
  );
}
