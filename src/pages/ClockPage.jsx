import { useState, useEffect } from 'react'
import {
  Box, Typography, Button, Card, CardContent, Fab,
  MenuItem, Select, FormControl, InputLabel, Chip,
  Grid, LinearProgress, Snackbar, Alert
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import WorkIcon from '@mui/icons-material/Work'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import PaymentsIcon from '@mui/icons-material/Payments'
import BoltIcon from '@mui/icons-material/Bolt'
import { format } from 'date-fns'
import { useSessions } from '../hooks/useData'
import SessionDialog from '../components/SessionDialog'
import { mins2dur, fmtMoney, calcSessionEarnings, getMonthSessions, tsToDate } from '../utils'

export default function ClockPage({ uid, workplaces, activeWpId, onSwitchWp, settings }) {
  const workplace = workplaces.find(w => w.id === activeWpId) || null
  const { sessions, loading, addSession } = useSessions(uid, activeWpId)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [now, setNow] = useState(new Date())
  const [toast, setToast] = useState('')

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000)
    return () => clearInterval(t)
  }, [])

  const today = new Date()
  const monthSessions = getMonthSessions(sessions, today.getFullYear(), today.getMonth())
  const totalNet = monthSessions.reduce((a, s) => a + (s.netMins || s.durationMins || 0), 0)
  const totalOT = monthSessions.reduce((a, s) => a + (s.otMins || 0), 0)
  const totalEarn = monthSessions.reduce((a, s) => a + (s.earnings || 0), 0)
  const workedDays = new Set(monthSessions.map(s => format(tsToDate(s.startTs), 'yyyy-MM-dd'))).size
  const unpaidSessions = monthSessions.filter(s => !s.isPaid)

  async function handleAddSession(data) {
    await addSession(data)
    setToast('Session added ✓')
  }

  if (!workplaces.length) {
    return (
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', p: 3, textAlign: 'center' }}>
        <WorkIcon sx={{ fontSize: 64, color: '#E7E0EC', mb: 2 }}/>
        <Typography variant="h6" color="text.secondary" gutterBottom>No workplace yet</Typography>
        <Typography variant="body2" color="text.secondary">
          Go to the Workplaces tab to add your first workplace
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', WebkitOverflowScrolling: 'touch', p: 2, pb: 10, width: '100%' }}>
      {/* Live clock */}
      <Card sx={{ mb: 2, background: 'linear-gradient(135deg, #6750A4 0%, #9C7CDB 100%)', border: 'none' }}>
        <CardContent sx={{ textAlign: 'center', py: 3 }}>
          <Typography variant="h2" fontWeight={700} color="white" sx={{ letterSpacing: -2, fontVariantNumeric: 'tabular-nums' }}>
            {format(now, 'hh:mm')}
          </Typography>
          <Typography variant="body1" color="rgba(255,255,255,0.8)">
            {format(now, 'a')} · {format(now, 'EEEE, dd MMM yyyy')}
          </Typography>
        </CardContent>
      </Card>

      {/* Workplace selector */}
      {workplaces.length > 1 && (
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Active Workplace</InputLabel>
          <Select value={activeWpId || ''} label="Active Workplace"
            onChange={e => onSwitchWp(e.target.value)}
            sx={{ borderRadius: 3 }}>
            {workplaces.map(w => (
              <MenuItem key={w.id} value={w.id}>{w.name} · {w.workplace}</MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      {workplace && (
        <>
          {/* Active workplace chip */}
          <Chip icon={<WorkIcon/>} label={`${workplace.name} · ${workplace.workplace}`}
            color="primary" variant="outlined" sx={{ mb: 2, borderRadius: 3 }}/>

          {/* This month stats */}
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
            {format(today, 'MMMM yyyy')}
          </Typography>
          <Grid container spacing={1.5} sx={{ mb: 2 }}>
            {[
              { label: 'Hours', value: mins2dur(totalNet), icon: <AccessTimeIcon fontSize="small"/>, color: '#6750A4' },
              { label: 'Days', value: workedDays, icon: <CalendarTodayIcon fontSize="small"/>, color: '#625B71' },
              { label: 'Overtime', value: mins2dur(totalOT), icon: <BoltIcon fontSize="small"/>, color: '#E67E22' },
              { label: 'Est. Pay', value: workplace.wage ? fmtMoney(totalEarn, workplace.currency) : '—', icon: <PaymentsIcon fontSize="small"/>, color: '#2E7D32' },
            ].map(stat => (
              <Grid item xs={6} key={stat.label}>
                <Card sx={{ height: '100%' }}>
                  <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5, color: stat.color }}>
                      {stat.icon}
                      <Typography variant="caption" color="text.secondary">{stat.label}</Typography>
                    </Box>
                    <Typography variant="h6" fontWeight={700} sx={{ fontSize: '1.1rem' }}>{stat.value}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Unpaid alert */}
          {unpaidSessions.length > 0 && (
            <Alert severity="warning" sx={{ mb: 2, borderRadius: 3 }}>
              {unpaidSessions.length} unpaid session{unpaidSessions.length > 1 ? 's' : ''} this month
              {workplace.wage && ` · ${fmtMoney(unpaidSessions.reduce((a,s) => a+(s.earnings||0), 0), workplace.currency)} owed`}
            </Alert>
          )}

          {/* Default break info */}
          {workplace.useDefaultBreak && workplace.defaultBreakMins > 0 && (
            <Alert severity="info" sx={{ mb: 2, borderRadius: 3 }} icon={false}>
              <Typography variant="caption">
                Default break: <strong>{mins2dur(workplace.defaultBreakMins)}</strong> auto-applied to new entries
              </Typography>
            </Alert>
          )}
        </>
      )}

      {/* FAB */}
      <Fab color="primary" variant="extended" onClick={() => setDialogOpen(true)}
        sx={{ position: 'fixed', bottom: 80, right: 20 }}>
        <AddIcon sx={{ mr: 1 }}/>
        Add Entry
      </Fab>

      <SessionDialog open={dialogOpen} onClose={() => setDialogOpen(false)}
        onSave={handleAddSession} workplace={workplace}/>

      <Snackbar open={!!toast} autoHideDuration={2500} onClose={() => setToast('')}
        message={toast} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}/>
    </Box>
  )
}
