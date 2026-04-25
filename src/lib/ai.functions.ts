import { createServerFn } from "@tanstack/react-start";

interface PromptOpts { word: string; meaning: string; mode: string; }

const SYSTEM = `你是一位资深中考英语教研老师（米赋AI教育）。请严格按 JSON 格式输出，不要任何额外文字。题目必须紧贴中国中考考纲（一二模真题难度）。`;

function buildPrompt({ word, meaning, mode }: PromptOpts): string {
  switch (mode) {
    case "pos":
      return `针对单词 "${word}"（${meaning}），出一道词性转换填空题。给出一个英文句子（中考真题风格），把该词的某种变形（名词/形容词/副词/过去式等）挖空作为答案。返回 JSON：{"question":"句子，用 ___ 表示空格","hint":"括号内提示原型，如 (${word})","answer":"正确变形","explain":"为什么是这个词性，简短中文解析"}`;
    case "root":
      return `针对单词 "${word}"（${meaning}），讲解词根词缀。返回 JSON：{"question":"请拆解 ${word} 的构词","prefix":"前缀及含义（无则填 -）","root":"词根及含义","suffix":"后缀及含义（无则填 -）","family":["同根同缀的2-3个相关词"],"explain":"50字内中文助记"}`;
    case "collocation":
      return `针对单词 "${word}"（${meaning}），出一道固定搭配选择题。返回 JSON：{"question":"中文+英文混合句子，挖空考搭配","options":["A","B","C","D"],"answer":"A/B/C/D","explain":"中文解析常见搭配"}`;
    case "cloze":
      return `针对单词 "${word}"（${meaning}），编一段50词左右的中考语法填空小短文，将该词及其变形挖空（共1空），返回 JSON：{"passage":"短文，用 ___(1) 表示空","hint":"(${word})","answer":"正确形式","explain":"中文解析时态/语态/词性"}`;
    default:
      return `针对单词 "${word}"，出一道中考英语题，返回 JSON：{"question":"...","answer":"...","explain":"..."}`;
  }
}

export const generateAIQuestion = createServerFn({ method: "POST" })
  .inputValidator((data: { word: string; meaning: string; mode: string }) => data)
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) return { error: "AI 服务未配置", data: null };

    try {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: SYSTEM },
            { role: "user", content: buildPrompt(data) },
          ],
          response_format: { type: "json_object" },
        }),
      });
      if (!res.ok) {
        if (res.status === 429) return { error: "请求过于频繁，稍后再试", data: null };
        if (res.status === 402) return { error: "AI 额度不足，请联系管理员", data: null };
        return { error: `AI 服务错误 ${res.status}`, data: null };
      }
      const json = await res.json();
      const content = json.choices?.[0]?.message?.content;
      try {
        return { error: null, data: JSON.parse(content) };
      } catch {
        return { error: null, data: { raw: content } };
      }
    } catch (e) {
      return { error: e instanceof Error ? e.message : "未知错误", data: null };
    }
  });
