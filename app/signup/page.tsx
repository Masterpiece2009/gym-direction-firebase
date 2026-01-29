"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, Button, Input } from "../_ui";
import { signup } from "../_db";

export default function Signup() {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await signup(email, password, displayName);
      window.location.href = "/app";
    } catch (err: any) {
      setMsg(err.message);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-md p-6">
        <h1 className="text-2xl font-semibold">Create account</h1>
        <form className="mt-6 space-y-3" onSubmit={submit}>
          <Input placeholder="Display Name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
          <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <Button className="w-full">Sign up</Button>
          {msg && <div className="text-sm text-red-400">{msg}</div>}
        </form>
        <div className="mt-5 text-sm text-zinc-400">
          Already have an account? <Link href="/login" className="text-white underline">Log in</Link>
        </div>
      </Card>
    </main>
  );
}
