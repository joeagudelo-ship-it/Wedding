import React from 'react'
import { getAllSheetData } from '../../lib/sheetsClient'
import TimelineClient from './TimelineClient'
import { ToastProvider } from '../../components/ToastProvider'

export const dynamic = 'force-dynamic'

export default async function TimelinePage() {
  const data = await getAllSheetData()
  return (
    <ToastProvider>
      <TimelineClient checklist={data.checklist} />
    </ToastProvider>
  )
}
