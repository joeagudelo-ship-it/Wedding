'use client'

import React, { useState, useCallback } from 'react'
import { useToast } from '../../components/ToastProvider'

type Supplier = { category: string; supplierName: string; contactPerson: string; contactNo: string; totalPrice: string; downpayment: string; balance: string; paid: string; contractSigned: string; notes: string }
type BudgetLine = { item: string; amount: string; notes: string }

function parseMoney(val: string): number { return parseFloat(val.replace(/[₱,]/g, '')) || 0 }
function formatMoney(n: number): string { return `₱${n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` }

function StatusBadge({ status }: { status: string }) {
  if (status === 'Paid' || status.includes('Done') || status === 'Sponsored') return <span className="badge badge-success">{status}</span>
  if (status === 'Partial') return <span className="badge badge-warning">{status}</span>
  if (status === 'N/A') return <span className="badge badge-info">{status}</span>
  if (status === 'No') return <span className="badge badge-danger">{status}</span>
  return <span className="badge badge-neutral">{status}</span>
}

function SupplierRow({ supplier, rowIndex, onUpdate }: { supplier: Supplier; rowIndex: number; onUpdate: () => void }) {
  const { addToast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [downpayment, setDownpayment] = useState(supplier.downpayment)
  const [paidStatus, setPaidStatus] = useState(supplier.paid)
  const [loading, setLoading] = useState(false)

  const total = parseMoney(supplier.totalPrice)
  const paid = parseMoney(downpayment)
  const balance = total - paid
  const pct = total > 0 ? Math.min(Math.round((paid / total) * 100), 100) : 0

  const handleSave = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/suppliers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rowIndex, downpayment, paid: paidStatus, notes: supplier.notes }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to update')
      addToast('Payment updated')
      setIsEditing(false)
      onUpdate()
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Failed to update', 'error')
    } finally { setLoading(false) }
  }

  const cancel = () => { setDownpayment(supplier.downpayment); setPaidStatus(supplier.paid); setIsEditing(false) }

  return (
    <tr style={{ opacity: loading ? 0.5 : 1 }}>
      <td><span className="badge badge-neutral">{supplier.category}</span></td>
      <td className="font-medium text-sm" style={{ color: 'var(--brown-deep)' }}>{supplier.supplierName}</td>
      <td className="text-sm">{supplier.contactNo}</td>
      <td className="text-sm font-medium peso">{supplier.totalPrice}</td>
      <td>{isEditing ? (
        <input type="text" value={downpayment} onChange={e => setDownpayment(e.target.value)} className="input-field" style={{ width: 120 }} placeholder="₱0.00" />
      ) : <span className="text-sm font-medium peso" style={{ color: paid > 0 ? 'var(--success)' : 'var(--brown-muted)' }}>{downpayment}</span>}</td>
      <td className="text-sm font-medium peso" style={{ color: balance > 0 ? 'var(--warning)' : 'var(--success)' }}>{formatMoney(balance)}</td>
      <td><div style={{ width: 70 }}><div className="progress-bar-bg"><div className="progress-bar-fill" style={{ width: `${pct}%` }} /></div><div className="text-xs mt-1 text-center" style={{ color: 'var(--brown-muted)' }}>{pct}%</div></div></td>
      <td>{isEditing ? (
        <select value={paidStatus} onChange={e => setPaidStatus(e.target.value)} className="input-field" style={{ width: 100 }}>
          <option value="No">No</option><option value="Partial">Partial</option><option value="Paid">Paid</option><option value="Sponsored">Sponsored</option><option value="N/A">N/A</option>
        </select>
      ) : <StatusBadge status={paidStatus} />}</td>
      <td>{isEditing ? (
        <div className="flex gap-1.5">
          <button className="btn btn-primary" onClick={handleSave} disabled={loading} style={{ padding: '4px 10px', fontSize: 12 }}>Save</button>
          <button className="btn btn-secondary" onClick={cancel} disabled={loading} style={{ padding: '4px 10px', fontSize: 12 }}>Cancel</button>
        </div>
      ) : <button className="btn btn-secondary" onClick={() => setIsEditing(true)} style={{ padding: '4px 10px', fontSize: 12 }}>Edit</button>}</td>
    </tr>
  )
}

