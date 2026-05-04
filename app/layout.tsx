import React from 'react'
import './globals.css'
import Link from 'next/link'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="bg-header p-4 shadow-md">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-primary inline-block" />
              <span className="text-xl font-semibold">Wedding Tracker</span>
            </div>
            <nav className="hidden md:flex space-x-6 text-sm">
              <Link href="/dashboard" className="hover:underline">Dashboard</Link>
              <Link href="/dashboard/tasks" className="hover:underline">Tasks</Link>
              <Link href="/dashboard/guests" className="hover:underline">Guests</Link>
              <Link href="/dashboard/timeline" className="hover:underline">Timeline</Link>
              <Link href="/dashboard/budget" className="hover:underline">Budget</Link>
              <Link href="/dashboard/vendors" className="hover:underline">Vendors</Link>
            </nav>
          </div>
        </header>
        <main className="p-4 container mx-auto">{children}</main>
      </body>
    </html>
  )
}
