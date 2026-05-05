import { NextResponse } from 'next/server'
import { getSheets, updateCell, appendRow } from '../../lib/sheetsUpdate'

export async function GET() {
  try {
    const { sheets, spreadsheetId } = getSheets()
    const res = await sheets.spreadsheets.values.get({ spreadsheetId, range: 'Seating Plan!A1:N' })
    const rows = res.data.values ?? []
    if (rows.length < 2) return NextResponse.json({ tables: [] })
    const tables: { tableNumber: number; guests: string[] }[] = []
    for (let i = 0; i < rows[0].length; i++) {
      const header = (rows[0][i] || '').trim()
      const match = header.match(/TABLE\s+(\d+)/i)
      if (match) {
        const tableNum = parseInt(match[1], 10)
        const guests: string[] = []
        for (let r = 1; r < rows.length; r++) {
          const guestName = (rows[r]?.[i] || '').trim()
          if (guestName) guests.push(guestName)
        }
        tables.push({ tableNumber: tableNum, guests })
      }
    }
    return NextResponse.json({ tables: tables.sort((a, b) => a.tableNumber - b.tableNumber) })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch seating' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { tableNumber, guests } = body
    if (tableNumber === undefined) return NextResponse.json({ error: 'tableNumber required' }, { status: 400 })
    const { sheets, spreadsheetId } = getSheets()
    const res = await sheets.spreadsheets.values.get({ spreadsheetId, range: 'Seating Plan!A1:N1' })
    const headers = res.data.values?.[0] ?? []
    let colIndex = -1
    for (let i = 0; i < headers.length; i++) {
      const match = (headers[i] || '').trim().match(/TABLE\s+(\d+)/i)
      if (match && parseInt(match[1], 10) === tableNumber) { colIndex = i; break }
    }
    if (colIndex === -1) return NextResponse.json({ error: 'Table not found' }, { status: 404 })
    const colLetter = String.fromCharCode(65 + colIndex)
    const range = `Seating Plan!${colLetter}2:${colLetter}20`
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: guests.map(g => [g]) },
    })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to update seating' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { tableNumber } = body
    if (!tableNumber) return NextResponse.json({ error: 'tableNumber required' }, { status: 400 })
    const { sheets, spreadsheetId } = getSheets()
    const res = await sheets.spreadsheets.values.get({ spreadsheetId, range: 'Seating Plan!A1:N1' })
    const headers = res.data.values?.[0] ?? []
    const existingTables = headers.filter(h => h && (h || '').trim().match(/TABLE/i)).length
    const newColLetter = String.fromCharCode(65 + existingTables)
    await updateCell(`Seating Plan!${newColLetter}1`, `Table ${tableNumber}`)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to add table' }, { status: 500 })
  }
}
