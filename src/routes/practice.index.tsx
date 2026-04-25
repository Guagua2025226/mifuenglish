import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useStudent } from "@/lib/student-context";

export const Route = createFileRoute("/practice/")({
  component: PracticeIndex,
});

const MODES = [
  { id: "study", name: "学习打卡", desc: "看词→发音→评级，间隔记忆", icon: "📖", ai: false, featured: true },
  { id: "cn2en", name: "中翻英", desc: "看中文写英文单词", icon: "✏️", ai: false },
  { id: "en2cn", name: "英翻中", desc: "看英文选中文释义", icon: "🔤", ai: false },
  { id: "match", name: "单词翻翻乐", desc: "记忆配对小游戏", icon: "🎴", ai: false },
  { id: "pos", name: "词性转换", desc: "AI 出题：apply→application", icon: "🔀", ai: true },
  { id: "root", name: "词根词缀", desc: "AI 拆解：un-/dis-/-able", icon: "🌱", ai: true },
  { id: "collocation", name: "固定搭配", desc: "AI 出题：apply for...", icon: "🔗", ai: true },
  { id: "cloze", name: "语法填空", desc: "AI 出中考真题语境短文", icon: "📝", ai: true },
];

function PracticeIndex() {
  const { student, loading } = useStudent();
  const navigate = useNavigate();
  const [hydrated, setHydrated] = useState(false);
  const [navError, setNavError] = useState<string | null>(null);

  useEffect(() => { setHydrated(true); }, []);
  useEffect(() => { if (!loading && !student) navigate({ to: "/join" }); }, [student, loading, navigate]);

  useEffect(() => {
    if (hydrated) return;
    const timer = setTimeout(() => {
      if (!hydrated && typeof window !== "undefined") {
        setNavError("页面加载中断，正在重新加载…");
        setTimeout(() => window.location.reload(), 600);
      }
    }, 4000);
    return () => clearTimeout(timer);
  }, [hydrated]);

  if (!student) return null;

  const goToMode = (mode: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    setNavError(null);
    try {
      navigate({ to: "/practice/$mode", params: { mode } });
      setTimeout(() => {
        if (typeof window !== "undefined" && !window.location.pathname.endsWith(`/practice/${mode}`)) {
          window.location.assign(`/practice/${mode}`);
        }
      }, 800);
    } catch (err) {
      console.error("Navigation failed, falling back to hard nav", err);
      setNavError("跳转出错，正在以安全方式打开…");
      window.location.assign(`/practice/${mode}`);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl md:text-3xl font-bold text-gradient-gold">词汇练习中心</h1>
      <p className="text-sm text-muted-foreground">
        {student.name} · {student.grade} · {student.district} · 共 7 种模式
      </p>

      {navError && (
        <div className="mt-4 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive flex items-center justify-between gap-3">
          <span>⚠️ {navError}</span>
          <button
            onClick={() => window.location.reload()}
            className="rounded-md border border-destructive/50 px-3 py-1 text-xs font-semibold hover:bg-destructive/20"
          >
            重新加载
          </button>
        </div>
      )}

      <Link
        to="/coaches"
        search={{ select: true }}
        className="mt-4 flex items-center justify-between gap-3 glass-card rounded-xl px-4 py-3 border border-gold/40 bg-gradient-to-r from-gold/10 to-primary/10 hover:scale-[1.01] transition"
      >
        <div className="text-sm">
          <span className="text-gold font-semibold">想要 1V1 教练辅导？</span>
          <span className="text-muted-foreground ml-1">选择心仪教练，免费试听课名额限时开放</span>
        </div>
        <span className="text-sm font-bold text-gold whitespace-nowrap">立即体验 →</span>
      </Link>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {MODES.map((m) => (
          <a
            key={m.id}
            href={`/practice/${m.id}`}
            onClick={goToMode(m.id)}
            className={`glass-card rounded-2xl p-6 transition-transform hover:scale-[1.02] hover:glow-purple block cursor-pointer ${
              m.featured ? "ring-2 ring-gold sm:col-span-2 lg:col-span-3 bg-gradient-to-r from-gold/10 to-primary/10" : ""
            }`}
          >
            <div className="text-4xl mb-3">{m.icon}</div>
            <div className="text-lg font-bold text-gradient-gold">{m.name}</div>
            <div className="mt-1 text-xs text-muted-foreground">{m.desc}</div>
            {m.ai && <div className="mt-2 inline-block text-[10px] px-2 py-0.5 rounded-full bg-primary/30 text-primary-foreground">AI 智能出题</div>}
          </a>
        ))}
      </div>
    </div>
  );
}