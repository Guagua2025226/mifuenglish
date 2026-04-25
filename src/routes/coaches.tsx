import { createFileRoute } from "@tanstack/react-router";
import { CoachSlider } from "@/components/coach-slider";

export const Route = createFileRoute("/coaches")({
  head: () => ({ meta: [
    { title: "教练团 — 米赋AI教育" },
    { name: "description", content: "米赋AI教育的清华博士级教练团：陈昱蓉、吕宁、张馨鹏，AI+教练双师系统。" },
  ]}),
  component: () => (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-3xl md:text-4xl font-bold text-gradient-gold">米赋Ai教育 · 教练团</h1>
      <p className="mt-2 text-muted-foreground">为不教而教 · 为自学而学 — 清华博士级教研导师</p>
      <CoachSlider />
    </div>
  ),
});
