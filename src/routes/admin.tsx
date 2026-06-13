import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { fetchLeads } from "@/lib/admin.functions";
import {
  listWhitelist,
  addWhitelist,
  removeWhitelist,
  listAllCoaches,
  setCoachStatus,
} from "@/lib/admin-coaches.functions";
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

interface WL {
  phone: string;
  suggested_name: string | null;
  suggested_subject: string | null;
  note: string | null;
  created_at: string;
}

interface CoachRow {
  id: string;
  name: string;
  phone: string | null;
  subject: string | null;
  mbti: string | null;
  status: "pending" | "approved" | "rejected" | "disabled";
  created_at: string;
}

const SALES_NAME: Record<string, string> = { lijing: "李晶", zhengjiabao: "郑家宝" };

const STATUS_COLOR: Record<CoachRow["status"], string> = {
  pending: "bg-yellow-500/20 text-yellow-500",
  approved: "bg-green-500/20 text-green-500",
  rejected: "bg-red-500/20 text-red-500",
  disabled: "bg-muted text-muted-foreground",
};
const STATUS_LABEL: Record<CoachRow["status"], string> = {
  pending: "待审核",
  approved: "已通过",
  rejected: "已拒绝",
  disabled: "已停用",
};

function AdminPage() {
  const [pwd, setPwd] = useState("");
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(false);

  // leads
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filter, setFilter] = useState<string>("all");

  // whitelist
  const [wl, setWl] = useState<WL[]>([]);
  const [newPhone, setNewPhone] = useState("");
  const [newName, setNewName] = useState("");
  const [newSubject, setNewSubject] = useState("");

  // coaches
  const [coaches, setCoaches] = useState<CoachRow[]>([]);

  const loadAll = async (p: string) => {
    const [r1, r2, r3] = await Promise.all([
      fetchLeads({ data: { password: p } }),
      listWhitelist({ data: { password: p } }),
      listAllCoaches({ data: { password: p } }),
    ]);
    if (r1.ok) setLeads(r1.leads as Lead[]);
    if (r2.ok) setWl(r2.rows as WL[]);
    if (r3.ok) setCoaches(r3.rows as CoachRow[]);
    return r1.ok;
  };

  const login = async () => {
    setLoading(true);
    try {
      const ok = await loadAll(pwd);
      if (!ok) {
        toast.error("密码错误");
        return;
      }
      setAuthed(true);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "加载失败");
    } finally {
      setLoading(false);
    }
  };

  const refresh = async () => {
    setLoading(true);
    await loadAll(pwd);
    setLoading(false);
  };

  const addWl = async () => {
    if (!newPhone) return;
    const r = await addWhitelist({
      data: { password: pwd, phone: newPhone, name: newName, subject: newSubject },
    });
    if (!r.ok) { toast.error(r.error); return; }
    toast.success("已加入白名单：" + r.phone);
    setNewPhone(""); setNewName(""); setNewSubject("");
    refresh();
  };

  const delWl = async (phone: string) => {
    if (!confirm(`删除白名单 ${phone}？`)) return;
    const r = await removeWhitelist({ data: { password: pwd, phone } });
    if (!r.ok) { toast.error(r.error); return; }
    refresh();
  };

  const updateStatus = async (id: string, status: CoachRow["status"]) => {
    const r = await setCoachStatus({ data: { password: pwd, id, status } });
    if (!r.ok) { toast.error(r.error); return; }
    toast.success("已更新");
    refresh();
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
  const pendingCount = coaches.filter((c) => c.status === "pending").length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <h1 className="text-2xl font-bold text-gradient-gold">顾问后台</h1>
        <Button variant="outline" onClick={refresh} disabled={loading}>
          {loading ? "刷新中..." : "刷新"}
        </Button>
      </div>

      <Tabs defaultValue="leads">
        <TabsList>
          <TabsTrigger value="leads">家长报名 ({leads.length})</TabsTrigger>
          <TabsTrigger value="coaches">
            教练审核 {pendingCount > 0 && <span className="ml-1 text-yellow-500">({pendingCount})</span>}
          </TabsTrigger>
          <TabsTrigger value="whitelist">教练白名单 ({wl.length})</TabsTrigger>
        </TabsList>

        {/* ===== leads ===== */}
        <TabsContent value="leads" className="mt-4">
          <div className="flex gap-2 mb-3">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="all">全部顾问</option>
              <option value="lijing">李晶</option>
              <option value="zhengjiabao">郑家宝</option>
            </select>
            <span className="text-sm text-muted-foreground self-center">共 {filtered.length} 条</span>
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
                    <td className="p-2.5">{l.email ? <a href={`mailto:${l.email}`} className="hover:underline">{l.email}</a> : "—"}</td>
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
                  <tr><td colSpan={9} className="p-8 text-center text-muted-foreground">暂无数据</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* ===== coaches ===== */}
        <TabsContent value="coaches" className="mt-4">
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-card/60 text-left">
                <tr>
                  <th className="p-2.5">姓名</th>
                  <th className="p-2.5">手机号</th>
                  <th className="p-2.5">学科</th>
                  <th className="p-2.5">MBTI</th>
                  <th className="p-2.5">状态</th>
                  <th className="p-2.5">提交时间</th>
                  <th className="p-2.5 text-right">操作</th>
                </tr>
              </thead>
              <tbody>
                {coaches.map((c) => (
                  <tr key={c.id} className="border-t border-border/50 hover:bg-card/30">
                    <td className="p-2.5 font-medium">{c.name}</td>
                    <td className="p-2.5 tabular-nums">{c.phone ?? "—"}</td>
                    <td className="p-2.5">{c.subject ?? "—"}</td>
                    <td className="p-2.5">{c.mbti ?? "—"}</td>
                    <td className="p-2.5">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs ${STATUS_COLOR[c.status]}`}>
                        {STATUS_LABEL[c.status]}
                      </span>
                    </td>
                    <td className="p-2.5 text-muted-foreground whitespace-nowrap">{fmt(c.created_at)}</td>
                    <td className="p-2.5 text-right">
                      <div className="inline-flex gap-1">
                        {c.status !== "approved" && (
                          <Button size="sm" variant="outline" onClick={() => updateStatus(c.id, "approved")}>通过</Button>
                        )}
                        {c.status !== "rejected" && (
                          <Button size="sm" variant="outline" onClick={() => updateStatus(c.id, "rejected")}>拒绝</Button>
                        )}
                        {c.status !== "disabled" && (
                          <Button size="sm" variant="ghost" onClick={() => updateStatus(c.id, "disabled")}>停用</Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {coaches.length === 0 && (
                  <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">暂无教练</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* ===== whitelist ===== */}
        <TabsContent value="whitelist" className="mt-4 space-y-4">
          <div className="glass-card rounded-xl p-4">
            <h3 className="font-semibold mb-3">添加教练白名单</h3>
            <div className="grid sm:grid-cols-4 gap-2">
              <Input
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                placeholder="手机号 138..."
              />
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="建议姓名（选填）"
              />
              <Input
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                placeholder="学科（选填）"
              />
              <Button onClick={addWl} disabled={!newPhone}>加入白名单</Button>
            </div>
            <p className="text-[11px] text-muted-foreground mt-2">
              加入白名单后，该手机号即可在 <code>/coach/login</code> 用短信验证码登录。
            </p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-card/60 text-left">
                <tr>
                  <th className="p-2.5">手机号</th>
                  <th className="p-2.5">建议姓名</th>
                  <th className="p-2.5">学科</th>
                  <th className="p-2.5">备注</th>
                  <th className="p-2.5">添加时间</th>
                  <th className="p-2.5 text-right">操作</th>
                </tr>
              </thead>
              <tbody>
                {wl.map((w) => (
                  <tr key={w.phone} className="border-t border-border/50 hover:bg-card/30">
                    <td className="p-2.5 tabular-nums font-medium">{w.phone}</td>
                    <td className="p-2.5">{w.suggested_name ?? "—"}</td>
                    <td className="p-2.5">{w.suggested_subject ?? "—"}</td>
                    <td className="p-2.5 text-muted-foreground">{w.note ?? "—"}</td>
                    <td className="p-2.5 text-muted-foreground whitespace-nowrap">{fmt(w.created_at)}</td>
                    <td className="p-2.5 text-right">
                      <Button size="sm" variant="ghost" onClick={() => delWl(w.phone)}>删除</Button>
                    </td>
                  </tr>
                ))}
                {wl.length === 0 && (
                  <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">暂无白名单</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
