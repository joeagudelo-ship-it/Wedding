'use client'

import React, { useState, useCallback } from 'react'
import { useToast } from '../../components/ToastProvider'

type Supplier = { category: string; supplierName: string; contactPerson: string; contactNo: string; totalPrice: string; downpayment: string; balance: string; paid: string; contractSigned: string; notes: string }

function parseMoney(val: string): number { return parseFloat(val.replace(/[₱,]/g, '')) || 0 }
function formatMoney(n: number): string { return `₱${n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` }

function StatusBadge({ status }: { status: string }) {
  if (status === 'Paid' || status === 'Done' || status === 'Sponsored' || status === 'Yes') return <span className="badge badge-success">{status}</span>
  if (status === 'Partial') return <span className="badge badge-warning">{status}</span>
  if (status === 'N/A') return <span className="badge badge-info">{status}</span>
  return <span className="badge badge-danger">{status}</span>
}

function SupplierRow({ supplier, rowIndex, onUpdate }: { supplier: Supplier; rowIndex: number; onUpdate: () => void }) {
  const { addToast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [data, setData] = useState(supplier)
  const [loading, setLoading] = useState(false)

  const total = parseMoney(data.totalPrice)
  const paid = parseMoney(data.downpayment)
  const balance = total - paid
  const pct = total > 0 ? Math.min(Math.round((paid / total) * 100), 100) : 0

  const save = async () => {
    setLoading(true)
    try {
      await fetch('/api/suppliers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rowIndex, ...data }),
      })
      addToast('Supplier updated')
      setIsEditing(false)
      onUpdate()
    } catch { addToast('Failed to update', 'error') } finally { setLoading(false) }
  }

  const remove = async () => {
    if (!confirm(`Remove ${supplier.supplierName}?`)) return
    setLoading(true)
    try {
      await fetch('/api/suppliers', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rowIndex }),
      })
      addToast('Supplier removed')
      onUpdate()
    } catch { addToast('Failed to delete', 'error') } finally { setLoading(false) }
  }

  const cancel = () => { setData(supplier); setIsEditing(false) }

  if (isEditing) {
    return (
      <tr style={{ background: 'var(--sakura-ultra)' }}>
        <td><input className="input-field" value={data.category} onChange={e => setData(d => ({ ...d, category: e.target.value }))} style={{ width: 100 }} /></td>
        <td><input className="input-field" value={data.supplierName} onChange={e => setData(d => ({ ...d, supplierName: e.target.value }))} style={{ width: 140 }} /></td>
        <td><input className="input-field" value={data.contactPerson} onChange={e => setData(d => ({ ...d, contactPerson: e.target.value }))} style={{ width: 100 }} /></td>
        <td><input className="input-field" value={data.contactNo} onChange={e => setData(d => ({ ...d, contactNo: e.target.value }))} style={{ width: 110 }} /></td>
        <td><input className="input-field" value={data.totalPrice} onChange={e => setData(d => ({ ...d, totalPrice: e.target.value }))} style={{ width: 100 }} /></td>
        <td><input className="input-field" value={data.downpayment} onChange={e => setData(d => ({ ...d, downpayment: e.target.value }))} style={{ width: 100 }} /></td>
        <td className="text-sm peso" style={{ color: balance > 0 ? 'var(--warning)' : 'var(--success)' }}>{formatMoney(balance)}</td>
        <td>
          <select className="input-field" value={data.paid} onChange={e => setData(d => ({ ...d, paid: e.target.value }))} style={{ width: 100 }}>
            <option value="No">No</option><option value="Partial">Partial</option><option value="Paid">Paid</option><option value="Sponsored">Sponsored</option><option value="N/A">N/A</option>
          </select>
        </td>
        <td>
          <select className="input-field" value={data.contractSigned} onChange={e => setData(d => ({ ...d, contractSigned: e.target.value }))} style={{ width: 80 }}>
            <option value="No">No</option><option value="Yes">Yes</option><option value="N/A">N/A</option>
          </select>
        </td>
        <td><input className="input-field" value={data.notes} onChange={e => setData(d => ({ ...d, notes: e.target.value }))} style={{ width: 140 }} /></td>
        <td>
          <div className="flex gap-1.5">
            <button className="btn btn-primary" onClick={save} disabled={loading} style={{ padding: '4px 10px', fontSize: 12 }}>Save</button>
            <button className="btn btn-secondary" onClick={cancel} disabled={loading} style={{ padding: '4px 10px', fontSize: 12 }}>Cancel</button>
          </div>
        </td>
      </tr>
    )
  }

  return (
    <tr style={{ opacity: loading ? 0.5 : 1 }}>
      <td><span className="badge badge-neutral">{supplier.category}</span></td>
      <td className="font-medium text-sm" style={{ color: 'var(--brown-deep)' }}>{supplier.supplierName}</td>
      <td className="text-sm">{supplier.contactPerson}</td>
      <td className="text-sm">{supplier.contactNo}</td>
      <td className="text-sm font-medium peso">{supplier.totalPrice}</td>
      <td className="text-sm peso">{supplier.downpayment}</td>
      <td><div style={{ minWidth: 80 }}><div className="progress-bar-bg"><div className="progress-bar-fill" style={{ width: `${pct}%` }} /></div><div className="text-xs mt-1 text-center" style={{ color: 'var(--brown-muted)' }}>{pct}%</div></div></td>
      <td><StatusBadge status={supplier.paid} /></td>
      <td><StatusBadge status={supplier.contractSigned} /></td>
      <td className="text-sm max-w-xs truncate" style={{ color: 'var(--brown-muted)' }} title={supplier.notes}>{supplier.notes}</td>
      <td>
        <div className="flex gap-1">
          <button className="btn btn-secondary" onClick={() => setIsEditing(true)} disabled={loading} style={{ padding: '4px 8px', fontSize: 11 }}>Edit</button>
          <button className="btn" onClick={remove} disabled={loading} style={{ padding: '4px 8px', fontSize: 12, color: 'var(--danger)', background: 'var(--danger-soft)' }}>×</button>
        </div>
      </td>
    </tr>
  )
}

