import { useEffect, useRef, useState } from "react";
import { COACHES, type Coach } from "@/lib/coaches";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { pickRandomSales, type Sales } from "@/lib/sales";

// Build extended list with placeholder filler cards for stronger slider feel
const PLACEHOLDERS = [
  { id: "ph1", name: "更多名师", subject: "陆续上线" },
  { id: "ph2", name: "学科教练", subject: "招募中" },
  { id: "ph3", name: "AI教研团", subject: "陆续公布" },
];

export function CoachSlider() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState<Coach | null>(null);
  const [salesOpen, setSalesOpen] = useState<Sales | null>(null);
  const [paused, setPaused] = useState(false);

  // Gentle auto-scroll until a card is snapped at the right anchor
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    let raf = 0;
    let lastT = performance.now();
    const tick = (t: number) => {
      const dt = t - lastT;
      lastT = t;
      if (!paused && el.scrollWidth > el.clientWidth) {
        el.scrollLeft += dt * 0.04; // slow drift
        if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 1) {
          el.scrollLeft = 0;
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [paused]);

  return (
    <section className="py-10">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gradient-gold">教练滑动榜</h2>
            <p className="mt-1 text-sm text-muted-foreground">左右滑动浏览 · 卡片靠右停止 · 点击查看详情</p>
          </div>
        </div>

        <div className="relative">
          {/* right anchor indicator */}
          <div className="pointer-events-none absolute right-0 top-0 h-full w-2 bg-gradient-to-l from-[oklch(0.82_0.14_85/0.6)] to-transparent z-10 rounded-r-2xl" />
          <div
            ref={scrollerRef}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onTouchStart={() => setPaused(true)}
            className="scroll-snap-x flex gap-4 overflow-x-auto pb-4"
          >
            {COACHES.map((c) => (
              <button
                key={c.id}
                onClick={() => { setPaused(true); setOpen(c); }}
                className="snap-end-strict glass-card group relative shrink-0 w-[260px] md:w-[300px] overflow-hidden rounded-2xl text-left transition-transform hover:scale-[1.03] hover:glow-purple"
              >
                <img src={c.image} alt={c.name} className="h-[380px] w-full object-cover" loading="lazy" />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent p-4">
                  <div className="text-lg font-bold text-white">{c.name} <span className="text-xs text-gold">{c.enName}</span></div>
                  <div className="text-xs text-white/80">{c.title}</div>
                  <div className="text-xs text-gold">{c.subject}</div>
                </div>
              </button>
            ))}
            {PLACEHOLDERS.map((p) => (
              <div key={p.id} className="snap-end-strict glass-card shrink-0 w-[260px] md:w-[300px] h-[380px] rounded-2xl flex flex-col items-center justify-center text-center px-6">
                <div className="text-5xl mb-3 text-gold">✦</div>
                <div className="text-lg font-bold text-foreground">{p.name}</div>
                <div className="mt-1 text-xs text-muted-foreground">{p.subject}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Coach detail dialog */}
      <Dialog open={!!open} onOpenChange={(v) => { if (!v) { setOpen(null); setPaused(false); } }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {open && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl text-gradient-gold">{open.name} <span className="text-base text-gold">{open.enName}</span></DialogTitle>
                <DialogDescription className="text-foreground/80">{open.title} · {open.subject}</DialogDescription>
              </DialogHeader>
              <div className="grid md:grid-cols-2 gap-6">
                <img src={open.image} alt={open.name} className="rounded-xl w-full" />
                <div>
                  <h3 className="font-semibold mb-2 text-gold">核心亮点</h3>
                  <ul className="space-y-1.5 text-sm text-foreground/90 mb-4">
                    {open.highlights.map((h, i) => <li key={i}>◎ {h}</li>)}
                  </ul>
                  <h3 className="font-semibold mb-2 text-gold">教学特色</h3>
                  <ul className="space-y-2 text-sm text-foreground/90">
                    {open.features.map((f, i) => <li key={i}>◎ {f}</li>)}
                  </ul>
                </div>
              </div>
              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-[oklch(0.82_0.14_85)] to-[oklch(0.72_0.16_70)] text-[oklch(0.20_0.05_290)] font-bold hover:opacity-90"
                onClick={() => setSalesOpen(pickRandomSales())}
              >
                立即试听
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Sales QR dialog */}
      <Dialog open={!!salesOpen} onOpenChange={(v) => { if (!v) setSalesOpen(null); }}>
        <DialogContent className="max-w-md">
          {salesOpen && (
            <>
              <DialogHeader>
                <DialogTitle>添加专属销售顾问</DialogTitle>
                <DialogDescription>扫描下方二维码联系 {salesOpen.name} 老师，预约试听课</DialogDescription>
              </DialogHeader>
              <div className="flex flex-col items-center">
                <img src={salesOpen.image} alt={salesOpen.name} className="rounded-xl w-full max-w-xs" />
                <div className="mt-3 text-center">
                  <div className="text-lg font-bold">{salesOpen.name}</div>
                  <div className="text-xs text-muted-foreground">{salesOpen.company}</div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
