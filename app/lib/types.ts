export type OverviewEntry = {
  key: string
  value: string
}

export type EntourageMember = {
  role: string
  name: string
}

export type ChecklistItem = {
  timeframe: string
  task: string
  status: string
  notes: string
}

export type Supplier = {
  category: string
  supplierName: string
  contactPerson: string
  contactNo: string
  totalPrice: string
  downpayment: string
  balance: string
  paid: string
  contractSigned: string
  notes: string
}

export type BudgetLine = {
  item: string
  amount: string
  notes: string
}

export type Guest = {
  name: string
  side: string
  role: string
  contactNo: string
  invitationSent: string
  rsvpStatus: string
  pax: string
  notes: string
}

export type Sponsor = {
  name: string
  side: string
  role: string
}

export type TableSeat = {
  tableNumber: number
  guests: string[]
}
