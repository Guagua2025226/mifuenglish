import { Outlet, createRootRouteWithContext, HeadContent, Scripts } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import appCss from "../styles.css?url";
import { StudentProvider } from "@/lib/student-context";
import { SiteHeader } from "@/components/site-header";
import { Toaster } from "@/components/ui/sonner";

interface RouterContext { queryClient: QueryClient }

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "米赋AI教育 — AI+教练 双师系统创导者" },
      { name: "description", content: "米赋AI教育 · 中考前词汇冲刺打卡，结合AI出题与名师教练，覆盖中翻英、英翻中、词性转换、词根词缀、固定搭配、语法填空与单词翻翻乐。" },
      { property: "og:title", content: "米赋AI教育 — AI+教练 双师系统创导者" },
      { name: "twitter:title", content: "米赋AI教育 — AI+教练 双师系统创导者" },
      { property: "og:description", content: "米赋AI教育 · 中考前词汇冲刺打卡，结合AI出题与名师教练，覆盖中翻英、英翻中、词性转换、词根词缀、固定搭配、语法填空与单词翻翻乐。" },
      { name: "twitter:description", content: "米赋AI教育 · 中考前词汇冲刺打卡，结合AI出题与名师教练，覆盖中翻英、英翻中、词性转换、词根词缀、固定搭配、语法填空与单词翻翻乐。" },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/ab27f5de-b395-4d80-9de6-25bda5b11f03/id-preview-3285e5f1--640b9dbe-9a52-4a54-bfb9-0e8c8870627d.lovable.app-1777125852789.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/ab27f5de-b395-4d80-9de6-25bda5b11f03/id-preview-3285e5f1--640b9dbe-9a52-4a54-bfb9-0e8c8870627d.lovable.app-1777125852789.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: () => (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="glass-card rounded-2xl p-10 text-center">
        <h1 className="text-6xl font-bold text-gradient-gold">404</h1>
        <p className="mt-3 text-muted-foreground">页面未找到</p>
        <a href="/" className="mt-6 inline-block rounded-md bg-primary px-4 py-2 text-sm">返回首页</a>
      </div>
    </div>
  ),
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <head><HeadContent /></head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <StudentProvider>
        <div className="min-h-screen flex flex-col">
          <SiteHeader />
          <main className="flex-1"><Outlet /></main>
          <footer className="mt-16 border-t border-border py-6 text-center text-xs text-muted-foreground">
            © 北京米赋教育科技有限公司 · 米赋AI教育 · AI+教练 双师系统创导者
          </footer>
        </div>
        <Toaster />
      </StudentProvider>
    </QueryClientProvider>
  );
}
