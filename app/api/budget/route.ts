import { NextResponse } from 'next/server'
import { getSheets, updateCell, appendRow, getSheetId } from '../../lib/sheetsUpdate'

export async function GET() {
  try {
    const { sheets, spreadsheetId } = getSheets()
    const res = await sheets.spreadsheets.values.get({ spreadsheetId, range: 'Budget Summary!A2:C' })
    const rows = res.data.values ?? []
    const lines = rows.filter(r => r[0] && !r[0].trim().startsWith('BUDGET SUMMARY')).map(r => ({
      item: (r[0] || '').trim(),
      amount: (r[1] || '').trim(),
      notes: (r[2] || '').trim(),
    }))
    return NextResponse.json({ lines })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch budget' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { item, amount, notes } = body
    if (!item) return NextResponse.json({ error: 'item required' }, { status: 400 })
    await appendRow('Budget Summary!A2', [item || '', amount || '', notes || ''])
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to add budget line' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { rowIndex, item, amount, notes } = body
    if (rowIndex === undefined) return NextResponse.json({ error: 'rowIndex required' }, { status: 400 })
    const row = rowIndex + 2
    const updates: Promise<void>[] = []
    if (item !== undefined) updates.push(updateCell(`Budget Summary!A${row}`, item))
    if (amount !== undefined) updates.push(updateCell(`Budget Summary!B${row}`, amount))
    if (notes !== undefined) updates.push(updateCell(`Budget Summary!C${row}`, notes))
    await Promise.all(updates)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to update budget line' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json()
    const { rowIndex } = body
    if (rowIndex === undefined) return NextResponse.json({ error: 'rowIndex required' }, { status: 400 })
    const sheetId = await getSheetId('Budget Summary')
    const { sheets, spreadsheetId } = getSheets()
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: { requests: [{ deleteDimension: { range: { sheetId, dimension: 'ROWS', startIndex: rowIndex + 1, endIndex: rowIndex + 2 } } }] },
    })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete budget line' }, { status: 500 })
  }
}
