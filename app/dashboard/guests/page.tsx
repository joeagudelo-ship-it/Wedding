import React from 'react'
import { getAllSheetData } from '../../lib/sheetsClient'

type Data = Awaited<ReturnType<typeof getAllSheetData>>

export default async function GuestsPage() {
  const data: Data = await getAllSheetData()
  const guests = data.guests
  return (
    <section>
      <h1 className="text-2xl mb-4">Guests</h1>
      <table className="card w-full border-collapse">
        <thead>
          <tr>
            <th className="border p-2 text-left">Name</th>
            <th className="border p-2">RSVP</th>
            <th className="border p-2">Plus One</th>
            <th className="border p-2">Dietary</th>
          </tr>
        </thead>
        <tbody>
          {guests.map((g) => (
            <tr key={g.id}>
              <td className="border p-2">{g.name}</td>
              <td className="border p-2">{g.rsvp}</td>
              <td className="border p-2">{g.plusOne || ''}</td>
              <td className="border p-2">{g.dietary || ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}
