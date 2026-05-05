import React from 'react'
import { getAllSheetData } from '../lib/sheetsClient'
import StatusBadge from './components/StatusBadge'

export const dynamic = 'force-dynamic'

type Data = Awaited<ReturnType<typeof getAllSheetData>>

function CheckIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
}

function ClipboardIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/></svg>
}

function UsersIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
}

function HeartIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
}

function MetricCard({ title, value, subtitle, icon, accent }: { title: string; value: string; subtitle?: string; icon: React.ReactNode; accent?: string }) {
  return (
    <div className="card" style={{ borderTop: `2px solid ${accent || 'var(--sakura-red)'}` }}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs uppercase tracking-wider" style={{ color: 'var(--brown-muted)', letterSpacing: '0.08em' }}>{title}</span>
        <span style={{ color: accent || 'var(--sakura-red)' }}>{icon}</span>
      </div>
      <div className="text-xl font-semibold peso" style={{ color: 'var(--brown-deep)', fontFamily: "'Zen Maru Gothic', sans-serif" }}>{value}</div>
      {subtitle && <div className="text-xs mt-1" style={{ color: 'var(--brown-muted)' }}>{subtitle}</div>}
    </div>
  )
}

export default async function DashboardPage() {
  const data: Data = await getAllSheetData()
  const { overview, entourage, checklist, sponsors } = data

  const details = Object.fromEntries(overview.map(e => [e.key, e.value]))
  const doneCount = checklist.filter(c => c.status.includes('Done')).length
  const pendingCount = checklist.length - doneCount
  const confirmedPax = details['Confirmed Guests'] || details['Target Guests'] || ''
  const pct = checklist.length ? Math.round((doneCount / checklist.length) * 100) : 0

  return (
    <div className="fade-in space-y-6">
      <div className="page-hero">
        <h1>Wedding Tracker</h1>
        <p>April 8, 2027 &middot; Saint Paul of the Cross &amp; Water Nymph Resort</p>
      </div>

      <div className="grid-4">
        <MetricCard title="Checklist" value={`${doneCount}/${checklist.length}`} subtitle={`${pendingCount} remaining &middot; ${pct}%`} icon={<CheckIcon />} />
        <MetricCard title="Suppliers" value={`${data.suppliers.length}`} subtitle={`${data.suppliers.filter(s => s.paid === 'Sponsored').length} sponsored`} icon={<ClipboardIcon />} accent="var(--warning)" />
        <MetricCard title="Guests" value={confirmedPax} subtitle="confirmed pax" icon={<UsersIcon />} accent="var(--info)" />
        <MetricCard title="Sponsors" value={`${sponsors.length}`} subtitle={`${sponsors.filter(s => s.role === 'Ninong').length} Ninongs, ${sponsors.filter(s => s.role === 'Ninang').length} Ninangs`} icon={<HeartIcon />} accent="var(--sakura)" />
      </div>

      <div className="grid-2">
        <div className="card-elevated">
          <h3 className="text-sm uppercase tracking-wider mb-4" style={{ color: 'var(--brown-muted)', letterSpacing: '0.08em', fontFamily: "'Zen Maru Gothic', sans-serif", fontWeight: 500 }}>Wedding Details</h3>
          <div className="space-y-1.5">
            {overview.filter(e => !['Theme', 'Groom', 'Bride', 'Target Guests', 'Confirmed Guests'].includes(e.key)).map(entry => (
              <div key={entry.key} className="flex justify-between items-center py-2.5 px-3 rounded" style={{ background: 'var(--sakura-ultra)' }}>
                <span className="text-xs uppercase tracking-wider" style={{ color: 'var(--brown-muted)', letterSpacing: '0.06em' }}>{entry.key}</span>
                <span className="text-sm font-medium" style={{ color: 'var(--brown-deep)' }}>{entry.value || '—'}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card-elevated">
          <h3 className="text-sm uppercase tracking-wider mb-4" style={{ color: 'var(--brown-muted)', letterSpacing: '0.08em', fontFamily: "'Zen Maru Gothic', sans-serif", fontWeight: 500 }}>Entourage</h3>
          <div className="space-y-1 max-h-72 overflow-y-auto">
            {entourage.map((member, i) => (
              <div key={i} className="flex justify-between items-center py-2 px-3 rounded" style={{ background: 'var(--sakura-ultra)' }}>
                <span className="text-sm font-medium" style={{ color: 'var(--brown-deep)' }}>{member.name}</span>
                <span className="badge badge-neutral">{member.role}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card-elevated">
        <h3 className="text-sm uppercase tracking-wider mb-4" style={{ color: 'var(--brown-muted)', letterSpacing: '0.08em', fontFamily: "'Zen Maru Gothic', sans-serif", fontWeight: 500 }}>Checklist</h3>
        <div className="table-container">
          <table>
            <thead><tr><th>Timeframe</th><th>Task</th><th>Status</th><th>Notes</th></tr></thead>
            <tbody>
              {checklist.slice(0, 10).map((item, i) => (
                <tr key={i}>
                  <td className="text-xs uppercase tracking-wider" style={{ color: 'var(--brown-muted)' }}>{item.timeframe}</td>
                  <td className="text-sm font-medium" style={{ color: 'var(--brown-deep)' }}>{item.task}</td>
                  <td><StatusBadge status={item.status} /></td>
                  <td className="text-sm max-w-xs truncate" style={{ color: 'var(--brown-muted)' }}>{item.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
