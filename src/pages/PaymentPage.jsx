import { useState } from 'react'
import {
  Box, Typography, Card, CardContent, IconButton,
  Checkbox, Button, LinearProgress, Divider, Snackbar, Chip
} from '@mui/material'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import BoltIcon from '@mui/icons-material/Bolt'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import PendingIcon from '@mui/icons-material/Pending'
import { format, addMonths, subMonths } from 'date-fns'
import { useSessions } from '../hooks/useData'
import { mins2dur, fmtMoney, getMonthSessions, groupByDay, tsToDate } from '../utils'

export default function PaymentPage({ uid, workplaces, activeWpId }) {
  const workplace = workplaces.find(w => w.id === activeWpId) || null
  const { sessions, loading, updateSession } = useSessions(uid, activeWpId)
  const [viewDate, setViewDate] = useState(new Date())
  const [toast, setToast] = useState('')

  const now = new Date()
  const monthSessions = getMonthSessions(sessions, viewDate.getFullYear(), viewDate.getMonth())
  const byDay = groupByDay(monthSessions)
  const days = Object.keys(byDay).sort((a, b) => b.localeCompare(a))
  const isCurrentMonth = viewDate.getFullYear() === now.getFullYear() && viewDate.getMonth() === now.getMonth()

  const totalEarn = monthSessions.reduce((a, s) => a + (s.earnings || 0), 0)
  const paidEarn = monthSessions.filter(s => s.isPaid).reduce((a, s) => a + (s.earnings || 0), 0)
  const unpaidEarn = totalEarn - paidEarn
  const totalNet = monthSessions.reduce((a, s) => a + (s.netMins || s.durationMins || 0), 0)
  const totalOT = monthSessions.reduce((a, s) => a + (s.otMins || 0), 0)
  const paidDays = days.filter(dk => byDay[dk].every(s => s.isPaid)).length
  const unpaidDays = days.length - paidDays
  const allPaid = monthSessions.length > 0 && monthSessions.every(s => s.isPaid)
  const sym = workplace?.currency || '₩'

  async function toggleDay(dayKey, paid) {
    await Promise.all(byDay[dayKey].map(s => updateSession(s.id, { isPaid: paid })))
    setToast(paid ? 'Day marked paid ✓' : 'Marked unpaid')
  }
  async function toggleAll(paid) {
    await Promise.all(monthSessions.map(s => updateSession(s.id, { isPaid: paid })))
    setToast(paid ? 'All marked as paid ✓' : 'All marked as unpaid')
  }

  if (!workplaces.length) return (
    <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
      <Typography color="text.secondary">Add a workplace first</Typography>
    </Box>
  )

  return (
    <Box sx={{ flex: 1, overflow: 'auto', p: 2, pb: 10 }}>

      {/* Month nav */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <IconButton onClick={() => setViewDate(d => subMonths(d, 1))}
          sx={{ bgcolor: '#F6F2FF' }}><ChevronLeftIcon color="primary"/></IconButton>
        <Typography variant="h6" fontWeight={700}>{format(viewDate, 'MMMM yyyy')}</Typography>
        <IconButton onClick={() => setViewDate(d => addMonths(d, 1))} disabled={isCurrentMonth}
          sx={{ bgcolor: isCurrentMonth ? undefined : '#F6F2FF' }}>
          <ChevronRightIcon color={isCurrentMonth ? 'disabled' : 'primary'}/>
        </IconButton>
      </Box>

      {loading ? <LinearProgress sx={{ borderRadius: 1, mb: 2 }}/> : monthSessions.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <PendingIcon sx={{ fontSize: 56, color: '#E7E0EC', mb: 2 }}/>
          <Typography color="text.secondary">No sessions in {format(viewDate, 'MMMM yyyy')}</Typography>
        </Box>
      ) : (
        <>
          {/* Summary */}
          <Card sx={{ mb: 2, background: allPaid ? 'linear-gradient(135deg,#E8F5E9,#F1F8E9)' : 'linear-gradient(135deg,#FFF8E1,#FFF3E0)', border: `1px solid ${allPaid ? '#A5D6A7' : '#FFE082'}` }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                {allPaid
                  ? <CheckCircleIcon color="success"/>
                  : <PendingIcon sx={{ color: '#E67E22' }}/>}
                <Typography variant="subtitle1" fontWeight={700} color={allPaid ? 'success.dark' : '#7a4a08'}>
                  {allPaid ? 'Fully Paid' : `${unpaidDays} day${unpaidDays !== 1 ? 's' : ''} unpaid`}
                </Typography>
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mb: 1.5 }}>
                {[
                  { label: 'Total hours', value: mins2dur(totalNet), color: 'text.primary' },
                  { label: 'Total sessions', value: monthSessions.length, color: 'text.primary' },
                  ...(workplace?.wage ? [
                    { label: 'Paid amount', value: fmtMoney(paidEarn, sym), color: 'success.main' },
                    { label: 'Unpaid amount', value: fmtMoney(unpaidEarn, sym), color: unpaidEarn > 0 ? 'error.main' : 'text.secondary' },
                  ] : []),
                ].map(s => (
                  <Box key={s.label} sx={{ background: 'rgba(255,255,255,0.7)', borderRadius: 2, p: 1.2 }}>
                    <Typography variant="caption" color="text.secondary" display="block">{s.label}</Typography>
                    <Typography variant="body1" fontWeight={700} color={s.color}>{s.value}</Typography>
                  </Box>
                ))}
              </Box>

              {totalOT > 0 && (
                <Box sx={{ background: '#FEF3DD', borderRadius: 2, p: 1.2, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <BoltIcon sx={{ color: '#E67E22', fontSize: 18 }}/>
                  <Typography variant="body2" color="#7a4a08" fontWeight={600}>
                    Overtime: {mins2dur(totalOT)}
                  </Typography>
                </Box>
              )}

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                <Button variant="contained" color="success" onClick={() => toggleAll(true)}
                  disabled={allPaid} sx={{ borderRadius: 2, fontWeight: 600 }}>
                  Mark All Paid
                </Button>
                <Button variant="outlined" color="error" onClick={() => toggleAll(false)}
                  disabled={!allPaid} sx={{ borderRadius: 2 }}>
                  Unmark All
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* Day list */}
          <Typography variant="caption" color="text.secondary" fontWeight={600}
            sx={{ display: 'block', mb: 1, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Day by day
          </Typography>

          {days.map(dk => {
            const ss = byDay[dk]
            const dayDate = new Date(dk)
            const dayNet = ss.reduce((a, s) => a + (s.netMins || s.durationMins || 0), 0)
            const dayEarn = ss.reduce((a, s) => a + (s.earnings || 0), 0)
            const dayOT = ss.reduce((a, s) => a + (s.otMins || 0), 0)
            const hasFullDayOT = ss.some(s => s.isFullDayOT)
            const paid = ss.every(s => s.isPaid)

            return (
              <Card key={dk} sx={{
                mb: 1.2,
                border: `1.5px solid ${paid ? '#A5D6A7' : '#FFE082'}`,
                background: paid ? '#FAFFF8' : '#FFFDF0'
              }}>
                <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 1.5, gap: 1 }}>
                    <Checkbox checked={paid} onChange={e => toggleDay(dk, e.target.checked)}
                      color="success" size="small" sx={{ p: 0 }}/>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Typography variant="body2" fontWeight={700} color="text.primary">
                          {format(dayDate, 'EEE, dd MMM')}
                        </Typography>
                        {hasFullDayOT && (
                          <Chip label="Holiday OT" size="small" icon={<BoltIcon sx={{ fontSize: '12px !important' }}/>}
                            sx={{ height: 18, fontSize: '0.6rem', bgcolor: '#FEF3DD', color: '#7a4a08', border: '1px solid #f5d49a' }}/>
                        )}
                        {!hasFullDayOT && dayOT > 0 && (
                          <Chip label={`OT ${mins2dur(dayOT)}`} size="small"
                            icon={<BoltIcon sx={{ fontSize: '12px !important' }}/>}
                            sx={{ height: 18, fontSize: '0.6rem', bgcolor: '#FEF3DD', color: '#7a4a08', border: '1px solid #f5d49a' }}/>
                        )}
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {mins2dur(dayNet)}
                        {workplace?.wage && dayEarn > 0 ? ` · ${fmtMoney(dayEarn, sym)}` : ''}
                        {` · ${ss.length} session${ss.length > 1 ? 's' : ''}`}
                      </Typography>
                    </Box>
                    <Chip
                      label={paid ? '✓ Paid' : 'Unpaid'}
                      size="small"
                      onClick={() => toggleDay(dk, !paid)}
                      sx={{
                        cursor: 'pointer', fontWeight: 700, fontSize: '0.72rem',
                        bgcolor: paid ? '#E8F5E9' : '#FFF3E0',
                        color: paid ? '#2E7D32' : '#E67E22',
                        border: `1px solid ${paid ? '#A5D6A7' : '#FFB74D'}`,
                        '&:hover': { opacity: 0.8 }
                      }}/>
                  </Box>
                </CardContent>
              </Card>
            )
          })}
        </>
      )}

      <Snackbar open={!!toast} autoHideDuration={2000} onClose={() => setToast('')}
        message={toast} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}/>
    </Box>
  )
}
