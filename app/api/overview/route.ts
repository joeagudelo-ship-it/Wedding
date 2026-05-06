import { NextResponse } from 'next/server'
import { updateCell, getSheets } from '../../lib/sheetsUpdate'
import { sanitizeString, validateRequired } from '../../lib/validation'
import { apiError, apiSuccess, apiBadRequest, apiNotFound } from '../../lib/apiResponse'

export async function GET() {
  try {
    const { sheets, spreadsheetId } = getSheets()
    const res = await sheets.spreadsheets.values.get({ spreadsheetId, range: 'Wedding Overview!A1:B50' })
    const rows = res.data.values ?? []
    const entries: { key: string; value: string }[] = []
    const entourage: { role: string; name: string }[] = []
    let inEntourage = false
    for (const row of rows) {
      const col0 = (row[0] || '').trim()
      const col1 = (row[1] || '').trim()
      if (col0 === 'ENTOURAGE') { inEntourage = true; continue }
      if (inEntourage) {
        if (col0 === 'Role' || !col0) continue
        entourage.push({ role: col0, name: col1 })
      } else {
        if (!col0 || col0.startsWith('💍')) continue
        entries.push({ key: col0, value: col1 })
      }
    }
    return apiSuccess({ entries, entourage })
  } catch (error) {
    return apiError('Failed to fetch overview', error)
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const validationError = validateRequired(body, ['key', 'value'])
    if (validationError) return apiBadRequest(validationError)

    const key = sanitizeString(body.key as string, 100)
    const value = sanitizeString(body.value as string, 500)

    const { sheets, spreadsheetId } = getSheets()
    const res = await sheets.spreadsheets.values.get({ spreadsheetId, range: 'Wedding Overview!A1:B50' })
    const rows = res.data.values ?? []
    let foundRow = -1
    let inEntourage = false
    for (let i = 0; i < rows.length; i++) {
      const col0 = (rows[i][0] || '').trim()
      if (col0 === 'ENTOURAGE') { inEntourage = true; continue }
      if (!inEntourage && col0 === key) { foundRow = i + 1; break }
    }
    if (foundRow === -1) return apiNotFound('Key not found')

    await updateCell(`Wedding Overview!B${foundRow}`, value)
    return apiSuccess({ success: true })
  } catch (error) {
    return apiError('Failed to update overview', error)
  }
}
