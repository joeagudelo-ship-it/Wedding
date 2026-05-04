import React from 'react'
import { getAllSheetData } from '../../lib/sheetsClient'

type Data = Awaited<ReturnType<typeof getAllSheetData>>

export default async function BudgetPage() {
  const data: Data = await getAllSheetData()
  const budget = data.budget
  const est = budget.reduce((a, b) => a + Number(b.estimated || 0), 0)
  const actual = budget.reduce((a, b) => a + Number(b.actual || 0), 0)
  const remaining = est - actual
  return (
    <section>
      <h1 className="text-2xl mb-4">Budget</h1>
      <div className="grid grid-2 gap-4 mb-4">
        <div className="card">
          <div className="text-sm text-gray-600">Estimated</div>
          <div className="text-xl font-semibold">{est}</div>
        </div>
        <div className="card">
          <div className="text-sm text-gray-600">Actual</div>
          <div className="text-xl font-semibold">{actual}</div>
        </div>
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <div className="text-sm text-gray-600">Remaining</div>
          <div className="text-xl font-semibold">{remaining}</div>
        </div>
      </div>
      <table className="card w-full border-collapse">
        <thead>
          <tr>
            <th className="border p-2 text-left">Item</th>
            <th className="border p-2">Category</th>
            <th className="border p-2">Est</th>
            <th className="border p-2">Actual</th>
          </tr>
        </thead>
        <tbody>
          {budget.map((b) => (
            <tr key={b.id}>
              <td className="border p-2">{b.item}</td>
              <td className="border p-2">{b.category}</td>
              <td className="border p-2">{b.estimated}</td>
              <td className="border p-2">{b.actual}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}
