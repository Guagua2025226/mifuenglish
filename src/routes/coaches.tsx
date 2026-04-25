import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { CoachSlider } from "@/components/coach-slider";

const search = z.object({
  select: z.union([z.boolean(), z.string()]).optional().transform((v) => v === true || v === "1" || v === "true"),
});

export const Route = createFileRoute("/coaches")({
  validateSearch: search,
  head: () => ({ meta: [
    { title: "教练团 — 米赋AI教育" },
    { name: "description", content: "米赋AI教育的清华博士级教练团：陈昱蓉、吕宁、张馨鹏，AI+教练双师系统。" },
  ]}),
  component: CoachesPage,
});

function CoachesPage() {
  const { select } = Route.useSearch();
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-3xl md:text-4xl font-bold text-gradient-gold">米赋Ai教育 · 教练团</h1>
      <p className="mt-2 text-muted-foreground">为不教而教 · 为自学而学 — 清华博士级教研导师</p>
      {select && (
        <div className="mt-6 glass-card rounded-2xl p-4 md:p-5 border border-gold/40 bg-gradient-to-r from-gold/10 to-primary/10">
          <div className="text-lg font-bold text-gradient-gold">第 1 步：选择您心仪的教练</div>
          <p className="mt-1 text-sm text-muted-foreground">
            点击下方任意教练卡片即可填写报名信息，我们将为您匹配专属顾问安排试听。
          </p>
        </div>
      )}
      <CoachSlider selectMode={select} />
    </div>
  );
}
