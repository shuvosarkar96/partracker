import { useState } from 'react'
import {
  Box, Typography, Card, CardContent, IconButton, Chip,
  Stack, Divider, Button, Menu, MenuItem, LinearProgress,
  Collapse, Alert, Snackbar, ToggleButtonGroup, ToggleButton
} from '@mui/material'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import BoltIcon from '@mui/icons-material/Bolt'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'
import DownloadIcon from '@mui/icons-material/Download'
import { format, addMonths, subMonths } from 'date-fns'
import { useSessions } from '../hooks/useData'
import SessionDialog from '../components/SessionDialog'
import { mins2dur, fmtMoney, fmtTime, fmtDate, fmtDayName, getMonthSessions, groupByDay, tsToDate, calcSessionEarnings } from '../utils'

function SessionCard({ session, workplace, onEdit, onDelete, onTogglePaid }) {
  const [anchor, setAnchor] = useState(null)
  const earn = session.earnings
  const hasOT = (session.otMins || 0) > 0 || session.isFullDayOT

  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', py: 1.5, gap: 1.5 }}>
      {/* Paid toggle */}
      <IconButton size="small" onClick={() => onTogglePaid(session)}
        sx={{ mt: 0.5, color: session.isPaid ? 'success.main' : 'text.disabled' }}>
        {session.isPaid ? <CheckCircleIcon fontSize="small"/> : <RadioButtonUncheckedIcon fontSize="small"/>}
      </IconButton>

      {/* Content */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
          <Typography variant="body2" fontWeight={600}>
            {fmtTime(session.startTs)} → {fmtTime(session.endTs)}
          </Typography>
          {session.bkMins > 0 && (
            <Chip label={`Brk ${mins2dur(session.bkMins)}`} size="small" variant="outlined"
              sx={{ height: 18, fontSize: '0.65rem' }}/>
          )}
          {hasOT && (
            <Chip icon={<BoltIcon sx={{ fontSize: '0.7rem !important' }}/>}
              label={session.isFullDayOT ? 'Holiday OT' : `OT ${mins2dur(session.otMins)}`}
              size="small" color="warning" variant="filled"
              sx={{ height: 18, fontSize: '0.65rem', bgcolor: '#FEF3DD', color: '#7a4a08' }}/>
          )}
        </Box>
        {session.note && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.3 }}>
            {session.note}
          </Typography>
        )}
      </Box>

      {/* Right: duration + earnings */}
      <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
        <Typography variant="body2" fontWeight={700} color="primary.dark">
          {mins2dur(session.netMins || session.durationMins)}
        </Typography>
        {earn > 0 && (
          <Typography variant="caption" color="success.main" fontWeight={600}>
            {fmtMoney(earn, workplace?.currency)}
          </Typography>
        )}
      </Box>

      {/* Menu */}
      <IconButton size="small" onClick={e => setAnchor(e.currentTarget)}>
        <MoreVertIcon fontSize="small"/>
      </IconButton>
      <Menu anchorEl={anchor} open={!!anchor} onClose={() => setAnchor(null)}>
        <MenuItem onClick={() => { onEdit(session); setAnchor(null) }}>
          <EditIcon fontSize="small" sx={{ mr: 1 }}/>Edit
        </MenuItem>
        <MenuItem onClick={() => { onTogglePaid(session); setAnchor(null) }}>
          {session.isPaid ? <RadioButtonUncheckedIcon fontSize="small" sx={{ mr: 1 }}/> : <CheckCircleIcon fontSize="small" sx={{ mr: 1 }}/>}
          {session.isPaid ? 'Mark Unpaid' : 'Mark Paid'}
        </MenuItem>
        <MenuItem onClick={() => { onDelete(session.id); setAnchor(null) }} sx={{ color: 'error.main' }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }}/>Delete
        </MenuItem>
      </Menu>
    </Box>
  )
}

