import { NextResponse } from 'next/server'
import { getSheets, updateCell, appendRow, getSheetId } from '../../lib/sheetsUpdate'

export async function GET() {
  try {
    const { sheets, spreadsheetId } = getSheets()
    const res = await sheets.spreadsheets.values.get({ spreadsheetId, range: 'Principal Sponsors!A2:C' })
    const rows = res.data.values ?? []
    const sponsors = rows.filter(r => r[0] && r[0].trim() !== 'Name' && !r[0].trim().includes('PRINCIPAL SPONSORS')).map(r => ({
      name: (r[0] || '').trim(),
      side: (r[1] || '').trim(),
      role: (r[2] || '').trim(),
    }))
    return NextResponse.json({ sponsors })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch sponsors' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, side, role } = body
    if (!name) return NextResponse.json({ error: 'name required' }, { status: 400 })
    await appendRow('Principal Sponsors!A2', [name || '', side || '', role || ''])
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to add sponsor' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { rowIndex, name, side, role } = body
    if (rowIndex === undefined) return NextResponse.json({ error: 'rowIndex required' }, { status: 400 })
    const row = rowIndex + 2
    const updates: Promise<void>[] = []
    if (name !== undefined) updates.push(updateCell(`Principal Sponsors!A${row}`, name))
    if (side !== undefined) updates.push(updateCell(`Principal Sponsors!B${row}`, side))
    if (role !== undefined) updates.push(updateCell(`Principal Sponsors!C${row}`, role))
    await Promise.all(updates)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to update sponsor' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json()
    const { rowIndex } = body
    if (rowIndex === undefined) return NextResponse.json({ error: 'rowIndex required' }, { status: 400 })
    const sheetId = await getSheetId('Principal Sponsors')
    const { sheets, spreadsheetId } = getSheets()
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: { requests: [{ deleteDimension: { range: { sheetId, dimension: 'ROWS', startIndex: rowIndex + 1, endIndex: rowIndex + 2 } } }] },
    })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete sponsor' }, { status: 500 })
  }
}
