"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Card } from "../../_ui";
import { getPublicProfile } from "../../_db";

export default function PublicProfile({ params }: { params: { uid: string } }) {
  const [profile, setProfile] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const pub = await getPublicProfile(params.uid);
      if (!pub || pub.public !== true) {
        setError("This profile is private or not found.");
        return;
      }
      setProfile(pub);
    }
    load();
  }, [params.uid]);

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <Card className="w-full max-w-xl p-6">
          <h1 className="text-2xl font-semibold">Public profile</h1>
          <p className="mt-3 text-zinc-300">{error}</p>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-10">
      <div className="mx-auto max-w-4xl grid gap-4">
        <Card className="p-6 flex items-center gap-5">
          <div className="relative h-20 w-20 overflow-hidden rounded-3xl border border-zinc-800">
            <Image src={profile?.avatar ?? "/profile.jpg"} alt="Avatar" fill className="object-cover" />
          </div>
          <div>
            <div className="text-2xl font-semibold">{profile?.displayName ?? "Athlete"}</div>
            <div className="mt-2 text-sm text-zinc-400">{profile?.bio ?? ""}</div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold">Top PRs</h2>
          <div className="mt-4 grid gap-2">
            {(profile?.topPRs ?? []).map((p: any) => (
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
            {!(profile?.topPRs ?? []).length && <div className="text-sm text-zinc-400">No PRs yet.</div>}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold">Program</h2>
          <div className="mt-4 grid gap-3">
            {(profile?.programSummary ?? []).map((d: any) => (
              <div key={d.weekday} className="rounded-2xl border border-zinc-800 bg-zinc-950/30 p-4">
                <div className="font-medium">{d.title}</div>
                <ul className="mt-2 text-sm text-zinc-400 space-y-1">
                  {(d.exercises ?? []).map((ex: any, i: number) => (
                    <li key={i}>• {ex.name} {ex.sets ? `(${ex.sets} sets)` : ""} {ex.reps ? `× ${ex.reps}` : ""}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </main>
  );
}
