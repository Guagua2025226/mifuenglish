import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, useCallback } from "react";
import { useStudent } from "@/lib/student-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { generateAIQuestion } from "@/lib/ai.functions";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { VOCAB_GROUPS, type VocabWord } from "@/lib/word-groups";
import { PRACTICE_MODES, markModeDone, getGroupProgress, type ModeId } from "@/lib/practice-progress";

export const Route = createFileRoute("/practice/$groupId/$mode")({
  component: PracticeMode,
});

const MODE_NAME = (id: string) => PRACTICE_MODES.find((m) => m.id === id)?.name ?? id;

function speakWord(w: string) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  const u = new SpeechSynthesisUtterance(w);
  u.lang = "en-US"; u.rate = 0.9;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}

function PracticeMode() {
  const { groupId, mode } = Route.useParams();
  const { student, loading: authLoading } = useStudent();
  const navigate = useNavigate();
  const groupIdNum = Number(groupId);
  const group = VOCAB_GROUPS.find((g) => g.id === groupIdNum);

  const [idx, setIdx] = useState(0);
  const [studied, setStudied] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const savedRef = useRef(false);

  useEffect(() => { if (!authLoading && !student) navigate({ to: "/join" }); }, [student, authLoading, navigate]);
  useEffect(() => { setIdx(0); setStudied(0); setCorrectCount(0); savedRef.current = false; }, [mode, groupId]);

  const recordResult = useCallback((correct: boolean) => {
    setStudied((s) => s + 1);
    if (correct) setCorrectCount((c) => c + 1);
  }, []);

  const next = () => setIdx((i) => i + 1);

  if (!student) return null;
  if (!group) {
    return (
      <div className="p-12 text-center">
        <p className="text-muted-foreground">未找到该词组</p>
        <Link to="/practice"><Button className="mt-4">返回练习中心</Button></Link>
      </div>
    );
  }

  const words = group.words;

  if (idx >= words.length) {
    const score = studied > 0 ? Math.round((correctCount / studied) * 100) : 0;
    // mark this mode done
    if (!savedRef.current && studied > 0) {
      savedRef.current = true;
      const gp = markModeDone(groupIdNum, mode as ModeId);
      if (gp.checkedInAt && gp.modes && Object.keys(gp.modes).length === PRACTICE_MODES.length) {
        toast.success(`🎉 ${group.name} 全部完成，已打卡！`);
      } else {
        toast.success(`✓ ${MODE_NAME(mode)} 完成`);
      }
    }
    const gp = getGroupProgress(groupIdNum);
    const nextUndone = PRACTICE_MODES.find((m) => !gp.modes[m.id]);
    const allDone = !nextUndone;

    return (
      <div className="mx-auto max-w-xl px-4 py-12 text-center">
        <div className="glass-card rounded-2xl p-8">
          <div className="text-5xl mb-3">{allDone ? "🏆" : "✅"}</div>
          <h2 className="text-2xl font-bold text-gradient-gold">
            {allDone ? `${group.name} 全部完成！打卡成功` : `${MODE_NAME(mode)} 完成`}
          </h2>
          <p className="mt-2 text-muted-foreground">练习 {studied} 词 · 正确 {correctCount} · 得分 {score}</p>

          <div className="mt-4 flex flex-wrap gap-1.5 justify-center">
            {PRACTICE_MODES.map((m) => (
              <span key={m.id} className={`text-xs px-2 py-1 rounded-full border ${
                gp.modes[m.id] ? "bg-success/20 border-success/40 text-success" : "bg-card/40 border-border/60 text-muted-foreground"
              }`}>{m.icon} {m.name}</span>
            ))}
          </div>

          <div className="mt-6 flex gap-2 justify-center flex-wrap">
            {nextUndone && (
              <Button onClick={() => navigate({ to: "/practice/$groupId/$mode", params: { groupId, mode: nextUndone.id } })}>
                下一环节：{nextUndone.icon} {nextUndone.name} →
              </Button>
            )}
            <Link to="/practice"><Button variant="outline">返回练习中心</Button></Link>
            {allDone && <Link to="/ranking"><Button variant="outline">🏆 封神榜</Button></Link>}
          </div>
        </div>
      </div>
    );
  }

  const current = words[idx];
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-3 flex items-center gap-3">
        <Link to="/practice" className="text-sm text-muted-foreground hover:text-foreground shrink-0">← 返回</Link>
        <Progress value={(idx / words.length) * 100} className="flex-1 h-2" />
        <div className="text-sm text-muted-foreground shrink-0 tabular-nums">{idx + 1} / {words.length}</div>
      </div>
      <div className="text-xs text-muted-foreground mb-3 text-center">{group.name} · {MODE_NAME(mode)}</div>
      <div className={mode === "study" ? "" : "glass-card rounded-2xl p-6 md:p-8"}>
        {mode === "study" && <StudyCard word={current} onResult={(c) => { recordResult(c); next(); }} />}
        {mode === "cn2en" && <Cn2En word={current} onResult={(c) => { recordResult(c); next(); }} />}
        {mode === "en2cn" && <En2Cn word={current} pool={words} onResult={(c) => { recordResult(c); next(); }} />}
        {mode === "match" && <MatchGame pool={words.slice(0, 6)} onDone={() => { recordResult(true); setIdx(words.length); }} />}
        {(mode === "pos" || mode === "root" || mode === "collocation" || mode === "cloze") && (
          <AIQuestion word={current} mode={mode} onResult={(c) => { recordResult(c); next(); }} />
        )}
      </div>
    </div>
  );
}

