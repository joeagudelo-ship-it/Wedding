import React from 'react'
import { getAllSheetData } from '../../lib/sheetsClient'
import StatusBadge from '../components/StatusBadge'

export const dynamic = 'force-dynamic'

type Data = Awaited<ReturnType<typeof getAllSheetData>>

function formatMoney(n: number): string { return `₱${n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` }

export default async function VendorsPage() {
  const data: Data = await getAllSheetData()
  const suppliers = data.suppliers

  const totalCommitted = suppliers.reduce((sum, s) => sum + parseMoney(s.totalPrice), 0)
  const totalPaid = suppliers.reduce((sum, s) => sum + parseMoney(s.downpayment), 0)
  const totalBalance = suppliers.reduce((sum, s) => sum + parseMoney(s.balance), 0)

  return (
    <div className="fade-in space-y-6">
      <div className="page-hero">
        <h1>Supplier Tracker</h1>
        <p>All suppliers, payments, and contracts</p>
      </div>

      <div className="grid-4">
        <div className="card card-glow card-accent">
          <div className="text-xs uppercase tracking-wider" style={{ color: 'var(--brown-muted)', letterSpacing: '0.08em' }}>Committed</div>
          <div className="text-lg font-semibold peso">{formatMoney(totalCommitted)}</div>
        </div>
        <div className="card" style={{ borderTop: '2px solid var(--success)' }}>
          <div className="text-xs uppercase tracking-wider" style={{ color: 'var(--brown-muted)', letterSpacing: '0.08em' }}>Paid</div>
          <div className="text-lg font-semibold peso" style={{ color: 'var(--success)' }}>{formatMoney(totalPaid)}</div>
        </div>
        <div className="card" style={{ borderTop: '2px solid var(--warning)' }}>
          <div className="text-xs uppercase tracking-wider" style={{ color: 'var(--brown-muted)', letterSpacing: '0.08em' }}>Balance</div>
          <div className="text-lg font-semibold peso" style={{ color: 'var(--warning)' }}>{formatMoney(totalBalance)}</div>
        </div>
        <div className="card">
          <div className="text-xs uppercase tracking-wider" style={{ color: 'var(--brown-muted)', letterSpacing: '0.08em' }}>Suppliers</div>
          <div className="text-lg font-semibold">{suppliers.length}</div>
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead><tr><th>Category</th><th>Supplier</th><th>Contact</th><th>Total</th><th>Downpayment</th><th>Balance</th><th>Paid</th><th>Contract</th><th>Notes</th></tr></thead>
          <tbody>
            {suppliers.map((s, i) => (
              <tr key={i}>
                <td><span className="badge badge-neutral">{s.category}</span></td>
                <td className="font-medium text-sm" style={{ color: 'var(--brown-deep)' }}>{s.supplierName}</td>
                <td className="text-sm">{s.contactNo}</td>
                <td className="text-sm font-medium peso">{s.totalPrice}</td>
                <td className="text-sm peso">{s.downpayment}</td>
                <td className="text-sm peso">{s.balance}</td>
                <td><StatusBadge status={s.paid} /></td>
                <td><StatusBadge status={s.contractSigned} /></td>
                <td className="text-sm max-w-xs truncate" style={{ color: 'var(--brown-muted)' }} title={s.notes}>{s.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function parseMoney(val: string): number { return parseFloat(val.replace(/[₱,]/g, '')) || 0 }
