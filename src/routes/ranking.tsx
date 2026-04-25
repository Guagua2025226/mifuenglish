import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useStudent } from "@/lib/student-context";

export const Route = createFileRoute("/ranking")({
  head: () => ({
    meta: [
      { title: "封神榜 — 全北京中考词汇打卡排行" },
      { name: "description", content: "米赋AI教育封神榜：全北京各区学生词汇打卡学习记录排行榜，看看你在你的区里排第几。" },
    ],
  }),
  component: Ranking,
});

interface Row {
  student_id: string;
  name: string;
  grade: string;
  district: string;
  total_words: number;
  total_correct: number;
  sessions: number;
  accuracy: number;
}

interface DistrictRow {
  district: string;
  total_words: number;
  students: number;
}

function Ranking() {
  const { student } = useStudent();
  const [rows, setRows] = useState<Row[]>([]);
  const [districts, setDistricts] = useState<DistrictRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("全部");

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [{ data: students }, { data: logs }] = await Promise.all([
        supabase.from("students").select("id,name,grade,district").limit(1000),
        supabase.from("study_logs").select("student_id,words_studied,correct_count").limit(5000),
      ]);
      const map = new Map<string, Row>();
      (students ?? []).forEach((s) => {
        map.set(s.id, {
          student_id: s.id, name: s.name, grade: s.grade, district: s.district,
          total_words: 0, total_correct: 0, sessions: 0, accuracy: 0,
        });
      });
      (logs ?? []).forEach((l) => {
        const r = map.get(l.student_id);
        if (!r) return;
        r.total_words += l.words_studied;
        r.total_correct += l.correct_count;
        r.sessions += 1;
      });
      const arr = Array.from(map.values()).map((r) => ({
        ...r,
        accuracy: r.total_words > 0 ? Math.round((r.total_correct / r.total_words) * 100) : 0,
      }));
      arr.sort((a, b) => b.total_words - a.total_words || b.accuracy - a.accuracy);
      setRows(arr);

      // district aggregates
      const dmap = new Map<string, DistrictRow>();
      arr.forEach((r) => {
        const d = dmap.get(r.district) ?? { district: r.district, total_words: 0, students: 0 };
        d.total_words += r.total_words;
        d.students += 1;
        dmap.set(r.district, d);
      });
      setDistricts(Array.from(dmap.values()).sort((a, b) => b.total_words - a.total_words));
      setLoading(false);
    })();
  }, []);

  const filtered = filter === "全部" ? rows : rows.filter((r) => r.district === filter);
  const myRank = student ? rows.findIndex((r) => r.student_id === student.id) + 1 : 0;
  const myDistrictRank = student
    ? rows.filter((r) => r.district === student.district).findIndex((r) => r.student_id === student.id) + 1
    : 0;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="text-center">
        <div className="text-5xl">🏆</div>
        <h1 className="mt-3 text-3xl md:text-4xl font-extrabold text-gradient-gold">封神榜</h1>
        <p className="mt-2 text-sm text-muted-foreground">全北京中考词汇打卡 · 看见每一份努力</p>
      </div>

      {student && (
        <div className="glass-card mt-6 rounded-2xl p-5 flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="text-xs text-muted-foreground">你的位置</div>
            <div className="text-base font-bold">
              {student.name} · {student.grade} · {student.district}
            </div>
          </div>
          <div className="flex gap-4">
            <div className="text-center">
              <div className="text-xs text-muted-foreground">全市排名</div>
              <div className="text-2xl font-bold text-gradient-gold">{myRank > 0 ? `#${myRank}` : "-"}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-muted-foreground">区内排名</div>
              <div className="text-2xl font-bold text-gradient-gold">{myDistrictRank > 0 ? `#${myDistrictRank}` : "-"}</div>
            </div>
          </div>
        </div>
      )}

      {/* District board */}
      <div className="glass-card mt-6 rounded-2xl p-5">
        <h2 className="font-bold mb-3">🗺️ 各区域学习总量</h2>
        {districts.length === 0 ? (
          <div className="text-sm text-muted-foreground">还没有打卡记录，快来抢占头名！</div>
        ) : (
          <div className="grid gap-2 grid-cols-2 md:grid-cols-4">
            {districts.slice(0, 16).map((d, i) => (
              <button
                key={d.district}
                onClick={() => setFilter(d.district)}
                className={`text-left rounded-lg p-3 border transition ${
                  filter === d.district ? "border-gold bg-gold/10" : "border-border bg-card/40 hover:bg-card/70"
                }`}
              >
                <div className="text-xs text-muted-foreground">#{i + 1}</div>
                <div className="font-bold text-sm">{d.district}</div>
                <div className="text-xs mt-1">
                  <span className="text-gold font-bold">{d.total_words}</span>
                  <span className="text-muted-foreground"> 词 · {d.students} 人</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Filter chips */}
      <div className="mt-6 flex items-center gap-2 flex-wrap">
        <span className="text-sm text-muted-foreground">筛选：</span>
        {["全部", ...districts.map((d) => d.district)].slice(0, 12).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-xs rounded-full px-3 py-1 border ${
              filter === f ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Leaderboard table */}
      <div className="glass-card mt-4 rounded-2xl p-5 overflow-hidden">
        <h2 className="font-bold mb-3">⚔️ 个人封神榜 {filter !== "全部" && <span className="text-sm font-normal text-muted-foreground">· {filter}</span>}</h2>
        {loading ? (
          <div className="py-8 text-center text-sm text-muted-foreground">加载中...</div>
        ) : filtered.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            还没有打卡记录，
            <Link to="/join" className="text-gold underline ml-1">立即加入</Link>
            ，成为第一位封神者！
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted-foreground border-b border-border">
                  <th className="py-2 w-12">排名</th>
                  <th className="py-2">姓名</th>
                  <th className="py-2 hidden sm:table-cell">年级</th>
                  <th className="py-2 hidden md:table-cell">区域</th>
                  <th className="py-2 text-right">背诵词数</th>
                  <th className="py-2 text-right hidden sm:table-cell">正确率</th>
                  <th className="py-2 text-right hidden md:table-cell">打卡次数</th>
                </tr>
              </thead>
              <tbody>
                {filtered.slice(0, 100).map((r, i) => {
                  const isMe = student?.id === r.student_id;
                  const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : null;
                  return (
                    <tr key={r.student_id} className={`border-b border-border/50 ${isMe ? "bg-gold/10" : ""}`}>
                      <td className="py-3 font-bold">{medal ?? `#${i + 1}`}</td>
                      <td className="py-3 font-medium">
                        {r.name}
                        {isMe && <span className="ml-2 text-[10px] rounded bg-gold/30 text-gold px-1.5 py-0.5">我</span>}
                      </td>
                      <td className="py-3 hidden sm:table-cell text-muted-foreground">{r.grade}</td>
                      <td className="py-3 hidden md:table-cell text-muted-foreground">{r.district}</td>
                      <td className="py-3 text-right font-bold text-gradient-gold">{r.total_words}</td>
                      <td className="py-3 text-right hidden sm:table-cell">{r.accuracy}%</td>
                      <td className="py-3 text-right hidden md:table-cell text-muted-foreground">{r.sessions}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {!student && (
        <div className="mt-6 text-center">
          <Link to="/join">
            <Button size="lg" className="bg-gradient-to-r from-[oklch(0.82_0.14_85)] to-[oklch(0.72_0.16_70)] text-[oklch(0.20_0.05_290)] font-bold">
              加入打卡，登上封神榜
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
