import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const SALES_RECIPIENTS = [
  "lijing@mifujiaoyu.com",
  "zhengjiabao@mifujiaoyu.com",
];

const PayloadSchema = z.object({
  parent_name: z.string().min(1).max(30),
  phone: z.string().regex(/^1[3-9]\d{9}$/),
  email: z.string().email().max(100),
  subject: z.string().min(1).max(20),
  score_range: z.string().min(1).max(20),
  mbti: z.string().max(10).nullable().optional(),
  coach_name: z.string().min(1).max(50),
  assigned_sales: z.enum(["lijing", "zhengjiabao"]),
  submitted_at: z.string().optional(),
});

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!)
  );
}

export const Route = createFileRoute("/api/public/notify-sales")({
  server: {
    handlers: {
      OPTIONS: async () =>
        new Response(null, {
          status: 204,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
          },
        }),
      POST: async ({ request }) => {
        const cors = {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        };

        const apiKey = process.env.RESEND_API_KEY;
        if (!apiKey) {
          console.error("RESEND_API_KEY 未配置");
          return new Response(
            JSON.stringify({ ok: false, error: "RESEND_API_KEY 未配置" }),
            { status: 500, headers: cors }
          );
        }
        const from =
          process.env.RESEND_FROM ?? "米赋报名 <onboarding@resend.dev>";

        let parsed;
        try {
          parsed = PayloadSchema.parse(await request.json());
        } catch (e) {
          console.error("payload 校验失败:", e);
          return new Response(
            JSON.stringify({ ok: false, error: "payload invalid" }),
            { status: 400, headers: cors }
          );
        }

        const submittedAt = parsed.submitted_at ?? new Date().toISOString();
        const localTime = new Date(submittedAt).toLocaleString("zh-CN", {
          timeZone: "Asia/Shanghai",
        });
        const salesNameMap: Record<string, string> = {
          lijing: "李晶",
          zhengjiabao: "郑家宝",
        };
        const assignedName = salesNameMap[parsed.assigned_sales];

        const html = `
<div style="font-family:-apple-system,'PingFang SC',Arial,sans-serif;max-width:600px;padding:24px;color:#222;">
  <h2 style="color:#0a6;margin:0 0 16px;">🔔 新家长报名 · 米赋AI教育</h2>
  <table cellpadding="8" style="border-collapse:collapse;font-size:14px;width:100%;border:1px solid #eee;">
    <tr style="background:#fafafa;"><td><b>家长姓名</b></td><td>${escapeHtml(parsed.parent_name)}</td></tr>
    <tr><td><b>联系电话</b></td><td>${escapeHtml(parsed.phone)}</td></tr>
    <tr style="background:#fafafa;"><td><b>联系邮箱</b></td><td>${escapeHtml(parsed.email)}</td></tr>
    <tr><td><b>提升学科</b></td><td>${escapeHtml(parsed.subject)}</td></tr>
    <tr style="background:#fafafa;"><td><b>目前成绩</b></td><td>${escapeHtml(parsed.score_range)}</td></tr>
    <tr><td><b>MBTI</b></td><td>${escapeHtml(parsed.mbti ?? "—")}</td></tr>
    <tr style="background:#fafafa;"><td><b>选择教练</b></td><td>${escapeHtml(parsed.coach_name)}</td></tr>
    <tr><td><b>分配顾问</b></td><td>${escapeHtml(assignedName)}</td></tr>
    <tr style="background:#fafafa;"><td><b>提交时间</b></td><td>${escapeHtml(localTime)}</td></tr>
  </table>
  <p style="color:#666;font-size:12px;margin-top:20px;">请尽快通过电话/微信回访该家长。</p>
</div>`;

        const subject = `【米赋报名】${parsed.parent_name} · ${parsed.subject} · ${parsed.coach_name}`;

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
            JSON.stringify({ ok: false, error: `Resend ${resp.status}` }),
            { status: 502, headers: cors }
          );
        }

        const result = await resp.json();
        return new Response(JSON.stringify({ ok: true, id: result.id }), {
          status: 200,
          headers: cors,
        });
      },
    },
  },
});
