'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ThemeToggle } from './ThemeProvider'

export function Header({ navLinks }: { navLinks: { href: string; label: string }[] }) {
  const pathname = usePathname()

  return (
    <header className="bg-header sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-3 no-underline focus-ring" style={{ borderRadius: 6 }}>
          <span className="w-8 h-8 rounded-full inline-flex items-center justify-center text-white text-xs font-semibold" style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))' }}>W</span>
          <span className="text-lg font-display" style={{ fontSize: 20, color: 'var(--text)', letterSpacing: '0.02em' }}>Wedding Tracker</span>
        </Link>
        <div className="flex items-center gap-2">
          <nav className="hidden md:flex items-center gap-0.5">
            {navLinks.map(link => (
              <Link key={link.href} href={link.href} className="nav-link" style={pathname === link.href ? { color: 'var(--accent)', background: 'var(--accent-soft)' } : undefined}>{link.label}</Link>
            ))}
          </nav>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
