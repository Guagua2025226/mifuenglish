import { createServerFn } from "@tanstack/react-start";
import { normalizePhone } from "./phone";

const ADMIN_PASSWORD = "1234";

function checkPwd(p: string) {
  return p === ADMIN_PASSWORD;
}

export const listWhitelist = createServerFn({ method: "POST" })
  .inputValidator((d: { password: string }) => d)
  .handler(async ({ data }) => {
    if (!checkPwd(data.password)) return { ok: false as const, error: "密码错误" };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin
      .from("coach_whitelist")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) return { ok: false as const, error: error.message };
    return { ok: true as const, rows: rows ?? [] };
  });

export const addWhitelist = createServerFn({ method: "POST" })
  .inputValidator(
    (d: { password: string; phone: string; name?: string; subject?: string; note?: string }) => d
  )
  .handler(async ({ data }) => {
    if (!checkPwd(data.password)) return { ok: false as const, error: "密码错误" };
    const e164 = normalizePhone(data.phone);
    if (!e164) return { ok: false as const, error: "手机号格式错误" };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("coach_whitelist").upsert(
      {
        phone: e164,
        suggested_name: data.name?.trim() || null,
        suggested_subject: data.subject?.trim() || null,
        note: data.note?.trim() || null,
      },
      { onConflict: "phone" }
    );
    if (error) return { ok: false as const, error: error.message };
    return { ok: true as const, phone: e164 };
  });

export const removeWhitelist = createServerFn({ method: "POST" })
  .inputValidator((d: { password: string; phone: string }) => d)
  .handler(async ({ data }) => {
    if (!checkPwd(data.password)) return { ok: false as const, error: "密码错误" };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("coach_whitelist")
      .delete()
      .eq("phone", data.phone);
    if (error) return { ok: false as const, error: error.message };
    return { ok: true as const };
  });

export const listAllCoaches = createServerFn({ method: "POST" })
  .inputValidator((d: { password: string }) => d)
  .handler(async ({ data }) => {
    if (!checkPwd(data.password)) return { ok: false as const, error: "密码错误" };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin
      .from("coaches")
      .select("*")
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false });
    if (error) return { ok: false as const, error: error.message };
    return { ok: true as const, rows: rows ?? [] };
  });

export const setCoachStatus = createServerFn({ method: "POST" })
  .inputValidator(
    (d: { password: string; id: string; status: "pending" | "approved" | "rejected" | "disabled" }) => d
  )
  .handler(async ({ data }) => {
    if (!checkPwd(data.password)) return { ok: false as const, error: "密码错误" };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("coaches")
      .update({ status: data.status })
      .eq("id", data.id);
    if (error) return { ok: false as const, error: error.message };
    return { ok: true as const };
  });