function AddSupplierForm({ onAdd }: { onAdd: () => void }) {
  const { addToast } = useToast()
  const [data, setData] = useState({ category: '', supplierName: '', contactPerson: '', contactNo: '', totalPrice: '₱0.00', downpayment: '₱0.00', paid: 'No', contractSigned: 'No', notes: '' })
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!data.category || !data.supplierName) return
    setLoading(true)
    try {
      await fetch('/api/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      addToast('Supplier added')
      setData({ category: '', supplierName: '', contactPerson: '', contactNo: '', totalPrice: '₱0.00', downpayment: '₱0.00', paid: 'No', contractSigned: 'No', notes: '' })
      onAdd()
    } catch { addToast('Failed to add', 'error') } finally { setLoading(false) }
  }

  return (
    <form onSubmit={submit} className="flex gap-2 items-end flex-wrap" style={{ marginBottom: 16 }}>
      <div>
        <label className="text-xs uppercase tracking-wider" style={{ color: 'var(--brown-muted)', letterSpacing: '0.06em', display: 'block', marginBottom: 4 }}>Category</label>
        <input className="input-field" value={data.category} onChange={e => setData(d => ({ ...d, category: e.target.value }))} placeholder="e.g. Catering" style={{ width: 130 }} />
      </div>
      <div style={{ flex: 1, minWidth: 160 }}>
        <label className="text-xs uppercase tracking-wider" style={{ color: 'var(--brown-muted)', letterSpacing: '0.06em', display: 'block', marginBottom: 4 }}>Supplier</label>
        <input className="input-field" value={data.supplierName} onChange={e => setData(d => ({ ...d, supplierName: e.target.value }))} placeholder="Supplier name..." />
      </div>
      <div>
        <label className="text-xs uppercase tracking-wider" style={{ color: 'var(--brown-muted)', letterSpacing: '0.06em', display: 'block', marginBottom: 4 }}>Total</label>
        <input className="input-field" value={data.totalPrice} onChange={e => setData(d => ({ ...d, totalPrice: e.target.value }))} style={{ width: 100 }} />
      </div>
      <button className="btn btn-primary" disabled={loading || !data.category || !data.supplierName} style={{ height: 36 }}>{loading ? 'Adding...' : 'Add Supplier'}</button>
    </form>
  )
}

