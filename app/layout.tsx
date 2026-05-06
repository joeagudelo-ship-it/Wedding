import React from 'react'
import './globals.css'
import Link from 'next/link'
import { CherryBlossomsBackground } from './components/CherryBlossomsBackground'
import { ThemeProvider } from './components/ThemeProvider'
import { Header } from './components/Header'

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
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              try {
                var stored = localStorage.getItem('wedding-theme');
                if (stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.setAttribute('data-theme', 'dark');
                }
              } catch(e) {}
            })();
          `
        }} />
      </head>
      <body suppressHydrationWarning>
        <ThemeProvider>
          <CherryBlossomsBackground />
          <Header navLinks={navLinks} />
          <main className="max-w-6xl mx-auto px-4 py-6 min-h-dvh">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  )
}
