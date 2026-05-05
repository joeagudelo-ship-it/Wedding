import React from 'react'
import { getAllSheetData } from '../../lib/sheetsClient'
import StatusBadge from '../components/StatusBadge'

export const dynamic = 'force-dynamic'

type Data = Awaited<ReturnType<typeof getAllSheetData>>

export default async function TimelinePage() {
  const data: Data = await getAllSheetData()
  const items = data.checklist

  const grouped = items.reduce<Record<string, typeof items>>((acc, item) => {
    if (!acc[item.timeframe]) acc[item.timeframe] = []
    acc[item.timeframe].push(item)
    return acc
  }, {})

  const timeframeOrder = ['11–14 months out', '9–11 months out', '6–9 months out', '3–6 months out', '1–3 months out', '1–4 weeks out', '1–7 days out', 'Wedding day']
  const sortedTimeframes = timeframeOrder.filter(tf => grouped[tf])

  const done = items.filter(i => i.status.includes('Done')).length
  const pending = items.length - done
  const pct = items.length ? Math.round((done / items.length) * 100) : 0

  return (
    <div className="fade-in space-y-6">
      <div className="page-hero">
        <h1>Timeline & Checklist</h1>
        <p>Track progress from planning to wedding day</p>
      </div>

      <div className="grid-3">
        <div className="card" style={{ borderTop: '2px solid var(--success)' }}>
          <div className="text-xs uppercase tracking-wider" style={{ color: 'var(--brown-muted)', letterSpacing: '0.08em' }}>Completed</div>
          <div className="text-xl font-semibold" style={{ color: 'var(--success)' }}>{done}</div>
        </div>
        <div className="card" style={{ borderTop: '2px solid var(--warning)' }}>
          <div className="text-xs uppercase tracking-wider" style={{ color: 'var(--brown-muted)', letterSpacing: '0.08em' }}>Pending</div>
          <div className="text-xl font-semibold" style={{ color: 'var(--warning)' }}>{pending}</div>
        </div>
        <div className="card">
          <div className="text-xs uppercase tracking-wider" style={{ color: 'var(--brown-muted)', letterSpacing: '0.08em' }}>Progress</div>
          <div className="text-xl font-semibold">{pct}%</div>
          <div className="progress-bar-bg mt-2"><div className="progress-bar-fill" style={{ width: `${pct}%` }} /></div>
        </div>
      </div>

      <div className="space-y-6">
        {sortedTimeframes.map(timeframe => (
          <div key={timeframe} className="card-elevated">
            <h3 className="text-sm uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: 'var(--brown-deep)', letterSpacing: '0.06em' }}>
              <span className="w-2 h-2 rounded-full" style={{ background: 'var(--sakura-red)' }} />
              {timeframe}
              <span className="text-xs font-normal" style={{ color: 'var(--brown-muted)' }}>
                ({grouped[timeframe].filter(i => i.status.includes('Done')).length}/{grouped[timeframe].length})
              </span>
            </h3>
            <div className="table-container">
              <table>
                <thead><tr><th>Task</th><th>Status</th><th>Notes</th></tr></thead>
                <tbody>
                  {grouped[timeframe].map((item, i) => (
                    <tr key={i}>
                      <td className="text-sm font-medium" style={{ color: 'var(--brown-deep)' }}>{item.task}</td>
                      <td><StatusBadge status={item.status} /></td>
                      <td className="text-sm max-w-xs truncate" style={{ color: 'var(--brown-muted)' }}>{item.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
