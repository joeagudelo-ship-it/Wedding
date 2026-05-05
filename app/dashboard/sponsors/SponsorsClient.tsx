'use client'

import React, { useState, useCallback } from 'react'
import { useToast } from '../../components/ToastProvider'

type Sponsor = { name: string; side: string; role: string }

function SponsorRow({ sponsor, rowIndex, onUpdate }: { sponsor: Sponsor; rowIndex: number; onUpdate: () => void }) {
  const { addToast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [data, setData] = useState(sponsor)
  const [loading, setLoading] = useState(false)

  const save = async () => {
    setLoading(true)
    try {
      await fetch('/api/sponsors', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ rowIndex, ...data }) })
      addToast('Sponsor updated')
      setIsEditing(false)
      onUpdate()
    } catch { addToast('Failed to update', 'error') } finally { setLoading(false) }
  }

  const remove = async () => {
    if (!confirm(`Remove ${sponsor.name}?`)) return
    setLoading(true)
    try {
      await fetch('/api/sponsors', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ rowIndex }) })
      addToast('Sponsor removed')
      onUpdate()
    } catch { addToast('Failed to delete', 'error') } finally { setLoading(false) }
  }

  const cancel = () => { setData(sponsor); setIsEditing(false) }

  if (isEditing) {
    return (
      <div className="card-subtle" style={{ opacity: loading ? 0.5 : 1 }}>
        <div className="flex gap-2 items-center">
          <input className="input-field" value={data.name} onChange={e => setData(d => ({ ...d, name: e.target.value }))} style={{ flex: 1 }} />
          <select className="input-field" value={data.side} onChange={e => setData(d => ({ ...d, side: e.target.value }))} style={{ width: 100 }}>
            <option value="Groom">Groom</option><option value="Bride">Bride</option>
          </select>
          <select className="input-field" value={data.role} onChange={e => setData(d => ({ ...d, role: e.target.value }))} style={{ width: 100 }}>
            <option value="Ninong">Ninong</option><option value="Ninang">Ninang</option>
          </select>
          <button className="btn btn-primary" onClick={save} disabled={loading} style={{ padding: '4px 10px', fontSize: 12 }}>Save</button>
          <button className="btn btn-secondary" onClick={cancel} disabled={loading} style={{ padding: '4px 10px', fontSize: 12 }}>Cancel</button>
        </div>
      </div>
    )
  }

  return (
    <div className="card-subtle" style={{ transition: 'opacity 0.2s', opacity: loading ? 0.5 : 1 }}>
      <div className="flex items-center justify-between">
        <div>
          <span className="text-sm font-medium" style={{ color: 'var(--brown-deep)' }}>{sponsor.name}</span>
          <span className={`badge ${data.role === 'Ninong' ? 'badge-neutral' : 'badge-info'}`} style={{ marginLeft: 8 }}>{sponsor.role}</span>
        </div>
        <div className="flex gap-1">
          <button className="btn btn-secondary" onClick={() => setIsEditing(true)} disabled={loading} style={{ padding: '4px 8px', fontSize: 11 }}>Edit</button>
          <button className="btn" onClick={remove} disabled={loading} style={{ padding: '4px 8px', fontSize: 12, color: 'var(--danger)', background: 'var(--danger-soft)' }}>×</button>
        </div>
      </div>
    </div>
  )
}

function AddSponsorForm({ side, onAdd }: { side: string; onAdd: () => void }) {
  const { addToast } = useToast()
  const [name, setName] = useState('')
  const [role, setRole] = useState('Ninong')
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    try {
      await fetch('/api/sponsors', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: name.trim(), side, role }) })
      addToast('Sponsor added')
      setName('')
      onAdd()
    } catch { addToast('Failed to add', 'error') } finally { setLoading(false) }
  }

  return (
    <form onSubmit={submit} className="flex gap-2 items-center mb-3">
      <input className="input-field" value={name} onChange={e => setName(e.target.value)} placeholder="Add sponsor..." style={{ flex: 1 }} />
      <select className="input-field" value={role} onChange={e => setRole(e.target.value)} style={{ width: 90 }}>
        <option value="Ninong">Ninong</option><option value="Ninang">Ninang</option>
      </select>
      <button className="btn btn-primary" disabled={loading || !name.trim()} style={{ padding: '6px 12px', fontSize: 12 }}>{loading ? 'Adding...' : 'Add'}</button>
    </form>
  )
}

