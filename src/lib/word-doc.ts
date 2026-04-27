// Generate a Word-compatible HTML file (.doc) for one vocab group.
// Uses pure browser Blob — no Node-only deps, works in all browsers.
import type { VocabGroup } from "./word-groups";

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]!));
}

export async function buildGroupDoc(group: VocabGroup): Promise<Blob> {
  const w = group.words;
  const shuffled = [...w].sort(() => Math.random() - 0.5);

  const rows = w.map((it, i) =>
    `<tr><td>${i + 1}</td><td><b>${escapeHtml(it.word)}</b></td><td>${escapeHtml(it.meaning)}</td></tr>`
  ).join("");

  const list = (title: string, render: (it: { word: string; meaning: string }, i: number) => string) =>
    `<h2>${title}</h2><ol>${w.map((it, i) => `<li>${render(it, i)}</li>`).join("")}</ol>`;

  const html = `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:w="urn:schemas-microsoft-com:office:word"
      xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8"><title>${escapeHtml(group.name)}</title>
<style>
body{font-family:"微软雅黑","Microsoft YaHei",Arial,sans-serif;font-size:12pt;color:#222;}
h1{text-align:center;color:#b8860b;}
h2{color:#8b6914;border-bottom:1px solid #ddd;padding-bottom:4px;margin-top:24px;}
table{border-collapse:collapse;width:100%;}
td,th{border:1px solid #bbb;padding:6px 10px;}
th{background:#f5e6c8;}
ol{line-height:2;}
.muted{color:#888;font-size:10pt;}
</style></head>
<body>
<h1>米赋AI · ${escapeHtml(group.name)} 单词练习包</h1>
<p class="muted" style="text-align:center;">共 ${w.length} 个单词 · 8 种练习题</p>

<h2>一、单词表</h2>
<table><tr><th>#</th><th>单词</th><th>释义</th></tr>${rows}</table>

${list("二、中翻英（看中文写英文）", (it) => `${escapeHtml(it.meaning)}　____________________`)}
${list("三、英翻中（看英文写中文）", (it) => `<b>${escapeHtml(it.word)}</b>　____________________`)}

<h2>四、单词翻翻乐（连线配对）</h2>
<table><tr><th>左</th><th>右</th></tr>
${w.map((it, i) => `<tr><td>${String.fromCharCode(65 + i)}. <b>${escapeHtml(it.word)}</b></td><td>${i + 1}. ${escapeHtml(shuffled[i].meaning)}</td></tr>`).join("")}
</table>

${list("五、词性转换（写出名词/形容词/副词形式）", (it) => `<b>${escapeHtml(it.word)}</b> → ____________________`)}
${list("六、词根词缀（拆解前缀/词根/后缀）", (it) => `<b>${escapeHtml(it.word)}</b>：前缀____ 词根____ 后缀____`)}
${list("七、固定搭配（写出常见搭配）", (it) => `<b>${escapeHtml(it.word)}</b> + ____________________`)}
${list("八、语法填空（用所给词的适当形式）", (it) => `(<b>${escapeHtml(it.word)}</b>)　____________________`)}

<h1>参考答案</h1>
<h2>中翻英 / 英翻中 答案</h2>
<ol>${w.map((it) => `<li><b>${escapeHtml(it.word)}</b> = ${escapeHtml(it.meaning)}</li>`).join("")}</ol>
</body></html>`;

  return new Blob(["\ufeff", html], { type: "application/msword" });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
