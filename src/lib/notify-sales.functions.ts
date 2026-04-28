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
  assigned_sales: z.string().min(1).max(30).optional().nullable(),
});

type LeadNotificationInput = z.infer<typeof inputSchema>;

const DEFAULT_SALES_RECIPIENTS = [
  "lijing@mifujiaoyu.com",
  "zhengjiabao@mifujiaoyu.com",
];

const DEFAULT_FROM = "米赋AI教育 <no-reply@mifujiaoyu.com>";

export const notifySalesByEmail = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => inputSchema.parse(input))
  .handler(async ({ data }) => {
    const recipients = getSalesRecipients();
    if (recipients.length === 0) {
      return { ok: false as const, error: "未配置销售通知收件人邮箱" };
    }

    const subject = `【米赋报名】${data.parent_name} · ${data.subject} · ${data.coach_name}`;
    const html = buildSalesLeadHtml(data);
    const text = buildSalesLeadText(data);

    try {
      if (process.env.RESEND_API_KEY) {
        await sendWithResend({ recipients, subject, html, text });
        return { ok: true as const, provider: "resend" as const };
      }

      const queued = await queueWithSupabase({ recipients, subject, html, text });
      if (queued) {
        return { ok: true as const, provider: "supabase" as const };
      }

      return {
        ok: false as const,
        error: "未配置 RESEND_API_KEY，且 Supabase 邮件队列不可用",
      };
    } catch (err) {
      console.error("notifySalesByEmail failed:", err);
      return { ok: false as const, error: "邮件通知发送失败" };
    }
  });

function getSalesRecipients() {
  const configured = process.env.SALES_NOTIFICATION_EMAILS?.trim();
  const recipients = configured
    ? configured.split(/[,;，；\s]+/)
    : DEFAULT_SALES_RECIPIENTS;

  return Array.from(
    new Set(recipients.map((email) => email.trim()).filter(Boolean))
  );
}

async function sendWithResend({
  recipients,
  subject,
  html,
  text,
}: {
  recipients: string[];
  subject: string;
  html: string;
  text: string;
}) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.SALES_NOTIFICATION_FROM || DEFAULT_FROM,
      to: recipients,
      subject,
      html,
      text,
      reply_to: process.env.SALES_NOTIFICATION_REPLY_TO || undefined,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Resend email failed (${response.status}): ${body.slice(0, 500)}`
    );
  }
}

async function queueWithSupabase({
  recipients,
  subject,
  html,
  text,
}: {
  recipients: string[];
  subject: string;
  html: string;
  text: string;
}) {
  try {
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );
    const client = supabaseAdmin as any;

    for (const to of recipients) {
      const { error } = await client.rpc("enqueue_email", {
        queue_name: "transactional_emails",
        message: {
          to,
          subject,
          html,
          text,
          template_name: "sales_lead_notification",
        },
      });

      if (error) throw error;
    }

    return true;
  } catch (err) {
    console.error("Supabase email queue unavailable:", err);
    return false;
  }
}

function buildSalesLeadHtml(data: LeadNotificationInput) {
  const rows = buildRows(data);
  const submittedAt = new Date().toLocaleString("zh-CN", {
    timeZone: "Asia/Shanghai",
    hour12: false,
  });

  return `
<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','PingFang SC','Microsoft YaHei',sans-serif;max-width:620px;padding:24px;color:#202124;line-height:1.6;">
  <h2 style="margin:0 0 12px;color:#7a4b00;">新家长报名 · 米赋AI教育</h2>
  <p style="margin:0 0 18px;color:#5f6368;font-size:14px;">家长刚刚提交了 1V1 试听信息，请尽快电话或企业微信回访。</p>
  <table cellpadding="8" style="width:100%;border-collapse:collapse;font-size:14px;border:1px solid #ead9aa;">
    <tbody>
      ${rows
        .map(
          ([label, value]) => `
      <tr>
        <td style="width:120px;background:#fff8e1;border-bottom:1px solid #ead9aa;font-weight:700;">${escapeHtml(label)}</td>
        <td style="border-bottom:1px solid #ead9aa;">${escapeHtml(value)}</td>
      </tr>`
        )
        .join("")}
      <tr>
        <td style="width:120px;background:#fff8e1;font-weight:700;">提交时间</td>
        <td>${escapeHtml(submittedAt)}</td>
      </tr>
    </tbody>
  </table>
  <p style="color:#5f6368;font-size:12px;margin-top:18px;">本邮件由官网报名表单自动发送。</p>
</div>`;
}

function buildSalesLeadText(data: LeadNotificationInput) {
  const submittedAt = new Date().toLocaleString("zh-CN", {
    timeZone: "Asia/Shanghai",
    hour12: false,
  });

  return [
    "新家长报名 · 米赋AI教育",
    "",
    ...buildRows(data).map(([label, value]) => `${label}: ${value}`),
    `提交时间: ${submittedAt}`,
    "",
    "请尽快电话或企业微信回访。",
  ].join("\n");
}

function buildRows(data: LeadNotificationInput): Array<[string, string]> {
  return [
    ["家长姓名", data.parent_name],
    ["联系电话", data.phone],
    ["家长邮箱", data.email],
    ["提升学科", data.subject],
    ["目前成绩", data.score_range],
    ["MBTI", data.mbti || "—"],
    ["选择教练", data.coach_name],
    ["分配顾问", data.assigned_sales || "—"],
  ];
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!)
  );
}
