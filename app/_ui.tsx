"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Calendar, Dumbbell, LayoutGrid, LogOut, Settings, Globe2 } from "lucide-react";
import { logout, watchAuth } from "./_db";
import type { User } from "firebase/auth";

export function cn(...x: any[]) {
  return twMerge(clsx(x));
}

export function Card(props: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={cn("rounded-3xl border border-zinc-800 bg-zinc-900/30 shadow-soft", props.className)}
    />
  );
}

export function Button({
  variant = "primary",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed";
  const variants: Record<string, string> = {
    primary: "bg-white text-zinc-900 hover:opacity-90",
    secondary: "bg-zinc-800 text-white hover:bg-zinc-700",
    ghost: "bg-transparent border border-zinc-800 text-white hover:bg-zinc-900",
    danger: "bg-red-500 text-white hover:opacity-90"
  };
  return <button {...props} className={cn(base, variants[variant], className)} />;
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "w-full rounded-2xl border border-zinc-800 bg-zinc-950/50 px-4 py-3 text-sm outline-none focus:border-zinc-600",
        props.className
      )}
    />
  );
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        "w-full min-h-[110px] rounded-2xl border border-zinc-800 bg-zinc-950/50 px-4 py-3 text-sm outline-none focus:border-zinc-600",
        props.className
      )}
    />
  );
}

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const unsub = watchAuth((u) => {
      if (!u) window.location.href = "/login";
      setReady(true);
    });
    return () => unsub();
  }, []);

  if (!ready) return <div className="min-h-screen flex items-center justify-center text-zinc-400">Loading…</div>;
  return <>{children}</>;
}

export function TopNav() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => watchAuth(setUser), []);

  const items = [
    { href: "/app", label: "Dashboard", icon: <LayoutGrid size={16} /> },
    { href: "/app/builder", label: "Builder", icon: <Settings size={16} /> },
    { href: "/app/calendar", label: "Calendar", icon: <Calendar size={16} /> }
  ];

  async function onLogout() {
    await logout();
    window.location.href = "/login";
  }

  return (
    <div className="sticky top-0 z-40 border-b border-zinc-800 bg-zinc-950/70 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between gap-4">
        <Link href="/app" className="font-semibold tracking-tight flex items-center gap-2">
          <Dumbbell size={18} /> Gym Direction
        </Link>

        <div className="flex items-center gap-2">
          {items.map((it) => {
            const active = pathname === it.href;
            return (
              <Link
                key={it.href}
                href={it.href}
                className={cn(
                  "rounded-2xl px-3 py-2 text-sm border transition flex items-center gap-2",
                  active
                    ? "border-zinc-600 bg-zinc-900 text-white"
                    : "border-zinc-800 bg-zinc-950/30 text-zinc-300 hover:bg-zinc-900"
                )}
              >
                {it.icon} {it.label}
              </Link>
            );
          })}

          {user && (
            <Link
              href={`/u/${user.uid}`}
              className="ml-2 rounded-2xl border border-zinc-800 bg-zinc-950/30 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-900 flex items-center gap-2"
            >
              <Globe2 size={16} /> Public Profile
            </Link>
          )}

          <Button variant="ghost" onClick={onLogout}>
            <LogOut size={16} /> Logout
          </Button>
        </div>
      </div>
    </div>
  );
}
