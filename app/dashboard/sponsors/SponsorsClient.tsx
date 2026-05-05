'use client'

import React, { useState, useCallback } from 'react'
import { useToast } from '../../components/ToastProvider'

type Sponsor = { name: string; side: string; role: string }
type SponsorPair = { pairIndex: number; ninong: Sponsor; ninongIndex: number | null; ninang: Sponsor | null; ninangIndex: number | null }

function PairCard({ pair, side, onUpdate }: { pair: SponsorPair; side: string; onUpdate: () => void }) {
  const { addToast } = useToast()
  const [loading, setLoading] = useState(false)

  const updateNinong = async (field: 'name' | 'role', value: string) => {
    if (pair.ninongIndex === null) return
    setLoading(true)
    try {
      await fetch('/api/sponsors', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ rowIndex: pair.ninongIndex, [field]: value }) })
      addToast('Updated')
      onUpdate()
    } catch { addToast('Failed to update', 'error') } finally { setLoading(false) }
  }

  const updateNinang = async (field: 'name' | 'role', value: string) => {
    if (pair.ninangIndex === null) return
    setLoading(true)
    try {
      await fetch('/api/sponsors', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ rowIndex: pair.ninangIndex, [field]: value }) })
      addToast('Updated')
      onUpdate()
    } catch { addToast('Failed to update', 'error') } finally { setLoading(false) }
  }

  const removeNinong = async () => {
    if (pair.ninongIndex === null || !confirm(`Remove ${pair.ninong.name}?`)) return
    setLoading(true)
    try {
      await fetch('/api/sponsors', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ rowIndex: pair.ninongIndex }) })
      addToast('Removed')
      onUpdate()
    } catch { addToast('Failed to delete', 'error') } finally { setLoading(false) }
  }

  const removeNinang = async () => {
    if (pair.ninangIndex === null || !confirm(`Remove ${pair.ninang.name}?`)) return
    setLoading(true)
    try {
      await fetch('/api/sponsors', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ rowIndex: pair.ninangIndex }) })
      addToast('Removed')
      onUpdate()
    } catch { addToast('Failed to delete', 'error') } finally { setLoading(false) }
  }

  return (
    <div className="card-elevated" style={{ opacity: loading ? 0.6 : 1, transition: 'opacity 0.2s' }}>
      <div className="flex items-center gap-2 mb-3">
        <span className="w-6 h-6 rounded-full inline-flex items-center justify-center text-xs font-semibold" style={{ background: 'var(--sakura-red)', color: '#fff' }}>
          {pair.pairIndex + 1}
        </span>
        <span className="text-xs uppercase tracking-wider" style={{ color: 'var(--brown-muted)', letterSpacing: '0.06em' }}>Pair {pair.pairIndex + 1}</span>
      </div>
      <div className="space-y-3">
        <div className="card-subtle">
          <div className="flex items-center gap-2 mb-2">
            <span className="badge badge-neutral">Ninong</span>
            {pair.ninongIndex !== null && (
              <div className="flex gap-1 ml-auto">
                <button onClick={removeNinong} style={{ padding: '2px 6px', fontSize: 11, color: 'var(--danger)', background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: 4 }}>×</button>
              </div>
            )}
          </div>
          {pair.ninongIndex !== null ? (
            <EditableSponsorField value={pair.ninong.name} onChange={v => updateNinong('name', v)} label="Name" />
          ) : (
            <div className="text-xs italic" style={{ color: 'var(--brown-muted)' }}>No Ninong assigned</div>
          )}
        </div>
        <div className="flex items-center justify-center" style={{ color: 'var(--sakura)' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
        </div>
        <div className="card-subtle">
          <div className="flex items-center gap-2 mb-2">
            <span className="badge badge-info">Ninang</span>
            {pair.ninangIndex !== null && (
              <div className="flex gap-1 ml-auto">
                <button onClick={removeNinang} style={{ padding: '2px 6px', fontSize: 11, color: 'var(--danger)', background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: 4 }}>×</button>
              </div>
            )}
          </div>
          {pair.ninangIndex !== null ? (
            <EditableSponsorField value={pair.ninang!.name} onChange={v => updateNinang('name', v)} label="Name" />
          ) : (
            <div className="text-xs italic" style={{ color: 'var(--brown-muted)' }}>No Ninang assigned</div>
          )}
        </div>
      </div>
    </div>
  )
}

function EditableSponsorField({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState(value)

  const save = () => {
    onChange(draft.trim() || value)
    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <div className="flex gap-1.5">
        <input className="input-field" value={draft} onChange={e => setDraft(e.target.value)} autoFocus style={{ flex: 1 }} onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') { setDraft(value); setIsEditing(false) } }} />
        <button className="btn btn-primary" onClick={save} style={{ padding: '4px 8px', fontSize: 11 }}>Save</button>
        <button className="btn btn-secondary" onClick={() => { setDraft(value); setIsEditing(false) }} style={{ padding: '4px 8px', fontSize: 11 }}>×</button>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between" style={{ cursor: 'pointer' }} onClick={() => { setDraft(value); setIsEditing(true) }}>
      <span className="text-sm font-medium" style={{ color: 'var(--brown-deep)' }}>{value}</span>
      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--brown-muted)', opacity: 0.4 }}><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
    </div>
  )
}

function AddPairForm({ side, onAdd }: { side: string; onAdd: () => void }) {
  const { addToast } = useToast()
  const [ninongName, setNinongName] = useState('')
  const [ninangName, setNinangName] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!ninongName.trim() && !ninangName.trim()) return
    setLoading(true)
    try {
      const promises: Promise<Response>[] = []
      if (ninongName.trim()) {
        promises.push(fetch('/api/sponsors', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: ninongName.trim(), side, role: 'Ninong' }) }))
      }
      if (ninangName.trim()) {
        promises.push(fetch('/api/sponsors', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: ninangName.trim(), side, role: 'Ninang' }) }))
      }
      await Promise.all(promises)
      addToast('Pair added')
      setNinongName('')
      setNinangName('')
      onAdd()
    } catch { addToast('Failed to add', 'error') } finally { setLoading(false) }
  }

  return (
    <form onSubmit={submit} className="card-subtle" style={{ marginBottom: 16 }}>
      <div className="text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--brown-muted)', letterSpacing: '0.06em' }}>Add New Pair</div>
      <div className="flex gap-3 items-end">
        <div style={{ flex: 1 }}>
          <label className="text-xs mb-1 block" style={{ color: 'var(--brown-light)' }}>Ninong</label>
          <input className="input-field" value={ninongName} onChange={e => setNinongName(e.target.value)} placeholder="Ninong name..." />
        </div>
        <div style={{ flex: 1 }}>
          <label className="text-xs mb-1 block" style={{ color: 'var(--brown-light)' }}>Ninang</label>
          <input className="input-field" value={ninangName} onChange={e => setNinangName(e.target.value)} placeholder="Ninang name..." />
        </div>
        <button className="btn btn-primary" disabled={loading || (!ninongName.trim() && !ninangName.trim())} style={{ height: 36 }}>{loading ? 'Adding...' : 'Add Pair'}</button>
      </div>
    </form>
  )
}

