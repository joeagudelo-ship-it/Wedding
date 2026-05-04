import React from 'react'
import { getAllSheetData } from '../../lib/sheetsClient'

type Data = Awaited<ReturnType<typeof getAllSheetData>>

export default async function VendorsPage() {
  const data: Data = await getAllSheetData()
  const vendors = data.vendors
  return (
    <section>
      <h1 className="text-2xl mb-4">Vendors</h1>
      <table className="card w-full border-collapse">
        <thead>
          <tr>
            <th className="border p-2 text-left">Name</th>
            <th className="border p-2">Category</th>
            <th className="border p-2">Contact</th>
            <th className="border p-2">Due</th>
          </tr>
        </thead>
        <tbody>
          {vendors.map((v) => (
            <tr key={v.id}>
              <td className="border p-2">{v.name}</td>
              <td className="border p-2">{v.category}</td>
              <td className="border p-2">{v.contact}</td>
              <td className="border p-2">{v.dueDate ? new Date(v.dueDate).toLocaleDateString() : ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}
