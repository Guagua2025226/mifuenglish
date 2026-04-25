import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const SALES_PASSWORD = "mifu2026";
const VALID_SALES = ["lijing", "zhengjiabao"] as const;

const inputSchema = z.object({
  sales_id: z.enum(VALID_SALES),
  password: z.string().min(1).max(100),
});

export const fetchSalesLeads = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => inputSchema.parse(input))
  .handler(async ({ data }) => {
    if (data.password !== SALES_PASSWORD) {
      return { ok: false as const, error: "密码错误" };
    }
    const { data: leads, error } = await supabaseAdmin
      .from("leads")
      .select("id, parent_name, phone, subject, score_range, mbti, coach_name, assigned_sales, created_at")
      .eq("assigned_sales", data.sales_id)
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) {
      return { ok: false as const, error: "查询失败，请重试" };
    }
    return { ok: true as const, leads: leads ?? [] };
  });
