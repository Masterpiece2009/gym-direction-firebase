"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, Button, Input } from "../_ui";
import { login } from "../_db";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await login(email, password);
      window.location.href = "/app";
    } catch (err: any) {
      setMsg(err.message);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-md p-6">
        <h1 className="text-2xl font-semibold">Log in</h1>
        <form className="mt-6 space-y-3" onSubmit={submit}>
          <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <Button className="w-full">Log in</Button>
          {msg && <div className="text-sm text-red-400">{msg}</div>}
        </form>
        <div className="mt-5 text-sm text-zinc-400">
          New here? <Link href="/signup" className="text-white underline">Create account</Link>
        </div>
      </Card>
    </main>
  );
}
