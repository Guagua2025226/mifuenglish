import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { fetchSalesLeads } from "@/lib/sales-leads.functions";
import { SALES_CONSULTANTS, type Sales } from "@/lib/sales";

export const Route = createFileRoute("/sales")({
  head: () => ({ meta: [{ title: "顾问后台 — 米赋AI教育" }] }),
  component: SalesPortal,
});

interface Lead {
  id: string;
  parent_name: string;
  phone: string;
  subject: string;
  score_range: string;
  mbti: string | null;
  coach_name: string;
  assigned_sales: string;
  created_at: string;
}

function SalesPortal() {
  const [salesId, setSalesId] = useState<Sales["id"]>("lijing");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);

  const currentSales = SALES_CONSULTANTS.find((s) => s.id === salesId)!;

  const login = async () => {
    if (!password) {
      toast.error("请输入密码");
      return;
    }
    setLoading(true);
    try {
      const res = await fetchSalesLeads({ data: { sales_id: salesId, password } });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      setLeads(res.leads as Lead[]);
      setAuthed(true);
      toast.success(`欢迎，${currentSales.name} 顾问`);
    } catch {
      toast.error("登录失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  const refresh = async () => {
    setLoading(true);
    const res = await fetchSalesLeads({ data: { sales_id: salesId, password } });
    if (res.ok) {
      setLeads(res.leads as Lead[]);
      toast.success("已刷新");
    }
    setLoading(false);
  };

  const logout = () => {
    setAuthed(false);
    setPassword("");
    setLeads([]);
  };

  if (!authed) {
    return (
      <div className="mx-auto max-w-md px-4 py-12">
        <div className="glass-card rounded-2xl p-8">
          <h1 className="text-2xl font-bold text-gradient-gold text-center">顾问后台登录</h1>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            米赋AI教育 · 课程顾问专属入口
          </p>
          <div className="mt-6 space-y-4">
            <div>
              <label className="text-sm font-medium">顾问</label>
              <select
                value={salesId}
                onChange={(e) => setSalesId(e.target.value as Sales["id"])}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {SALES_CONSULTANTS.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">密码</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && login()}
                placeholder="请输入顾问密码"
              />
            </div>
            <Button
              onClick={login}
              disabled={loading}
              className="w-full bg-gradient-to-r from-[oklch(0.82_0.14_85)] to-[oklch(0.72_0.16_70)] text-[oklch(0.20_0.05_290)] font-bold"
            >
              {loading ? "登录中..." : "登录 →"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gradient-gold">
            {currentSales.name} 顾问 · 报名信息后台
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            共 {leads.length} 条家长报名记录 · 仅显示分配给您的线索
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={refresh} disabled={loading}>
            {loading ? "刷新中..." : "🔄 刷新"}
          </Button>
          <Button variant="outline" size="sm" onClick={logout}>退出</Button>
        </div>
      </div>

      {leads.length === 0 ? (
        <div className="mt-10 glass-card rounded-2xl p-10 text-center text-muted-foreground">
          暂无报名记录
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto glass-card rounded-2xl">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/30">
              <tr className="text-left">
                <th className="px-4 py-3 font-semibold">提交时间</th>
                <th className="px-4 py-3 font-semibold">家长姓名</th>
                <th className="px-4 py-3 font-semibold">联系电话</th>
                <th className="px-4 py-3 font-semibold">提升学科</th>
                <th className="px-4 py-3 font-semibold">目前成绩</th>
                <th className="px-4 py-3 font-semibold">MBTI</th>
                <th className="px-4 py-3 font-semibold">选择教练</th>
                <th className="px-4 py-3 font-semibold">分配顾问</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((l) => (
                <tr key={l.id} className="border-b border-border/50 hover:bg-muted/20">
                  <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(l.created_at).toLocaleString("zh-CN")}
                  </td>
                  <td className="px-4 py-3 font-medium">{l.parent_name}</td>
                  <td className="px-4 py-3">
                    <a href={`tel:${l.phone}`} className="text-gold hover:underline">{l.phone}</a>
                  </td>
                  <td className="px-4 py-3">{l.subject}</td>
                  <td className="px-4 py-3">{l.score_range}</td>
                  <td className="px-4 py-3 text-muted-foreground">{l.mbti || "—"}</td>
                  <td className="px-4 py-3">{l.coach_name}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center rounded-full bg-gold/15 px-2 py-0.5 text-xs text-gold">
                      {SALES_CONSULTANTS.find((s) => s.id === l.assigned_sales)?.name ?? l.assigned_sales}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
