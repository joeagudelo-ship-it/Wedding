import React from 'react'
import { getAllSheetData } from '../../lib/sheetsClient'
import VendorsClient from './VendorsClient'
import { ToastProvider } from '../../components/ToastProvider'

export const dynamic = 'force-dynamic'

export default async function VendorsPage() {
  const data = await getAllSheetData()
  return (
    <ToastProvider>
      <VendorsClient suppliers={data.suppliers} />
    </ToastProvider>
  )
}