export default function HistoryPage({ uid, workplaces, activeWpId }) {
  const workplace = workplaces.find(w => w.id === activeWpId) || null
  const { sessions, loading, updateSession, deleteSession } = useSessions(uid, activeWpId)
  const [viewDate, setViewDate] = useState(new Date())
  const [editSession, setEditSession] = useState(null)
  const [toast, setToast] = useState('')
  const now = new Date()

  const monthSessions = getMonthSessions(sessions, viewDate.getFullYear(), viewDate.getMonth())
  const byDay = groupByDay(monthSessions)
  const days = Object.keys(byDay).sort((a, b) => b.localeCompare(a))

  const totalNet = monthSessions.reduce((a, s) => a + (s.netMins || s.durationMins || 0), 0)
  const totalOT = monthSessions.reduce((a, s) => a + (s.otMins || 0), 0)
  const totalEarn = monthSessions.reduce((a, s) => a + (s.earnings || 0), 0)
  const paidEarn = monthSessions.filter(s => s.isPaid).reduce((a, s) => a + (s.earnings || 0), 0)
  const unpaidEarn = totalEarn - paidEarn
  const workedDays = days.length

  async function handleEdit(data) {
    if (!editSession) return
    await updateSession(editSession.id, data)
    setToast('Session updated ✓')
    setEditSession(null)
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this session?')) return
    await deleteSession(id)
    setToast('Deleted')
  }

  async function handleTogglePaid(session) {
    await updateSession(session.id, { isPaid: !session.isPaid })
  }

  // mark whole month paid/unpaid
  async function markMonthPaid(paid) {
    await Promise.all(monthSessions.map(s => updateSession(s.id, { isPaid: paid })))
    setToast(paid ? 'Month marked as paid ✓' : 'Month marked as unpaid')
  }

  function exportCSV() {
    if (!monthSessions.length) return
    const rows = [
      ['Date', 'Day', 'Clock In', 'Clock Out', 'Net Mins', 'OT Mins', 'Break Mins', 'Earnings', 'Paid', 'Note'],
      ...monthSessions.sort((a,b) => tsToDate(a.startTs) - tsToDate(b.startTs)).map(s => [
        fmtDate(s.startTs), fmtDayName(s.startTs),
        fmtTime(s.startTs), fmtTime(s.endTs),
        (s.netMins || s.durationMins || 0).toFixed(1),
        (s.otMins || 0).toFixed(1),
        (s.bkMins || 0).toFixed(1),
        s.earnings ? fmtMoney(s.earnings, workplace?.currency) : '',
        s.isPaid ? 'Yes' : 'No',
        s.note || ''
      ])
    ]
    const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    a.download = `${workplace?.workplace || 'sessions'}_${format(viewDate, 'MMM_yyyy')}.csv`
    a.click()
  }

  const isCurrentMonth = viewDate.getFullYear() === now.getFullYear() && viewDate.getMonth() === now.getMonth()
  const allPaid = monthSessions.length > 0 && monthSessions.every(s => s.isPaid)

  return (
    <Box sx={{ flex: 1, overflow: 'auto', p: 2, pb: 10 }}>
      {/* Month nav */}
      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
            <IconButton onClick={() => setViewDate(d => subMonths(d, 1))} size="small"><ChevronLeftIcon/></IconButton>
            <Typography variant="h6" fontWeight={600}>{format(viewDate, 'MMMM yyyy')}</Typography>
            <IconButton onClick={() => setViewDate(d => addMonths(d, 1))} size="small"
              disabled={isCurrentMonth}><ChevronRightIcon/></IconButton>
          </Box>

          {loading ? <LinearProgress sx={{ borderRadius: 1 }}/> : monthSessions.length > 0 ? (
            <>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 1, mb: 1.5 }}>
                {[
                  { label: 'Hours', value: mins2dur(totalNet) },
                  { label: 'Days', value: workedDays },
                  { label: 'OT', value: mins2dur(totalOT) },
                  { label: 'Pay', value: workplace?.wage ? fmtMoney(totalEarn, workplace.currency) : '—' },
                ].map(s => (
                  <Box key={s.label} sx={{ textAlign: 'center', background: '#F6F2FF', borderRadius: 2, p: 1 }}>
                    <Typography variant="caption" color="text.secondary" display="block">{s.label}</Typography>
                    <Typography variant="body2" fontWeight={700}>{s.value}</Typography>
                  </Box>
                ))}
              </Box>

              {/* Payment status */}
              {workplace?.wage && (
                <Box sx={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: allPaid ? '#E8F5E9' : '#FFF3E0', borderRadius: 2, p: 1.5
                }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      {allPaid ? 'Fully paid' : `Unpaid: ${fmtMoney(unpaidEarn, workplace.currency)}`}
                    </Typography>
                    <Typography variant="body2" fontWeight={600} color={allPaid ? 'success.main' : 'warning.main'}>
                      {allPaid ? `${fmtMoney(totalEarn, workplace.currency)} received` : `Paid: ${fmtMoney(paidEarn, workplace.currency)}`}
                    </Typography>
                  </Box>
                  <Button size="small" variant="outlined"
                    color={allPaid ? 'error' : 'success'}
                    onClick={() => markMonthPaid(!allPaid)}
                    sx={{ borderRadius: 2, fontSize: '0.7rem' }}>
                    {allPaid ? 'Unmark' : 'Mark Paid'}
                  </Button>
                </Box>
              )}
            </>
          ) : (
            <Typography variant="body2" color="text.secondary" textAlign="center" py={1}>
              No sessions in {format(viewDate, 'MMMM yyyy')}
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Export button */}
      {monthSessions.length > 0 && (
        <Button startIcon={<DownloadIcon/>} onClick={exportCSV} variant="outlined"
          fullWidth sx={{ mb: 2, borderRadius: 3 }}>
          Export CSV — {format(viewDate, 'MMM yyyy')}
        </Button>
      )}

      {/* Sessions grouped by day */}
      {days.map(dayKey => {
        const daySessions = byDay[dayKey]
        const dayDate = new Date(dayKey)
        const dayNet = daySessions.reduce((a, s) => a + (s.netMins || s.durationMins || 0), 0)
        const dayEarn = daySessions.reduce((a, s) => a + (s.earnings || 0), 0)
        const dayPaid = daySessions.every(s => s.isPaid)

        return (
          <Card key={dayKey} sx={{ mb: 1.5 }}>
            <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
              {/* Day header */}
              <Box sx={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                px: 2, py: 1.5,
                background: dayPaid ? '#F1F8E9' : '#FAFAFA',
                borderBottom: '1px solid #F0EBF8'
              }}>
                <Box>
                  <Typography variant="subtitle2" fontWeight={700}>
                    {format(dayDate, 'EEE, dd MMM')}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {mins2dur(dayNet)}{workplace?.wage && dayEarn > 0 ? ` · ${fmtMoney(dayEarn, workplace.currency)}` : ''}
                  </Typography>
                </Box>
                <Chip
                  label={dayPaid ? 'Paid' : 'Unpaid'}
                  size="small"
                  color={dayPaid ? 'success' : 'default'}
                  variant={dayPaid ? 'filled' : 'outlined'}
                  onClick={() => Promise.all(daySessions.map(s => updateSession(s.id, { isPaid: !dayPaid })))}
                  sx={{ cursor: 'pointer', fontSize: '0.7rem' }}
                />
              </Box>

              {/* Sessions */}
              <Box sx={{ px: 2 }}>
                {daySessions.map((s, i) => (
                  <Box key={s.id}>
                    <SessionCard session={s} workplace={workplace}
                      onEdit={setEditSession} onDelete={handleDelete} onTogglePaid={handleTogglePaid}/>
                    {i < daySessions.length - 1 && <Divider/>}
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        )
      })}

      <SessionDialog open={!!editSession} onClose={() => setEditSession(null)}
        onSave={handleEdit} session={editSession} workplace={workplace}/>

      <Snackbar open={!!toast} autoHideDuration={2500} onClose={() => setToast('')}
        message={toast} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}/>
    </Box>
  )
}
