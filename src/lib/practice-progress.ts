// localStorage helpers for tracking which sections of a 20-word group are completed.
// A group counts as "checked-in" only when all 8 sections are done.

export const PRACTICE_MODES = [
  { id: "study", name: "学习打卡", icon: "📖" },
  { id: "cn2en", name: "中翻英", icon: "✏️" },
  { id: "en2cn", name: "英翻中", icon: "🔤" },
  { id: "match", name: "单词翻翻乐", icon: "🎴" },
  { id: "pos", name: "词性转换", icon: "🔀" },
  { id: "root", name: "词根词缀", icon: "🌱" },
  { id: "collocation", name: "固定搭配", icon: "🔗" },
  { id: "cloze", name: "语法填空", icon: "📝" },
] as const;

export type ModeId = (typeof PRACTICE_MODES)[number]["id"];

const KEY = "mifu.practice.progress.v1";

export interface GroupProgress {
  // mode id -> completed
  modes: Partial<Record<ModeId, boolean>>;
  checkedInAt?: string; // ISO when all 8 modes done
}

export type AllProgress = Record<number, GroupProgress>; // groupId -> progress

export function loadProgress(): AllProgress {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveProgress(p: AllProgress) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(p));
}

export function markModeDone(groupId: number, mode: ModeId): GroupProgress {
  const all = loadProgress();
  const g: GroupProgress = all[groupId] ?? { modes: {} };
  g.modes[mode] = true;
  // Check if all 8 done
  const allDone = PRACTICE_MODES.every((m) => g.modes[m.id]);
  if (allDone && !g.checkedInAt) g.checkedInAt = new Date().toISOString();
  all[groupId] = g;
  saveProgress(all);
  return g;
}

export function getGroupProgress(groupId: number): GroupProgress {
  return loadProgress()[groupId] ?? { modes: {} };
}

export function nextUndoneMode(groupId: number): ModeId | null {
  const g = getGroupProgress(groupId);
  for (const m of PRACTICE_MODES) if (!g.modes[m.id]) return m.id;
  return null;
}

export function todayCheckinCount(): number {
  const all = loadProgress();
  const today = new Date().toISOString().slice(0, 10);
  return Object.values(all).filter((g) => g.checkedInAt?.slice(0, 10) === today).length;
}

export function totalCheckinCount(): number {
  return Object.values(loadProgress()).filter((g) => g.checkedInAt).length;
}
