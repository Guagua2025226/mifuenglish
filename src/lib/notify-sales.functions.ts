import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const inputSchema = z.object({
  parent_name: z.string().trim().min(1).max(30),
  phone: z.string().regex(/^1[3-9]\d{9}$/),
  email: z.string().trim().email().max(100),
  subject: z.string().min(1).max(20),
  score_range: z.string().min(1).max(20),
  mbti: z.string().max(10).optional().nullable(),
  coach_name: z.string().min(1).max(50),
});

const SALES_RECIPIENTS = [
  "lijing@mifujiaoyu.com",
  "zhengjiabao@mifujiaoyu.com",
];

export const notifySalesByEmail = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => inputSchema.parse(input))
  .handler(async ({ data }) => {
    try {
      const { supabaseAdmin } = await import(
        "@/integrations/supabase/client.server"
      );

      const html = `
<div style="font-family: -apple-system, 'PingFang SC', sans-serif; max-width:560px; padding:20px; color:#222;">
  <h2 style="color:#0a6;">🔔 新家长报名 · 米赋AI教育</h2>
  <table cellpadding="6" style="border-collapse:collapse; font-size:14px;">
    <tr><td><b>家长姓名</b></td><td>${escapeHtml(data.parent_name)}</td></tr>
    <tr><td><b>联系电话</b></td><td>${escapeHtml(data.phone)}</td></tr>
    <tr><td><b>家长邮箱</b></td><td>${escapeHtml(data.email)}</td></tr>
    <tr><td><b>提升学科</b></td><td>${escapeHtml(data.subject)}</td></tr>
    <tr><td><b>目前成绩</b></td><td>${escapeHtml(data.score_range)}</td></tr>
    <tr><td><b>MBTI</b></td><td>${escapeHtml(data.mbti ?? "—")}</td></tr>
    <tr><td><b>选择教练</b></td><td>${escapeHtml(data.coach_name)}</td></tr>
  </table>
  <p style="color:#666; font-size:12px; margin-top:20px;">请尽快通过电话/微信回访该家长。</p>
</div>`;

      // 通过 Supabase pgmq 队列入队（需先在 Cloud → Emails 配置发件域名）
      const client = supabaseAdmin as any;
      for (const to of SALES_RECIPIENTS) {
        await client.rpc("enqueue_email", {
          queue_name: "transactional_emails",
          message: {
            to,
            subject: `【米赋报名】${data.parent_name} · ${data.subject} · ${data.coach_name}`,
            html,
            template_name: "sales_lead_notification",
          },
        });
      }
      return { ok: true as const };
    } catch (err) {
      console.error("notifySalesByEmail failed:", err);
      return { ok: false as const, error: "邮件发送暂未配置或失败" };
    }
  });

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!)
  );
}
