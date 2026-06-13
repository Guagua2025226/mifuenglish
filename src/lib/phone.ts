// 把任意输入归一为 E.164 形式（中国大陆默认 +86）
export function normalizePhone(input: string): string | null {
  const digits = input.replace(/\D/g, "");
  if (!digits) return null;
  // 已含国家码
  if (input.trim().startsWith("+")) return `+${digits}`;
  // 11 位国内手机号
  if (/^1[3-9]\d{9}$/.test(digits)) return `+86${digits}`;
  // 已含 86 前缀
  if (/^861[3-9]\d{9}$/.test(digits)) return `+${digits}`;
  return null;
}

// 用作 supabase.auth signInWithOtp 的 phone 参数（不带 +）
export function toSupabasePhone(e164: string): string {
  return e164.replace(/^\+/, "");
}
