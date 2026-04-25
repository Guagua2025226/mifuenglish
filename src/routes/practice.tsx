import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import { useEffect } from "react";

export const Route = createFileRoute("/practice")({
  head: () => ({ meta: [{ title: "词汇练习 — 米赋AI教育" }] }),
  component: PracticeIndex,
});

const MODES = [
  { id: "cn2en", name: "中翻英", desc: "看中文写英文单词", icon: "✏️", ai: false },
  { id: "en2cn", name: "英翻中", desc: "看英文选中文释义", icon: "🔤", ai: false },
  { id: "match", name: "单词翻翻乐", desc: "记忆配对小游戏", icon: "🎴", ai: false },
  { id: "pos", name: "词性转换", desc: "AI 出题：apply→application", icon: "🔀", ai: true },
  { id: "root", name: "词根词缀", desc: "AI 拆解：un-/dis-/-able", icon: "🌱", ai: true },
  { id: "collocation", name: "固定搭配", desc: "AI 出题：apply for...", icon: "🔗", ai: true },
  { id: "cloze", name: "语法填空", desc: "AI 出中考真题语境短文", icon: "📝", ai: true },
];

function PracticeIndex() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  useEffect(() => { if (!loading && !user) navigate({ to: "/auth" }); }, [user, loading, navigate]);
  if (!user) return null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl md:text-3xl font-bold text-gradient-gold">词汇练习中心</h1>
      <p className="text-sm text-muted-foreground">中考前词汇冲刺 · 中考一二模提炼 · 共 7 种模式</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {MODES.map((m) => (
          <Link
            key={m.id}
            to="/practice/$mode"
            params={{ mode: m.id }}
            className="glass-card rounded-2xl p-6 transition-transform hover:scale-[1.02] hover:glow-purple block"
          >
            <div className="text-4xl mb-3">{m.icon}</div>
            <div className="text-lg font-bold text-gradient-gold">{m.name}</div>
            <div className="mt-1 text-xs text-muted-foreground">{m.desc}</div>
            {m.ai && <div className="mt-2 inline-block text-[10px] px-2 py-0.5 rounded-full bg-primary/30 text-primary-foreground">AI 智能出题</div>}
          </Link>
        ))}
      </div>
    </div>
  );
}
