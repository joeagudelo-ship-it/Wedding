import React from 'react'
import { getAllSheetData } from '../../lib/sheetsClient'
import SeatingClient from './SeatingClient'
import { ToastProvider } from '../../components/ToastProvider'

export const dynamic = 'force-dynamic'

export default async function SeatingPage() {
  const data = await getAllSheetData()
  return (
    <ToastProvider>
      <SeatingClient tables={data.seating} />
    </ToastProvider>
  )
}
