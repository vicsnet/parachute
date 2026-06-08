import type { Metadata } from "next"
//@ts-ignore
import "./globals.css"
import { Nav } from "@/components/Nav"

export const metadata: Metadata = {
  title: "Parachute — Autonomous Crypto Crash Insurance",
  description: "Set a price floor. Pay a small premium. Get paid out automatically when the market crashes.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-[#080b0f] text-[#e8edf3] min-h-screen font-[Syne,sans-serif] my_container ">
        <Nav />
        <main className="">{children}</main>
      </body>
    </html>
  )
}