function Cn2En({ word, onResult }: { word: VocabWord; onResult: (c: boolean) => void }) {
  const [val, setVal] = useState("");
  const [showAns, setShowAns] = useState(false);
  useEffect(() => { setVal(""); setShowAns(false); }, [word.word]);
  return (
    <>
      <div className="text-sm text-muted-foreground mb-2">看中文写英文</div>
      <div className="text-3xl md:text-4xl font-bold mb-6">{word.meaning}</div>
      <Input value={val} onChange={(e) => setVal(e.target.value)} placeholder="输入英文单词" autoFocus disabled={showAns} />
      {showAns && (
        <div className="mt-4 rounded-lg bg-card/60 p-3 text-sm">
          正确答案：<span className="font-bold text-gold">{word.word}</span>
        </div>
      )}
      <div className="mt-4 flex gap-2">
        {!showAns ? (
          <Button onClick={() => setShowAns(true)} className="flex-1">提交</Button>
        ) : (
          <>
            <Button variant="outline" className="flex-1" onClick={() => onResult(false)}>没记住</Button>
            <Button className="flex-1" onClick={() => onResult(val.trim().toLowerCase() === word.word.toLowerCase())}>
              {val.trim().toLowerCase() === word.word.toLowerCase() ? "✓ 我答对了" : "✗ 我答错了"}
            </Button>
          </>
        )}
      </div>
    </>
  );
}

function En2Cn({ word, pool, onResult }: { word: VocabWord; pool: VocabWord[]; onResult: (c: boolean) => void }) {
  const [picked, setPicked] = useState<string | null>(null);
  const [opts, setOpts] = useState<VocabWord[]>([]);
  useEffect(() => {
    const distractors = pool.filter((w) => w.word !== word.word).sort(() => Math.random() - 0.5).slice(0, 3);
    setOpts([...distractors, word].sort(() => Math.random() - 0.5));
    setPicked(null);
  }, [word.word, pool]);
  return (
    <>
      <div className="text-sm text-muted-foreground mb-2">选择正确的中文释义</div>
      <div className="text-4xl md:text-5xl font-bold mb-6 text-gradient-gold">{word.word}</div>
      <div className="space-y-2">
        {opts.map((o) => {
          const correct = o.word === word.word;
          const isPicked = picked === o.word;
          return (
            <button key={o.word} disabled={!!picked} onClick={() => setPicked(o.word)}
              className={`w-full text-left p-3 rounded-lg border transition ${
                picked
                  ? correct ? "bg-success/20 border-success" : isPicked ? "bg-destructive/20 border-destructive" : "bg-card/30 border-border"
                  : "bg-card/40 border-border hover:bg-card/70"
              }`}>{o.meaning}</button>
          );
        })}
      </div>
      {picked && <Button className="w-full mt-4" onClick={() => onResult(picked === word.word)}>下一题</Button>}
    </>
  );
}

