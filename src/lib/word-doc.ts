// Generate a Word document containing one group's 20 words + practice exercises.
import {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  Table, TableRow, TableCell, WidthType, BorderStyle,
} from "docx";
import type { VocabGroup } from "./word-groups";

function p(text: string, opts: { bold?: boolean; size?: number; color?: string } = {}) {
  return new Paragraph({
    children: [new TextRun({ text, bold: opts.bold, size: opts.size, color: opts.color })],
  });
}

function vocabTable(words: { word: string; meaning: string }[]) {
  const border = { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC" };
  const borders = { top: border, bottom: border, left: border, right: border };
  const headerCell = (txt: string, w: number) => new TableCell({
    borders, width: { size: w, type: WidthType.DXA },
    children: [new Paragraph({ children: [new TextRun({ text: txt, bold: true })] })],
  });
  const cell = (txt: string, w: number) => new TableCell({
    borders, width: { size: w, type: WidthType.DXA },
    children: [new Paragraph(txt)],
  });
  return new Table({
    width: { size: 9000, type: WidthType.DXA },
    columnWidths: [800, 3500, 4700],
    rows: [
      new TableRow({ children: [headerCell("#", 800), headerCell("单词", 3500), headerCell("释义", 4700)] }),
      ...words.map((w, i) => new TableRow({
        children: [cell(String(i + 1), 800), cell(w.word, 3500), cell(w.meaning, 4700)],
      })),
    ],
  });
}

export async function buildGroupDoc(group: VocabGroup): Promise<Blob> {
  const children: (Paragraph | Table)[] = [];

  children.push(new Paragraph({
    heading: HeadingLevel.HEADING_1, alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: `米赋AI · ${group.name} 单词练习包`, bold: true })],
  }));
  children.push(p(`共 ${group.words.length} 个单词 · 8 种练习题`, { color: "888888" }));
  children.push(p(""));

  // Section 1: 单词表
  children.push(new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: "一、单词表", bold: true })] }));
  children.push(vocabTable(group.words));
  children.push(p(""));

  // Section 2: 中翻英默写
  children.push(new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: "二、中翻英（看中文写英文）", bold: true })] }));
  group.words.forEach((w, i) => {
    children.push(p(`${i + 1}. ${w.meaning}  ____________________`));
  });
  children.push(p(""));

  // Section 3: 英翻中
  children.push(new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: "三、英翻中（看英文写中文）", bold: true })] }));
  group.words.forEach((w, i) => {
    children.push(p(`${i + 1}. ${w.word}  ____________________`));
  });
  children.push(p(""));

  // Section 4: 翻翻乐配对（列出乱序）
  children.push(new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: "四、单词翻翻乐（连线配对）", bold: true })] }));
  const shuffled = [...group.words].sort(() => Math.random() - 0.5);
  group.words.forEach((w, i) => {
    const right = shuffled[i];
    children.push(p(`${String.fromCharCode(65 + i)}. ${w.word}        ${i + 1}. ${right.meaning}`));
  });
  children.push(p(""));

  // Section 5/6/7/8: AI题型 -- 提供示例题（线下做）
  children.push(new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: "五、词性转换（写出名词/形容词/副词形式）", bold: true })] }));
  group.words.forEach((w, i) => children.push(p(`${i + 1}. ${w.word} → ____________________`)));
  children.push(p(""));

  children.push(new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: "六、词根词缀（拆解前缀/词根/后缀）", bold: true })] }));
  group.words.forEach((w, i) => children.push(p(`${i + 1}. ${w.word}：前缀____  词根____  后缀____`)));
  children.push(p(""));

  children.push(new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: "七、固定搭配（写出常见搭配）", bold: true })] }));
  group.words.forEach((w, i) => children.push(p(`${i + 1}. ${w.word} + ____________________`)));
  children.push(p(""));

  children.push(new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: "八、语法填空（用所给词的适当形式）", bold: true })] }));
  group.words.forEach((w, i) => children.push(p(`${i + 1}. (${w.word})  ____________________`)));
  children.push(p(""));

  // 答案
  children.push(new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: "参考答案", bold: true })] }));
  children.push(new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: "中翻英 / 英翻中 答案", bold: true })] }));
  group.words.forEach((w, i) => {
    children.push(p(`${i + 1}. ${w.word} = ${w.meaning}`));
  });

  const doc = new Document({
    sections: [{
      properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 } } },
      children,
    }],
  });

  return await Packer.toBlob(doc);
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
