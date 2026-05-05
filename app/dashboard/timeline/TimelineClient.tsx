'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useToast } from '../../components/ToastProvider'

type ChecklistItem = { timeframe: string; task: string; status: string; notes: string }

const TIMEFRAMES = ['11–14 months out', '9–11 months out', '6–9 months out', '3–6 months out', '1–3 months out', '1–4 weeks out', '1–7 days out', 'Wedding day']

function StatusBadge({ status }: { status: string }) {
  if (status.includes('Done')) return <span className="badge badge-success">{status}</span>
  if (status.includes('Partial')) return <span className="badge badge-warning">{status}</span>
  if (status === 'N/A') return <span className="badge badge-info">{status}</span>
  return <span className="badge badge-neutral">{status}</span>
}

function ChecklistRow({ item, rowIndex, onUpdate }: { item: ChecklistItem; rowIndex: number; onUpdate: () => void }) {
  const { addToast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [task, setTask] = useState(item.task)
  const [notes, setNotes] = useState(item.notes)
  const [loading, setLoading] = useState(false)

  const toggleStatus = async () => {
    setLoading(true)
    try {
      const newStatus = item.status.includes('Done') ? 'Pending' : 'Done'
      await fetch('/api/checklist', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rowIndex, status: newStatus }),
      })
      addToast(newStatus === 'Done' ? 'Task marked as done' : 'Task marked as pending')
      onUpdate()
    } catch {
      addToast('Failed to update status', 'error')
    } finally { setLoading(false) }
  }

  const save = async () => {
    setLoading(true)
    try {
      await fetch('/api/checklist', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rowIndex, task, notes }),
      })
      addToast('Task updated')
      setIsEditing(false)
      onUpdate()
    } catch {
      addToast('Failed to update', 'error')
    } finally { setLoading(false) }
  }

  const remove = async () => {
    if (!confirm('Delete this task?')) return
    setLoading(true)
    try {
      await fetch('/api/checklist', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rowIndex }),
      })
      addToast('Task deleted')
      onUpdate()
    } catch {
      addToast('Failed to delete', 'error')
    } finally { setLoading(false) }
  }

  const cancel = () => { setTask(item.task); setNotes(item.notes); setIsEditing(false) }

  return (
    <tr style={{ opacity: loading ? 0.5 : 1 }}>
      <td>
        <button onClick={toggleStatus} className="btn" style={{ padding: '4px 8px', minWidth: 'auto', fontSize: 12 }} disabled={loading} title={item.status.includes('Done') ? 'Mark as pending' : 'Mark as done'}>
          {item.status.includes('Done') ? '✓' : '○'}
        </button>
      </td>
      <td className="text-sm font-medium" style={{ color: 'var(--brown-deep)' }}>
        {isEditing ? (
          <input className="input-field" value={task} onChange={e => setTask(e.target.value)} style={{ width: '100%' }} />
        ) : task}
      </td>
      <td><StatusBadge status={item.status} /></td>
      <td className="text-sm max-w-xs" style={{ color: 'var(--brown-muted)' }}>
        {isEditing ? (
          <input className="input-field" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notes..." />
        ) : <span className="truncate block">{notes}</span>}
      </td>
      <td>
        {isEditing ? (
          <div className="flex gap-1.5">
            <button className="btn btn-primary" onClick={save} disabled={loading} style={{ padding: '4px 10px', fontSize: 12 }}>Save</button>
            <button className="btn btn-secondary" onClick={cancel} disabled={loading} style={{ padding: '4px 10px', fontSize: 12 }}>Cancel</button>
          </div>
        ) : (
          <div className="flex gap-1.5">
            <button className="btn btn-secondary" onClick={() => setIsEditing(true)} disabled={loading} style={{ padding: '4px 10px', fontSize: 12 }}>Edit</button>
            <button className="btn" onClick={remove} disabled={loading} style={{ padding: '4px 10px', fontSize: 12, color: 'var(--danger)', background: 'var(--danger-soft)' }}>×</button>
          </div>
        )}
      </td>
    </tr>
  )
}

function AddChecklistForm({ onAdd }: { onAdd: () => void }) {
  const { addToast } = useToast()
  const [timeframe, setTimeframe] = useState(TIMEFRAMES[0])
  const [task, setTask] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!task.trim()) return
    setLoading(true)
    try {
      await fetch('/api/checklist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timeframe, task: task.trim(), notes: notes.trim() }),
      })
      addToast('Task added')
      setTask('')
      setNotes('')
      onAdd()
    } catch {
      addToast('Failed to add task', 'error')
    } finally { setLoading(false) }
  }

  return (
    <form onSubmit={submit} className="flex gap-2 items-end flex-wrap" style={{ marginBottom: 16 }}>
      <div>
        <label className="text-xs uppercase tracking-wider" style={{ color: 'var(--brown-muted)', letterSpacing: '0.06em', display: 'block', marginBottom: 4 }}>Timeframe</label>
        <select className="input-field" value={timeframe} onChange={e => setTimeframe(e.target.value)} style={{ width: 180 }}>
          {TIMEFRAMES.map(tf => <option key={tf} value={tf}>{tf}</option>)}
        </select>
      </div>
      <div style={{ flex: 1, minWidth: 200 }}>
        <label className="text-xs uppercase tracking-wider" style={{ color: 'var(--brown-muted)', letterSpacing: '0.06em', display: 'block', marginBottom: 4 }}>Task</label>
        <input className="input-field" value={task} onChange={e => setTask(e.target.value)} placeholder="New task..." />
      </div>
      <div style={{ flex: 1, minWidth: 150 }}>
        <label className="text-xs uppercase tracking-wider" style={{ color: 'var(--brown-muted)', letterSpacing: '0.06em', display: 'block', marginBottom: 4 }}>Notes</label>
        <input className="input-field" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional notes..." />
      </div>
      <button className="btn btn-primary" disabled={loading || !task.trim()} style={{ height: 36 }}>{loading ? 'Adding...' : 'Add Task'}</button>
    </form>
  )
}