function BudgetLineRow({ line, rowIndex, onUpdate }: { line: BudgetLine; rowIndex: number; onUpdate: () => void }) {
  const { addToast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [item, setItem] = useState(line.item)
  const [amount, setAmount] = useState(line.amount)
  const [notes, setNotes] = useState(line.notes)
  const [loading, setLoading] = useState(false)

  const save = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/budget', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ rowIndex, item, amount, notes }) })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to update')
      addToast('Budget line updated')
      setIsEditing(false)
      onUpdate()
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Failed to update', 'error')
    } finally { setLoading(false) }
  }

  const remove = async () => {
    if (!confirm(`Remove "${line.item}"?`)) return
    setLoading(true)
    try {
      const res = await fetch('/api/budget', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ rowIndex }) })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to delete')
      addToast('Budget line removed')
      onUpdate()
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Failed to delete', 'error')
    } finally { setLoading(false) }
  }

  const cancel = () => { setItem(line.item); setAmount(line.amount); setNotes(line.notes); setIsEditing(false) }

  const isOver = item.toLowerCase().includes('over') || item.toLowerCase().includes('gap')
  const isPaid = item.toLowerCase().includes('paid')
  const isBalance = item.toLowerCase().includes('balance')
  const isCommitted = item.toLowerCase().includes('committed')
  const isOriginal = item.toLowerCase().includes('original')
  let valueColor = 'var(--brown-deep)'
  if (isOver) valueColor = 'var(--danger)'
  else if (isPaid) valueColor = 'var(--success)'
  else if (isBalance || isCommitted) valueColor = 'var(--warning)'
  else if (isOriginal) valueColor = 'var(--sakura-red)'

  if (isEditing) {
    return (
      <div className="card-subtle" style={{ opacity: loading ? 0.5 : 1 }}>
        <div className="flex gap-2 items-center">
          <input className="input-field" value={item} onChange={e => setItem(e.target.value)} style={{ flex: 1 }} />
          <input className="input-field" value={amount} onChange={e => setAmount(e.target.value)} style={{ width: 120 }} />
          <input className="input-field" value={notes} onChange={e => setNotes(e.target.value)} style={{ width: 150 }} placeholder="Notes..." />
          <button className="btn btn-primary" onClick={save} disabled={loading} style={{ padding: '4px 10px', fontSize: 12 }}>Save</button>
          <button className="btn btn-secondary" onClick={cancel} disabled={loading} style={{ padding: '4px 10px', fontSize: 12 }}>Cancel</button>
        </div>
      </div>
    )
  }

  return (
    <div className="card-subtle" style={{ opacity: loading ? 0.5 : 1 }}>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--brown-muted)', letterSpacing: '0.06em' }}>{item}</div>
          <div className="text-lg font-semibold peso" style={{ color: valueColor }}>{amount}</div>
          {notes && <div className="text-xs mt-1" style={{ color: 'var(--brown-muted)' }}>{notes}</div>}
        </div>
        <div className="flex gap-1">
          <button className="btn btn-secondary" onClick={() => setIsEditing(true)} disabled={loading} style={{ padding: '4px 8px', fontSize: 11 }}>Edit</button>
          <button className="btn" onClick={remove} disabled={loading} style={{ padding: '4px 8px', fontSize: 12, color: 'var(--danger)', background: 'var(--danger-soft)' }}>×</button>
        </div>
      </div>
    </div>
  )
}

function AddBudgetForm({ onAdd }: { onAdd: () => void }) {
  const { addToast } = useToast()
  const [item, setItem] = useState('')
  const [amount, setAmount] = useState('₱0.00')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!item.trim()) return
    setLoading(true)
    try {
      const res = await fetch('/api/budget', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ item: item.trim(), amount, notes }) })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to add')
      addToast('Budget line added')
      setItem('')
      setAmount('₱0.00')
      setNotes('')
      onAdd()
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Failed to add', 'error')
    } finally { setLoading(false) }
  }

  return (
    <form onSubmit={submit} className="flex gap-2 items-end flex-wrap">
      <div style={{ flex: 1, minWidth: 200 }}>
        <label className="text-xs uppercase tracking-wider" style={{ color: 'var(--brown-muted)', letterSpacing: '0.06em', display: 'block', marginBottom: 4 }}>Item</label>
        <input className="input-field" value={item} onChange={e => setItem(e.target.value)} placeholder="e.g. Venue, Catering..." />
      </div>
      <div>
        <label className="text-xs uppercase tracking-wider" style={{ color: 'var(--brown-muted)', letterSpacing: '0.06em', display: 'block', marginBottom: 4 }}>Amount</label>
        <input className="input-field" value={amount} onChange={e => setAmount(e.target.value)} style={{ width: 120 }} />
      </div>
      <div>
        <label className="text-xs uppercase tracking-wider" style={{ color: 'var(--brown-muted)', letterSpacing: '0.06em', display: 'block', marginBottom: 4 }}>Notes</label>
        <input className="input-field" value={notes} onChange={e => setNotes(e.target.value)} style={{ width: 150 }} placeholder="Optional..." />
      </div>
      <button className="btn btn-primary" disabled={loading || !item.trim()} style={{ height: 36 }}>{loading ? 'Adding...' : 'Add Line'}</button>
    </form>
  )
}

