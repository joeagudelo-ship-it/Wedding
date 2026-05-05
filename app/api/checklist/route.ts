import { NextResponse } from 'next/server'
import { getSheets, updateCell, updateRow, appendRow, getSheetId } from '../../lib/sheetsUpdate'

export async function GET() {
  try {
    const { sheets, spreadsheetId } = getSheets()
    const res = await sheets.spreadsheets.values.get({ spreadsheetId, range: 'Timeline & Checklist!A2:D' })
    const rows = res.data.values ?? []
    const items = rows.filter(r => r[0] && r[1] && r[0].trim() !== 'Timeframe').map(r => ({
      timeframe: (r[0] || '').trim(),
      task: (r[1] || '').trim(),
      status: (r[2] || '').trim(),
      notes: (r[3] || '').trim(),
    }))
    return NextResponse.json({ items })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch checklist' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { timeframe, task, status, notes } = body
    if (!timeframe || !task) return NextResponse.json({ error: 'timeframe and task required' }, { status: 400 })
    await appendRow('Timeline & Checklist!A2', [timeframe, task, status || 'Pending', notes || ''])
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to add checklist item' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { rowIndex, timeframe, task, status, notes } = body
    if (rowIndex === undefined) return NextResponse.json({ error: 'rowIndex required' }, { status: 400 })
    const row = rowIndex + 2
    const updates: Promise<void>[] = []
    if (timeframe !== undefined) updates.push(updateCell(`Timeline & Checklist!A${row}`, timeframe))
    if (task !== undefined) updates.push(updateCell(`Timeline & Checklist!B${row}`, task))
    if (status !== undefined) updates.push(updateCell(`Timeline & Checklist!C${row}`, status))
    if (notes !== undefined) updates.push(updateCell(`Timeline & Checklist!D${row}`, notes))
    await Promise.all(updates)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to update checklist item' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json()
    const { rowIndex } = body
    if (rowIndex === undefined) return NextResponse.json({ error: 'rowIndex required' }, { status: 400 })
    const sheetId = await getSheetId('Timeline & Checklist')
    const { sheets, spreadsheetId } = getSheets()
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: { requests: [{ deleteDimension: { range: { sheetId, dimension: 'ROWS', startIndex: rowIndex + 1, endIndex: rowIndex + 2 } } }] },
    })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete checklist item' }, { status: 500 })
  }
}
