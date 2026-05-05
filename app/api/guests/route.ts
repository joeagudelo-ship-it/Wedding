import { NextResponse } from 'next/server'
import { getSheets, updateCell, appendRow, getSheetId } from '../../lib/sheetsUpdate'

export async function GET() {
  try {
    const { sheets, spreadsheetId } = getSheets()
    const res = await sheets.spreadsheets.values.get({ spreadsheetId, range: 'Guest List!A2:H' })
    const rows = res.data.values ?? []
    const guests = rows.filter(r => r[0] && !r[0].trim().startsWith('TOTAL') && r[0].trim() !== 'Guest Name' && !r[0].trim().startsWith('GUEST LIST')).map(r => ({
      name: (r[0] || '').trim(),
      side: (r[1] || '').trim(),
      role: (r[2] || '').trim(),
      contactNo: (r[3] || '').trim(),
      invitationSent: (r[4] || '').trim(),
      rsvpStatus: (r[5] || '').trim(),
      pax: (r[6] || '').trim(),
      notes: (r[7] || '').trim(),
    }))
    return NextResponse.json({ guests })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch guests' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, side, role, contactNo, invitationSent, rsvpStatus, pax, notes } = body
    if (!name) return NextResponse.json({ error: 'name required' }, { status: 400 })
    await appendRow('Guest List!A2', [name || '', side || '', role || '', contactNo || '', invitationSent || '', rsvpStatus || '', pax || '1', notes || ''])
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to add guest' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { rowIndex, name, side, role, contactNo, invitationSent, rsvpStatus, pax, notes } = body
    if (rowIndex === undefined) return NextResponse.json({ error: 'rowIndex required' }, { status: 400 })
    const row = rowIndex + 2
    const updates: Promise<void>[] = []
    if (name !== undefined) updates.push(updateCell(`Guest List!A${row}`, name))
    if (side !== undefined) updates.push(updateCell(`Guest List!B${row}`, side))
    if (role !== undefined) updates.push(updateCell(`Guest List!C${row}`, role))
    if (contactNo !== undefined) updates.push(updateCell(`Guest List!D${row}`, contactNo))
    if (invitationSent !== undefined) updates.push(updateCell(`Guest List!E${row}`, invitationSent))
    if (rsvpStatus !== undefined) updates.push(updateCell(`Guest List!F${row}`, rsvpStatus))
    if (pax !== undefined) updates.push(updateCell(`Guest List!G${row}`, pax))
    if (notes !== undefined) updates.push(updateCell(`Guest List!H${row}`, notes))
    await Promise.all(updates)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to update guest' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json()
    const { rowIndex } = body
    if (rowIndex === undefined) return NextResponse.json({ error: 'rowIndex required' }, { status: 400 })
    const sheetId = await getSheetId('Guest List')
    const { sheets, spreadsheetId } = getSheets()
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: { requests: [{ deleteDimension: { range: { sheetId, dimension: 'ROWS', startIndex: rowIndex + 1, endIndex: rowIndex + 2 } } }] },
    })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete guest' }, { status: 500 })
  }
}
