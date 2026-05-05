import React from 'react'
import { getAllSheetData } from '../../lib/sheetsClient'
import SponsorsClient from './SponsorsClient'
import { ToastProvider } from '../../components/ToastProvider'

export const dynamic = 'force-dynamic'

export default async function SponsorsPage() {
  const data = await getAllSheetData()
  return (
    <ToastProvider>
      <SponsorsClient sponsors={data.sponsors} />
    </ToastProvider>
  )
}
