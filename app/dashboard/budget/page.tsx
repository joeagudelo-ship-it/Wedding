import React from 'react'
import { getAllSheetData } from '../../lib/sheetsClient'
import BudgetClient from './BudgetClient'
import { ToastProvider } from '../../components/ToastProvider'

export const dynamic = 'force-dynamic'

export default async function BudgetPage() {
  const data = await getAllSheetData()
  return (
    <ToastProvider>
      <BudgetClient suppliers={data.suppliers} budget={data.budget} />
    </ToastProvider>
  )
}
