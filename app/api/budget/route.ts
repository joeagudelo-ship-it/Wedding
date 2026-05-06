import { NextResponse } from 'next/server'
import { getSheets, updateCell, appendRow, getSheetId } from '../../lib/sheetsUpdate'
import { sanitizeString, validateRequired, validateRowIndex, sanitizeCurrency } from '../../lib/validation'
import { apiError, apiSuccess, apiBadRequest } from '../../lib/apiResponse'

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
    return apiSuccess({ lines })
  } catch (error) {
    return apiError('Failed to fetch budget', error)
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validationError = validateRequired(body, ['item'])
    if (validationError) return apiBadRequest(validationError)

    const item = sanitizeString(body.item as string, 200)
    const amount = sanitizeCurrency(body.amount as string)
    const notes = sanitizeString(body.notes as string, 500)

    await appendRow('Budget Summary!A2', [item, amount, notes])
    return apiSuccess({ success: true })
  } catch (error) {
    return apiError('Failed to add budget line', error)
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const rowIndexError = validateRowIndex(body.rowIndex)
    if (rowIndexError) return apiBadRequest(rowIndexError)

    const row = (body.rowIndex as number) + 2
    const updates: Promise<void>[] = []

    const item = body.item !== undefined ? sanitizeString(body.item as string, 200) : undefined
    const amount = body.amount !== undefined ? sanitizeCurrency(body.amount as string) : undefined
    const notes = body.notes !== undefined ? sanitizeString(body.notes as string, 500) : undefined

    if (item !== undefined) updates.push(updateCell(`Budget Summary!A${row}`, item))
    if (amount !== undefined) updates.push(updateCell(`Budget Summary!B${row}`, amount))
    if (notes !== undefined) updates.push(updateCell(`Budget Summary!C${row}`, notes))

    await Promise.all(updates)
    return apiSuccess({ success: true })
  } catch (error) {
    return apiError('Failed to update budget line', error)
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json()
    const rowIndexError = validateRowIndex(body.rowIndex)
    if (rowIndexError) return apiBadRequest(rowIndexError)

    const sheetId = await getSheetId('Budget Summary')
    const { sheets, spreadsheetId } = getSheets()
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: { requests: [{ deleteDimension: { range: { sheetId, dimension: 'ROWS', startIndex: (body.rowIndex as number) + 1, endIndex: (body.rowIndex as number) + 2 } } }] },
    })
    return apiSuccess({ success: true })
  } catch (error) {
    return apiError('Failed to delete budget line', error)
  }
}
