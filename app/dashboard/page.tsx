import React from 'react'
import { getAllSheetData } from '../lib/sheetsClient'
import Card from './components/Card'

type Data = Awaited<ReturnType<typeof getAllSheetData>>

export default async function DashboardPage() {
  const data: Data = await getAllSheetData()
  const { tasks, guests, timeline, budget } = data
  const totalTasks = tasks.length
  const upcomingTasks = tasks.filter((t) => t.dueDate && new Date(t.dueDate) >= new Date()).length
  const rsvpsYes = guests.filter((g) => String(g.rsvp).toLowerCase() === 'yes').length
  const budgetEst = budget.reduce((a, b) => a + Number(b.estimated || 0), 0)
  const budgetActual = budget.reduce((a, b) => a + Number(b.actual || 0), 0)

  return (
    <section className="grid grid-4 gap-4">
      <Card title="Total Tasks" value={totalTasks} />
      <Card title="Upcoming Tasks" value={upcomingTasks} />
      <Card title="RSVPs (Yes)" value={rsvpsYes} />
      <Card title="Budget (Est vs Actual)" value={`${budgetActual} / ${budgetEst}`} />

      <div className="card" style={{ gridColumn: 'span 2' }}>
        <h3 className="text-lg font-semibold mb-2">Upcoming Timeline</h3>
        <ul className="text-sm">
          {timeline.slice(0, 5).map((e) => (
            <li key={e.id} className="mb-1">{e.date ? new Date(e.date).toDateString() : ''} - {e.event}</li>
          ))}
        </ul>
      </div>

      <div className="card" style={{ gridColumn: 'span 2' }}>
        <h3 className="text-lg font-semibold mb-2">Recent Tasks</h3>
        <ul className="text-sm">
          {tasks.slice(0, 5).map((t) => (
            <li key={t.id} className="mb-1">{t.title} — {t.status}</li>
          ))}
        </ul>
      </div>
    </section>
  )
}
