import { NextResponse } from 'next/server'
import { getSheets, updateCell, appendRow } from '../../lib/sheetsUpdate'
import { sanitizeString, validateRequired, validateTableNumber } from '../../lib/validation'
import { apiError, apiSuccess, apiBadRequest } from '../../lib/apiResponse'

export async function GET() {
  try {
    const { sheets, spreadsheetId } = getSheets()
    const res = await sheets.spreadsheets.values.get({ spreadsheetId, range: 'Seating Plan!A1:N' })
    const rows = res.data.values ?? []
    if (rows.length < 2) return apiSuccess({ tables: [] })
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
    return apiSuccess({ tables: tables.sort((a, b) => a.tableNumber - b.tableNumber) })
  } catch (error) {
    return apiError('Failed to fetch seating', error)
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const tableNumberError = validateTableNumber(body.tableNumber)
    if (tableNumberError) return apiBadRequest(tableNumberError)

    if (!Array.isArray(body.guests)) {
      return apiBadRequest('guests must be an array')
    }

    const guests = (body.guests as string[]).map(g => sanitizeString(g, 100))

    const { sheets, spreadsheetId } = getSheets()
    const res = await sheets.spreadsheets.values.get({ spreadsheetId, range: 'Seating Plan!A1:N1' })
    const headers = res.data.values?.[0] ?? []
    let colIndex = -1
    for (let i = 0; i < headers.length; i++) {
      const match = (headers[i] || '').trim().match(/TABLE\s+(\d+)/i)
      if (match && parseInt(match[1], 10) === body.tableNumber) { colIndex = i; break }
    }
    if (colIndex === -1) return apiBadRequest('Table not found')

    const colLetter = String.fromCharCode(65 + colIndex)
    const range = `Seating Plan!${colLetter}2:${colLetter}20`
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: guests.map(g => [g]) },
    })
    return apiSuccess({ success: true })
  } catch (error) {
    return apiError('Failed to update seating', error)
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const tableNumberError = validateTableNumber(body.tableNumber)
    if (tableNumberError) return apiBadRequest(tableNumberError)

    const { sheets, spreadsheetId } = getSheets()
    const res = await sheets.spreadsheets.values.get({ spreadsheetId, range: 'Seating Plan!A1:N1' })
    const headers = res.data.values?.[0] ?? []
    const existingTables = headers.filter(h => h && (h || '').trim().match(/TABLE/i)).length
    const newColLetter = String.fromCharCode(65 + existingTables)
    await updateCell(`Seating Plan!${newColLetter}1`, `Table ${body.tableNumber}`)
    return apiSuccess({ success: true })
  } catch (error) {
    return apiError('Failed to add table', error)
  }
}
