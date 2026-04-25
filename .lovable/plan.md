# 米赋AI教育 · 中考词汇冲刺打卡网站

## 一、整体定位
- **大标题**：米赋AI教育
- **副标题**：AI+教练 双师系统创导者
- **核心模块**：中考前词汇冲刺（中考一二模提炼）单词打卡 + 教练滑动榜
- **品牌色**：紫色调（取自上传海报：深紫渐变 + 金色点缀）+ 凤凰LOGO

## 二、页面结构

```text
/                          首页（Hero + 功能入口 + 教练滑动榜）
/auth                      登录 / 注册
/dashboard                 我的打卡（连续天数、今日进度、词汇掌握度）
/practice                  练习中心（7种练习模式入口）
/practice/$mode/$session   单题练习页
/coaches                   教练完整列表
```

## 三、功能模块

### 1. 账号系统（Lovable Cloud）
- 邮箱+密码注册登录、Google 登录
- 用户表 `profiles` 存昵称；`user_progress` 存每个词的掌握度；`daily_checkin` 存每日打卡

### 2. 单词打卡 Dashboard
- 顶部：连续打卡天数 🔥、今日已学/目标、累计掌握词数
- 学习进度环形图 + 7天热力图
- "今日打卡"按钮：完成今日学习任务后亮章

### 3. 七种练习模式（基于上传 Excel ~200词）
| 模式 | 说明 | 出题方式 |
|---|---|---|
| 中翻英 | 给中文写英文 | 词库 |
| 英翻中 | 给英文选中文 | 词库 |
| 词性转换 | apply→application 等 | AI 实时生成 |
| 词根词缀 | un-/dis-/-able 拆解讲解 | AI 实时生成 |
| 固定搭配 | apply for / be absent from | AI 实时生成 |
| 语法填空 | 给中考真题语境短文挖空 | AI 实时生成 |
| 单词翻翻乐 | 记忆配对小游戏（中英卡片翻转配对） | 词库 |

- 所有 AI 题型通过 TanStack 服务端函数调用 Lovable AI Gateway（`google/gemini-3-flash-preview`），后端注入 system prompt + 中考考纲约束
- 每题答对/答错写入 `user_progress`，更新该词掌握度（艾宾浩斯式：错过的词更高频复现）

### 4. 教练滑动榜（首页 + /coaches）
- 横向滑动 carousel，展示 3 位真实教练（陈昱蓉 / 吕宁 / 张馨鹏）+ 占位卡片，营造连续滑动感
- 交互逻辑：
  - **左右滑动**：默认自动缓慢滚动
  - **教练卡片靠到右侧定位区时自动停止**（吸附 snap）
  - **点击卡片**：放大弹窗显示完整海报 + 教学特色详情
  - 弹窗底部按钮：**「立即试听」**
  - 点击立即试听 → 弹出销售顾问二维码：李晶 50% / 郑家宝 50% 随机展示，含姓名、公司、二维码图

### 5. 资源下载
- 提供上传的"2026年中考英语阅读完形高频词汇默写表"PDF 下载链接

## 四、设计风格
- 深紫渐变背景 + 金色高亮（呼应海报）
- 凤凰LOGO + "为不教而教 为自学而学" slogan
- 卡片：玻璃拟态（毛玻璃+紫色高光）
- 字体：中文思源黑体 / 英文 Inter
- 全部移动端响应式（学生主要在手机上打卡）

## 五、技术细节（开发参考）
- TanStack Start + Lovable Cloud（Supabase）+ Lovable AI Gateway
- 词库通过种子脚本一次性导入 `vocabulary` 表
- 数据表：`profiles`、`vocabulary`、`user_progress`、`daily_checkin`、`coaches`、`sales_consultants`
- AI 出题用 `createServerFn` + tool calling 输出结构化题目（题干/选项/答案/解析）
- 滑动榜用 embla-carousel + scroll-snap，吸附位检测后暂停 autoplay
- 上传的教练海报、销售顾问名片、凤凰LOGO 复制到 `src/assets/`
- 二维码图片：直接裁剪上传的销售顾问名片图作为弹窗内容