export default function SponsorsClient({ sponsors }: { sponsors: Sponsor[] }) {
  const [data, setData] = useState(sponsors)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/sponsors')
      const json = await res.json()
      setData(json.sponsors || [])
    } catch { /* silent */ }
    finally { setLoading(false) }
  }, [])

  const groomNinongs = data.filter(s => s.side === 'Groom' && s.role === 'Ninong')
  const groomNinangs = data.filter(s => s.side === 'Groom' && s.role === 'Ninang')
  const brideNinongs = data.filter(s => s.side === 'Bride' && s.role === 'Ninong')
  const brideNinangs = data.filter(s => s.side === 'Bride' && s.role === 'Ninang')

  let groomFiltered = [...groomNinongs, ...groomNinangs]
  let brideFiltered = [...brideNinongs, ...brideNinangs]
  if (search) {
    groomFiltered = groomFiltered.filter(s => s.name.toLowerCase().includes(search.toLowerCase()))
    brideFiltered = brideFiltered.filter(s => s.name.toLowerCase().includes(search.toLowerCase()))
  }

  return (
    <div className="fade-in space-y-6">
      <div className="page-hero">
        <h1>Principal Sponsors</h1>
        <p>Ninongs and Ninangs for the wedding ceremony</p>
      </div>

      <div className="grid-3">
        <div className="card card-glow card-accent">
          <div className="text-xs uppercase tracking-wider" style={{ color: 'var(--brown-muted)', letterSpacing: '0.08em' }}>Total Sponsors</div>
          <div className="text-lg font-semibold">{data.length}</div>
        </div>
        <div className="card" style={{ borderTop: '2px solid var(--sakura-red)' }}>
          <div className="text-xs uppercase tracking-wider" style={{ color: 'var(--brown-muted)', letterSpacing: '0.08em' }}>Ninongs</div>
          <div className="text-lg font-semibold">{data.filter(s => s.role === 'Ninong').length}</div>
        </div>
        <div className="card" style={{ borderTop: '2px solid var(--info)' }}>
          <div className="text-xs uppercase tracking-wider" style={{ color: 'var(--brown-muted)', letterSpacing: '0.08em' }}>Ninangs</div>
          <div className="text-lg font-semibold">{data.filter(s => s.role === 'Ninang').length}</div>
        </div>
      </div>

      <div className="card-elevated">
        <input className="input-field" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search sponsors..." style={{ width: 250, marginBottom: 20 }} />

        {loading ? (
          <div className="text-center py-8" style={{ color: 'var(--brown-muted)' }}>Loading...</div>
        ) : (
          <div className="grid-2">
            <div>
              <h3 className="text-sm uppercase tracking-wider mb-2" style={{ color: 'var(--brown-deep)', letterSpacing: '0.06em' }}>Groom Side</h3>
              <AddSponsorForm side="Groom" onAdd={fetchData} />
              <div className="space-y-2">
                {groomFiltered.map((s, i) => <SponsorRow key={`groom-${i}`} sponsor={s} rowIndex={data.indexOf(s)} onUpdate={fetchData} />)}
              </div>
            </div>
            <div>
              <h3 className="text-sm uppercase tracking-wider mb-2" style={{ color: 'var(--brown-deep)', letterSpacing: '0.06em' }}>Bride Side</h3>
              <AddSponsorForm side="Bride" onAdd={fetchData} />
              <div className="space-y-2">
                {brideFiltered.map((s, i) => <SponsorRow key={`bride-${i}`} sponsor={s} rowIndex={data.indexOf(s)} onUpdate={fetchData} />)}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
