import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "我的打卡 — 米赋AI教育" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total: 0, mastered: 0, todayWords: 0, streak: 0 });
  const [recent, setRecent] = useState<{ date: string; words: number }[]>([]);

  useEffect(() => { if (!loading && !user) navigate({ to: "/auth" }); }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { count: total } = await supabase.from("vocabulary").select("*", { count: "exact", head: true });
      const { data: prog } = await supabase.from("user_progress").select("mastery").eq("user_id", user.id);
      const mastered = (prog ?? []).filter((p) => p.mastery >= 2).length;
      const today = new Date().toISOString().slice(0, 10);
      const { data: ck } = await supabase.from("daily_checkin").select("checkin_date, words_studied").eq("user_id", user.id).order("checkin_date", { ascending: false }).limit(14);
      const todayWords = ck?.find((c) => c.checkin_date === today)?.words_studied ?? 0;
      // streak
      let streak = 0;
      const dates = new Set((ck ?? []).map((c) => c.checkin_date));
      const d = new Date();
      while (dates.has(d.toISOString().slice(0, 10))) { streak++; d.setDate(d.getDate() - 1); }
      setStats({ total: total ?? 0, mastered, todayWords, streak });
      setRecent((ck ?? []).map((c) => ({ date: c.checkin_date, words: c.words_studied })).reverse());
    })();
  }, [user]);

  if (!user) return null;
  const pct = stats.total ? Math.round((stats.mastered / stats.total) * 100) : 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl md:text-3xl font-bold text-gradient-gold">我的打卡</h1>
      <p className="text-sm text-muted-foreground">每天进步一点点，中考冲刺更轻松</p>

      <div className="mt-6 grid gap-4 grid-cols-2 md:grid-cols-4">
        <StatCard label="🔥 连续打卡" value={`${stats.streak} 天`} />
        <StatCard label="今日学习" value={`${stats.todayWords} 词`} />
        <StatCard label="已掌握" value={`${stats.mastered} / ${stats.total}`} />
        <StatCard label="总进度" value={`${pct}%`} />
      </div>

      <div className="glass-card mt-6 rounded-2xl p-6">
        <div className="mb-2 flex justify-between text-sm">
          <span>词汇掌握进度</span><span className="text-gold">{pct}%</span>
        </div>
        <Progress value={pct} />
      </div>

      <div className="glass-card mt-6 rounded-2xl p-6">
        <h2 className="mb-4 font-semibold">近 14 天打卡</h2>
        <div className="flex gap-1 items-end h-24">
          {Array.from({ length: 14 }).map((_, i) => {
            const d = new Date(); d.setDate(d.getDate() - (13 - i));
            const ds = d.toISOString().slice(0, 10);
            const item = recent.find((r) => r.date === ds);
            const h = item ? Math.min(100, item.words * 5) : 4;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full rounded-t bg-gradient-to-t from-primary to-[oklch(0.72_0.20_300)]" style={{ height: `${h}%`, minHeight: 4 }} />
                <div className="text-[9px] text-muted-foreground">{d.getDate()}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <Link to="/practice"><Button size="lg" className="bg-gradient-to-r from-primary to-[oklch(0.72_0.20_300)]">开始今日练习</Button></Link>
        <a href="/vocab-handout.pdf" target="_blank" rel="noreferrer"><Button size="lg" variant="outline">下载词汇默写表</Button></a>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass-card rounded-2xl p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-xl md:text-2xl font-bold text-gradient-gold">{value}</div>
    </div>
  );
}
