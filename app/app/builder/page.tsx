"use client";

import { useEffect, useState } from "react";
import { RequireAuth, TopNav, Card, Button, Input } from "../../_ui";
import { auth, getProgram, saveProgram, getPublicProfile, setPublic, type ProgramDoc, type ProgramDay } from "../../_db";

export default function Builder() {
  const [program, setProgram] = useState<ProgramDoc | null>(null);
  const [saving, setSaving] = useState(false);
  const [isPublic, setIsPublic] = useState(false);

  useEffect(() => {
    async function load() {
      const uid = auth.currentUser!.uid;
      setProgram(await getProgram(uid));
      const pub = await getPublicProfile(uid);
      setIsPublic(Boolean(pub?.public));
    }
    load();
  }, []);

  function updateDay(idx: number, patch: Partial<ProgramDay>) {
    setProgram((p) => {
      if (!p) return p;
      const days = [...p.days];
      days[idx] = { ...days[idx], ...patch };
      return { ...p, days };
    });
  }

  function addExercise(dayIdx: number) {
    setProgram((p) => {
      if (!p) return p;
      const days = [...p.days];
      days[dayIdx] = {
        ...days[dayIdx],
        exercises: [...days[dayIdx].exercises, { name: "New Exercise", sets: 3, reps: "8–12" }]
      };
      return { ...p, days };
    });
  }

  function removeExercise(dayIdx: number, exIdx: number) {
    setProgram((p) => {
      if (!p) return p;
      const days = [...p.days];
      const ex = [...days[dayIdx].exercises];
      ex.splice(exIdx, 1);
      days[dayIdx] = { ...days[dayIdx], exercises: ex };
      return { ...p, days };
    });
  }

  function updateExercise(dayIdx: number, exIdx: number, patch: any) {
    setProgram((p) => {
      if (!p) return p;
      const days = [...p.days];
      const ex = [...days[dayIdx].exercises];
      ex[exIdx] = { ...ex[exIdx], ...patch };
      days[dayIdx] = { ...days[dayIdx], exercises: ex };
      return { ...p, days };
    });
  }

  async function save() {
    if (!program) return;
    setSaving(true);
    try {
      await saveProgram(auth.currentUser!.uid, program);
      alert("Program saved!");
    } finally {
      setSaving(false);
    }
  }

  async function togglePublic() {
    const uid = auth.currentUser!.uid;
    const next = !isPublic;
    setIsPublic(next);
    await setPublic(uid, next);
    alert(next ? "Public profile enabled!" : "Public profile disabled.");
  }

  return (
    <RequireAuth>
      <TopNav />
      <div className="mx-auto max-w-6xl px-4 py-6 grid gap-4">
        <Card className="p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl font-semibold">Program Builder</h1>
              <p className="mt-2 text-sm text-zinc-400">Edit your weekly split & exercises.</p>
            </div>
            <div className="flex gap-2">
              <Button variant={isPublic ? "secondary" : "ghost"} onClick={togglePublic}>
                {isPublic ? "Public: ON" : "Public: OFF"}
              </Button>
              <Button onClick={save} disabled={saving || !program}>
                {saving ? "Saving…" : "Save"}
              </Button>
            </div>
          </div>
          <p className="mt-3 text-xs text-zinc-500">
            Your public page is: <span className="text-zinc-300">/u/{auth.currentUser?.uid}</span> (only visible when Public is ON)
          </p>
        </Card>

        <div className="grid gap-4">
          {program?.days?.map((d, dayIdx) => (
            <Card key={d.weekday} className="p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <Input value={d.title} onChange={(e) => updateDay(dayIdx, { title: e.target.value })} />
                <Button variant="ghost" onClick={() => addExercise(dayIdx)}>
                  + Add exercise
                </Button>
              </div>

              <div className="mt-4 grid gap-2">
                {d.exercises.map((ex, exIdx) => (
                  <div key={exIdx} className="rounded-2xl border border-zinc-800 bg-zinc-950/30 p-4 grid gap-2 md:grid-cols-12 items-center">
                    <div className="md:col-span-6">
                      <Input value={ex.name} onChange={(e) => updateExercise(dayIdx, exIdx, { name: e.target.value })} />
                    </div>
                    <div className="md:col-span-2">
                      <Input
                        type="number"
                        placeholder="Sets"
                        value={ex.sets ?? ""}
                        onChange={(e) => updateExercise(dayIdx, exIdx, { sets: e.target.value ? Number(e.target.value) : undefined })}
                      />
                    </div>
                    <div className="md:col-span-3">
                      <Input
                        value={ex.reps ?? ""}
                        placeholder="Reps (e.g. 8–12)"
                        onChange={(e) => updateExercise(dayIdx, exIdx, { reps: e.target.value })}
                      />
                    </div>
                    <div className="md:col-span-1 flex justify-end">
                      <Button variant="danger" onClick={() => removeExercise(dayIdx, exIdx)}>
                        ×
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </RequireAuth>
  );
}