export default function TimelineClient({ checklist }: { checklist: ChecklistItem[] }) {
  const [data, setData] = useState(checklist)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('All')
  const [loading, setLoading] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/checklist')
      const json = await res.json()
      setData(json.items || [])
    } catch { /* silent */ }
    finally { setLoading(false) }
  }, [])

  const grouped = data.reduce<Record<string, typeof data>>((acc, item) => {
    if (!acc[item.timeframe]) acc[item.timeframe] = []
    acc[item.timeframe].push(item)
    return acc
  }, {})

  const sortedTimeframes = TIMEFRAMES.filter(tf => grouped[tf])

  let filtered = data
  if (search) filtered = filtered.filter(i => i.task.toLowerCase().includes(search.toLowerCase()) || i.notes.toLowerCase().includes(search.toLowerCase()))
  if (filterStatus !== 'All') {
    if (filterStatus === 'Done') filtered = filtered.filter(i => i.status.includes('Done'))
    else if (filterStatus === 'Pending') filtered = filtered.filter(i => !i.status.includes('Done'))
  }

  const filteredGrouped = filtered.reduce<Record<string, typeof data>>((acc, item) => {
    if (!acc[item.timeframe]) acc[item.timeframe] = []
    acc[item.timeframe].push(item)
    return acc
  }, {})

  const done = data.filter(i => i.status.includes('Done')).length
  const pending = data.length - done
  const pct = data.length ? Math.round((done / data.length) * 100) : 0

  return (
    <div className="fade-in space-y-6">
      <div className="page-hero">
        <h1>Timeline & Checklist</h1>
        <p>Track progress from planning to wedding day</p>
      </div>

      <div className="grid-3">
        <div className="card" style={{ borderTop: '2px solid var(--success)' }}>
          <div className="text-xs uppercase tracking-wider" style={{ color: 'var(--brown-muted)', letterSpacing: '0.08em' }}>Completed</div>
          <div className="text-xl font-semibold" style={{ color: 'var(--success)' }}>{done}</div>
        </div>
        <div className="card" style={{ borderTop: '2px solid var(--warning)' }}>
          <div className="text-xs uppercase tracking-wider" style={{ color: 'var(--brown-muted)', letterSpacing: '0.08em' }}>Pending</div>
          <div className="text-xl font-semibold" style={{ color: 'var(--warning)' }}>{pending}</div>
        </div>
        <div className="card">
          <div className="text-xs uppercase tracking-wider" style={{ color: 'var(--brown-muted)', letterSpacing: '0.08em' }}>Progress</div>
          <div className="text-xl font-semibold">{pct}%</div>
          <div className="progress-bar-bg mt-2"><div className="progress-bar-fill" style={{ width: `${pct}%` }} /></div>
        </div>
      </div>

      <div className="card-elevated">
        <h3 className="text-sm uppercase tracking-wider mb-3" style={{ color: 'var(--brown-deep)', letterSpacing: '0.06em' }}>Add New Task</h3>
        <AddChecklistForm onAdd={fetchData} />
      </div>

      <div className="card-elevated">
        <div className="flex gap-3 items-center mb-4 flex-wrap">
          <input className="input-field" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tasks..." style={{ width: 250 }} />
          <select className="input-field" value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ width: 140 }}>
            <option value="All">All Status</option>
            <option value="Done">Done</option>
            <option value="Pending">Pending</option>
          </select>
        </div>

        {loading ? (
          <div className="text-center py-8" style={{ color: 'var(--brown-muted)' }}>Loading...</div>
        ) : (
          <div className="space-y-6">
            {sortedTimeframes.map(timeframe => {
              const items = filteredGrouped[timeframe] || grouped[timeframe] || []
              if (search || filterStatus !== 'All') {
                const hasFiltered = filteredGrouped[timeframe]?.length
                if (!hasFiltered && search) return null
              }
              return (
                <div key={timeframe}>
                  <h3 className="text-sm uppercase tracking-wider mb-2 flex items-center gap-2" style={{ color: 'var(--brown-deep)', letterSpacing: '0.06em' }}>
                    <span className="w-2 h-2 rounded-full" style={{ background: 'var(--sakura-red)' }} />
                    {timeframe}
                    <span className="text-xs font-normal" style={{ color: 'var(--brown-muted)' }}>
                      ({(grouped[timeframe] || []).filter(i => i.status.includes('Done')).length}/{(grouped[timeframe] || []).length})
                    </span>
                  </h3>
                  <div className="table-container">
                    <table>
                      <thead><tr><th style={{ width: 40 }}></th><th>Task</th><th>Status</th><th>Notes</th><th style={{ width: 160 }}>Actions</th></tr></thead>
                      <tbody>
                        {items.map((item, i) => {
                          const globalIndex = data.findIndex(d => d === item)
                          return <ChecklistRow key={`${timeframe}-${i}`} item={item} rowIndex={globalIndex} onUpdate={fetchData} />
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
