import { createFileRoute, Link } from "@tanstack/react-router";
import { CoachSlider } from "@/components/coach-slider";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo-phoenix.png";

export const Route = createFileRoute("/")({
  component: Index,
});

const FEATURES = [
  { icon: "✏️", title: "中翻英", desc: "看中文写英文" },
  { icon: "🔤", title: "英翻中", desc: "看英文选释义" },
  { icon: "🔀", title: "词性转换", desc: "AI 智能出题" },
  { icon: "🌱", title: "词根词缀", desc: "AI 拆解构词" },
  { icon: "🔗", title: "固定搭配", desc: "高频考点搭配" },
  { icon: "📝", title: "语法填空", desc: "中考真题语境" },
  { icon: "🎴", title: "翻翻乐", desc: "记忆配对游戏" },
];

function Index() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,oklch(0.55_0.22_295/0.5),transparent_70%)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 md:py-24 text-center">
          <img src={logo} alt="米赋AI教育" width={88} height={88} className="mx-auto drop-shadow-[0_0_30px_oklch(0.85_0.14_85/0.7)]" />
          <h1 className="mt-6 text-4xl md:text-6xl font-extrabold tracking-tight text-gradient-gold">
            米赋AI教育
          </h1>
          <p className="mt-4 text-lg md:text-2xl font-medium text-gradient-purple">
            AI + 教练 · 双师系统创导者
          </p>
          <p className="mt-6 text-base md:text-lg text-foreground/80">
            中考前词汇冲刺 · <span className="text-gold">中考一二模提炼</span>
          </p>
          <p className="mt-2 text-sm text-muted-foreground">为不教而教 · 为自学而学</p>
          <div className="mt-8 flex justify-center gap-3 flex-wrap">
            <Link to="/practice"><Button size="lg" className="bg-gradient-to-r from-[oklch(0.82_0.14_85)] to-[oklch(0.72_0.16_70)] text-[oklch(0.20_0.05_290)] font-bold hover:opacity-90">开始今日打卡</Button></Link>
            <Link to="/dashboard"><Button size="lg" variant="outline">查看我的进度</Button></Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 py-12">
        <h2 className="text-2xl md:text-3xl font-bold text-gradient-gold text-center">7 种练习模式 · 全面覆盖中考考纲</h2>
        <p className="mt-2 text-center text-sm text-muted-foreground">基于中考一二模高频词汇 · AI 实时出题 · 错题智能复现</p>
        <div className="mt-8 grid gap-4 grid-cols-2 md:grid-cols-4 lg:grid-cols-7">
          {FEATURES.map((f) => (
            <Link key={f.title} to="/practice" className="glass-card rounded-2xl p-4 text-center hover:scale-105 transition">
              <div className="text-3xl">{f.icon}</div>
              <div className="mt-2 text-sm font-bold">{f.title}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">{f.desc}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Resources */}
      <section className="mx-auto max-w-7xl px-4 py-6">
        <div className="glass-card rounded-2xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-gradient-gold">2026 中考英语高频词汇默写表</h3>
            <p className="text-sm text-muted-foreground mt-1">中考阅读 + 完形高频词汇背诵版 · 免费下载</p>
          </div>
          <a href="/vocab-handout.pdf" target="_blank" rel="noreferrer">
            <Button size="lg" variant="outline">立即下载 PDF</Button>
          </a>
        </div>
      </section>

      {/* Coach slider */}
      <CoachSlider />
    </>
  );
}
