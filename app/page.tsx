import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-3xl rounded-3xl border border-zinc-800 bg-zinc-900/30 shadow-soft p-8">
        <h1 className="text-4xl font-semibold tracking-tight">Gym Direction</h1>
        <p className="mt-3 text-zinc-300 leading-relaxed">
          Program Builder + Training Tracker + PRs (best set & best volume) + Calendar + Shareable Public Profile.
        </p>
        <div className="mt-6 flex gap-3">
          <Link href="/signup" className="rounded-2xl bg-white text-zinc-900 px-5 py-3 font-medium hover:opacity-90">
            Create account
          </Link>
          <Link href="/login" className="rounded-2xl border border-zinc-700 px-5 py-3 font-medium hover:bg-zinc-900">
            Log in
          </Link>
        </div>
        <p className="mt-8 text-xs text-zinc-500">Next.js + Firebase. Deploy to Vercel from GitHub.</p>
      </div>
    </main>
  );
}
