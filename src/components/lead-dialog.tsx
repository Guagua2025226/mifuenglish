import { useState } from "react";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { pickRandomSales } from "@/lib/sales";
import { useStudent } from "@/lib/student-context";
import type { Coach } from "@/lib/coaches";
import { notifySalesByEmail } from "@/lib/notify-sales.functions";
import diagnosisQR from "@/assets/diagnosis-qrcode.jpg";
import qrLijing from "@/assets/qr-lijing.jpg";
import qrZheng from "@/assets/qr-zhengjiabao.jpg";

const SALES_QR: Record<string, { name: string; company: string; qr: string }> = {
  lijing: { name: "李晶", company: "北京米赋教育科技有限公司", qr: qrLijing },
  zhengjiabao: { name: "郑家宝", company: "北京米赋教育科技有限公司", qr: qrZheng },
};

const SUBJECTS = ["英语", "数学", "语文", "物理", "化学", "全科"] as const;
const SCORES = ["90+", "80–90", "70–80", "60–70", "60 以下"] as const;
const MBTIS = [
  "INTJ", "INTP", "ENTJ", "ENTP",
  "INFJ", "INFP", "ENFJ", "ENFP",
  "ISTJ", "ISFJ", "ESTJ", "ESFJ",
  "ISTP", "ISFP", "ESTP", "ESFP",
] as const;

const schema = z.object({
  parent_name: z.string().trim().min(1, "请输入家长姓名").max(20, "姓名最多 20 字"),
  phone: z.string().trim().regex(/^1[3-9]\d{9}$/, "请输入正确的 11 位手机号"),
  email: z.string().trim().email("请输入正确的邮箱地址").max(100, "邮箱过长"),
  subject: z.enum(SUBJECTS, { message: "请选择提升学科" }),
  score_range: z.enum(SCORES, { message: "请选择目前成绩" }),
  mbti: z.string().optional(),
});

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  coach: Coach | null;
}

export function LeadDialog({ open, onOpenChange, coach }: Props) {
  const { student } = useStudent();
  const [parentName, setParentName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState<typeof SUBJECTS[number]>("英语");
  const [score, setScore] = useState<typeof SCORES[number]>("80–90");
  const [mbti, setMbti] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [assignedSalesId, setAssignedSalesId] = useState<string>("lijing");

  const reset = () => {
    setParentName(""); setPhone(""); setEmail(""); setSubject("英语");
    setScore("80–90"); setMbti(""); setSubmitted(false);
  };

  const handleClose = (v: boolean) => {
    if (!v) reset();
    onOpenChange(v);
  };

  const submit = async () => {
    if (!coach) return;
    const parsed = schema.safeParse({
      parent_name: parentName,
      phone,
      email,
      subject,
      score_range: score,
      mbti: mbti || undefined,
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    const sales = pickRandomSales();
    setLoading(true);
    const { error } = await supabase.from("leads").insert({
      parent_name: parsed.data.parent_name,
      phone: parsed.data.phone,
      email: parsed.data.email,
      subject: parsed.data.subject,
      score_range: parsed.data.score_range,
      mbti: parsed.data.mbti ?? null,
      coach_id: coach.id,
      coach_name: coach.name,
      assigned_sales: sales.id,
      student_id: student?.id ?? null,
    });
    if (error) {
      setLoading(false);
      toast.error("提交失败，请稍后重试");
      return;
    }

    // 异步通知顾问邮箱（失败不影响用户体验）
    notifySalesByEmail({
      data: {
        parent_name: parsed.data.parent_name,
        phone: parsed.data.phone,
        email: parsed.data.email,
        subject: parsed.data.subject,
        score_range: parsed.data.score_range,
        mbti: parsed.data.mbti ?? null,
        coach_name: coach.name,
      },
    }).catch((e) => console.error("邮件通知失败：", e));

    setLoading(false);
    setSubmitted(true);
    toast.success("报名成功！请扫码领取学情诊断报告");
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        {!coach ? null : submitted ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-gradient-gold">🎁 免费学情诊断报告</DialogTitle>
              <DialogDescription>
                报名成功！扫描下方二维码，立即领取一份<span className="text-gold font-semibold">全方位学情诊断报告</span>，
                顾问将通过邮箱与电话与您联系。
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col items-center">
              <img
                src={diagnosisQR}
                alt="米赋AI云校 学生综合测评问卷 二维码"
                className="rounded-xl w-full max-w-xs border border-border"
              />
              <p className="mt-3 text-center text-xs text-muted-foreground">
                打开手机微信「扫一扫」即可填写测评问卷
              </p>
            </div>
            <Button variant="outline" onClick={() => handleClose(false)}>完成</Button>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-gradient-gold">立即体验 · 1V1 试听</DialogTitle>
              <DialogDescription>
                您选择的教练：<span className="text-gold font-semibold">{coach.name} 老师</span>（{coach.subject}）
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">家长姓名 *</label>
                <Input value={parentName} onChange={(e) => setParentName(e.target.value)} maxLength={20} placeholder="请输入家长姓名" />
              </div>
              <div>
                <label className="text-sm font-medium">联系电话 *</label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))} maxLength={11} placeholder="11 位手机号" inputMode="numeric" />
              </div>
              <div>
                <label className="text-sm font-medium">联系邮箱 *</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value.trim())}
                  maxLength={100}
                  placeholder="例如：parent@example.com"
                  inputMode="email"
                />
              </div>
              <div>
                <label className="text-sm font-medium">提升学科 *</label>
                <select value={subject} onChange={(e) => setSubject(e.target.value as typeof SUBJECTS[number])}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">目前成绩 *</label>
                <select value={score} onChange={(e) => setScore(e.target.value as typeof SCORES[number])}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  {SCORES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">MBTI <span className="text-xs text-muted-foreground">（选填）</span></label>
                <select value={mbti} onChange={(e) => setMbti(e.target.value)}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="">暂不填写</option>
                  {MBTIS.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <Button
                onClick={submit}
                disabled={loading}
                className="w-full bg-gradient-to-r from-[oklch(0.82_0.14_85)] to-[oklch(0.72_0.16_70)] text-[oklch(0.20_0.05_290)] font-bold"
              >
                {loading ? "提交中..." : "提交并领取学情诊断 →"}
              </Button>
              <p className="text-[11px] text-muted-foreground text-center">
                提交即同意将信息用于课程顾问联系
              </p>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
