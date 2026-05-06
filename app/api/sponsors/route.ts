import { NextResponse } from 'next/server'
import { getSheets, updateCell, appendRow, getSheetId } from '../../lib/sheetsUpdate'
import { sanitizeString, validateRequired, validateRowIndex } from '../../lib/validation'
import { apiError, apiSuccess, apiBadRequest } from '../../lib/apiResponse'

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
    return apiSuccess({ sponsors })
  } catch (error) {
    return apiError('Failed to fetch sponsors', error)
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validationError = validateRequired(body, ['name'])
    if (validationError) return apiBadRequest(validationError)

    const name = sanitizeString(body.name as string, 100)
    const side = sanitizeString(body.side as string)
    const role = sanitizeString(body.role as string)

    await appendRow('Principal Sponsors!A2', [name, side, role])
    return apiSuccess({ success: true })
  } catch (error) {
    return apiError('Failed to add sponsor', error)
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const rowIndexError = validateRowIndex(body.rowIndex)
    if (rowIndexError) return apiBadRequest(rowIndexError)

    const row = (body.rowIndex as number) + 2
    const updates: Promise<void>[] = []

    const name = body.name !== undefined ? sanitizeString(body.name as string, 100) : undefined
    const side = body.side !== undefined ? sanitizeString(body.side as string) : undefined
    const role = body.role !== undefined ? sanitizeString(body.role as string) : undefined

    if (name !== undefined) updates.push(updateCell(`Principal Sponsors!A${row}`, name))
    if (side !== undefined) updates.push(updateCell(`Principal Sponsors!B${row}`, side))
    if (role !== undefined) updates.push(updateCell(`Principal Sponsors!C${row}`, role))

    await Promise.all(updates)
    return apiSuccess({ success: true })
  } catch (error) {
    return apiError('Failed to update sponsor', error)
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json()
    const rowIndexError = validateRowIndex(body.rowIndex)
    if (rowIndexError) return apiBadRequest(rowIndexError)

    const sheetId = await getSheetId('Principal Sponsors')
    const { sheets, spreadsheetId } = getSheets()
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: { requests: [{ deleteDimension: { range: { sheetId, dimension: 'ROWS', startIndex: (body.rowIndex as number) + 1, endIndex: (body.rowIndex as number) + 2 } } }] },
    })
    return apiSuccess({ success: true })
  } catch (error) {
    return apiError('Failed to delete sponsor', error)
  }
}