function MatchGame({ pool, onDone }: { pool: VocabWord[]; onDone: () => void }) {
  type Card = { key: string; id: string; text: string; kind: "en" | "cn" };
  const [cards] = useState<Card[]>(() => {
    const arr: Card[] = [];
    pool.forEach((w) => {
      arr.push({ key: `${w.word}-en`, id: w.word, text: w.word, kind: "en" });
      arr.push({ key: `${w.word}-cn`, id: w.word, text: w.meaning, kind: "cn" });
    });
    return arr.sort(() => Math.random() - 0.5);
  });
  const [flipped, setFlipped] = useState<string[]>([]);
  const [matched, setMatched] = useState<Set<string>>(new Set());

  const onFlip = (k: string) => {
    if (flipped.includes(k) || matched.has(k)) return;
    const nf = [...flipped, k];
    setFlipped(nf);
    if (nf.length === 2) {
      const [a, b] = nf.map((kk) => cards.find((c) => c.key === kk)!);
      if (a.id === b.id && a.kind !== b.kind) {
        setTimeout(() => { setMatched(new Set([...matched, a.key, b.key])); setFlipped([]); }, 400);
      } else {
        setTimeout(() => setFlipped([]), 800);
      }
    }
  };

  useEffect(() => { if (matched.size === cards.length) setTimeout(onDone, 500); }, [matched, cards.length, onDone]);

  return (
    <>
      <div className="text-sm text-muted-foreground mb-3">翻翻乐：找出英文与中文配对</div>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {cards.map((c) => {
          const isOpen = flipped.includes(c.key) || matched.has(c.key);
          return (
            <button key={c.key} onClick={() => onFlip(c.key)}
              className={`h-20 rounded-lg text-sm font-medium transition ${
                matched.has(c.key) ? "bg-success/20 border border-success text-success-foreground"
                : isOpen ? "bg-primary/40 border border-primary"
                : "bg-card/60 border border-border hover:bg-card/80"
              }`}>{isOpen ? c.text : "?"}</button>
          );
        })}
      </div>
    </>
  );
}

function AIQuestion({ word, mode, onResult }: { word: VocabWord; mode: string; onResult: (c: boolean) => void }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reveal, setReveal] = useState(false);
  const [answer, setAnswer] = useState("");

  useEffect(() => {
    setLoading(true); setReveal(false); setAnswer(""); setData(null);
    generateAIQuestion({ data: { word: word.word, meaning: word.meaning, mode } })
      .then((r) => { if (r.error) toast.error(r.error); setData(r.data); })
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, [word.word, mode]);

  if (loading) return <div className="py-8 text-center text-muted-foreground">AI 正在为「{word.word}」出题...</div>;
  if (!data) return <Button onClick={() => onResult(false)}>跳过</Button>;

  if (mode === "root") {
    return (
      <>
        <div className="text-xs text-muted-foreground mb-2">词根词缀拆解</div>
        <div className="text-3xl font-bold mb-4 text-gradient-gold">{word.word}</div>
        <div className="space-y-2 text-sm">
          <Row label="前缀" value={data.prefix} />
          <Row label="词根" value={data.root} />
          <Row label="后缀" value={data.suffix} />
          {data.family && <Row label="同根词" value={Array.isArray(data.family) ? data.family.join(", ") : data.family} />}
          <div className="rounded-lg bg-card/60 p-3 mt-3">{data.explain}</div>
        </div>
        <Button className="w-full mt-4" onClick={() => onResult(true)}>已掌握，下一个</Button>
      </>
    );
  }

  if (mode === "collocation" && data.options) {
    return (
      <>
        <div className="text-xs text-muted-foreground mb-2">固定搭配</div>
        <div className="text-base mb-4">{data.question}</div>
        <div className="space-y-2">
          {(data.options as string[]).map((o, i) => {
            const letter = String.fromCharCode(65 + i);
            const isAns = letter === data.answer;
            const isPicked = answer === letter;
            return (
              <button key={i} disabled={!!answer} onClick={() => setAnswer(letter)}
                className={`w-full text-left p-3 rounded-lg border ${
                  answer ? (isAns ? "bg-success/20 border-success" : isPicked ? "bg-destructive/20 border-destructive" : "bg-card/30 border-border")
                  : "bg-card/40 border-border hover:bg-card/70"
                }`}>
                <span className="font-bold mr-2">{letter}.</span>{o}
              </button>
            );
          })}
        </div>
        {answer && (
          <>
            <div className="rounded-lg bg-card/60 p-3 mt-3 text-sm">{data.explain}</div>
            <Button className="w-full mt-3" onClick={() => onResult(answer === data.answer)}>下一题</Button>
          </>
        )}
      </>
    );
  }

  const text = data.passage || data.question;
  return (
    <>
      <div className="text-xs text-muted-foreground mb-2">{mode === "cloze" ? "语法填空" : "词性转换"}</div>
      <div className="text-base mb-3 leading-relaxed whitespace-pre-wrap">{text}</div>
      {data.hint && <div className="text-xs text-gold mb-3">提示：{data.hint}</div>}
      {!reveal ? (
        <>
          <Input value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="输入答案" />
          <Button className="w-full mt-3" onClick={() => setReveal(true)}>提交答案</Button>
        </>
      ) : (
        <>
          <div className="rounded-lg bg-card/60 p-3 text-sm">
            <div>正确答案：<span className="font-bold text-gold">{data.answer}</span></div>
            {data.explain && <div className="mt-2 text-muted-foreground">{data.explain}</div>}
          </div>
          <div className="mt-3 flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => onResult(false)}>没答对</Button>
            <Button className="flex-1" onClick={() => onResult(answer.trim().toLowerCase() === String(data.answer).trim().toLowerCase())}>下一题</Button>
          </div>
        </>
      )}
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3 p-2 rounded bg-card/40">
      <div className="text-muted-foreground w-16 shrink-0">{label}</div>
      <div className="flex-1">{value || "-"}</div>
    </div>
  );
}

