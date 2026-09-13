import 'server-only'

const DEFAULT_TIME_ZONE = 'Europe/Bratislava'

function integerFromEnv(name: string, fallback: number, min: number, max: number) {
  const parsed = Number.parseInt(process.env[name] || '', 10)
  return Number.isInteger(parsed) && parsed >= min && parsed <= max ? parsed : fallback
}

function timeFromEnv(name: string, fallback: string) {
  const value = process.env[name]?.trim() || fallback
  const match = /^(\d{1,2}):(\d{2})$/.exec(value)
  if (!match) return fallback
  const hour = Number(match[1])
  const minute = Number(match[2])
  return hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59
    ? `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
    : fallback
}

function timeToMinutes(value: string) {
  const [hour = 0, minute = 0] = value.split(':').map(Number)
  return hour * 60 + minute
}

function weekdaysFromEnv() {
  const values = (process.env.BOOKING_WEEKDAYS || '1,2,3,4,5')
    .split(',')
    .map((value) => Number.parseInt(value.trim(), 10))
    .filter((value) => Number.isInteger(value) && value >= 1 && value <= 7)
  return [...new Set(values)].sort((a, b) => a - b).length
    ? [...new Set(values)].sort((a, b) => a - b)
    : [1, 2, 3, 4, 5]
}

function validTimeZone(value: string) {
  try {
    new Intl.DateTimeFormat('sk-SK', { timeZone: value }).format()
    return value
  } catch {
    return DEFAULT_TIME_ZONE
  }
}

export type BookingConfig = ReturnType<typeof getBookingConfig>

export function getBookingConfig() {
  const dayStart = timeFromEnv('BOOKING_DAY_START', '09:00')
  const dayEnd = timeFromEnv('BOOKING_DAY_END', '16:00')
  const slotMinutes = integerFromEnv('BOOKING_SLOT_MINUTES', 60, 15, 240)
  const startMinutes = timeToMinutes(dayStart)
  const configuredEndMinutes = timeToMinutes(dayEnd)
  const endMinutes = configuredEndMinutes > startMinutes
    ? configuredEndMinutes
    : Math.min(startMinutes + slotMinutes, 24 * 60)

  return {
    dayEnd: `${String(Math.floor(endMinutes / 60)).padStart(2, '0')}:${String(endMinutes % 60).padStart(2, '0')}`,
    dayStart,
    endMinutes,
    leadHours: integerFromEnv('BOOKING_LEAD_HOURS', 24, 0, 720),
    slotMinutes,
    startMinutes,
    timeZone: validTimeZone(process.env.BOOKING_TIME_ZONE?.trim() || DEFAULT_TIME_ZONE),
    weekdays: weekdaysFromEnv(),
    windowDays: integerFromEnv('BOOKING_WINDOW_DAYS', 45, 7, 180),
  }
}
