import { NextResponse } from 'next/server'
import { getSheets, updateCell, appendRow, getSheetId } from '../../lib/sheetsUpdate'
import { sanitizeString, validateRequired, validateRowIndex, sanitizeCurrency, validateEmail, validatePhone } from '../../lib/validation'
import { apiError, apiSuccess, apiBadRequest } from '../../lib/apiResponse'

export async function GET() {
  try {
    const { sheets, spreadsheetId } = getSheets()
    const res = await sheets.spreadsheets.values.get({ spreadsheetId, range: 'Supplier Tracker!A2:J' })
    const rows = res.data.values ?? []
    const suppliers = rows.filter(r => {
      const cat = (r[0] || '').trim()
      return cat && !cat.startsWith('SUPPLIER TRACKER') && cat !== 'Category' && cat !== 'TOTAL'
    }).map(r => ({
      category: (r[0] || '').trim(),
      supplierName: (r[1] || '').trim(),
      contactPerson: (r[2] || '').trim(),
      contactNo: (r[3] || '').trim(),
      totalPrice: (r[4] || '').trim(),
      downpayment: (r[5] || '').trim(),
      balance: (r[6] || '').trim(),
      paid: (r[7] || '').trim(),
      contractSigned: (r[8] || '').trim(),
      notes: (r[9] || '').trim(),
    }))
    return apiSuccess({ suppliers })
  } catch (error) {
    return apiError('Failed to fetch suppliers', error)
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validationError = validateRequired(body, ['category', 'supplierName'])
    if (validationError) return apiBadRequest(validationError)

    const category = sanitizeString(body.category as string, 100)
    const supplierName = sanitizeString(body.supplierName as string, 200)
    const contactPerson = sanitizeString(body.contactPerson as string, 100)
    const contactNo = sanitizeString(body.contactNo as string, 50)
    const totalPrice = sanitizeCurrency(body.totalPrice as string)
    const downpayment = sanitizeCurrency(body.downpayment as string)
    const paid = sanitizeString(body.paid as string)
    const contractSigned = sanitizeString(body.contractSigned as string)
    const notes = sanitizeString(body.notes as string, 500)

    if (contactNo && !validatePhone(contactNo)) {
      return apiBadRequest('Invalid phone number format')
    }

    const bal = `₱${(parseFloat(totalPrice.replace(/[₱,]/g, '')) || 0) - (parseFloat(downpayment.replace(/[₱,]/g, '')) || 0)}`
    await appendRow('Supplier Tracker!A2', [category, supplierName, contactPerson, contactNo, totalPrice, downpayment, bal, paid || 'No', contractSigned || 'No', notes])
    return apiSuccess({ success: true })
  } catch (error) {
    return apiError('Failed to add supplier', error)
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const rowIndexError = validateRowIndex(body.rowIndex)
    if (rowIndexError) return apiBadRequest(rowIndexError)

    const row = (body.rowIndex as number) + 2
    const updates: Promise<void>[] = []

    const category = body.category !== undefined ? sanitizeString(body.category as string, 100) : undefined
    const supplierName = body.supplierName !== undefined ? sanitizeString(body.supplierName as string, 200) : undefined
    const contactPerson = body.contactPerson !== undefined ? sanitizeString(body.contactPerson as string, 100) : undefined
    const contactNo = body.contactNo !== undefined ? sanitizeString(body.contactNo as string, 50) : undefined
    const totalPrice = body.totalPrice !== undefined ? sanitizeCurrency(body.totalPrice as string) : undefined
    const downpayment = body.downpayment !== undefined ? sanitizeCurrency(body.downpayment as string) : undefined
    const paid = body.paid !== undefined ? sanitizeString(body.paid as string) : undefined
    const contractSigned = body.contractSigned !== undefined ? sanitizeString(body.contractSigned as string) : undefined
    const notes = body.notes !== undefined ? sanitizeString(body.notes as string, 500) : undefined

    if (contactNo && !validatePhone(contactNo)) {
      return apiBadRequest('Invalid phone number format')
    }

    if (category !== undefined) updates.push(updateCell(`Supplier Tracker!A${row}`, category))
    if (supplierName !== undefined) updates.push(updateCell(`Supplier Tracker!B${row}`, supplierName))
    if (contactPerson !== undefined) updates.push(updateCell(`Supplier Tracker!C${row}`, contactPerson))
    if (contactNo !== undefined) updates.push(updateCell(`Supplier Tracker!D${row}`, contactNo))
    if (totalPrice !== undefined) updates.push(updateCell(`Supplier Tracker!E${row}`, totalPrice))
    if (downpayment !== undefined) updates.push(updateCell(`Supplier Tracker!F${row}`, downpayment))
    if (paid !== undefined) updates.push(updateCell(`Supplier Tracker!H${row}`, paid))
    if (contractSigned !== undefined) updates.push(updateCell(`Supplier Tracker!I${row}`, contractSigned))
    if (notes !== undefined) updates.push(updateCell(`Supplier Tracker!J${row}`, notes))

    if (totalPrice !== undefined || downpayment !== undefined) {
      const { sheets, spreadsheetId } = getSheets()
      const vals = await sheets.spreadsheets.values.get({ spreadsheetId, range: `Supplier Tracker!E${row}:F${row}` })
      const total = parseFloat(((vals.data.values?.[0]?.[0] || '0').replace(/[₱,]/g, ''))) || 0
      const down = parseFloat(((vals.data.values?.[0]?.[1] || '0').replace(/[₱,]/g, ''))) || 0
      updates.push(updateCell(`Supplier Tracker!G${row}`, `₱${(total - down).toFixed(2)}`))
    }

    await Promise.all(updates)
    return apiSuccess({ success: true })
  } catch (error) {
    return apiError('Failed to update supplier', error)
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json()
    const rowIndexError = validateRowIndex(body.rowIndex)
    if (rowIndexError) return apiBadRequest(rowIndexError)

    const sheetId = await getSheetId('Supplier Tracker')
    const { sheets, spreadsheetId } = getSheets()
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: { requests: [{ deleteDimension: { range: { sheetId, dimension: 'ROWS', startIndex: (body.rowIndex as number) + 1, endIndex: (body.rowIndex as number) + 2 } } }] },
    })
    return apiSuccess({ success: true })
  } catch (error) {
    return apiError('Failed to delete supplier', error)
  }
}
