import {
  type OverviewEntry,
  type EntourageMember,
  type ChecklistItem,
  type Supplier,
  type BudgetLine,
  type Guest,
  type Sponsor,
  type TableSeat,
} from './types'

type SheetData = {
  overview: OverviewEntry[]
  entourage: EntourageMember[]
  checklist: ChecklistItem[]
  suppliers: Supplier[]
  budget: BudgetLine[]
  guests: Guest[]
  sponsors: Sponsor[]
  seating: TableSeat[]
}

let cache: { data: SheetData; ts: number } | null = null
const DEFAULT_REVALIDATE_SECONDS = 120

const getCredentials = (): any => {
  const raw = process.env.GOOGLE_SHEETS_CREDENTIALS
  if (!raw) throw new Error('GOOGLE_SHEETS_CREDENTIALS not configured')
  try {
    return JSON.parse(raw)
  } catch {
    throw new Error('Invalid GOOGLE_SHEETS_CREDENTIALS JSON')
  }
}

const getSheetsClient = () => {
  const creds = getCredentials()
  const { google } = require('googleapis')
  const auth = new google.auth.JWT(
    creds.client_email,
    undefined,
    creds.private_key,
    ['https://www.googleapis.com/auth/spreadsheets']
  )
  const sheets = google.sheets({ version: 'v4', auth })
  const spreadsheetId = process.env.SPREADSHEET_ID
  if (!spreadsheetId) throw new Error('SPREADSHEET_ID not configured')
  return { sheets, spreadsheetId }
}

const fetchRange = async (range: string): Promise<string[][]> => {
  const { sheets, spreadsheetId } = getSheetsClient()
  const res = await sheets.spreadsheets.values.get({ spreadsheetId, range })
  return res.data.values ?? []
}

const parseOverviewTab = (rows: string[][]): { entries: OverviewEntry[]; entourage: EntourageMember[] } => {
  const entries: OverviewEntry[] = []
  const entourage: EntourageMember[] = []
  let inEntourage = false

  for (const row of rows) {
    const col0 = (row[0] || '').trim()
    const col1 = (row[1] || '').trim()

    if (col0 === 'ENTOURAGE') {
      inEntourage = true
      continue
    }

    if (inEntourage) {
      if (col0 === 'Role' || !col0) continue
      entourage.push({ role: col0, name: col1 })
    } else {
      if (!col0 || col0.startsWith('💍')) continue
      entries.push({ key: col0, value: col1 })
    }
  }

  return { entries, entourage }
}

const parseChecklistTab = (rows: string[][]): ChecklistItem[] => {
  const items: ChecklistItem[] = []
  for (const row of rows) {
    const timeframe = (row[0] || '').trim()
    const task = (row[1] || '').trim()
    if (!timeframe || !task || timeframe === 'Timeframe') continue
    items.push({
      timeframe,
      task,
      status: (row[2] || '').trim(),
      notes: (row[3] || '').trim(),
    })
  }
  return items
}

const parseSupplierTab = (rows: string[][]): Supplier[] => {
  const suppliers: Supplier[] = []
  for (const row of rows) {
    const category = (row[0] || '').trim()
    const name = (row[1] || '').trim()
    if (!category || category === 'SUPPLIER TRACKER Category' || category === 'Category') continue
    if (category === 'TOTAL') continue
    suppliers.push({
      category,
      supplierName: name,
      contactPerson: (row[2] || '').trim(),
      contactNo: (row[3] || '').trim(),
      totalPrice: (row[4] || '').trim(),
      downpayment: (row[5] || '').trim(),
      balance: (row[6] || '').trim(),
      paid: (row[7] || '').trim(),
      contractSigned: (row[8] || '').trim(),
      notes: (row[9] || '').trim(),
    })
  }
  return suppliers
}

const parseBudgetTab = (rows: string[][]): BudgetLine[] => {
  const lines: BudgetLine[] = []
  for (const row of rows) {
    const item = (row[0] || '').trim()
    if (!item || item === 'BUDGET SUMMARY Item') continue
    lines.push({
      item,
      amount: (row[1] || '').trim(),
      notes: (row[2] || '').trim(),
    })
  }
  return lines
}

const parseGuestTab = (rows: string[][]): Guest[] => {
  const guests: Guest[] = []
  for (const row of rows) {
    const name = (row[0] || '').trim()
    if (!name || name === 'GUEST LIST Guest Name' || name === 'TOTAL GUESTS' || name === 'Guest Name') continue
    guests.push({
      name,
      side: (row[1] || '').trim(),
      role: (row[2] || '').trim(),
      contactNo: (row[3] || '').trim(),
      invitationSent: (row[4] || '').trim(),
      rsvpStatus: (row[5] || '').trim(),
      pax: (row[6] || '').trim(),
      notes: (row[7] || '').trim(),
    })
  }
  return guests
}

const parseSponsorTab = (rows: string[][]): Sponsor[] => {
  const sponsors: Sponsor[] = []
  for (const row of rows) {
    const name = (row[0] || '').trim()
    if (!name || name === 'PRINCIPAL SPONSORS (NINONGS & NINANGS)' || name === 'Name') continue
    sponsors.push({
      name,
      side: (row[1] || '').trim(),
      role: (row[2] || '').trim(),
    })
  }
  return sponsors
}

const parseSeatingTab = (rows: string[][]): TableSeat[] => {
  if (rows.length < 2) return []
  const headerRow = rows[1]
  const tables: TableSeat[] = []
  for (let i = 0; i < headerRow.length; i++) {
    const header = (headerRow[i] || '').trim()
    if (!header) continue
    const match = header.match(/TABLE\s+(\d+)/i)
    if (match) {
      const tableNum = parseInt(match[1], 10)
      const guests: string[] = []
      for (let r = 2; r < rows.length; r++) {
        const guestName = (rows[r]?.[i] || '').trim()
        if (guestName) guests.push(guestName)
      }
      tables.push({ tableNumber: tableNum, guests })
    }
  }
  return tables.sort((a, b) => a.tableNumber - b.tableNumber)
}

export const getAllSheetData = async (): Promise<SheetData> => {
  const now = Date.now()
  const renew = Number(process.env.REVALIDATE_SECONDS ?? DEFAULT_REVALIDATE_SECONDS)
  if (cache && now - cache.ts < renew * 1000) return cache.data

  const [
    overviewRaw,
    checklistRaw,
    supplierRaw,
    budgetRaw,
    guestRaw,
    sponsorRaw,
    seatingRaw,
  ] = await Promise.all([
    fetchRange('Wedding Overview!A1:B50'),
    fetchRange('Timeline & Checklist!A2:D'),
    fetchRange('Supplier Tracker!A2:J'),
    fetchRange('Budget Summary!A2:C'),
    fetchRange('Guest List!A2:H'),
    fetchRange('Principal Sponsors!A2:C'),
    fetchRange('Seating Plan!A1:N'),
  ])

  const { entries, entourage } = parseOverviewTab(overviewRaw)

  const data: SheetData = {
    overview: entries,
    entourage,
    checklist: parseChecklistTab(checklistRaw),
    suppliers: parseSupplierTab(supplierRaw),
    budget: parseBudgetTab(budgetRaw),
    guests: parseGuestTab(guestRaw),
    sponsors: parseSponsorTab(sponsorRaw),
    seating: parseSeatingTab(seatingRaw),
  }

  cache = { data, ts: now }
  return data
}
