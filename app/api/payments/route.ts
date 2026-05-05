import { NextResponse } from 'next/server'
import { google } from 'googleapis'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { rowIndex, downpayment, paid, notes } = body

    const rawCreds = process.env.GOOGLE_SHEETS_CREDENTIALS
    if (!rawCreds) throw new Error('GOOGLE_SHEETS_CREDENTIALS not configured')
    const creds = JSON.parse(rawCreds)

    const auth = new google.auth.JWT(
      creds.client_email,
      undefined,
      creds.private_key,
      ['https://www.googleapis.com/auth/spreadsheets']
    )

    const sheets = google.sheets({ version: 'v4', auth })
    const spreadsheetId = process.env.SPREADSHEET_ID
    if (!spreadsheetId) throw new Error('SPREADSHEET_ID not configured')

    const row = rowIndex + 2

    const updates: any[] = []
    if (downpayment !== undefined) {
      updates.push({ range: `Supplier Tracker!F${row}`, values: [[downpayment]] })
    }
    if (paid !== undefined) {
      updates.push({ range: `Supplier Tracker!H${row}`, values: [[paid]] })
    }
    if (notes !== undefined) {
      updates.push({ range: `Supplier Tracker!J${row}`, values: [[notes]] })
    }

    if (updates.length > 0) {
      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId,
        requestBody: { data: updates, valueInputOption: 'USER_ENTERED' },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Payment update error:', error)
    return NextResponse.json({ error: 'Failed to update payment' }, { status: 500 })
  }
}
