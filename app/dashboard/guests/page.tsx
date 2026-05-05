import React from 'react'
import { getAllSheetData } from '../../lib/sheetsClient'
import GuestListClient from './GuestListClient'
import { ToastProvider } from '../../components/ToastProvider'

export const dynamic = 'force-dynamic'

export default async function GuestsPage() {
  const data = await getAllSheetData()
  return (
    <ToastProvider>
      <GuestListClient guests={data.guests} />
    </ToastProvider>
  )
}
