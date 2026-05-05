import React from 'react'
import { getAllSheetData } from '../../lib/sheetsClient'
import BudgetTrackerClient from './BudgetTrackerClient'

export const dynamic = 'force-dynamic'

type Data = Awaited<ReturnType<typeof getAllSheetData>>

export default async function BudgetTrackerPage() {
  const data: Data = await getAllSheetData()
  return <BudgetTrackerClient suppliers={data.suppliers} budget={data.budget} />
}
