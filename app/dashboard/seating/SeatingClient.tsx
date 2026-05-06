'use client'

import React, { useState, useCallback } from 'react'
import { useToast } from '../../components/ToastProvider'

type TableSeat = { tableNumber: number; guests: string[] }

function TableCard({ table, onUpdate }: { table: TableSeat; onUpdate: () => void }) {
  const { addToast } = useToast()
  const [newGuest, setNewGuest] = useState('')
  const [loading, setLoading] = useState(false)

  const addGuest = async () => {
    if (!newGuest.trim()) return
    setLoading(true)
    try {
      const updatedGuests = [...table.guests, newGuest.trim()]
      const res = await fetch('/api/seating', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableNumber: table.tableNumber, guests: updatedGuests }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to add')
      addToast('Guest assigned')
      setNewGuest('')
      onUpdate()
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Failed to add', 'error')
    } finally { setLoading(false) }
  }

  const removeGuest = async (index: number) => {
    setLoading(true)
    try {
      const updatedGuests = table.guests.filter((_, i) => i !== index)
      const res = await fetch('/api/seating', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableNumber: table.tableNumber, guests: updatedGuests }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to remove')
      addToast('Guest removed')
      onUpdate()
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Failed to remove', 'error')
    } finally { setLoading(false) }
  }

  return (
    <div className="card-elevated">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold" style={{ color: 'var(--brown-deep)' }}>Table {table.tableNumber}</h3>
        <span className="badge badge-neutral">{table.guests.length} guests</span>
      </div>
      <div className="space-y-1 mb-3 max-h-48 overflow-y-auto">
        {table.guests.length === 0 ? (
          <div className="text-xs text-center py-3" style={{ color: 'var(--brown-muted)' }}>Empty table</div>
        ) : (
          table.guests.map((g, i) => (
            <div key={i} className="flex items-center justify-between py-1.5 px-2 rounded" style={{ background: 'var(--sakura-ultra)' }}>
              <span className="text-sm" style={{ color: 'var(--brown-deep)' }}>{g}</span>
              <button onClick={() => removeGuest(i)} className="btn" disabled={loading} style={{ padding: '2px 6px', fontSize: 12, color: 'var(--danger)', background: 'transparent' }} title="Remove">×</button>
            </div>
          ))
        )}
      </div>
      <div className="flex gap-1.5">
        <input className="input-field" value={newGuest} onChange={e => setNewGuest(e.target.value)} placeholder="Assign guest..." onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addGuest())} style={{ flex: 1 }} />
        <button className="btn btn-primary" onClick={addGuest} disabled={loading || !newGuest.trim()} style={{ padding: '6px 10px', fontSize: 12 }}>Add</button>
      </div>
    </div>
  )
}

function AddTableForm({ onAdd }: { onAdd: () => void }) {
  const { addToast } = useToast()
  const [tableNum, setTableNum] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!tableNum) return
    setLoading(true)
    try {
      const res = await fetch('/api/seating', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableNumber: parseInt(tableNum) }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to add table')
      addToast('Table added')
      setTableNum('')
      onAdd()
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Failed to add table', 'error')
    } finally { setLoading(false) }
  }

  return (
    <form onSubmit={submit} className="flex gap-2 items-end">
      <div>
        <label className="text-xs uppercase tracking-wider" style={{ color: 'var(--brown-muted)', letterSpacing: '0.06em', display: 'block', marginBottom: 4 }}>Table #</label>
        <input className="input-field" type="number" value={tableNum} onChange={e => setTableNum(e.target.value)} placeholder="Table number" style={{ width: 100 }} />
      </div>
      <button className="btn btn-primary" disabled={loading || !tableNum} style={{ height: 36 }}>{loading ? 'Adding...' : 'Add Table'}</button>
    </form>
  )
}

export default function SeatingClient({ tables }: { tables: TableSeat[] }) {
  const { addToast } = useToast()
  const [data, setData] = useState(tables)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/seating')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      setData(json.tables || [])
    } catch (error) {
      addToast('Failed to load seating', 'error')
    }
    finally { setLoading(false) }
  }, [])

  let filtered = data
  if (search) filtered = data.filter(t => t.guests.some(g => g.toLowerCase().includes(search.toLowerCase())))

  const totalGuests = data.reduce((sum, t) => sum + t.guests.length, 0)

  return (
    <div className="fade-in space-y-6">
      <div className="page-hero">
        <h1>Seating Plan</h1>
        <p>{data.length} tables — Assign guests to tables</p>
      </div>

      <div className="grid-3">
        <div className="card card-glow card-accent">
          <div className="text-xs uppercase tracking-wider" style={{ color: 'var(--brown-muted)', letterSpacing: '0.08em' }}>Total Tables</div>
          <div className="text-lg font-semibold">{data.length}</div>
        </div>
        <div className="card" style={{ borderTop: '2px solid var(--info)' }}>
          <div className="text-xs uppercase tracking-wider" style={{ color: 'var(--brown-muted)', letterSpacing: '0.08em' }}>Guests Seated</div>
          <div className="text-lg font-semibold">{totalGuests}</div>
        </div>
        <div className="card" style={{ borderTop: '2px solid var(--warning)' }}>
          <div className="text-xs uppercase tracking-wider" style={{ color: 'var(--brown-muted)', letterSpacing: '0.08em' }}>Avg per Table</div>
          <div className="text-lg font-semibold">{data.length ? Math.round(totalGuests / data.length) : 0}</div>
        </div>
      </div>

      <div className="card-elevated">
        <h3 className="text-sm uppercase tracking-wider mb-3" style={{ color: 'var(--brown-deep)', letterSpacing: '0.06em' }}>Add Table</h3>
        <AddTableForm onAdd={fetchData} />
      </div>

      <div className="card-elevated">
        <input className="input-field" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by guest name..." style={{ width: 250, marginBottom: 20 }} />

        {loading ? (
          <div className="text-center py-8" style={{ color: 'var(--brown-muted)' }}>Loading...</div>
        ) : (
          <div className="grid-3">
            {filtered.map((t, i) => <TableCard key={i} table={t} onUpdate={fetchData} />)}
          </div>
        )}
      </div>
    </div>
  )
}
