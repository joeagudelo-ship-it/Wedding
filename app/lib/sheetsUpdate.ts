import { google } from 'googleapis'

export const getAuth = () => {
  const raw = process.env.GOOGLE_SHEETS_CREDENTIALS
  if (!raw) throw new Error('GOOGLE_SHEETS_CREDENTIALS not configured')
  const creds = JSON.parse(raw)
  return new google.auth.JWT(creds.client_email, undefined, creds.private_key, ['https://www.googleapis.com/auth/spreadsheets'])
}

export const getSheets = () => {
  const auth = getAuth()
  const sheets = google.sheets({ version: 'v4', auth })
  const spreadsheetId = process.env.SPREADSHEET_ID
  if (!spreadsheetId) throw new Error('SPREADSHEET_ID not configured')
  return { sheets, spreadsheetId }
}

export const updateCell = async (range: string, value: string) => {
  const { sheets, spreadsheetId } = getSheets()
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [[value]] },
  })
}

export const updateRow = async (range: string, values: string[]) => {
  const { sheets, spreadsheetId } = getSheets()
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [values] },
  })
}

export const appendRow = async (range: string, values: string[]) => {
  const { sheets, spreadsheetId } = getSheets()
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [values] },
  })
}

export const deleteRow = async (sheetName: string, rowIndex: number) => {
  const { sheets, spreadsheetId } = getSheets()
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [{
        deleteDimension: {
          range: {
            sheetId: 0,
            dimension: 'ROWS',
            startIndex: rowIndex - 1,
            endIndex: rowIndex,
          },
        },
      }],
    },
  })
}

export const getSheetId = async (sheetName: string): Promise<number> => {
  const { sheets, spreadsheetId } = getSheets()
  const res = await sheets.spreadsheets.get({ spreadsheetId })
  const sheet = res.data.sheets?.find(s => s.properties?.title === sheetName)
  return sheet?.properties?.sheetId ?? 0
}
