import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({ component: AuthPage });

function AuthPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (user) navigate({ to: "/dashboard" }); }, [user, navigate]);

  const signIn = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) toast.error(error.message);
    else { toast.success("登录成功"); navigate({ to: "/dashboard" }); }
  };

  const signUp = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { emailRedirectTo: `${window.location.origin}/dashboard`, data: { nickname } },
    });
    setLoading(false);
    if (error) toast.error(error.message);
    else { toast.success("注册成功，已自动登录"); navigate({ to: "/dashboard" }); }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="glass-card rounded-2xl p-8">
        <h1 className="mb-1 text-2xl font-bold text-gradient-gold">欢迎来到米赋AI教育</h1>
        <p className="mb-6 text-sm text-muted-foreground">登录后即可开始中考词汇打卡</p>
        <Tabs defaultValue="signin">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">登录</TabsTrigger>
            <TabsTrigger value="signup">注册</TabsTrigger>
          </TabsList>
          <TabsContent value="signin" className="space-y-3 pt-4">
            <div><Label>邮箱</Label><Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" /></div>
            <div><Label>密码</Label><Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" /></div>
            <Button onClick={signIn} disabled={loading} className="w-full">{loading ? "登录中..." : "登录"}</Button>
          </TabsContent>
          <TabsContent value="signup" className="space-y-3 pt-4">
            <div><Label>昵称</Label><Input value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="同学怎么称呼你？" /></div>
            <div><Label>邮箱</Label><Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" /></div>
            <div><Label>密码（至少6位）</Label><Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" /></div>
            <Button onClick={signUp} disabled={loading} className="w-full">{loading ? "注册中..." : "立即注册"}</Button>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
