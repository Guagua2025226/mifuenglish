import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useStudent } from "@/lib/student-context";
import { VOCAB_GROUPS, TOTAL_GROUPS } from "@/lib/word-groups";
import { PRACTICE_MODES, loadProgress, type AllProgress, todayCheckinCount, totalCheckinCount } from "@/lib/practice-progress";
import { Button } from "@/components/ui/button";
import { buildGroupDoc, downloadBlob } from "@/lib/word-doc";
import { toast } from "sonner";

export const Route = createFileRoute("/practice/")({
  component: PracticeIndex,
});

function PracticeIndex() {
  const { student, loading } = useStudent();
  const navigate = useNavigate();
  const [progress, setProgress] = useState<AllProgress>({});
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  useEffect(() => { setProgress(loadProgress()); }, []);
  useEffect(() => { if (!loading && !student) navigate({ to: "/join" }); }, [student, loading, navigate]);

  const todayCount = useMemo(() => todayCheckinCount(), [progress]);
  const totalCount = useMemo(() => totalCheckinCount(), [progress]);

  const handleDownload = async (groupId: number) => {
    const grp = VOCAB_GROUPS.find((g) => g.id === groupId);
    if (!grp) return;
    setDownloadingId(groupId);
    try {
      const blob = await buildGroupDoc(grp);
      downloadBlob(blob, `米赋AI-${grp.name}-练习包.doc`);
      toast.success("下载完成！");
    } catch (e: any) {
      toast.error("生成失败：" + (e?.message ?? "未知错误"));
    } finally {
      setDownloadingId(null);
    }
  };

  if (!student) return null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl md:text-3xl font-bold text-gradient-gold">词汇练习中心</h1>
      <p className="text-sm text-muted-foreground">
        {student.name} · {student.grade} · 共 {TOTAL_GROUPS} 组 · 每组 20 词
      </p>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="glass-card rounded-xl px-4 py-3">
          <div className="text-xs text-muted-foreground">今日打卡</div>
          <div className="text-2xl font-bold text-gold">{todayCount} 组</div>
        </div>
        <div className="glass-card rounded-xl px-4 py-3">
          <div className="text-xs text-muted-foreground">累计打卡</div>
          <div className="text-2xl font-bold text-gradient-gold">{totalCount} 组</div>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-border/60 bg-card/40 px-4 py-3 text-xs text-muted-foreground">
        💡 每组需依次完成 <b className="text-foreground">{PRACTICE_MODES.length} 个环节</b>（{PRACTICE_MODES.map(m => m.name).join(" · ")}），全部完成才算 1 次打卡。可一天连续打多组！
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {VOCAB_GROUPS.map((g) => {
          const gp = progress[g.id] ?? { modes: {} };
          const doneCount = PRACTICE_MODES.filter((m) => gp.modes[m.id]).length;
          const checkedIn = !!gp.checkedInAt;
          return (
            <div
              key={g.id}
              className={`glass-card rounded-2xl p-5 flex flex-col gap-3 transition ${
                checkedIn ? "ring-2 ring-success/60 bg-success/5" : "hover:scale-[1.02]"
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-lg font-bold text-gradient-gold">{g.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {g.words.slice(0, 3).map(w => w.word).join(" / ")} ...
                  </div>
                </div>
                {checkedIn && <div className="text-2xl">✅</div>}
              </div>

              <div className="flex flex-wrap gap-1">
                {PRACTICE_MODES.map((m) => (
                  <span
                    key={m.id}
                    className={`text-[10px] px-2 py-0.5 rounded-full border ${
                      gp.modes[m.id]
                        ? "bg-success/20 border-success/40 text-success"
                        : "bg-card/40 border-border/60 text-muted-foreground"
                    }`}
                    title={m.name}
                  >
                    {m.icon} {m.name}
                  </span>
                ))}
              </div>

              <div className="text-xs text-muted-foreground">
                进度 {doneCount} / {PRACTICE_MODES.length}
              </div>

              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  onClick={() => navigate({ to: "/practice/$groupId/$mode", params: { groupId: String(g.id), mode: PRACTICE_MODES.find(m => !gp.modes[m.id])?.id ?? "study" } })}
                >
                  {checkedIn ? "重新练习" : doneCount > 0 ? "继续打卡" : "开始打卡"}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleDownload(g.id)}
                  disabled={downloadingId === g.id}
                  title="下载Word练习包"
                >
                  {downloadingId === g.id ? "..." : "📄"}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
