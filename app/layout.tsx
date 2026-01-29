import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gym Direction",
  description: "Program builder + training tracker + PRs"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