export default function BudgetClient({ suppliers, budget }: { suppliers: Supplier[]; budget: BudgetLine[] }) {
  const { addToast } = useToast()
  const [suppliersData, setSuppliersData] = useState(suppliers)
  const [budgetData, setBudgetData] = useState(budget)
  const [loading, setLoading] = useState(false)

  const fetchSuppliers = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/suppliers')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      setSuppliersData(json.suppliers || [])
    } catch (error) {
      addToast('Failed to load suppliers', 'error')
    } finally { setLoading(false) }
  }, [])

  const fetchBudget = useCallback(async () => {
    try {
      const res = await fetch('/api/budget')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      setBudgetData(json.lines || [])
    } catch (error) {
      addToast('Failed to load budget', 'error')
    }
  }, [])

  const totalCommitted = suppliersData.reduce((sum, s) => sum + parseMoney(s.totalPrice), 0)
  const totalPaid = suppliersData.reduce((sum, s) => sum + parseMoney(s.downpayment), 0)
  const totalBalance = totalCommitted - totalPaid
  const overallPct = totalCommitted > 0 ? Math.round((totalPaid / totalCommitted) * 100) : 0

  return (
    <div className="fade-in space-y-6">
      <div className="page-hero">
        <h1>Budget Tracker</h1>
        <p>Track payments, balances, and supplier invoices</p>
      </div>

      <div className="grid-4">
        <div className="card card-glow card-accent">
          <div className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--brown-muted)', letterSpacing: '0.08em' }}>Total Committed</div>
          <div className="text-xl font-semibold peso" style={{ color: 'var(--brown-deep)' }}>{formatMoney(totalCommitted)}</div>
        </div>
        <div className="card" style={{ borderTop: '2px solid var(--success)' }}>
          <div className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--brown-muted)', letterSpacing: '0.08em' }}>Total Paid</div>
          <div className="text-xl font-semibold peso" style={{ color: 'var(--success)' }}>{formatMoney(totalPaid)}</div>
        </div>
        <div className="card" style={{ borderTop: '2px solid var(--warning)' }}>
          <div className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--brown-muted)', letterSpacing: '0.08em' }}>Remaining</div>
          <div className="text-xl font-semibold peso" style={{ color: 'var(--warning)' }}>{formatMoney(totalBalance)}</div>
        </div>
        <div className="card">
          <div className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--brown-muted)', letterSpacing: '0.08em' }}>Progress</div>
          <div className="text-xl font-semibold">{overallPct}%</div>
          <div className="progress-bar-bg mt-2"><div className="progress-bar-fill" style={{ width: `${overallPct}%` }} /></div>
        </div>
      </div>

      <div className="card-elevated">
        <h3 className="text-sm uppercase tracking-wider mb-3" style={{ color: 'var(--brown-deep)', letterSpacing: '0.06em' }}>Budget Summary</h3>
        <AddBudgetForm onAdd={fetchBudget} />
        <div className="space-y-2" style={{ marginTop: 16 }}>
          {loading ? <div className="text-center py-4" style={{ color: 'var(--brown-muted)' }}>Loading...</div> : budgetData.map((line, i) => <BudgetLineRow key={i} line={line} rowIndex={i} onUpdate={fetchBudget} />)}
        </div>
      </div>

      <div className="card-elevated">
        <h3 className="text-sm uppercase tracking-wider mb-1" style={{ color: 'var(--brown-muted)', letterSpacing: '0.08em', fontWeight: 500 }}>Supplier Payments</h3>
        <p className="text-xs mb-4" style={{ color: 'var(--brown-muted)' }}>Click "Edit" to update downpayment and payment status</p>
        <div className="table-container">
          <table>
            <thead><tr><th>Category</th><th>Supplier</th><th>Contact</th><th>Total</th><th>Paid</th><th>Balance</th><th></th><th>Status</th><th></th></tr></thead>
            <tbody>{suppliersData.map((s, i) => <SupplierRow key={i} supplier={s} rowIndex={i} onUpdate={fetchSuppliers} />)}</tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
