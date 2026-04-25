import chen from "@/assets/coach-chen.jpg";
import lv from "@/assets/coach-lv.jpg";
import zhang from "@/assets/coach-zhang.jpg";
import zeng from "@/assets/coach-zeng.jpg";
import guo from "@/assets/coach-guo.jpg";
import li from "@/assets/coach-li.jpg";
import lu from "@/assets/coach-lu.jpg";
import sun from "@/assets/coach-sun.jpg";
import wang from "@/assets/coach-wang.jpg";
import xu from "@/assets/coach-xu.jpg";
import zhao from "@/assets/coach-zhao.jpg";

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
  {
    id: "zeng",
    name: "曾远卓",
    enName: "Dr. Zeng",
    title: "北京大学 博士",
    subject: "英语 教练",
    image: zeng,
    highlights: [
      "国家级大学生创新创业训练计划优秀项目背景",
      "第 48 届日内瓦国际发明展金奖",
      "SCI 论文期刊发表者",
      "IELTS 高分教练 · AI 融合语言教学经验",
    ],
    features: [
      "学科专长：英语阅读、学术写作、中高考应试。",
      "提分逻辑：诊断 → 专项 → 真题 → 冲刺。",
      "押题优势：北大英语资源，精准把握中高考命题。",
      "AI 融合语言教学，定制化学习路径。",
    ],
  },
  {
    id: "guo",
    name: "郭志勇",
    enName: "Dr. Guo",
    title: "北京大学 博士",
    subject: "生物 · 数学 双学科教练",
    image: guo,
    highlights: [
      "7 年深耕 竞赛级数学功底",
      "双国际会议全英文报告",
      "高考押题命中率高",
      "985 理科背景 科研教学双优",
    ],
    features: [
      "数学：真题精研｜模型解题｜压轴突破。",
      "生物：考点拆解｜精准押题｜跨越式提分。",
      "全国大学生数学竞赛奖项。",
      "华中地区数学建模邀请赛奖项。",
    ],
  },
  {
    id: "li",
    name: "李嘉欣",
    enName: "Dr. Li",
    title: "北京大学 硕士",
    subject: "数学 · 物理教练",
    image: li,
    highlights: [
      "全国大学生数学建模大赛奖项",
      "科研 + 论文发表背景",
      "AI 考纲考点研究：擅长从考纲及教材中，提炼核心考点",
      "分层教学：适配基础薄弱、中等、培优不同层次学生",
    ],
    features: [
      "以数学逻辑 + 考点提炼为核心，分层设计教案。",
      "用思维导图、专题定点练习、试卷分析系统化教学。",
      "清晰拆解知识体系，适配各层次学生。",
      "擅长培优拔高与基础夯实并重。",
    ],
  },
  {
    id: "lu",
    name: "卢大伟",
    enName: "Dr. Lu",
    title: "北京大学 博士",
    subject: "数学 · 物理 · 化学教练",
    image: lu,
    highlights: [
      "高中竞赛班出身",
      "美国大学生数学建模竞赛",
      "中国化学奥林匹克竞赛",
      "本科阶段发表顶刊论文（JACS）",
    ],
    features: [
      "学科深度：贯通竞赛—科研，吃透学科本质。",
      "教学方法：善建知识体系，关联化教学。",
      "学术能力：科研训练加持，逻辑、推导、解题强。",
      "创新素养：原创科研经验，可启创新。",
    ],
  },
  {
    id: "sun",
    name: "孙博",
    enName: "Dr. Sun",
    title: "清华大学 博士",
    subject: "数学 · 物理 · 化学教练",
    image: sun,
    highlights: [
      "高考数学 148 分，理科全能型教练",
      "数学竞赛奖项",
      "AI + 学科 教学研究",
      "中高考体系，押题及命题精准研究",
    ],
    features: [
      "主打推导式授课 + 结构化笔记，溯源公式原理，理解优先、拒绝死记。",
      "AI 应用力 + 学习力合力教学。",
      "分层教学，兼顾基础夯实与专题拔高，适配各层次学生。",
      "擅长转化薄弱、厌学学生，快速培养学习信心。",
    ],
  },
  {
    id: "wang",
    name: "王禹澍",
    enName: "Dr. Wang",
    title: "英国利兹大学 硕士",
    subject: "师训培训师 · 英语教练",
    image: wang,
    highlights: [
      "8 年英语教学经验，熟悉中高考命题规律",
      "独创倒推式教学，结合真题拆解考点",
      "专项突破阅读、完形、写作，定制考前冲刺",
      "AI 赋能教学，精准规划，高效提分",
    ],
    features: [
      "紧扣考点，倒推拆解知识点，透彻讲解原理。",
      "结合 AI 高效教学，简化语法难点。",
      "塑造英语思维，提升自主学习能力。",
      "考前冲刺定制化方案，精准押题。",
    ],
  },
  {
    id: "xu",
    name: "许睿智",
    enName: "Dr. Xu",
    title: "香港大学 硕士",
    subject: "数学 · 物理教练",
    image: xu,
    highlights: [
      "6 年深耕数学 物理教学",
      "理科竞赛奖项背景",
      "科研成果及国际期刊发布",
      "高考 & 国际学科双提分教师",
    ],
    features: [
      "数学：重基础、讲通俗、建思维；练测+错题复盘，基础差稳提分。",
      "物理：补漏洞、同步学；拆题型、循序渐进提能力。",
      "专攻基础薄弱、低分逆袭。",
      "方法简单落地，提分稳定。",
    ],
  },
  {
    id: "zhao",
    name: "赵荣文",
    enName: "Dr. Zhao",
    title: "北京大学",
    subject: "政治 · 历史教练",
    image: zhao,
    highlights: [
      "拥有 7 年一线初高中教学经验，教研负责人",
      "擅长学术研究、考纲政策研究类文稿输出",
      "长期从事教研与命题研究，独立编写考点讲义、押题卷、答题套路手册",
      "AI 教研分析、大模型研究报告撰写",
    ],
    features: [
      "政治：时政 + 教材 + 模板，主观题精准踩分。",
      "语文：素材 + 模板 + 踩分，突破阅读作文。",
      "独立编写考点讲义与押题卷。",
      "教研负责人，深谙命题规律。",
    ],
  },
];
