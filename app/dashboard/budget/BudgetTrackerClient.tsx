'use client'

import React, { useState, useCallback, useEffect } from 'react'

type Supplier = {
  category: string; supplierName: string; contactPerson: string; contactNo: string;
  totalPrice: string; downpayment: string; balance: string; paid: string;
  contractSigned: string; notes: string
}
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

function PaymentRow({ supplier, index, onUpdate }: { supplier: Supplier; index: number; onUpdate: () => void }) {
  const [isEditing, setIsEditing] = useState(false)
  const [downpayment, setDownpayment] = useState(supplier.downpayment)
  const [paidStatus, setPaidStatus] = useState(supplier.paid)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const total = parseMoney(supplier.totalPrice)
  const paid = parseMoney(downpayment)
  const balance = total - paid
  const pct = total > 0 ? Math.min(Math.round((paid / total) * 100), 100) : 0

  const handleSave = async () => {
    setLoading(true)
    try {
      await fetch('/api/payments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ rowIndex: index, downpayment, paid: paidStatus }) })
      setToast('Payment updated')
      setIsEditing(false)
      onUpdate()
    } catch { setToast('Failed to update') }
    finally { setLoading(false) }
  }

  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(null), 3000); return () => clearTimeout(t) } }, [toast])

  return (
    <>
      {toast && <div className="toast toast-success">{toast}</div>}
      <tr>
        <td><span className="badge badge-neutral">{supplier.category}</span></td>
        <td className="font-medium text-sm" style={{ color: 'var(--brown-deep)' }}>{supplier.supplierName}</td>
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
            <button className="btn btn-primary" onClick={handleSave} disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
            <button className="btn btn-secondary" onClick={() => { setIsEditing(false); setDownpayment(supplier.downpayment); setPaidStatus(supplier.paid) }}>Cancel</button>
          </div>
        ) : <button className="btn btn-secondary" onClick={() => setIsEditing(true)}>Edit</button>}</td>
      </tr>
    </>
  )
}

export default function BudgetTrackerClient({ suppliers, budget }: { suppliers: Supplier[]; budget: BudgetLine[] }) {
  const [key, setKey] = useState(0)
  const refresh = useCallback(() => setKey(k => k + 1), [])

  const totalCommitted = suppliers.reduce((sum, s) => sum + parseMoney(s.totalPrice), 0)
  const totalPaid = suppliers.reduce((sum, s) => sum + parseMoney(s.downpayment), 0)
  const totalBalance = totalCommitted - totalPaid
  const overallPct = totalCommitted > 0 ? Math.round((totalPaid / totalCommitted) * 100) : 0

  return (
    <div key={key} className="fade-in space-y-6">
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
        <h3 className="text-sm uppercase tracking-wider mb-4" style={{ color: 'var(--brown-muted)', letterSpacing: '0.08em', fontFamily: "'Zen Maru Gothic', sans-serif", fontWeight: 500 }}>Budget Summary</h3>
        <div className="grid-3">
          {budget.map((line, i) => {
            const isOver = line.item.toLowerCase().includes('over') || line.item.toLowerCase().includes('gap')
            const isPaid = line.item.toLowerCase().includes('paid')
            const isBalance = line.item.toLowerCase().includes('balance')
            const isCommitted = line.item.toLowerCase().includes('committed')
            const isOriginal = line.item.toLowerCase().includes('original')
            let valueColor = 'var(--brown-deep)'
            if (isOver) valueColor = 'var(--danger)'
            else if (isPaid) valueColor = 'var(--success)'
            else if (isBalance || isCommitted) valueColor = 'var(--warning)'
            else if (isOriginal) valueColor = 'var(--sakura-red)'
            return (
              <div key={i} className="card-subtle">
                <div className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--brown-muted)', letterSpacing: '0.06em' }}>{line.item}</div>
                <div className="text-lg font-semibold peso" style={{ color: valueColor }}>{line.amount}</div>
                {line.notes && <div className="text-xs mt-1" style={{ color: 'var(--brown-muted)' }}>{line.notes}</div>}
              </div>
            )
          })}
        </div>
      </div>

      <div className="card-elevated">
        <h3 className="text-sm uppercase tracking-wider mb-1" style={{ color: 'var(--brown-muted)', letterSpacing: '0.08em', fontFamily: "'Zen Maru Gothic', sans-serif", fontWeight: 500 }}>Supplier Payments</h3>
        <p className="text-xs mb-4" style={{ color: 'var(--brown-muted)' }}>Click "Edit" to update downpayment and payment status</p>
        <div className="table-container">
          <table>
            <thead><tr><th>Category</th><th>Supplier</th><th>Total</th><th>Paid</th><th>Balance</th><th></th><th>Status</th><th></th></tr></thead>
            <tbody>{suppliers.map((s, i) => <PaymentRow key={i} supplier={s} index={i} onUpdate={refresh} />)}</tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
