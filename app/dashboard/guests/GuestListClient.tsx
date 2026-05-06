'use client'

import React, { useState, useCallback } from 'react'
import { useToast } from '../../components/ToastProvider'

type Guest = { name: string; side: string; role: string; contactNo: string; invitationSent: string; rsvpStatus: string; pax: string; notes: string }

function StatusBadge({ status, variant }: { status: string; variant?: 'side' | 'rsvp' }) {
  if (variant === 'side') {
    if (status.toLowerCase().includes('groom')) return <span className="badge badge-neutral">{status}</span>
    if (status.toLowerCase().includes('bride')) return <span className="badge badge-info">{status}</span>
    return <span className="badge badge-warning">{status}</span>
  }
  if (status.toLowerCase().includes('confirm')) return <span className="badge badge-success">{status}</span>
  if (status.toLowerCase().includes('declin')) return <span className="badge badge-danger">{status}</span>
  if (status.toLowerCase().includes('pending') || status.toLowerCase().includes('awaiting')) return <span className="badge badge-warning">{status}</span>
  if (status.toLowerCase().includes('yes')) return <span className="badge badge-success">{status}</span>
  return <span className="badge badge-neutral">{status}</span>
}

function GuestRow({ guest, rowIndex, onUpdate }: { guest: Guest; rowIndex: number; onUpdate: () => void }) {
  const { addToast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [data, setData] = useState(guest)
  const [loading, setLoading] = useState(false)

  const save = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/guests', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rowIndex, ...data }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to update')
      addToast('Guest updated')
      setIsEditing(false)
      onUpdate()
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Failed to update', 'error')
    } finally { setLoading(false) }
  }

  const remove = async () => {
    if (!confirm(`Remove ${guest.name}?`)) return
    setLoading(true)
    try {
      const res = await fetch('/api/guests', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rowIndex }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to delete')
      addToast('Guest removed')
      onUpdate()
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Failed to delete', 'error')
    } finally { setLoading(false) }
  }

  const quickRSVP = async (status: string) => {
    setLoading(true)
    try {
      const res = await fetch('/api/guests', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rowIndex, rsvpStatus: status }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to update')
      addToast(`RSVP updated to ${status}`)
      onUpdate()
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Failed to update', 'error')
    } finally { setLoading(false) }
  }

  const cancel = () => { setData(guest); setIsEditing(false) }

  if (isEditing) {
    return (
      <tr>
        <td className="text-sm font-medium"><input className="input-field" value={data.name} onChange={e => setData(d => ({ ...d, name: e.target.value }))} style={{ width: 130 }} /></td>
        <td>
          <select className="input-field" value={data.side} onChange={e => setData(d => ({ ...d, side: e.target.value }))} style={{ width: 85 }}>
            <option value="">—</option><option value="Groom">Groom</option><option value="Bride">Bride</option><option value="Friends">Friends</option>
          </select>
        </td>
        <td><input className="input-field" value={data.role} onChange={e => setData(d => ({ ...d, role: e.target.value }))} placeholder="Role" style={{ width: 80 }} /></td>
        <td><input className="input-field" value={data.contactNo} onChange={e => setData(d => ({ ...d, contactNo: e.target.value }))} style={{ width: 100 }} /></td>
        <td>
          <select className="input-field" value={data.invitationSent} onChange={e => setData(d => ({ ...d, invitationSent: e.target.value }))} style={{ width: 85 }}>
            <option value="">—</option><option value="Yes">Yes</option><option value="No">No</option>
          </select>
        </td>
        <td>
          <select className="input-field" value={data.rsvpStatus} onChange={e => setData(d => ({ ...d, rsvpStatus: e.target.value }))} style={{ width: 100 }}>
            <option value="">—</option><option value="Confirmed">Confirmed</option><option value="Pending">Pending</option><option value="Declined">Declined</option><option value="Awaiting">Awaiting</option>
          </select>
        </td>
        <td><input className="input-field" type="number" value={data.pax || '1'} onChange={e => setData(d => ({ ...d, pax: e.target.value }))} style={{ width: 50, textAlign: 'center' }} /></td>
        <td><input className="input-field" value={data.notes} onChange={e => setData(d => ({ ...d, notes: e.target.value }))} style={{ width: 120 }} /></td>
        <td>
          <div className="flex gap-1">
            <button className="btn btn-primary" onClick={save} disabled={loading} style={{ padding: '4px 8px', fontSize: 11 }}>Save</button>
            <button className="btn btn-secondary" onClick={cancel} disabled={loading} style={{ padding: '4px 8px', fontSize: 11 }}>Cancel</button>
          </div>
        </td>
      </tr>
    )
  }

  return (
    <tr style={{ opacity: loading ? 0.5 : 1 }}>
      <td className="text-sm font-medium" style={{ color: 'var(--brown-deep)' }} title={guest.name}>
        <span className="truncate block" style={{ maxWidth: 140 }}>{guest.name}</span>
      </td>
      <td><StatusBadge status={guest.side} variant="side" /></td>
      <td className="text-sm" style={{ color: 'var(--brown-muted)' }}>{guest.role}</td>
      <td className="text-sm">{guest.contactNo}</td>
      <td>{guest.invitationSent === 'Yes' ? <span className="badge badge-success">Sent</span> : guest.invitationSent === 'No' ? <span className="badge badge-warning">Not sent</span> : <span className="badge badge-neutral">{guest.invitationSent || '—'}</span>}</td>
      <td><StatusBadge status={guest.rsvpStatus} variant="rsvp" /></td>
      <td className="text-sm text-center">{guest.pax || '1'}</td>
      <td className="text-sm max-w-xs truncate" style={{ color: 'var(--brown-muted)' }}>{guest.notes}</td>
      <td>
        <div className="flex gap-1">
          <button className="btn btn-secondary" onClick={() => setIsEditing(true)} disabled={loading} style={{ padding: '4px 8px', fontSize: 11 }} title="Edit">Edit</button>
          <button className="btn" onClick={() => quickRSVP('Confirmed')} disabled={loading} style={{ padding: '4px 8px', fontSize: 11, background: 'var(--success-soft)', color: 'var(--success)' }} title="Quick confirm">✓</button>
          <button className="btn" onClick={() => quickRSVP('Declined')} disabled={loading} style={{ padding: '4px 8px', fontSize: 11, background: 'var(--danger-soft)', color: 'var(--danger)' }} title="Quick decline">✕</button>
          <button className="btn" onClick={remove} disabled={loading} style={{ padding: '4px 8px', fontSize: 12, color: 'var(--danger)', background: 'var(--danger-soft)' }} title="Delete">×</button>
        </div>
      </td>
    </tr>
  )
}

