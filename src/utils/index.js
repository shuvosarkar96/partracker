import { format, differenceInMinutes } from 'date-fns'

export const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
export const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
export const CURRENCIES = [
  { code: '₩', label: 'Korean Won (KRW)' },
  { code: '$', label: 'US Dollar (USD)' },
  { code: '৳', label: 'Bangladeshi Taka (BDT)' },
  { code: '€', label: 'Euro (EUR)' },
  { code: '¥', label: 'Japanese Yen (JPY)' },
]

export function mins2dur(mins) {
  if (!mins || mins <= 0) return '0h 0m'
  const h = Math.floor(mins / 60)
  const m = Math.round(mins % 60)
  return `${h}h ${m}m`
}

export function fmtMoney(amount, sym = '₩') {
  if (!amount) return `${sym}0`
  return `${sym}${Math.round(amount).toLocaleString()}`
}

export function fmtDateTime(ts) {
  if (!ts) return ''
  const d = ts?.toDate ? ts.toDate() : new Date(ts)
  return format(d, 'dd MMM yyyy, hh:mm a')
}

export function fmtTime(ts) {
  if (!ts) return ''
  const d = ts?.toDate ? ts.toDate() : new Date(ts)
  return format(d, 'hh:mm a')
}

export function fmtDate(ts) {
  if (!ts) return ''
  const d = ts?.toDate ? ts.toDate() : new Date(ts)
  return format(d, 'dd MMM yyyy')
}

export function fmtDayName(ts) {
  if (!ts) return ''
  const d = ts?.toDate ? ts.toDate() : new Date(ts)
  return format(d, 'EEE')
}

export function tsToDate(ts) {
  if (!ts) return new Date()
  return ts?.toDate ? ts.toDate() : new Date(ts)
}

export function calcSessionEarnings(session, workplace) {
  if (!workplace?.wage) return null
  const net = session.netMins || session.durationMins || 0
  const otMins = session.otMins || 0
  const isFullDayOT = session.isFullDayOT || false

  let baseEarn = 0, otEarn = 0
  const otRate = workplace.otWage || workplace.wage * 1.5

  if (isFullDayOT) {
    // entire shift at OT rate
    otEarn = (net / 60) * otRate
  } else {
    const baseMins = Math.max(0, net - otMins)
    baseEarn = (baseMins / 60) * workplace.wage
    otEarn = (otMins / 60) * otRate
  }

  return { base: baseEarn, ot: otEarn, total: baseEarn + otEarn }
}

export function getMonthSessions(sessions, year, month) {
  return sessions.filter(s => {
    const d = tsToDate(s.startTs)
    return d.getFullYear() === year && d.getMonth() === month
  })
}

export function groupByDay(sessions) {
  const groups = {}
  sessions.forEach(s => {
    const d = tsToDate(s.startTs)
    const key = format(d, 'yyyy-MM-dd')
    if (!groups[key]) groups[key] = []
    groups[key].push(s)
  })
  return groups
}
