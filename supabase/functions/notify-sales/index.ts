// Edge Function: 接收 leads 信息，使用 Resend 邮件通知顾问
// 不需要 JWT；通过 RESEND_API_KEY 发送邮件
// 必需环境变量：RESEND_API_KEY；可选：RESEND_FROM（默认 onboarding@resend.dev）

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SALES_RECIPIENTS = [
  "lijing@mifujiaoyu.com",
  "zhengjiabao@mifujiaoyu.com",
];

interface LeadPayload {
  parent_name: string;
  phone: string;
  email: string;
  subject: string;
  score_range: string;
  mbti?: string | null;
  coach_name: string;
  assigned_sales: string;
  submitted_at?: string;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!)
  );
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("RESEND_API_KEY");
    if (!apiKey) {
      console.error("RESEND_API_KEY 未配置");
      return new Response(
        JSON.stringify({ ok: false, error: "RESEND_API_KEY 未配置" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const from = Deno.env.get("RESEND_FROM") ?? "米赋报名 <onboarding@resend.dev>";

    const data = (await req.json()) as LeadPayload;

    const submittedAt = data.submitted_at ?? new Date().toISOString();
    const localTime = new Date(submittedAt).toLocaleString("zh-CN", {
      timeZone: "Asia/Shanghai",
    });

    const salesNameMap: Record<string, string> = {
      lijing: "李晶",
      zhengjiabao: "郑家宝",
    };
    const assignedName = salesNameMap[data.assigned_sales] ?? data.assigned_sales;

    const html = `
<div style="font-family:-apple-system,'PingFang SC',Arial,sans-serif;max-width:600px;padding:24px;color:#222;">
  <h2 style="color:#0a6;margin:0 0 16px;">🔔 新家长报名 · 米赋AI教育</h2>
  <table cellpadding="8" style="border-collapse:collapse;font-size:14px;width:100%;border:1px solid #eee;">
    <tr style="background:#fafafa;"><td><b>家长姓名</b></td><td>${escapeHtml(data.parent_name)}</td></tr>
    <tr><td><b>联系电话</b></td><td>${escapeHtml(data.phone)}</td></tr>
    <tr style="background:#fafafa;"><td><b>联系邮箱</b></td><td>${escapeHtml(data.email)}</td></tr>
    <tr><td><b>提升学科</b></td><td>${escapeHtml(data.subject)}</td></tr>
    <tr style="background:#fafafa;"><td><b>目前成绩</b></td><td>${escapeHtml(data.score_range)}</td></tr>
    <tr><td><b>MBTI</b></td><td>${escapeHtml(data.mbti ?? "—")}</td></tr>
    <tr style="background:#fafafa;"><td><b>选择教练</b></td><td>${escapeHtml(data.coach_name)}</td></tr>
    <tr><td><b>分配顾问</b></td><td>${escapeHtml(assignedName)}</td></tr>
    <tr style="background:#fafafa;"><td><b>提交时间</b></td><td>${escapeHtml(localTime)}</td></tr>
  </table>
  <p style="color:#666;font-size:12px;margin-top:20px;">请尽快通过电话/微信回访该家长。</p>
</div>`;

    const subject = `【米赋报名】${data.parent_name} · ${data.subject} · ${data.coach_name}`;

    const resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from,
        to: SALES_RECIPIENTS,
        subject,
        html,
      }),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      console.error("Resend 邮件发送失败:", resp.status, errText);
      return new Response(
        JSON.stringify({ ok: false, error: `Resend ${resp.status}: ${errText}` }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const result = await resp.json();
    return new Response(JSON.stringify({ ok: true, id: result.id }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("notify-sales 异常:", err);
    return new Response(
      JSON.stringify({ ok: false, error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
