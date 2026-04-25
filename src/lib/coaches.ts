import chen from "@/assets/coach-chen.jpg";
import lv from "@/assets/coach-lv.jpg";
import zhang from "@/assets/coach-zhang.jpg";

export interface Coach {
  id: string;
  name: string;
  enName: string;
  title: string;
  subject: string;
  image: string;
  highlights: string[];
  features: string[];
}

export const COACHES: Coach[] = [
  {
    id: "chen",
    name: "陈昱蓉",
    enName: "Dr. Chen",
    title: "清华大学 博士后",
    subject: "数学 & 物理资深竞赛 / 高考教练",
    image: chen,
    highlights: [
      "跨学科基础学习力体系",
      "ICF 专业教练认证 + 发展心理学背景",
      "AI 智能赋能 + 高考精准提分双轮驱动",
      "科研原生 · AI 原生复合型教研导师",
    ],
    features: [
      "深厚理科功底：工科+理学跨学科复合背景，数理逻辑严谨缜密。",
      "顶尖教研实力：清华大学博士后科研经历，精通考点建模、命题规律提炼。",
      "科学育人理念：融合 ICF 专业教练机制与发展心理学。",
      "AI 高效智能教学：将 AI 全流程深度融入备课、授课、刷题、错题复盘。",
    ],
  },
  {
    id: "lv",
    name: "吕宁",
    enName: "Dr. Lv",
    title: "清华大学 博士",
    subject: "英语 · 语言类 教练",
    image: lv,
    highlights: [
      "教育 & 语言类论文发表",
      "交叉能力：教育政策、学习科学",
      "效率提升、跨文化教学、AI 教育应用",
      "雅思高分 + 小语种双力教练",
    ],
    features: [
      "3 份咨政报告获教育部采纳，具备教育规律提炼、考点梳理能力。",
      "深耕学习科学、高效学习策略、教育数字化方向。",
      "学科提分能力：依托清华教育学功底，精通学习路径规划。",
      "学科维度：以教育学+双语能力为核心，覆盖语言类、文科类教学。",
    ],
  },
  {
    id: "zhang",
    name: "张馨鹏",
    enName: "Dr. Zhang",
    title: "清华大学 博士",
    subject: "数学 教练",
    image: zhang,
    highlights: [
      "全国大学生数学竞赛",
      "竞赛背景 化学奖项",
      "清华大学数学基础学科背景",
      "学魁网 主讲老师",
    ],
    features: [
      "理科中高考研究与提分 / 押题能力。",
      "以考点为核心，用母题构建解题框架，用技巧提升做题效率。",
      "AI 知识体系：构建结构化、可检索、可迭代的考点图谱。",
      "强化学习力：训练逻辑推理、自主总结、举一反三能力。",
    ],
  },
];
