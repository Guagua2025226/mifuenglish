import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/practice")({
  head: () => ({ meta: [{ title: "词汇练习 — 米赋AI教育" }] }),
  component: PracticeLayout,
});

function PracticeLayout() {
  return <Outlet />;
}
