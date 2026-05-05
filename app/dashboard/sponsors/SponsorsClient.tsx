'use client'

import React, { useState, useCallback } from 'react'
import { useToast } from '../../components/ToastProvider'

type Sponsor = { name: string; side: string; role: string }

function EditableCell({ value, rowIndex, field, side, role, onUpdate }: { value: string; rowIndex: number | null; field: 'name' | 'role'; side: string; role: string; onUpdate: () => void }) {
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
        <input className="input-field" value={draft} onChange={e => setDraft(e.target.value)} autoFocus onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') { setDraft(value); setIsEditing(false) } }} style={{ flex: 1, padding: '4px 8px', fontSize: 13, minHeight: 28 }} />
        <button className="btn btn-primary" onClick={save} disabled={loading} style={{ padding: '4px 8px', fontSize: 11, minHeight: 28 }}>Save</button>
        <button className="btn" onClick={remove} disabled={loading} style={{ padding: '4px 6px', fontSize: 14, color: 'var(--danger)', background: 'transparent', minHeight: 28 }}>×</button>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between" style={{ cursor: 'pointer', minHeight: 28 }} onClick={() => { setDraft(value); setIsEditing(true) }}>
      {value ? (
        <span className="text-sm font-medium" style={{ color: 'var(--brown-deep)' }}>{value}</span>
      ) : (
        <span className="text-xs italic" style={{ color: 'var(--brown-muted)' }}>Empty — click to add</span>
      )}
      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--brown-muted)', opacity: 0.3, flexShrink: 0 }}><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
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

  const groomNinongs = data.filter(s => s.side === 'Groom' && s.role === 'Ninong')
  const groomNinangs = data.filter(s => s.side === 'Groom' && s.role === 'Ninang')
  const brideNinongs = data.filter(s => s.side === 'Bride' && s.role === 'Ninong')
  const brideNinangs = data.filter(s => s.side === 'Bride' && s.role === 'Ninang')

  const totalNinong = groomNinongs.length + brideNinongs.length
  const totalNinang = groomNinangs.length + brideNinangs.length
  const pairCount = Math.max(groomNinongs.length, groomNinangs.length, brideNinongs.length, brideNinangs.length, 1)

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
          <div className="text-lg font-semibold">{pairCount}</div>
        </div>
        <div className="card" style={{ borderTop: '2px solid var(--info)' }}>
          <div className="text-xs uppercase tracking-wider" style={{ color: 'var(--brown-muted)', letterSpacing: '0.08em' }}>Ninongs / Ninangs</div>
          <div className="text-lg font-semibold">{totalNinong} / {totalNinang}</div>
        </div>
      </div>

      <div className="card-elevated">
        <input className="input-field" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search sponsors..." style={{ width: 250, marginBottom: 20 }} />

        {loading ? (
          <div className="text-center py-8" style={{ color: 'var(--brown-muted)' }}>Loading...</div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th rowSpan={2} style={{ width: 70, verticalAlign: 'middle' }}>Pair #</th>
                  <th colSpan={2} style={{ textAlign: 'center' }}>
                    <span className="badge badge-neutral">Ninong</span>
                  </th>
                  <th colSpan={2} style={{ textAlign: 'center' }}>
                    <span className="badge badge-info">Ninang</span>
                  </th>
                </tr>
                <tr>
                  <th style={{ width: 160 }}>
                    <div className="flex items-center gap-1.5 justify-center">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--sakura-red)' }} />
                      Groom Side
                    </div>
                  </th>
                  <th style={{ width: 160 }}>
                    <div className="flex items-center gap-1.5 justify-center">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--info)' }} />
                      Bride Side
                    </div>
                  </th>
                  <th style={{ width: 160 }}>
                    <div className="flex items-center gap-1.5 justify-center">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--sakura-red)' }} />
                      Groom Side
                    </div>
                  </th>
                  <th style={{ width: 160 }}>
                    <div className="flex items-center gap-1.5 justify-center">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--info)' }} />
                      Bride Side
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: pairCount }, (_, i) => {
                  const gn = groomNinongs[i] || null
                  const bn = brideNinongs[i] || null
                  const ga = groomNinangs[i] || null
                  const ba = brideNinangs[i] || null

                  return (
                    <tr key={i}>
                      <td>
                        <div className="flex items-center justify-center">
                          <span className="w-7 h-7 rounded-full inline-flex items-center justify-center text-xs font-semibold" style={{ background: 'linear-gradient(135deg, var(--sakura-red), var(--sakura))', color: '#fff' }}>
                            {i + 1}
                          </span>
                        </div>
                      </td>
                      <td>
                        <EditableCell
                          value={gn?.name || ''}
                          rowIndex={gn ? data.indexOf(gn) : null}
                          field="name"
                          side="Groom"
                          role="Ninong"
                          onUpdate={fetchData}
                        />
                      </td>
                      <td>
                        <EditableCell
                          value={bn?.name || ''}
                          rowIndex={bn ? data.indexOf(bn) : null}
                          field="name"
                          side="Bride"
                          role="Ninong"
                          onUpdate={fetchData}
                        />
                      </td>
                      <td>
                        <EditableCell
                          value={ga?.name || ''}
                          rowIndex={ga ? data.indexOf(ga) : null}
                          field="name"
                          side="Groom"
                          role="Ninang"
                          onUpdate={fetchData}
                        />
                      </td>
                      <td>
                        <EditableCell
                          value={ba?.name || ''}
                          rowIndex={ba ? data.indexOf(ba) : null}
                          field="name"
                          side="Bride"
                          role="Ninang"
                          onUpdate={fetchData}
                        />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
