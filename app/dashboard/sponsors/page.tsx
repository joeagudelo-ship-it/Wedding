import React from 'react'
import { getAllSheetData } from '../../lib/sheetsClient'

export const dynamic = 'force-dynamic'

type Data = Awaited<ReturnType<typeof getAllSheetData>>

export default async function SponsorsPage() {
  const data: Data = await getAllSheetData()
  const sponsors = data.sponsors

  const groomSponsors = sponsors.filter(s => s.side === 'Groom')
  const brideSponsors = sponsors.filter(s => s.side === 'Bride')
  const ninongs = sponsors.filter(s => s.role === 'Ninong')
  const ninangs = sponsors.filter(s => s.role === 'Ninang')

  return (
    <div className="fade-in space-y-6">
      <div>
        <h1 className="font-display" style={{ fontSize: 36, color: 'var(--primary)', marginBottom: 4 }}>Principal Sponsors</h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Ninongs and Ninangs for the wedding ceremony</p>
      </div>

      <div className="grid-3">
        <div className="card card-glow">
          <div className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Total Sponsors</div>
          <div className="text-2xl font-semibold">{sponsors.length}</div>
        </div>
        <div className="card" style={{ borderTop: '3px solid var(--primary)' }}>
          <div className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Ninongs</div>
          <div className="text-2xl font-semibold" style={{ color: 'var(--primary)' }}>{ninongs.length}</div>
        </div>
        <div className="card" style={{ borderTop: '3px solid var(--info)' }}>
          <div className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Ninangs</div>
          <div className="text-2xl font-semibold" style={{ color: 'var(--info)' }}>{ninangs.length}</div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card-elevated">
          <h3 className="text-base font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text)' }}>
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: 'var(--primary)' }} />
            Groom Side ({groomSponsors.length})
          </h3>
          <div className="space-y-2">
            {groomSponsors.map((s, i) => (
              <div key={i} className="flex items-center justify-between py-2.5 px-3 rounded-lg" style={{ background: 'var(--bg-alt)' }}>
                <span className="text-sm font-medium" style={{ color: 'var(--text-body)' }}>{s.name}</span>
                <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{
                  background: s.role === 'Ninong' ? 'var(--primary-soft)' : 'var(--info-soft)',
                  color: s.role === 'Ninong' ? 'var(--primary-hover)' : '#115E59'
                }}>{s.role}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card-elevated">
          <h3 className="text-base font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text)' }}>
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: 'var(--info)' }} />
            Bride Side ({brideSponsors.length})
          </h3>
          <div className="space-y-2">
            {brideSponsors.map((s, i) => (
              <div key={i} className="flex items-center justify-between py-2.5 px-3 rounded-lg" style={{ background: 'var(--bg-alt)' }}>
                <span className="text-sm font-medium" style={{ color: 'var(--text-body)' }}>{s.name}</span>
                <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{
                  background: s.role === 'Ninong' ? 'var(--primary-soft)' : 'var(--info-soft)',
                  color: s.role === 'Ninong' ? 'var(--primary-hover)' : '#115E59'
                }}>{s.role}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