function AddGuestForm({ onAdd }: { onAdd: () => void }) {
  const { addToast } = useToast()
  const [data, setData] = useState({ name: '', side: 'Groom', role: '', contactNo: '', invitationSent: 'No', rsvpStatus: 'Pending', pax: '1', notes: '' })
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!data.name.trim()) return
    setLoading(true)
    try {
      const res = await fetch('/api/guests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to add')
      addToast('Guest added')
      setData({ name: '', side: 'Groom', role: '', contactNo: '', invitationSent: 'No', rsvpStatus: 'Pending', pax: '1', notes: '' })
      onAdd()
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Failed to add guest', 'error')
    } finally { setLoading(false) }
  }

  return (
    <form onSubmit={submit} className="flex gap-2 items-end flex-wrap" style={{ marginBottom: 16 }}>
      <div style={{ flex: 1, minWidth: 160 }}>
        <label className="text-xs uppercase tracking-wider" style={{ color: 'var(--brown-muted)', letterSpacing: '0.06em', display: 'block', marginBottom: 4 }}>Name</label>
        <input className="input-field" value={data.name} onChange={e => setData(d => ({ ...d, name: e.target.value }))} placeholder="Guest name..." />
      </div>
      <div>
        <label className="text-xs uppercase tracking-wider" style={{ color: 'var(--brown-muted)', letterSpacing: '0.06em', display: 'block', marginBottom: 4 }}>Side</label>
        <select className="input-field" value={data.side} onChange={e => setData(d => ({ ...d, side: e.target.value }))} style={{ width: 100 }}>
          <option value="Groom">Groom</option><option value="Bride">Bride</option><option value="Friends">Friends</option>
        </select>
      </div>
      <div>
        <label className="text-xs uppercase tracking-wider" style={{ color: 'var(--brown-muted)', letterSpacing: '0.06em', display: 'block', marginBottom: 4 }}>Pax</label>
        <input className="input-field" type="number" value={data.pax} onChange={e => setData(d => ({ ...d, pax: e.target.value }))} style={{ width: 60, textAlign: 'center' }} />
      </div>
      <button className="btn btn-primary" disabled={loading || !data.name.trim()} style={{ height: 36 }}>{loading ? 'Adding...' : 'Add Guest'}</button>
    </form>
  )
}

