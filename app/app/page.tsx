"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { RequireAuth, TopNav, Card, Button, Textarea } from "../_ui";
import { auth, getProgram, addSession, getPRs, getRecentSessions, type ProgramDoc, type SessionDoc } from "../_db";

function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function AppDashboard() {
  const [program, setProgram] = useState<ProgramDoc | null>(null);
  const [prs, setPrs] = useState<any[]>([]);
  const [recent, setRecent] = useState<any[]>([]);
  const [notes, setNotes] = useState("");
  const [logging, setLogging] = useState(false);

  const weekday = useMemo(() => new Date().getDay(), []);
  const date = useMemo(() => todayISO(), []);

  useEffect(() => {
    async function load() {
      const uid = auth.currentUser!.uid;
      setProgram(await getProgram(uid));
      setPrs((await getPRs(uid)).slice(0, 8));
      setRecent(await getRecentSessions(uid, 10));
    }
    const t = setTimeout(load, 100);
    return () => clearTimeout(t);
  }, []);

  const today = program?.days?.find((d) => d.weekday === weekday);

  async function quickLog() {
    if (!today) return;
    setLogging(true);
    try {
      const uid = auth.currentUser!.uid;
      const session: SessionDoc = {
        date,
        weekday,
        programTitle: today.title,
        notes: notes || "",
        exercises: today.exercises.map((ex) => ({
          name: ex.name,
          sets: Array.from({ length: ex.sets ?? 3 }).map(() => ({
            reps: undefined,
            weight: undefined,
            rpe: undefined
          }))
        }))
      };
      const id = await addSession(uid, session);
      window.location.href = `/app/sessions/${id}`;
    } finally {
      setLogging(false);
    }
  }

  function sessionVolume(s: any) {
    let v = 0;
    for (const ex of s.exercises || []) {
      for (const st of ex.sets || []) {
        v += Number(st.reps ?? 0) * Number(st.weight ?? 0);
      }
    }
    return v;
  }

  return (
    <RequireAuth>
      <TopNav />
      <div className="mx-auto max-w-6xl px-4 py-6 grid gap-4">
        <Card className="p-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <div className="text-sm text-zinc-400">Today • {date}</div>
              <h1 className="mt-2 text-2xl font-semibold">{today?.title ?? "No program for today"}</h1>
            </div>

            <div className="w-full md:w-[420px]">
              <label className="text-xs text-zinc-400">Notes (optional)</label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="How did it feel?" />
              <div className="mt-3 flex gap-2">
                <Button onClick={quickLog} disabled={!today || logging}>
                  {logging ? "Logging…" : "Log session"}
                </Button>
                <Link href="/app/builder">
                  <Button variant="ghost">Edit program</Button>
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-2">
            {today?.exercises?.map((ex, i) => (
              <div
                key={i}
                className="rounded-2xl border border-zinc-800 bg-zinc-950/30 p-3 flex justify-between gap-3"
              >
                <div className="font-medium">{ex.name}</div>
                <div className="text-sm text-zinc-400">
                  {ex.sets ? `${ex.sets} sets` : ""} {ex.reps ? `× ${ex.reps}` : ""}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="p-6">
            <h2 className="text-lg font-semibold">Top PRs</h2>
            <div className="mt-4 grid gap-2">
              {prs.map((p: any) => (
                <div key={p.exercise} className="rounded-2xl border border-zinc-800 bg-zinc-950/30 p-4">
                  <div className="font-medium">{p.exercise}</div>
                  <div className="mt-2 text-sm text-zinc-400">
                    Best set: {p.bestSetWeight} × {p.bestSetReps} ({p.bestSetDate})
                  </div>
                  <div className="text-sm text-zinc-400">
                    Best volume: {Math.round(p.bestVolume)} ({p.bestVolumeDate})
                  </div>
                </div>
              ))}
              {!prs.length && <div className="text-sm text-zinc-400">No PRs yet. Log weights/reps.</div>}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold">Recent sessions</h2>
            <div className="mt-4 grid gap-2">
              {recent.map((s: any) => (
                <Link
                  key={s.id}
                  href={`/app/sessions/${s.id}`}
                  className="rounded-2xl border border-zinc-800 bg-zinc-950/30 p-4 hover:bg-zinc-950/45 transition"
                >
                  <div className="flex justify-between gap-4">
                    <div className="font-medium">{s.date}</div>
                    <div className="text-sm text-zinc-400 truncate">{s.programTitle}</div>
                  </div>
                  <div className="mt-2 text-xs text-zinc-500">Volume: {Math.round(sessionVolume(s))}</div>
                </Link>
              ))}
              {!recent.length && <div className="text-sm text-zinc-400">No sessions yet.</div>}
            </div>
          </Card>
        </div>
      </div>
    </RequireAuth>
  );
}
