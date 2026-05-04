import React from 'react'
import { getAllSheetData } from '../../lib/sheetsClient'

type Data = Awaited<ReturnType<typeof getAllSheetData>>

export default async function TimelinePage() {
  const data: Data = await getAllSheetData()
  const items = data.timeline
  return (
    <section>
      <h1 className="text-2xl mb-4">Timeline</h1>
      <ul className="card list-none p-0">{
        items.map((ev) => (
          <li key={ev.id} className="mb-2 pl-4 flex items-center gap-2">
            <span style={{ width: 8, height: 8, borderRadius: 9999, background: 'var(--color-accent)' }} />
            <span>
              <strong>{ev.event}</strong> — {ev.date ? new Date(ev.date).toDateString() : ''}
              {ev.location ? ` @ ${ev.location}` : ''}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}
