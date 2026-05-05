import React from 'react'
import { getAllSheetData } from '../../lib/sheetsClient'

export const dynamic = 'force-dynamic'

type Data = Awaited<ReturnType<typeof getAllSheetData>>

export default async function SeatingPage() {
  const data: Data = await getAllSheetData()
  const seating = data.seating

  const totalSeated = seating.reduce((sum, t) => sum + t.guests.length, 0)

  return (
    <div className="fade-in space-y-6">
      <div>
        <h1 className="font-display" style={{ fontSize: 36, color: 'var(--primary)', marginBottom: 4 }}>Seating Plan</h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>13 tables &mdash; To be arranged</p>
      </div>

      <div className="grid-2">
        <div className="card card-glow">
          <div className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Total Tables</div>
          <div className="text-2xl font-semibold">{seating.length}</div>
        </div>
        <div className="card">
          <div className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Guests Seated</div>
          <div className="text-2xl font-semibold">{totalSeated}</div>
        </div>
      </div>

      {seating.length === 0 ? (
        <div className="card-elevated empty-state">
          <svg className="empty-state-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v11a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7"/><path d="M21 7H3l2-4h14l2 4Z"/><path d="M9 20V11"/><path d="M15 20V11"/></svg>
          <h3 className="empty-state-title">Seating plan not yet arranged</h3>
          <p className="empty-state-desc">Guest assignments will appear here once the sheet is updated.</p>
        </div>
      ) : (
        <div className="grid-3">
          {seating.map(table => (
            <div key={table.tableNumber} className="card-elevated">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm" style={{ color: 'var(--text)' }}>Table {table.tableNumber}</h3>
                <span className="badge badge-neutral">{table.guests.length} guests</span>
              </div>
              {table.guests.length > 0 ? (
                <ul className="space-y-1">
                  {table.guests.map((guest, i) => (
                    <li key={i} className="text-sm" style={{ color: 'var(--text-body)' }}>{guest}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm py-2" style={{ color: 'var(--text-muted)' }}>No guests assigned yet</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
