import { Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo-phoenix.png";

export function SiteHeader() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/40 border-b border-border">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="米赋AI教育" width={36} height={36} className="drop-shadow-[0_0_10px_oklch(0.85_0.14_85/0.6)]" />
          <div className="leading-tight">
            <div className="text-base font-bold text-gradient-gold">米赋AI教育</div>
            <div className="text-[10px] text-muted-foreground">为不教而教 · 为自学而学</div>
          </div>
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          <Link to="/" className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground" activeOptions={{ exact: true }} activeProps={{ className: "px-3 py-1.5 text-sm text-foreground font-medium" }}>首页</Link>
          <Link to="/practice" className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground" activeProps={{ className: "px-3 py-1.5 text-sm text-foreground font-medium" }}>词汇练习</Link>
          <Link to="/dashboard" className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground" activeProps={{ className: "px-3 py-1.5 text-sm text-foreground font-medium" }}>我的打卡</Link>
          <Link to="/coaches" className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground" activeProps={{ className: "px-3 py-1.5 text-sm text-foreground font-medium" }}>教练团</Link>
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            <Button variant="outline" size="sm" onClick={async () => { await signOut(); navigate({ to: "/" }); }}>退出</Button>
          ) : (
            <Button size="sm" onClick={() => navigate({ to: "/auth" })} className="bg-gradient-to-r from-primary to-[oklch(0.72_0.20_300)] hover:opacity-90">登录 / 注册</Button>
          )}
        </div>
      </div>
    </header>
  );
}
