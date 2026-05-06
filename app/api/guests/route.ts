import { NextResponse } from 'next/server'
import { getSheets, updateCell, appendRow, getSheetId } from '../../lib/sheetsUpdate'
import { sanitizeString, validateRequired, validateRowIndex, validateEmail, validatePhone } from '../../lib/validation'
import { apiError, apiSuccess, apiBadRequest } from '../../lib/apiResponse'

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
    return apiSuccess({ guests })
  } catch (error) {
    return apiError('Failed to fetch guests', error)
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
    const contactNo = sanitizeString(body.contactNo as string, 50)
    const invitationSent = sanitizeString(body.invitationSent as string)
    const rsvpStatus = sanitizeString(body.rsvpStatus as string)
    const pax = sanitizeString(body.pax as string, 10)
    const notes = sanitizeString(body.notes as string, 500)

    if (contactNo && !validatePhone(contactNo)) {
      return apiBadRequest('Invalid phone number format')
    }

    await appendRow('Guest List!A2', [name, side, role, contactNo, invitationSent, rsvpStatus, pax || '1', notes])
    return apiSuccess({ success: true })
  } catch (error) {
    return apiError('Failed to add guest', error)
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
    const contactNo = body.contactNo !== undefined ? sanitizeString(body.contactNo as string, 50) : undefined
    const invitationSent = body.invitationSent !== undefined ? sanitizeString(body.invitationSent as string) : undefined
    const rsvpStatus = body.rsvpStatus !== undefined ? sanitizeString(body.rsvpStatus as string) : undefined
    const pax = body.pax !== undefined ? sanitizeString(body.pax as string, 10) : undefined
    const notes = body.notes !== undefined ? sanitizeString(body.notes as string, 500) : undefined

    if (contactNo && !validatePhone(contactNo)) {
      return apiBadRequest('Invalid phone number format')
    }

    if (name !== undefined) updates.push(updateCell(`Guest List!A${row}`, name))
    if (side !== undefined) updates.push(updateCell(`Guest List!B${row}`, side))
    if (role !== undefined) updates.push(updateCell(`Guest List!C${row}`, role))
    if (contactNo !== undefined) updates.push(updateCell(`Guest List!D${row}`, contactNo))
    if (invitationSent !== undefined) updates.push(updateCell(`Guest List!E${row}`, invitationSent))
    if (rsvpStatus !== undefined) updates.push(updateCell(`Guest List!F${row}`, rsvpStatus))
    if (pax !== undefined) updates.push(updateCell(`Guest List!G${row}`, pax))
    if (notes !== undefined) updates.push(updateCell(`Guest List!H${row}`, notes))

    await Promise.all(updates)
    return apiSuccess({ success: true })
  } catch (error) {
    return apiError('Failed to update guest', error)
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json()
    const rowIndexError = validateRowIndex(body.rowIndex)
    if (rowIndexError) return apiBadRequest(rowIndexError)

    const sheetId = await getSheetId('Guest List')
    const { sheets, spreadsheetId } = getSheets()
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: { requests: [{ deleteDimension: { range: { sheetId, dimension: 'ROWS', startIndex: (body.rowIndex as number) + 1, endIndex: (body.rowIndex as number) + 2 } } }] },
    })
    return apiSuccess({ success: true })
  } catch (error) {
    return apiError('Failed to delete guest', error)
  }
}
