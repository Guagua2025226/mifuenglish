// 判断一个单词/词组是否适合某个练习模式。
// 词性转换 (pos)、词根词缀 (root) 对短词、闭类词、词组没意义；
// 用户反馈：tell 没有词性转换（应放在固定搭配里），calm 这类短词不需要拆词根。

import type { ModeId } from "./practice-progress";

// 没有有意义词形变化的常见词（人工维护）
const POS_BLACKLIST = new Set<string>([
  "tell", "drop", "mood", "chain", "coach", "ruin", "doubt", "stare",
  "whisper", "calm", "author", "crisis", "charity", "disease", "survey",
  "experiment", "attempt", "director", "astronaut", "adulthood", "facial",
  "ashamed", "puzzled", "hopeful", "various", "practical", "significant",
  "sensitive", "inefficient",
]);

// 词根词缀拆分意义不大的词（短词/原生英语词/已经是词根）
const ROOT_BLACKLIST = new Set<string>([
  "calm", "tell", "drop", "mood", "chain", "coach", "ruin", "doubt",
  "stare", "whisper", "land", "turn", "take", "author", "crisis", "mood",
  "survey", "drop", "puzzled", "ashamed",
]);

export function isModeApplicable(word: string, mode: ModeId): boolean {
  const w = word.toLowerCase().trim();
  const isPhrase = /\s/.test(w);

  if (mode === "pos") {
    if (isPhrase) return false;
    if (w.length <= 4) return false;
    if (POS_BLACKLIST.has(w)) return false;
    return true;
  }
  if (mode === "root") {
    if (isPhrase) return false;
    if (w.length <= 5) return false;
    if (ROOT_BLACKLIST.has(w)) return false;
    return true;
  }
  if (mode === "cloze") {
    // 太长的词组不适合做语法填空
    if (isPhrase && w.split(/\s+/).length > 3) return false;
    return true;
  }
  // collocation、study、cn2en、en2cn、match 全部适用
  return true;
}

export function filterApplicable<T extends { word: string }>(words: T[], mode: ModeId): T[] {
  return words.filter((w) => isModeApplicable(w.word, mode));
}
