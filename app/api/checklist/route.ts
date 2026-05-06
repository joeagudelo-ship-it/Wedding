import { NextResponse } from 'next/server'
import { getSheets, updateCell, appendRow, getSheetId } from '../../lib/sheetsUpdate'
import { sanitizeString, validateRequired, validateRowIndex } from '../../lib/validation'
import { apiError, apiSuccess, apiBadRequest } from '../../lib/apiResponse'

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
    return apiSuccess({ items })
  } catch (error) {
    return apiError('Failed to fetch checklist', error)
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validationError = validateRequired(body, ['timeframe', 'task'])
    if (validationError) return apiBadRequest(validationError)

    const timeframe = sanitizeString(body.timeframe as string, 100)
    const task = sanitizeString(body.task as string, 200)
    const status = sanitizeString(body.status as string)
    const notes = sanitizeString(body.notes as string, 500)

    await appendRow('Timeline & Checklist!A2', [timeframe, task, status || 'Pending', notes])
    return apiSuccess({ success: true })
  } catch (error) {
    return apiError('Failed to add checklist item', error)
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const rowIndexError = validateRowIndex(body.rowIndex)
    if (rowIndexError) return apiBadRequest(rowIndexError)

    const row = (body.rowIndex as number) + 2
    const updates: Promise<void>[] = []

    const timeframe = body.timeframe !== undefined ? sanitizeString(body.timeframe as string, 100) : undefined
    const task = body.task !== undefined ? sanitizeString(body.task as string, 200) : undefined
    const status = body.status !== undefined ? sanitizeString(body.status as string) : undefined
    const notes = body.notes !== undefined ? sanitizeString(body.notes as string, 500) : undefined

    if (timeframe !== undefined) updates.push(updateCell(`Timeline & Checklist!A${row}`, timeframe))
    if (task !== undefined) updates.push(updateCell(`Timeline & Checklist!B${row}`, task))
    if (status !== undefined) updates.push(updateCell(`Timeline & Checklist!C${row}`, status))
    if (notes !== undefined) updates.push(updateCell(`Timeline & Checklist!D${row}`, notes))

    await Promise.all(updates)
    return apiSuccess({ success: true })
  } catch (error) {
    return apiError('Failed to update checklist item', error)
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json()
    const rowIndexError = validateRowIndex(body.rowIndex)
    if (rowIndexError) return apiBadRequest(rowIndexError)

    const sheetId = await getSheetId('Timeline & Checklist')
    const { sheets, spreadsheetId } = getSheets()
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: { requests: [{ deleteDimension: { range: { sheetId, dimension: 'ROWS', startIndex: (body.rowIndex as number) + 1, endIndex: (body.rowIndex as number) + 2 } } }] },
    })
    return apiSuccess({ success: true })
  } catch (error) {
    return apiError('Failed to delete checklist item', error)
  }
}
