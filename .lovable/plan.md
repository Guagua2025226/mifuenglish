## 目标
新增"立即体验"流程：点击 → 跳转教练页选择教练 → 选择后弹出报名表单（显示已选教练名字）→ 提交后展示该教练对应顾问的二维码。

## 流程
```text
[首页/任意页] 点击"立即体验"
        ↓
[/coaches?select=1] 教练团页（进入"选择教练"模式：每张卡片显示"选择 TA"按钮）
        ↓ 选中教练
[LeadDialog 弹窗] 顶部显示"您选择的教练：陈昱蓉 老师"
        ↓ 填写并提交
[二维码视图] "已为您匹配专属顾问 李晶/郑家宝"
```

## 表单字段
- 家长姓名 *（≤20）
- 联系电话 *（中国 11 位手机号 `/^1[3-9]\d{9}$/`）
- 提升学科 *（英语/数学/语文/物理/化学/全科）
- 目前成绩 *（90+ / 80–90 / 70–80 / 60–70 / 60 以下）
- MBTI（选填，16 项 + 暂不填写）

## 放置位置
- **首页 Hero**：新增金色主按钮"立即体验 · 选教练"
- **SiteHeader**：右侧新增小按钮"立即体验"
- **教练团页 `/coaches`**：当 `?select=1` 时进入选择模式（卡片右下角显示"选择 TA"按钮，CoachSlider 同样响应）
- **教练详情弹窗**：原"立即试听"按钮保留，但改为直接打开 LeadDialog 并预填该教练
- **练习中心顶部**：小提示条"想要 1V1 教练辅导？立即体验"

## 数据库
新建 `leads` 表（公开 INSERT，禁止公开 SELECT 防泄漏销售线索）：
```
id uuid pk default gen_random_uuid()
parent_name text not null
phone text not null
subject text not null
score_range text not null
mbti text
coach_id text not null            -- 选中的教练
coach_name text not null
assigned_sales text not null      -- 'lijing' / 'zhengjiabao'
student_id uuid                   -- 若已 join 则关联
created_at timestamptz default now()
```
RLS：
- `INSERT` 公开，With Check：字段长度限制 + 手机号格式 + 枚举校验
- 不开放 SELECT/UPDATE/DELETE

## 组件 / 文件
- 新建 `src/components/lead-dialog.tsx`
  - props: `open`, `onOpenChange`, `coach: Coach`
  - 两阶段视图：表单 → 提交成功后切到顾问二维码
  - 顾问随机分配（复用 `pickRandomSales`），写入 `assigned_sales`
- 编辑 `src/components/coach-slider.tsx`
  - 接收 `selectMode?: boolean` prop；选择模式下点卡片直接打开 LeadDialog
  - 详情弹窗"立即试听"→ 改为打开 LeadDialog（带当前教练）
- 编辑 `src/routes/coaches.tsx`
  - 读取 `search.select`；为 true 时显示顶部"请选择您心仪的教练"提示条；把 CoachSlider 切到 selectMode
  - `validateSearch` 加 `select: z.boolean().optional()`
- 编辑 `src/routes/index.tsx`：新增"立即体验 · 选教练"按钮 → `Link to="/coaches" search={{ select: true }}`
- 编辑 `src/components/site-header.tsx`：右侧加"立即体验"按钮
- 编辑 `src/routes/practice.tsx`：顶部加 1V1 体验提示条
- 新建 migration：`leads` 表 + RLS

## 校验
zod schema 客户端 + RLS WITH CHECK 服务端双重校验。提交前 trim、enum 校验、手机号正则。

## 文件改动汇总
- 新建：`supabase/migrations/*_leads.sql`、`src/components/lead-dialog.tsx`
- 编辑：`src/components/coach-slider.tsx`、`src/routes/coaches.tsx`、`src/routes/index.tsx`、`src/components/site-header.tsx`、`src/routes/practice.tsx`