function StudyCard({ word, onResult }: { word: VocabWord; onResult: (correct: boolean) => void }) {
  const [showMeaning, setShowMeaning] = useState(false);
  useEffect(() => {
    setShowMeaning(false);
    const t = setTimeout(() => speakWord(word.word), 250);
    return () => clearTimeout(t);
  }, [word.word]);

  const rate = (level: "unknown" | "fuzzy" | "known" | "mastered") => onResult(level !== "unknown");

  const levels = [
    { id: "unknown", label: "不会", days: "+明天", cls: "bg-destructive/15 hover:bg-destructive/25 border-destructive/40", labelCls: "text-destructive" },
    { id: "fuzzy", label: "模糊", days: "+2 天", cls: "bg-gold/15 hover:bg-gold/25 border-gold/40", labelCls: "text-gold" },
    { id: "known", label: "认识", days: "+4 天", cls: "bg-success/15 hover:bg-success/25 border-success/40", labelCls: "text-success" },
    { id: "mastered", label: "掌握", days: "+7 天", cls: "bg-success/30 hover:bg-success/40 border-success/60", labelCls: "text-success" },
  ] as const;

  return (
    <>
      <div className="glass-card rounded-3xl p-10 md:p-14 text-center min-h-[280px] flex flex-col items-center justify-center">
        <div className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-gold/20 text-gold mb-6">✨ 新词</div>
        <div className="flex items-center gap-4">
          <div className="text-5xl md:text-6xl font-extrabold tracking-tight">{word.word}</div>
          <button onClick={() => speakWord(word.word)} aria-label="发音"
            className="h-12 w-12 rounded-full bg-success/20 hover:bg-success/30 flex items-center justify-center text-success transition">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>
          </button>
        </div>
        {!showMeaning ? (
          <Button variant="outline" className="mt-8" onClick={() => setShowMeaning(true)}>👁  显示释义</Button>
        ) : (
          <div className="mt-6 text-2xl md:text-3xl font-semibold text-gradient-gold max-w-xl">{word.meaning}</div>
        )}
      </div>
      <div className="mt-3 text-center text-xs text-muted-foreground">想想看再点显示释义</div>
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
        {levels.map((lv) => (
          <button key={lv.id} onClick={() => rate(lv.id)} className={`rounded-2xl border-2 py-4 transition ${lv.cls}`}>
            <div className={`text-lg font-bold ${lv.labelCls}`}>{lv.label}</div>
            <div className={`text-xs mt-0.5 ${lv.labelCls} opacity-80`}>{lv.days}</div>
          </button>
        ))}
      </div>
    </>
  );
}
