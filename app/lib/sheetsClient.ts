import { google } from 'googleapis'
import type { JWT } from 'google-auth-library'
import { Task, Guest, TimelineEvent, BudgetItem, Vendor } from './types'

type SheetData = {
  tasks: Task[]
  guests: Guest[]
  timeline: TimelineEvent[]
  budget: BudgetItem[]
  vendors: Vendor[]
}

// Canonical types imported from app/lib/types.ts

type SheetData = {
  tasks: Task[];
  guests: Guest[];
  timeline: TimelineEvent[];
  budget: BudgetItem[];
  vendors: Vendor[];
}

let cache: { data: SheetData; ts: number } | null = null
const DEFAULT_REVALIDATE_SECONDS = 120

const getCredentials = (): any => {
  const raw = process.env.GOOGLE_SHEETS_CREDENTIALS
  if (!raw) throw new Error('GOOGLE_SHEETS_CREDENTIALS not configured')
  try {
    return JSON.parse(raw)
  } catch (e) {
    throw new Error('Invalid GOOGLE_SHEETS_CREDENTIALS JSON')
  }
}

const getSheetsClient = () => {
  const creds = getCredentials() as any
  const clientEmail = creds.client_email
  const privateKey = creds.private_key
  const auth = new (require('googleapis').google.auth as any).JWT(
    clientEmail,
    undefined,
    privateKey,
    ['https://www.googleapis.com/auth/spreadsheets.readonly']
  )
  const sheets = (require('googleapis').google as any).sheets({ version: 'v4', auth })
  const spreadsheetId = process.env.SPREADSHEET_ID
  if (!spreadsheetId) throw new Error('SPREADSHEET_ID not configured')
  return { sheets, spreadsheetId }
}

const mapRows = (headers: string[], row: string[]): any => {
  const obj: any = {}
  headers.forEach((h, i) => {
    obj[h] = row[i] ?? ''
  })
  return obj
}

const fetchTab = async (tabName: string, headersRange = `${tabName}!A1:Z1` , dataRange = `${tabName}!A2:Z`): Promise<any[]> => {
  const { sheets, spreadsheetId } = getSheetsClient()
  const headerRes = await sheets.spreadsheets.values.get({ spreadsheetId, range: headersRange })
  const dataRes = await sheets.spreadsheets.values.get({ spreadsheetId, range: dataRange })
  const headers: string[] = headerRes.data.values?.[0] ?? []
  const rows: string[][] = dataRes.data.values ?? []
  return rows.map((r) => mapRows(headers, r))
}

export const getAllSheetData = async (): Promise<SheetData> => {
  const now = Date.now()
  const renew = Number(process.env.REVALIDATE_SECONDS ?? DEFAULT_REVALIDATE_SECONDS)
  if (cache && now - cache.ts < renew * 1000) return cache.data

  // Fetch raw tab rows
  const [tasksRaw, guestsRaw, timelineRaw, budgetRaw, vendorsRaw] = await Promise.all([
    fetchTab('Tasks'),
    fetchTab('Guests'),
    fetchTab('Timeline'),
    fetchTab('Budget'),
    fetchTab('Vendors'),
  ])

  // Helpers to map rows to canonical types with header-name flexibility
  const mapValue = (row: any, keys: string[]) => {
    for (const k of keys) {
      if (row && Object.prototype.hasOwnProperty.call(row, k) && row[k] !== undefined) {
        return row[k]
      }
    }
    return ''
  }

  const mapTask = (row: any, index: number): Task => {
    // common header synonyms
    const title = mapValue(row, ['Title', 'Task', 'Task Title']) || mapValue(row, ['Name'])
    const status = mapValue(row, ['Status', 'State', 'Progress']) || 'pending'
    const dueDate = mapValue(row, ['Due Date', 'DueDate', 'Due'])
    const assignee = mapValue(row, ['Assignee', 'Owner', 'Responsible'])
    const category = mapValue(row, ['Category', 'Bucket', 'Type'])
    const notes = mapValue(row, ['Notes', 'Comment', 'Notes & Comments'])
    const id = row['id'] ?? row['ID'] ?? `task-${index}`
    return { id: String(id), title: title ?? '', status: String(status), dueDate, assignee, category, notes }
  }

  const mapGuest = (row: any, index: number): Guest => {
    const name = mapValue(row, ['Name', 'Guest Name'])
    const rsvp = mapValue(row, ['RSVP', 'rsvp', 'Response']) || ''
    const plusOne = mapValue(row, ['Plus One', 'PlusOne'])
    const dietary = mapValue(row, ['Dietary', 'Diet'])
    const contact = mapValue(row, ['Contact', 'Phone', 'Email'])
    const id = row['id'] ?? row['ID'] ?? `guest-${index}`
    return { id: String(id), name: name ?? '', rsvp: String(rsvp), plusOne, dietary, contact }
  }

  const mapTimeline = (row: any, index: number): TimelineEvent => {
    const event = mapValue(row, ['Event', 'Event Name', 'Title'])
    const date = mapValue(row, ['Date', 'Date/Time', 'EventDate'])
    const location = mapValue(row, ['Location', 'Place'])
    const notes = mapValue(row, ['Notes', 'Notes & Details'])
    const id = row['id'] ?? row['ID'] ?? `timeline-${index}`
    return { id: String(id), event: event ?? '', date, location, notes }
  }

  const mapBudget = (row: any, index: number): BudgetItem => {
    const category = mapValue(row, ['Category', 'Bucket', 'Group'])
    const item = mapValue(row, ['Item', 'Description'])
    const estimated = mapValue(row, ['Est', 'Estimated', 'Budgeted'])
    const actual = mapValue(row, ['Actual', 'Spent', 'ActualCost'])
    const status = mapValue(row, ['Status', 'State']) || 'pending'
    const id = row['id'] ?? row['ID'] ?? `budget-${index}`
    return { id: String(id), category, item, estimated, actual, status }
  }

  const mapVendor = (row: any, index: number): Vendor => {
    const name = mapValue(row, ['Name', 'Vendor Name'])
    const category = mapValue(row, ['Category', 'Type'])
    const contact = mapValue(row, ['Contact', 'Phone', 'Email'])
    const dueDate = mapValue(row, ['Due Date', 'DueDate', 'Date'])
    const notes = mapValue(row, ['Notes', 'Notes & Details'])
    const id = row['id'] ?? row['ID'] ?? `vendor-${index}`
    return { id: String(id), name: name ?? '', category, contact, dueDate, notes }
  }

  const tasks: Task[] = tasksRaw.map((r, i) => mapTask(r, i))
  const guests: Guest[] = guestsRaw.map((r, i) => mapGuest(r, i))
  const timeline: TimelineEvent[] = timelineRaw.map((r, i) => mapTimeline(r, i))
  const budget: BudgetItem[] = budgetRaw.map((r, i) => mapBudget(r, i))
  const vendors: Vendor[] = vendorsRaw.map((r, i) => mapVendor(r, i))

  const data: SheetData = { tasks, guests, timeline, budget, vendors }

  cache = { data, ts: now }
  return data
}

export const getTasks = async (): Promise<any[]> => {
  const data = await getAllSheetData()
  return data.tasks
}

export const getGuests = async (): Promise<any[]> => {
  const data = await getAllSheetData()
  return data.guests
}

export const getTimeline = async (): Promise<any[]> => {
  const data = await getAllSheetData()
  return data.timeline
}

export const getBudget = async (): Promise<any[]> => {
  const data = await getAllSheetData()
  return data.budget
}

export const getVendors = async (): Promise<any[]> => {
  const data = await getAllSheetData()
  return data.vendors
}
