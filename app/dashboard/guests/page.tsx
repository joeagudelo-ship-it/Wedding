import React from 'react'
import { getAllSheetData } from '../../lib/sheetsClient'

export const dynamic = 'force-dynamic'

type Data = Awaited<ReturnType<typeof getAllSheetData>>

export default async function GuestsPage() {
  const data: Data = await getAllSheetData()
  const guests = data.guests

  const groomSide = guests.filter(g => g.side === 'Groom').length
  const brideSide = guests.filter(g => g.side === 'Bride').length
  const friendsSide = guests.filter(g => g.side === 'Friends').length

  return (
    <div className="fade-in space-y-6">
      <div>
        <h1 className="font-display" style={{ fontSize: 36, color: 'var(--primary)', marginBottom: 4 }}>Guest List</h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Manage invitations, RSVPs, and seating</p>
      </div>

      <div className="grid-4">
        <div className="card card-glow">
          <div className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Total Guests</div>
          <div className="text-2xl font-semibold">{guests.length}</div>
        </div>
        <div className="card" style={{ borderTop: '3px solid var(--primary)' }}>
          <div className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Groom Side</div>
          <div className="text-2xl font-semibold" style={{ color: 'var(--primary)' }}>{groomSide}</div>
        </div>
        <div className="card" style={{ borderTop: '3px solid var(--info)' }}>
          <div className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Bride Side</div>
          <div className="text-2xl font-semibold" style={{ color: 'var(--info)' }}>{brideSide}</div>
        </div>
        <div className="card" style={{ borderTop: '3px solid var(--secondary)' }}>
          <div className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Friends</div>
          <div className="text-2xl font-semibold" style={{ color: 'var(--secondary)' }}>{friendsSide}</div>
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead><tr><th>#</th><th>Guest Name</th><th>Side</th><th>Role</th><th>RSVP</th><th>Pax</th></tr></thead>
          <tbody>
            {guests.map((g, i) => (
              <tr key={i}>
                <td className="text-sm" style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                <td className="font-medium text-sm" style={{ color: 'var(--text-body)' }}>{g.name}</td>
                <td>
                  <span className="badge" style={{
                    background: g.side === 'Groom' ? 'var(--primary-soft)' : g.side === 'Bride' ? 'var(--info-soft)' : 'var(--bg-alt)',
                    color: g.side === 'Groom' ? 'var(--primary-hover)' : g.side === 'Bride' ? '#115E59' : 'var(--text-muted)'
                  }}>{g.side}</span>
                </td>
                <td className="text-sm">{g.role || '—'}</td>
                <td className="text-sm">{g.rsvpStatus || '—'}</td>
                <td className="text-sm">{g.pax || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