export default function VendorsClient({ suppliers }: { suppliers: Supplier[] }) {
  const [data, setData] = useState(suppliers)
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('All')
  const [filterPaid, setFilterPaid] = useState('All')
  const [loading, setLoading] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/suppliers')
      const json = await res.json()
      setData(json.suppliers || [])
    } catch { /* silent */ }
    finally { setLoading(false) }
  }, [])

  let filtered = data
  if (search) filtered = filtered.filter(s => s.supplierName.toLowerCase().includes(search.toLowerCase()) || s.notes.toLowerCase().includes(search.toLowerCase()))
  if (filterCategory !== 'All') filtered = filtered.filter(s => s.category === filterCategory)
  if (filterPaid !== 'All') filtered = filtered.filter(s => s.paid === filterPaid)

  const totalCommitted = data.reduce((sum, s) => sum + parseMoney(s.totalPrice), 0)
  const totalPaid = data.reduce((sum, s) => sum + parseMoney(s.downpayment), 0)
  const totalBalance = totalCommitted - totalPaid
  const overallPct = totalCommitted > 0 ? Math.round((totalPaid / totalCommitted) * 100) : 0

  const categories = Array.from(new Set(data.map(s => s.category))).sort()

  return (
    <div className="fade-in space-y-6">
      <div className="page-hero">
        <h1>Supplier Tracker</h1>
        <p>All suppliers, payments, and contracts</p>
      </div>

      <div className="grid-4">
        <div className="card card-glow card-accent">
          <div className="text-xs uppercase tracking-wider" style={{ color: 'var(--brown-muted)', letterSpacing: '0.08em' }}>Total Committed</div>
          <div className="text-lg font-semibold peso" style={{ color: 'var(--brown-deep)' }}>{formatMoney(totalCommitted)}</div>
        </div>
        <div className="card" style={{ borderTop: '2px solid var(--success)' }}>
          <div className="text-xs uppercase tracking-wider" style={{ color: 'var(--brown-muted)', letterSpacing: '0.08em' }}>Total Paid</div>
          <div className="text-lg font-semibold peso" style={{ color: 'var(--success)' }}>{formatMoney(totalPaid)}</div>
        </div>
        <div className="card" style={{ borderTop: '2px solid var(--warning)' }}>
          <div className="text-xs uppercase tracking-wider" style={{ color: 'var(--brown-muted)', letterSpacing: '0.08em' }}>Remaining</div>
          <div className="text-lg font-semibold peso" style={{ color: 'var(--warning)' }}>{formatMoney(totalBalance)}</div>
        </div>
        <div className="card">
          <div className="text-xs uppercase tracking-wider" style={{ color: 'var(--brown-muted)', letterSpacing: '0.08em' }}>Progress</div>
          <div className="text-lg font-semibold">{overallPct}%</div>
          <div className="progress-bar-bg mt-2"><div className="progress-bar-fill" style={{ width: `${overallPct}%` }} /></div>
        </div>
      </div>

      <div className="card-elevated">
        <h3 className="text-sm uppercase tracking-wider mb-3" style={{ color: 'var(--brown-deep)', letterSpacing: '0.06em' }}>Add Supplier</h3>
        <AddSupplierForm onAdd={fetchData} />
      </div>

      <div className="card-elevated">
        <div className="flex gap-3 items-center mb-4 flex-wrap">
          <input className="input-field" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search suppliers..." style={{ width: 250 }} />
          <select className="input-field" value={filterCategory} onChange={e => setFilterCategory(e.target.value)} style={{ width: 140 }}>
            <option value="All">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select className="input-field" value={filterPaid} onChange={e => setFilterPaid(e.target.value)} style={{ width: 130 }}>
            <option value="All">All Status</option>
            <option value="No">Not Paid</option><option value="Partial">Partial</option><option value="Paid">Paid</option><option value="Sponsored">Sponsored</option>
          </select>
          <span className="text-xs" style={{ color: 'var(--brown-muted)' }}>{filtered.length} of {data.length} shown</span>
        </div>

        {loading ? (
          <div className="text-center py-8" style={{ color: 'var(--brown-muted)' }}>Loading...</div>
        ) : (
          <div className="table-container">
            <table>
              <thead><tr><th>Category</th><th>Supplier</th><th>Contact Person</th><th>Contact #</th><th>Total</th><th>Paid</th><th></th><th>Status</th><th>Contract</th><th>Notes</th><th style={{ width: 140 }}>Actions</th></tr></thead>
              <tbody>
                {filtered.map((s, i) => <SupplierRow key={i} supplier={s} rowIndex={data.indexOf(s)} onUpdate={fetchData} />)}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
