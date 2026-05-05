import React from 'react'
import './globals.css'
import Link from 'next/link'
import { CherryBlossomsBackground } from './components/CherryBlossomsBackground'

const navLinks = [
  { href: '/dashboard', label: 'Overview' },
  { href: '/dashboard/timeline', label: 'Timeline' },
  { href: '/dashboard/vendors', label: 'Suppliers' },
  { href: '/dashboard/budget', label: 'Budget' },
  { href: '/dashboard/guests', label: 'Guests' },
  { href: '/dashboard/sponsors', label: 'Sponsors' },
  { href: '/dashboard/seating', label: 'Seating' },
]

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <CherryBlossomsBackground />
        <header className="bg-header sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-3 no-underline focus-ring" style={{ borderRadius: 6 }}>
              <span className="w-8 h-8 rounded-full inline-flex items-center justify-center text-white text-xs font-semibold" style={{ background: 'linear-gradient(135deg, var(--sakura-red), var(--sakura-red-hover))' }}>W</span>
              <span className="text-lg font-display" style={{ fontSize: 20, color: 'var(--brown-deep)', letterSpacing: '0.02em' }}>Wedding Tracker</span>
            </Link>
            <nav className="hidden md:flex items-center gap-0.5">
              {navLinks.map(link => (
                <Link key={link.href} href={link.href} className="nav-link">{link.label}</Link>
              ))}
            </nav>
          </div>
        </header>
        <main className="max-w-6xl mx-auto px-4 py-6 min-h-dvh">{children}</main>
      </body>
    </html>
  )
}
