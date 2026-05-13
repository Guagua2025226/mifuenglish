import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const ADMIN_PASSWORD = "1234";

export const fetchLeads = createServerFn({ method: "POST" })
  .inputValidator((data: { password: string }) => data)
  .handler(async ({ data }) => {
    if (data.password !== ADMIN_PASSWORD) {
      return { ok: false as const, error: "密码错误" };
    }
    const { data: rows, error } = await supabaseAdmin
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) {
      return { ok: false as const, error: error.message };
    }
    return { ok: true as const, leads: rows ?? [] };
  });
