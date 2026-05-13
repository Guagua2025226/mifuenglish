import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchLeads } from "@/lib/admin.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
});

interface Lead {
  id: string;
  parent_name: string;
  phone: string;
  email: string | null;
  subject: string;
  score_range: string;
  mbti: string | null;
  coach_name: string;
  assigned_sales: string;
  created_at: string;
}

const SALES_NAME: Record<string, string> = { lijing: "李晶", zhengjiabao: "郑家宝" };

function AdminPage() {
  const [pwd, setPwd] = useState("");
  const [authed, setAuthed] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<string>("all");

  const login = async () => {
    setLoading(true);
    try {
      const res = await fetchLeads({ data: { password: pwd } });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      setLeads(res.leads as Lead[]);
      setAuthed(true);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "加载失败");
    } finally {
      setLoading(false);
    }
  };

  const refresh = async () => {
    setLoading(true);
    const res = await fetchLeads({ data: { password: pwd } });
    if (res.ok) setLeads(res.leads as Lead[]);
    setLoading(false);
  };

  if (!authed) {
    return (
      <div className="mx-auto max-w-sm px-4 py-20">
        <div className="glass-card rounded-2xl p-8">
          <h1 className="text-2xl font-bold text-gradient-gold mb-1">顾问后台</h1>
          <p className="text-sm text-muted-foreground mb-6">请输入访问密码</p>
          <Input
            type="password"
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && login()}
            placeholder="密码"
            autoFocus
          />
          <Button onClick={login} disabled={loading || !pwd} className="w-full mt-4">
            {loading ? "验证中..." : "进入"}
          </Button>
        </div>
      </div>
    );
  }

  const filtered = filter === "all" ? leads : leads.filter((l) => l.assigned_sales === filter);
  const fmt = (s: string) =>
    new Date(s).toLocaleString("zh-CN", { timeZone: "Asia/Shanghai", hour12: false });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-2xl font-bold text-gradient-gold">家长报名信息</h1>
          <p className="text-sm text-muted-foreground">共 {filtered.length} 条记录</p>
        </div>
        <div className="flex gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="all">全部顾问</option>
            <option value="lijing">李晶</option>
            <option value="zhengjiabao">郑家宝</option>
          </select>
          <Button variant="outline" onClick={refresh} disabled={loading}>
            {loading ? "刷新中..." : "刷新"}
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-card/60 text-left">
            <tr>
              <th className="p-2.5">提交时间</th>
              <th className="p-2.5">家长</th>
              <th className="p-2.5">电话</th>
              <th className="p-2.5">邮箱</th>
              <th className="p-2.5">学科</th>
              <th className="p-2.5">成绩</th>
              <th className="p-2.5">MBTI</th>
              <th className="p-2.5">教练</th>
              <th className="p-2.5">顾问</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((l) => (
              <tr key={l.id} className="border-t border-border/50 hover:bg-card/30">
                <td className="p-2.5 whitespace-nowrap text-muted-foreground">{fmt(l.created_at)}</td>
                <td className="p-2.5 font-medium">{l.parent_name}</td>
                <td className="p-2.5 tabular-nums">
                  <a href={`tel:${l.phone}`} className="text-gold hover:underline">{l.phone}</a>
                </td>
                <td className="p-2.5">
                  {l.email ? <a href={`mailto:${l.email}`} className="hover:underline">{l.email}</a> : "—"}
                </td>
                <td className="p-2.5">{l.subject}</td>
                <td className="p-2.5">{l.score_range}</td>
                <td className="p-2.5">{l.mbti ?? "—"}</td>
                <td className="p-2.5">{l.coach_name}</td>
                <td className="p-2.5">
                  <span className="inline-block px-2 py-0.5 rounded-full text-xs bg-gold/20 text-gold">
                    {SALES_NAME[l.assigned_sales] ?? l.assigned_sales}
                  </span>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={9} className="p-8 text-center text-muted-foreground">暂无数据</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
