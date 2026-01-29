"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { RequireAuth, TopNav, Card, Button } from "../../_ui";
import { auth, getRecentSessions } from "../../_db";

function toISO(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function monthGrid(year: number, monthIndex0: number) {
  const first = new Date(year, monthIndex0, 1);
  const startDay = first.getDay();
  const daysInMonth = new Date(year, monthIndex0 + 1, 0).getDate();

  const cells: { date: Date | null; key: string }[] = [];
  for (let i = 0; i < startDay; i++) cells.push({ date: null, key: `pad-${i}` });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ date: new Date(year, monthIndex0, d), key: `d-${d}` });
  while (cells.length % 7 !== 0) cells.push({ date: null, key: `tail-${cells.length}` });
  return cells;
}

export default function CalendarPage() {
  const now = useMemo(() => new Date(), []);
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [sessions, setSessions] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      const uid = auth.currentUser!.uid;
      setSessions(await getRecentSessions(uid, 250));
    }
    load();
  }, []);

  const map = useMemo(() => {
    const m = new Map<string, any[]>();
    for (const s of sessions) {
      const arr = m.get(s.date) ?? [];
      arr.push(s);
      m.set(s.date, arr);
    }
    return m;
  }, [sessions]);

  const cells = useMemo(() => monthGrid(year, month), [year, month]);
  const monthName = useMemo(() => new Date(year, month, 1).toLocaleString(undefined, { month: "long" }), [year, month]);

  function prev() {
    if (month === 0) {
      setYear((y) => y - 1);
      setMonth(11);
    } else setMonth((m) => m - 1);
  }
  function next() {
    if (month === 11) {
      setYear((y) => y + 1);
      setMonth(0);
    } else setMonth((m) => m + 1);
  }

  return (
    <RequireAuth>
      <TopNav />
      <div className="mx-auto max-w-6xl px-4 py-6 grid gap-4">
        <Card className="p-6 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-semibold">Calendar</h1>
            <p className="mt-2 text-sm text-zinc-400">Sessions by date.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={prev}>←</Button>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/40 px-4 py-2 text-sm">
              {monthName} {year}
            </div>
            <Button variant="ghost" onClick={next}>→</Button>
          </div>
        </Card>

        <Card className="p-6">
          <div className="grid grid-cols-7 gap-2 text-xs text-zinc-500 mb-2">
            {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d) => (
              <div key={d} className="px-2">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {cells.map((c) => {
              const iso = c.date ? toISO(c.date) : "";
              const has = c.date ? map.get(iso) : null;
              return (
                <div
                  key={c.key}
                  className={[
                    "min-h-[92px] rounded-2xl border p-2",
                    c.date ? "border-zinc-800 bg-zinc-950/30" : "border-transparent"
                  ].join(" ")}
                >
                  {c.date && (
                    <>
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium">{c.date.getDate()}</div>
                        {has?.length ? <div className="text-[11px] text-zinc-400">{has.length}</div> : <div className="text-[11px] text-zinc-600">—</div>}
                      </div>

                      <div className="mt-2 grid gap-1">
                        {(has ?? []).slice(0, 2).map((s: any) => (
                          <Link
                            key={s.id}
                            href={`/app/sessions/${s.id}`}
                            className="text-[11px] rounded-xl border border-zinc-800 bg-zinc-900/40 px-2 py-1 hover:bg-zinc-900/70 truncate"
                            title={s.programTitle}
                          >
                            {s.programTitle}
                          </Link>
                        ))}
                        {(has ?? []).length > 2 && <div className="text-[11px] text-zinc-500">+{(has ?? []).length - 2} more</div>}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </RequireAuth>
  );
}
