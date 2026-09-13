export type BookingStatus = 'confirmed' | 'cancelled'
export type BookingSource = 'website' | 'team_go'

export type BookingRecord = {
  id: string
  name: string
  email: string
  phone: string
  company: string
  note: string
  startsAt: Date
  endsAt: Date
  status: BookingStatus
  source: BookingSource
  externalId: string | null
  createdAt: Date
  updatedAt: Date
}

export type BookingInput = {
  name: string
  email: string
  phone: string
  company: string
  note: string
  startsAt: Date
  source: BookingSource
  externalId?: string | null
}
