import React from 'react'
import { getAllSheetData } from '../lib/sheetsClient'
import DashboardClient from './DashboardClient'
import { ToastProvider } from '../components/ToastProvider'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const data = await getAllSheetData()
  return (
    <ToastProvider>
      <DashboardClient overview={data.overview} entourage={data.entourage} checklist={data.checklist} suppliers={data.suppliers} sponsors={data.sponsors} />
    </ToastProvider>
  )
}
