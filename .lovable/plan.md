## 目标

模仿截图，把"词汇练习中心"中的"中翻英"改造成卡片式学习打卡模式：进入后**直接显示英文单词** + **TTS 发音按钮**，"显示释义"后用 **不会 / 模糊 / 认识 / 掌握** 四档评级（SRS 间隔），并把这套作为新主模式 `study`。

## 截图还原要点

- 顶部进度条 + `1 / 20`
- 大白卡片，居中显示单词（如 `allow`），右侧绿色喇叭按钮（点击发音）
- "新词"小徽章
- "显示释义"按钮 → 点击后展开中文释义 + 词性
- 下方 4 个彩色评级按钮：
  - 不会（红，+明天）
  - 模糊（黄，+2 天）
  - 认识（浅绿，+4 天）
  - 掌握（深绿，+7 天）
- 提示文案"想想看再点显示释义"

## 新增/修改

### 1. 新增"学习打卡"模式 `study`
- `src/routes/practice.$mode.tsx`：新增 `StudyCard` 组件作为 `mode === "study"` 的渲染。
- 进入即显单词 + 发音按钮（用浏览器内置 `speechSynthesis`，`lang="en-US"`，无需任何 API）。
- 点击"显示释义"切换释义可见。
- 点击四档评级按钮 → 记 1 题（"不会"算错，其余算对）→ `next()`。
- 完成时仍写入 `study_logs`（保持现有逻辑）。

### 2. 在练习中心置顶"学习打卡"卡片
- `src/routes/practice.tsx`：MODES 数组顶部新增  
  `{ id: "study", name: "学习打卡", desc: "看词→评级，间隔记忆", icon: "📖", ai: false }`，并在网格中突出显示（更大卡片 / 描边强调）。

### 3. 视觉对齐截图
- 卡片采用更亮的浅色背景（在当前深紫主题下，使用 `bg-card/95` + 大圆角 + 阴影），单词用大号深色字。
- 4 个评级按钮使用现有色板（destructive / gold / success 浅深两档）+ 圆角大按钮，字号清晰。
- 顶部已有 `idx+1 / words.length`，补一条 Tailwind `Progress` 横条。

## 不在范围
- 不改其它 6 个模式的 UI。
- 不实现真正的 SRS 持久化间隔（仅显示 +天数文案，作为视觉一致），后续可扩展。
- 不接入第三方 TTS（用浏览器原生 `speechSynthesis`，零成本，多数环境可用）。

## 技术细节

- 发音函数：
  ```ts
  const speak = (w: string) => {
    const u = new SpeechSynthesisUtterance(w);
    u.lang = "en-US"; u.rate = 0.9;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  };
  ```
- 进入卡片时自动播放一次发音（可选）。
- `Progress` 用现有 `@/components/ui/progress`，`value={(idx/words.length)*100}`。
- 评级 → `recordResult(current, level !== "unknown"); next();`
