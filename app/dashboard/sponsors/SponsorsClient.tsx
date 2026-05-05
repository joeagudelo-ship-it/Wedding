'use client'

import React, { useState, useCallback } from 'react'
import { useToast } from '../../components/ToastProvider'

type Sponsor = { name: string; side: string; role: string }

function EditableCell({ value, rowIndex, field, side, role, onUpdate, isNew }: { value: string; rowIndex: number | null; field: 'name' | 'role'; side: string; role: string; onUpdate: () => void; isNew: boolean }) {
  const { addToast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const [loading, setLoading] = useState(false)

  const save = async () => {
    if (rowIndex === null) {
      if (!draft.trim()) { setIsEditing(false); return }
      setLoading(true)
      try {
        await fetch('/api/sponsors', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: draft.trim(), side, role }) })
        addToast('Sponsor added')
        onUpdate()
      } catch { addToast('Failed to add', 'error') } finally { setLoading(false) }
      return
    }
    setLoading(true)
    try {
      await fetch('/api/sponsors', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ rowIndex, [field]: draft.trim() || value }) })
      addToast('Updated')
      onUpdate()
    } catch { addToast('Failed to update', 'error') } finally { setLoading(false) }
    setIsEditing(false)
  }

  const remove = async () => {
    if (rowIndex === null) { setDraft(''); setIsEditing(false); return }
    if (!confirm(`Remove ${value}?`)) return
    setLoading(true)
    try {
      await fetch('/api/sponsors', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ rowIndex }) })
      addToast('Removed')
      onUpdate()
    } catch { addToast('Failed to delete', 'error') } finally { setLoading(false) }
  }

  if (isEditing) {
    return (
      <div className="flex gap-1.5 items-center">
        <input className="input-field" value={draft} onChange={e => setDraft(e.target.value)} autoFocus onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') { setDraft(value); setIsEditing(false) } }} style={{ flex: 1 }} />
        <button className="btn btn-primary" onClick={save} disabled={loading} style={{ padding: '4px 8px', fontSize: 11 }}>Save</button>
        <button className="btn" onClick={remove} disabled={loading} style={{ padding: '4px 6px', fontSize: 14, color: 'var(--danger)', background: 'transparent' }}>×</button>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between" style={{ cursor: 'pointer' }} onClick={() => { setDraft(value); setIsEditing(true) }}>
      {value ? (
        <span className="text-sm font-medium" style={{ color: 'var(--brown-deep)' }}>{value}</span>
      ) : (
        <span className="text-xs italic" style={{ color: 'var(--brown-muted)' }}>Empty — click to add</span>
      )}
      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--brown-muted)', opacity: 0.3, flexShrink: 0 }}><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
    </div>
  )
}

function SponsorsTable({ side, sponsors, onUpdate }: { side: string; sponsors: Sponsor[]; onUpdate: () => void }) {
  const ninongs = sponsors.filter(s => s.role === 'Ninong')
  const ninangs = sponsors.filter(s => s.role === 'Ninang')
  const pairCount = Math.max(ninongs.length, ninangs.length, 1)

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <span className="w-2 h-2 rounded-full" style={{ background: side === 'Groom' ? 'var(--sakura-red)' : 'var(--info)' }} />
        <h3 className="text-sm uppercase tracking-wider" style={{ color: 'var(--brown-deep)', letterSpacing: '0.06em' }}>{side} Side</h3>
      </div>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th style={{ width: 80 }}>Pair #</th>
              <th>
                <div className="flex items-center gap-2">
                  <span className="badge badge-neutral">Ninong</span>
                </div>
              </th>
              <th>
                <div className="flex items-center gap-2">
                  <span className="badge badge-info">Ninang</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: pairCount }, (_, i) => {
              const ninong = ninongs[i] || null
              const ninang = ninangs[i] || null
              return (
                <tr key={i}>
                  <td>
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full inline-flex items-center justify-center text-xs font-semibold" style={{ background: 'linear-gradient(135deg, var(--sakura-red), var(--sakura))', color: '#fff' }}>
                        {i + 1}
                      </span>
                    </div>
                  </td>
                  <td>
                    <EditableCell
                      value={ninong?.name || ''}
                      rowIndex={ninong ? sponsors.indexOf(ninong) : null}
                      field="name"
                      side={side}
                      role="Ninong"
                      onUpdate={onUpdate}
                      isNew={!ninong}
                    />
                  </td>
                  <td>
                    <EditableCell
                      value={ninang?.name || ''}
                      rowIndex={ninang ? sponsors.indexOf(ninang) : null}
                      field="name"
                      side={side}
                      role="Ninang"
                      onUpdate={onUpdate}
                      isNew={!ninang}
                    />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
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

  const groomSponsors = data.filter(s => s.side === 'Groom')
  const brideSponsors = data.filter(s => s.side === 'Bride')

  const groomNinongs = groomSponsors.filter(s => s.role === 'Ninong').length
  const groomNinangs = groomSponsors.filter(s => s.role === 'Ninang').length
  const brideNinongs = brideSponsors.filter(s => s.role === 'Ninong').length
  const brideNinangs = brideSponsors.filter(s => s.role === 'Ninang').length
  const groomPairs = Math.max(groomNinongs, groomNinangs)
  const bridePairs = Math.max(brideNinongs, brideNinangs)

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
          <div className="text-xs uppercase tracking-wider" style={{ color: 'var(--brown-muted)', letterSpacing: '0.08em' }}>Total Pairs</div>
          <div className="text-lg font-semibold">{groomPairs + bridePairs}</div>
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
          <div className="space-y-6">
            <SponsorsTable side="Groom" sponsors={groomSponsors} onUpdate={fetchData} />
            <SponsorsTable side="Bride" sponsors={brideSponsors} onUpdate={fetchData} />
          </div>
        )}
      </div>
    </div>
  )
}
