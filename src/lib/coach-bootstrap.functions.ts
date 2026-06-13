import { createServerFn } from "@tanstack/react-start";

// 教练登录后调用：根据 accessToken 取到用户，校验白名单，绑定/创建 coaches 行
export const bootstrapCoach = createServerFn({ method: "POST" })
  .inputValidator((data: { accessToken: string }) => data)
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(
      data.accessToken
    );
    if (userErr || !userData.user) {
      return { ok: false as const, error: "未登录或会话已过期" };
    }
    const user = userData.user;
    // supabase 存的 phone 是无 + 的纯数字
    const rawPhone = user.phone ?? "";
    if (!rawPhone) return { ok: false as const, error: "用户缺少手机号" };
    const e164 = `+${rawPhone}`;

    // 白名单校验
    const { data: wl } = await supabaseAdmin
      .from("coach_whitelist")
      .select("*")
      .eq("phone", e164)
      .maybeSingle();
    if (!wl) {
      return {
        ok: false as const,
        error: "您的手机号未在教练白名单中，请联系管理员添加后再试",
      };
    }

    // 已绑定 user_id 的行
    const { data: byUser } = await supabaseAdmin
      .from("coaches")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();
    if (byUser) return { ok: true as const, coach: byUser };

    // 同手机号的现有行（之前管理员预设过 phone）
    const { data: byPhone } = await supabaseAdmin
      .from("coaches")
      .select("*")
      .eq("phone", e164)
      .maybeSingle();
    if (byPhone) {
      const { data: updated, error: upErr } = await supabaseAdmin
        .from("coaches")
        .update({ user_id: user.id })
        .eq("id", byPhone.id)
        .select()
        .single();
      if (upErr) return { ok: false as const, error: upErr.message };
      return { ok: true as const, coach: updated };
    }

    // 新建一行（状态 pending，等待审核）
    const newId = `c_${Date.now().toString(36)}`;
    const { data: created, error: insErr } = await supabaseAdmin
      .from("coaches")
      .insert({
        id: newId,
        user_id: user.id,
        phone: e164,
        name: wl.suggested_name ?? "待完善",
        subject: wl.suggested_subject,
        status: "pending",
      })
      .select()
      .single();
    if (insErr) return { ok: false as const, error: insErr.message };
    return { ok: true as const, coach: created };
  });
