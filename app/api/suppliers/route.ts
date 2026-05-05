import { NextResponse } from 'next/server'
import { getSheets, updateCell, appendRow, getSheetId } from '../../lib/sheetsUpdate'

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
    return NextResponse.json({ suppliers })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch suppliers' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { category, supplierName, contactPerson, contactNo, totalPrice, downpayment, paid, contractSigned, notes } = body
    if (!category || !supplierName) return NextResponse.json({ error: 'category and supplierName required' }, { status: 400 })
    const total = totalPrice || '₱0.00'
    const down = downpayment || '₱0.00'
    const bal = `₱${(parseFloat(total.replace(/[₱,]/g, '')) || 0) - (parseFloat(down.replace(/[₱,]/g, '')) || 0)}`
    await appendRow('Supplier Tracker!A2', [category, supplierName, contactPerson || '', contactNo || '', total, down, bal, paid || 'No', contractSigned || 'No', notes || ''])
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to add supplier' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { rowIndex, category, supplierName, contactPerson, contactNo, totalPrice, downpayment, paid, contractSigned, notes } = body
    if (rowIndex === undefined) return NextResponse.json({ error: 'rowIndex required' }, { status: 400 })
    const row = rowIndex + 2
    const updates: Promise<void>[] = []
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
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to update supplier' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json()
    const { rowIndex } = body
    if (rowIndex === undefined) return NextResponse.json({ error: 'rowIndex required' }, { status: 400 })
    const sheetId = await getSheetId('Supplier Tracker')
    const { sheets, spreadsheetId } = getSheets()
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: { requests: [{ deleteDimension: { range: { sheetId, dimension: 'ROWS', startIndex: rowIndex + 1, endIndex: rowIndex + 2 } } }] },
    })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete supplier' }, { status: 500 })
  }
}
