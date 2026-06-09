"use client"
import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ConnectButton } from "@rainbow-me/rainbowkit"

export function Nav() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  const links = [
    { href: "/", label: "Dashboard" },
    { href: "/pool", label: "Pool" },
  ]

  return (
    <nav className=" border-b border-[#1e2832] bg-[#080b0f] mb-20 pb-10">
      <div className="container flex items-center justify-between px-4 py-4 md:px-10">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 md:w-9 md:h-9 bg-[#00e5a0] rounded-xl flex items-center justify-center text-lg">
            🪂
          </div>
          <span className="text-xl md:text-2xl font-black tracking-tight">
            <span className="text-white">Para</span>
            <span className="text-[#00e5a0]">chute</span>
          </span>
        </div>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-semibold tracking-wide transition-colors ${
                pathname === link.href ? "text-white" : "text-[#5a7080] hover:text-[#a0b4c0]"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop connect button */}
        <div className="hidden md:block">
          <ConnectButton />
        </div>

        {/* Mobile: connect + hamburger */}
        <div className="flex items-center gap-3 md:hidden">
          <ConnectButton />
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex flex-col gap-1.5 p-2"
            aria-label="Toggle menu"
          >
            <span className={`block w-5 h-0.5 bg-white transition-all ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
            <span className={`block w-5 h-0.5 bg-white transition-all ${menuOpen ? "opacity-0" : ""}`} />
            <span className={`block w-5 h-0.5 bg-white transition-all ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-[#1e2832] bg-[#0d1117] px-4 py-4 flex flex-col gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className={`px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                pathname === link.href
                  ? "bg-[#131920] text-white"
                  : "text-[#5a7080] hover:text-white hover:bg-[#131920]"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}