export default function GuestListClient({ guests }: { guests: Guest[] }) {
  const { addToast } = useToast()
  const [data, setData] = useState(guests)
  const [search, setSearch] = useState('')
  const [filterSide, setFilterSide] = useState('All')
  const [filterRSVP, setFilterRSVP] = useState('All')
  const [loading, setLoading] = useState(false)

    const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/guests')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      setData(json.guests || [])
    } catch (error) {
      addToast('Failed to load guests', 'error')
    }
    finally { setLoading(false) }
  }, [])

  let filtered = data
  if (search) filtered = filtered.filter(g => g.name.toLowerCase().includes(search.toLowerCase()) || g.notes.toLowerCase().includes(search.toLowerCase()))
  if (filterSide !== 'All') filtered = filtered.filter(g => g.side === filterSide)
  if (filterRSVP !== 'All') filtered = filtered.filter(g => {
    if (filterRSVP === 'Confirmed') return g.rsvpStatus.toLowerCase().includes('confirm') || g.rsvpStatus.toLowerCase() === 'yes'
    if (filterRSVP === 'Pending') return g.rsvpStatus.toLowerCase().includes('pending') || g.rsvpStatus.toLowerCase().includes('await')
    if (filterRSVP === 'Declined') return g.rsvpStatus.toLowerCase().includes('declin')
    return true
  })

  const totalPax = data.reduce((sum, g) => sum + (parseInt(g.pax) || 1), 0)
  const groomCount = data.filter(g => g.side.toLowerCase().includes('groom')).length
  const brideCount = data.filter(g => g.side.toLowerCase().includes('bride')).length
  const friendsCount = data.filter(g => g.side.toLowerCase().includes('friend')).length

  return (
    <div className="fade-in space-y-6">
      <div className="page-hero">
        <h1>Guest List</h1>
        <p>Manage invitations, RSVPs, and seating</p>
      </div>

      <div className="grid-4">
        <div className="card card-glow card-accent">
          <div className="text-xs uppercase tracking-wider" style={{ color: 'var(--brown-muted)', letterSpacing: '0.08em' }}>Total Guests</div>
          <div className="text-lg font-semibold" style={{ color: 'var(--brown-deep)' }}>{data.length}</div>
          <div className="text-xs mt-1" style={{ color: 'var(--brown-muted)' }}>{totalPax} pax</div>
        </div>
        <div className="card" style={{ borderTop: '2px solid var(--sakura-red)' }}>
          <div className="text-xs uppercase tracking-wider" style={{ color: 'var(--brown-muted)', letterSpacing: '0.08em' }}>Groom Side</div>
          <div className="text-lg font-semibold">{groomCount}</div>
        </div>
        <div className="card" style={{ borderTop: '2px solid var(--info)' }}>
          <div className="text-xs uppercase tracking-wider" style={{ color: 'var(--brown-muted)', letterSpacing: '0.08em' }}>Bride Side</div>
          <div className="text-lg font-semibold">{brideCount}</div>
        </div>
        <div className="card" style={{ borderTop: '2px solid var(--warning)' }}>
          <div className="text-xs uppercase tracking-wider" style={{ color: 'var(--brown-muted)', letterSpacing: '0.08em' }}>Friends</div>
          <div className="text-lg font-semibold">{friendsCount}</div>
        </div>
      </div>

      <div className="card-elevated">
        <h3 className="text-sm uppercase tracking-wider mb-3" style={{ color: 'var(--brown-deep)', letterSpacing: '0.06em' }}>Add Guest</h3>
        <AddGuestForm onAdd={fetchData} />
      </div>

      <div className="card-elevated">
        <div className="flex gap-3 items-center mb-4 flex-wrap">
          <input className="input-field" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search guests..." style={{ width: 200 }} />
          <select className="input-field" value={filterSide} onChange={e => setFilterSide(e.target.value)} style={{ width: 110 }}>
            <option value="All">All Sides</option><option value="Groom">Groom</option><option value="Bride">Bride</option><option value="Friends">Friends</option>
          </select>
          <select className="input-field" value={filterRSVP} onChange={e => setFilterRSVP(e.target.value)} style={{ width: 120 }}>
            <option value="All">All RSVP</option><option value="Confirmed">Confirmed</option><option value="Pending">Pending</option><option value="Declined">Declined</option>
          </select>
          <span className="text-xs" style={{ color: 'var(--brown-muted)' }}>{filtered.length} of {data.length}</span>
        </div>

        {loading ? (
          <div className="text-center py-8" style={{ color: 'var(--brown-muted)' }}>Loading...</div>
        ) : (
          <div className="table-container">
            <table>
              <thead><tr><th>Name</th><th>Side</th><th>Role</th><th>Contact</th><th>Invitation</th><th>RSVP</th><th>Pax</th><th>Notes</th><th style={{ width: 160 }}>Actions</th></tr></thead>
              <tbody>
                {filtered.map((guest, i) => {
                  const rowIndex = data.findIndex(d => d === guest)
                  return <GuestRow key={i} guest={guest} rowIndex={rowIndex} onUpdate={fetchData} />
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
