export type Task = {
  id: string
  title: string
  status: string
  dueDate?: string
  assignee?: string
  category?: string
  notes?: string
}

export type Guest = {
  id: string
  name: string
  rsvp: string
  plusOne?: string
  dietary?: string
  contact?: string
}

export type TimelineEvent = {
  id: string
  event: string
  date?: string
  location?: string
  notes?: string
}

export type BudgetItem = {
  id: string
  category?: string
  item?: string
  estimated?: string
  actual?: string
  status?: string
}

export type Vendor = {
  id: string
  name: string
  category?: string
  contact?: string
  dueDate?: string
  notes?: string
}
