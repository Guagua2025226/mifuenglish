import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useStudent } from "@/lib/student-context";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "我的打卡 — 米赋AI教育" }] }),
  component: Dashboard,
});

interface DayLog { date: string; words: number; correct: number }

function Dashboard() {
  const { student, loading } = useStudent();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalWords: 0, totalCorrect: 0, sessions: 0, streak: 0, todayWords: 0 });
  const [recent, setRecent] = useState<DayLog[]>([]);
  const [vocabTotal, setVocabTotal] = useState(0);

  useEffect(() => { if (!loading && !student) navigate({ to: "/join" }); }, [student, loading, navigate]);

  useEffect(() => {
    if (!student) return;
    (async () => {
      const { count } = await supabase.from("vocabulary").select("*", { count: "exact", head: true });
      setVocabTotal(count ?? 0);

      const { data: logs } = await supabase
        .from("study_logs")
        .select("words_studied,correct_count,created_at")
        .eq("student_id", student.id)
        .order("created_at", { ascending: false })
        .limit(500);

      const all = logs ?? [];
      const totalWords = all.reduce((a, l) => a + l.words_studied, 0);
      const totalCorrect = all.reduce((a, l) => a + l.correct_count, 0);
      const sessions = all.length;

      // Aggregate by date
      const dayMap = new Map<string, DayLog>();
      all.forEach((l) => {
        const d = new Date(l.created_at).toISOString().slice(0, 10);
        const cur = dayMap.get(d) ?? { date: d, words: 0, correct: 0 };
        cur.words += l.words_studied;
        cur.correct += l.correct_count;
        dayMap.set(d, cur);
      });
      const today = new Date().toISOString().slice(0, 10);
      const todayWords = dayMap.get(today)?.words ?? 0;

      // streak
      let streak = 0;
      const d = new Date();
      while (dayMap.has(d.toISOString().slice(0, 10))) {
        streak++;
        d.setDate(d.getDate() - 1);
      }

      setStats({ totalWords, totalCorrect, sessions, streak, todayWords });
      setRecent(Array.from(dayMap.values()).sort((a, b) => a.date.localeCompare(b.date)));
    })();
  }, [student]);

  if (!student) return null;
  const accuracy = stats.totalWords > 0 ? Math.round((stats.totalCorrect / stats.totalWords) * 100) : 0;
  const coverage = vocabTotal > 0 ? Math.min(100, Math.round((stats.totalWords / vocabTotal) * 100)) : 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gradient-gold">我的打卡</h1>
          <p className="text-sm text-muted-foreground">
            {student.name} · {student.grade} · {student.district}
          </p>
        </div>
        <Link to="/ranking"><Button variant="outline">🏆 查看封神榜</Button></Link>
      </div>

      <div className="mt-6 grid gap-4 grid-cols-2 md:grid-cols-4">
        <StatCard label="🔥 连续打卡" value={`${stats.streak} 天`} />
        <StatCard label="今日学习" value={`${stats.todayWords} 词`} />
        <StatCard label="累计词数" value={`${stats.totalWords}`} />
        <StatCard label="平均正确率" value={`${accuracy}%`} />
      </div>

      <div className="glass-card mt-6 rounded-2xl p-6">
        <div className="mb-2 flex justify-between text-sm">
          <span>词汇覆盖进度（共 {vocabTotal} 词）</span>
          <span className="text-gold">{coverage}%</span>
        </div>
        <Progress value={coverage} />
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

      <div className="mt-6 flex gap-3 flex-wrap">
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
