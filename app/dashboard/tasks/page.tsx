import React from 'react'
import { getAllSheetData } from '../../lib/sheetsClient'

type Data = Awaited<ReturnType<typeof getAllSheetData>>

export default async function TasksPage() {
  const data: Data = await getAllSheetData()
  const tasks = data.tasks
  return (
    <section>
      <h1 className="text-2xl mb-4">Tasks</h1>
      <table className="card w-full border-collapse">
        <thead>
          <tr>
            <th className="border p-2 text-left">Title</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Due</th>
            <th className="border p-2">Assignee</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((t) => (
            <tr key={t.id}>
              <td className="border p-2">{t.title}</td>
              <td className="border p-2">{t.status}</td>
              <td className="border p-2">{t.dueDate ? new Date(t.dueDate).toLocaleDateString() : ''}</td>
              <td className="border p-2">{t.assignee}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}