function AddSingleForm({ side, role, onAdd }: { side: string; role: string; onAdd: () => void }) {
  const { addToast } = useToast()
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    try {
      await fetch('/api/sponsors', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: name.trim(), side, role }) })
      addToast(`${role} added`)
      setName('')
      onAdd()
    } catch { addToast('Failed to add', 'error') } finally { setLoading(false) }
  }

  return (
    <form onSubmit={submit} className="flex gap-2 items-center mb-2">
      <input className="input-field" value={name} onChange={e => setName(e.target.value)} placeholder={`Add ${role.toLowerCase()}...`} style={{ flex: 1 }} />
      <button className="btn btn-secondary" disabled={loading || !name.trim()} style={{ padding: '6px 12px', fontSize: 12 }}>{loading ? 'Adding...' : `Add ${role}`}</button>
    </form>
  )
}

function SideSection({ side, sponsors, onUpdate }: { side: string; sponsors: Sponsor[]; onUpdate: () => void }) {
  const ninongs = sponsors.filter(s => s.role === 'Ninong')
  const ninangs = sponsors.filter(s => s.role === 'Ninang')
  const maxPairs = Math.max(ninongs.length, ninangs.length)

  const pairs: SponsorPair[] = []
  for (let i = 0; i < maxPairs; i++) {
    const ninong = ninongs[i] || null
    const ninang = ninangs[i] || null
    pairs.push({
      pairIndex: i,
      ninong: ninong || { name: '', side, role: 'Ninong' },
      ninongIndex: ninongs[i] ? sponsors.indexOf(ninongs[i]) : null,
      ninang,
      ninangIndex: ninang ? sponsors.indexOf(ninang) : null,
    })
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span className="w-2 h-2 rounded-full" style={{ background: side === 'Groom' ? 'var(--sakura-red)' : 'var(--info)' }} />
        <h3 className="text-sm uppercase tracking-wider" style={{ color: 'var(--brown-deep)', letterSpacing: '0.06em' }}>{side} Side — {pairs.length} pairs</h3>
      </div>
      <AddPairForm side={side} onAdd={onUpdate} />
      <div className="flex gap-2 mb-4">
        <AddSingleForm side={side} role="Ninong" onAdd={onUpdate} />
        <AddSingleForm side={side} role="Ninang" onAdd={onUpdate} />
      </div>
      <div className="space-y-3">
        {pairs.map(p => <PairCard key={`${side}-pair-${p.pairIndex}`} pair={p} side={side} onUpdate={onUpdate} />)}
      </div>
    </div>
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

  let groomSponsors = data.filter(s => s.side === 'Groom')
  let brideSponsors = data.filter(s => s.side === 'Bride')
  if (search) {
    groomSponsors = groomSponsors.filter(s => s.name.toLowerCase().includes(search.toLowerCase()))
    brideSponsors = brideSponsors.filter(s => s.name.toLowerCase().includes(search.toLowerCase()))
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
          <div className="text-xs uppercase tracking-wider" style={{ color: 'var(--brown-muted)', letterSpacing: '0.08em' }}>Pairs</div>
          <div className="text-lg font-semibold">{Math.max(data.filter(s => s.side === 'Groom' && s.role === 'Ninong').length, data.filter(s => s.side === 'Groom' && s.role === 'Ninang').length) + Math.max(data.filter(s => s.side === 'Bride' && s.role === 'Ninong').length, data.filter(s => s.side === 'Bride' && s.role === 'Ninang').length)}</div>
        </div>
        <div className="card" style={{ borderTop: '2px solid var(--info)' }}>
          <div className="text-xs uppercase tracking-wider" style={{ color: 'var(--brown-muted)', letterSpacing: '0.08em' }}>Ninongs / Ninangs</div>
          <div className="text-lg font-semibold">{data.filter(s => s.role === 'Ninong').length} / {data.filter(s => s.role === 'Ninang').length}</div>
        </div>
      </div>

      <div className="card-elevated">
        <input className="input-field" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search sponsors..." style={{ width: 250, marginBottom: 20 }} />

        {loading ? (
          <div className="text-center py-8" style={{ color: 'var(--brown-muted)' }}>Loading...</div>
        ) : (
          <div className="grid-2">
            <SideSection side="Groom" sponsors={groomSponsors} onUpdate={fetchData} />
            <SideSection side="Bride" sponsors={brideSponsors} onUpdate={fetchData} />
          </div>
        )}
      </div>
    </div>
  )
}
