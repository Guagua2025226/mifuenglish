import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { generateAIQuestion } from "@/lib/ai.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/practice/$mode")({
  component: PracticeMode,
});

interface Word { id: string; word: string; meaning: string; pos: string | null }

const MODE_NAMES: Record<string, string> = {
  cn2en: "中翻英", en2cn: "英翻中", match: "单词翻翻乐",
  pos: "词性转换", root: "词根词缀", collocation: "固定搭配", cloze: "语法填空",
};

function PracticeMode() {
  const { mode } = Route.useParams();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [words, setWords] = useState<Word[]>([]);
  const [idx, setIdx] = useState(0);
  const [studied, setStudied] = useState(0);

  useEffect(() => { if (!authLoading && !user) navigate({ to: "/auth" }); }, [user, authLoading, navigate]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("vocabulary").select("*").limit(500);
      const shuffled = [...(data ?? [])].sort(() => Math.random() - 0.5).slice(0, 20);
      setWords(shuffled as Word[]);
      setIdx(0); setStudied(0);
    })();
  }, [mode]);

  const recordResult = useCallback(async (word: Word, correct: boolean) => {
    if (!user) return;
    setStudied((s) => s + 1);
    const today = new Date().toISOString().slice(0, 10);
    // upsert progress
    const { data: existing } = await supabase.from("user_progress").select("*").eq("user_id", user.id).eq("word_id", word.id).maybeSingle();
    if (existing) {
      await supabase.from("user_progress").update({
        correct_count: existing.correct_count + (correct ? 1 : 0),
        wrong_count: existing.wrong_count + (correct ? 0 : 1),
        mastery: Math.max(0, existing.mastery + (correct ? 1 : -1)),
        last_reviewed_at: new Date().toISOString(),
      }).eq("id", existing.id);
    } else {
      await supabase.from("user_progress").insert({
        user_id: user.id, word_id: word.id,
        correct_count: correct ? 1 : 0, wrong_count: correct ? 0 : 1,
        mastery: correct ? 1 : 0, last_reviewed_at: new Date().toISOString(),
      });
    }
    // upsert today checkin
    const { data: ck } = await supabase.from("daily_checkin").select("*").eq("user_id", user.id).eq("checkin_date", today).maybeSingle();
    if (ck) {
      await supabase.from("daily_checkin").update({ words_studied: ck.words_studied + 1, correct_count: ck.correct_count + (correct ? 1 : 0) }).eq("id", ck.id);
    } else {
      await supabase.from("daily_checkin").insert({ user_id: user.id, checkin_date: today, words_studied: 1, correct_count: correct ? 1 : 0 });
    }
  }, [user]);

  const next = () => setIdx((i) => i + 1);

  if (!user || words.length === 0) return <div className="p-12 text-center text-muted-foreground">加载中...</div>;
  if (idx >= words.length) {
    return (
      <div className="mx-auto max-w-xl px-4 py-12 text-center">
        <div className="glass-card rounded-2xl p-8">
          <div className="text-5xl mb-3">🎉</div>
          <h2 className="text-2xl font-bold text-gradient-gold">本轮完成！</h2>
          <p className="mt-2 text-muted-foreground">本次共练习 {studied} 个单词</p>
          <div className="mt-6 flex gap-3 justify-center">
            <Button onClick={() => { setIdx(0); setStudied(0); }}>再来一轮</Button>
            <Link to="/dashboard"><Button variant="outline">查看打卡</Button></Link>
          </div>
        </div>
      </div>
    );
  }

  const current = words[idx];
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-4 flex items-center justify-between">
        <Link to="/practice" className="text-sm text-muted-foreground hover:text-foreground">← 返回练习中心</Link>
        <div className="text-sm text-muted-foreground">{idx + 1} / {words.length} · {MODE_NAMES[mode] ?? mode}</div>
      </div>
      <div className="glass-card rounded-2xl p-6 md:p-8">
        {mode === "cn2en" && <Cn2En word={current} onResult={(c) => { recordResult(current, c); next(); }} />}
        {mode === "en2cn" && <En2Cn word={current} pool={words} onResult={(c) => { recordResult(current, c); next(); }} />}
        {mode === "match" && <MatchGame pool={words.slice(0, 6)} onDone={() => { recordResult(current, true); next(); }} />}
        {(mode === "pos" || mode === "root" || mode === "collocation" || mode === "cloze") && (
          <AIQuestion word={current} mode={mode} onResult={(c) => { recordResult(current, c); next(); }} />
        )}
      </div>
    </div>
  );
}

function Cn2En({ word, onResult }: { word: Word; onResult: (c: boolean) => void }) {
  const [val, setVal] = useState("");
  const [showAns, setShowAns] = useState(false);
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

function En2Cn({ word, pool, onResult }: { word: Word; pool: Word[]; onResult: (c: boolean) => void }) {
  const [picked, setPicked] = useState<string | null>(null);
  const [opts] = useState(() => {
    const distractors = pool.filter((w) => w.id !== word.id).sort(() => Math.random() - 0.5).slice(0, 3);
    return [...distractors, word].sort(() => Math.random() - 0.5);
  });
  return (
    <>
      <div className="text-sm text-muted-foreground mb-2">选择正确的中文释义</div>
      <div className="text-4xl md:text-5xl font-bold mb-2 text-gradient-gold">{word.word}</div>
      {word.pos && <div className="text-sm text-muted-foreground mb-6">{word.pos}</div>}
      <div className="space-y-2">
        {opts.map((o) => {
          const correct = o.id === word.id;
          const isPicked = picked === o.id;
          return (
            <button key={o.id} disabled={!!picked} onClick={() => setPicked(o.id)}
              className={`w-full text-left p-3 rounded-lg border transition ${
                picked
                  ? correct ? "bg-success/20 border-success" : isPicked ? "bg-destructive/20 border-destructive" : "bg-card/30 border-border"
                  : "bg-card/40 border-border hover:bg-card/70"
              }`}>{o.meaning}</button>
          );
        })}
      </div>
      {picked && (
        <Button className="w-full mt-4" onClick={() => onResult(picked === word.id)}>下一题</Button>
      )}
    </>
  );
}

function MatchGame({ pool, onDone }: { pool: Word[]; onDone: () => void }) {
  type Card = { key: string; id: string; text: string; kind: "en" | "cn" };
  const [cards] = useState<Card[]>(() => {
    const arr: Card[] = [];
    pool.forEach((w) => {
      arr.push({ key: `${w.id}-en`, id: w.id, text: w.word, kind: "en" });
      arr.push({ key: `${w.id}-cn`, id: w.id, text: w.meaning, kind: "cn" });
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
              }`}>
              {isOpen ? c.text : "?"}
            </button>
          );
        })}
      </div>
    </>
  );
}

function AIQuestion({ word, mode, onResult }: { word: Word; mode: string; onResult: (c: boolean) => void }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reveal, setReveal] = useState(false);
  const [answer, setAnswer] = useState("");

  useEffect(() => {
    setLoading(true); setReveal(false); setAnswer(""); setData(null);
    generateAIQuestion({ data: { word: word.word, meaning: word.meaning, mode } })
      .then((r) => {
        if (r.error) toast.error(r.error);
        setData(r.data);
      })
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, [word.id, mode]);

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

  // pos / cloze (fill in the blank)
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
