import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { normalizePhone, toSupabasePhone } from "@/lib/phone";
import { toast } from "sonner";

export const Route = createFileRoute("/coach/login")({
  component: CoachLoginPage,
});

function CoachLoginPage() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [loading, setLoading] = useState(false);
  const [sentTo, setSentTo] = useState<string>("");

  const sendCode = async () => {
    const e164 = normalizePhone(phone);
    if (!e164) {
      toast.error("请输入正确的手机号");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      phone: toSupabasePhone(e164),
    });
    setLoading(false);
    if (error) {
      toast.error("发送失败：" + error.message);
      return;
    }
    setSentTo(e164);
    setStep("code");
    toast.success("验证码已发送");
  };

  const verify = async () => {
    if (!code || code.length < 4) {
      toast.error("请输入验证码");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({
      phone: toSupabasePhone(sentTo),
      token: code,
      type: "sms",
    });
    setLoading(false);
    if (error) {
      toast.error("验证失败：" + error.message);
      return;
    }
    toast.success("登录成功");
    navigate({ to: "/coach" });
  };

  return (
    <div className="mx-auto max-w-sm px-4 py-20">
      <div className="glass-card rounded-2xl p-8">
        <h1 className="text-2xl font-bold text-gradient-gold mb-1">教练登录</h1>
        <p className="text-sm text-muted-foreground mb-6">手机号 + 短信验证码</p>

        {step === "phone" ? (
          <>
            <label className="text-sm font-medium">手机号</label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/[^\d+]/g, ""))}
              placeholder="13800138000"
              inputMode="numeric"
              maxLength={15}
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && sendCode()}
            />
            <Button
              onClick={sendCode}
              disabled={loading || !phone}
              className="w-full mt-4"
            >
              {loading ? "发送中..." : "发送验证码"}
            </Button>
          </>
        ) : (
          <>
            <p className="text-xs text-muted-foreground mb-2">已发送至 {sentTo}</p>
            <label className="text-sm font-medium">验证码</label>
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              placeholder="6 位验证码"
              inputMode="numeric"
              maxLength={6}
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && verify()}
            />
            <Button onClick={verify} disabled={loading || !code} className="w-full mt-4">
              {loading ? "验证中..." : "登录"}
            </Button>
            <Button
              variant="ghost"
              onClick={() => setStep("phone")}
              className="w-full mt-2 text-xs"
            >
              ← 换个手机号
            </Button>
          </>
        )}

        <p className="text-[11px] text-muted-foreground text-center mt-6">
          未在白名单内的手机号无法成为教练，请联系管理员。
          <br />
          <Link to="/" className="text-gold hover:underline">返回首页</Link>
        </p>
      </div>
    </div>
  );
}
