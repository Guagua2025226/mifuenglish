import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Student {
  id: string;
  name: string;
  grade: string;
  district: string;
}

interface StudentCtx {
  student: Student | null;
  loading: boolean;
  setStudent: (s: Student | null) => void;
  signOut: () => void;
}

const Ctx = createContext<StudentCtx>({
  student: null,
  loading: true,
  setStudent: () => {},
  signOut: () => {},
});

const STORAGE_KEY = "mifu_student";

export function StudentProvider({ children }: { children: ReactNode }) {
  const [student, setStudentState] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
      if (raw) {
        const parsed = JSON.parse(raw) as Student;
        // Verify it still exists in DB (best effort)
        supabase.from("students").select("id,name,grade,district").eq("id", parsed.id).maybeSingle().then(({ data }) => {
          if (data) setStudentState(data as Student);
          else {
            window.localStorage.removeItem(STORAGE_KEY);
            setStudentState(null);
          }
          setLoading(false);
        });
        return;
      }
    } catch { /* noop */ }
    setLoading(false);
  }, []);

  const setStudent = (s: Student | null) => {
    setStudentState(s);
    if (typeof window !== "undefined") {
      if (s) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
      else window.localStorage.removeItem(STORAGE_KEY);
    }
  };

  const signOut = () => setStudent(null);

  return <Ctx.Provider value={{ student, loading, setStudent, signOut }}>{children}</Ctx.Provider>;
}

export const useStudent = () => useContext(Ctx);

export const BJ_DISTRICTS = [
  "东城区","西城区","朝阳区","海淀区","丰台区","石景山区",
  "通州区","昌平区","大兴区","顺义区","房山区","门头沟区",
  "怀柔区","平谷区","密云区","延庆区",
];

export const GRADES = ["初一","初二","初三","高一","高二","高三"];
