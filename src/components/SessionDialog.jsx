import { useState, useEffect } from 'react'
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Box, Typography, Switch,
  FormControlLabel, Divider, Chip, Stack, IconButton, Alert
} from '@mui/material'
import { MobileTimePicker } from '@mui/x-date-pickers/MobileTimePicker'
import { MobileDatePicker } from '@mui/x-date-pickers/MobileDatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import CloseIcon from '@mui/icons-material/Close'
import BoltIcon from '@mui/icons-material/Bolt'
import CoffeeIcon from '@mui/icons-material/Coffee'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import { differenceInMinutes, format, setHours, setMinutes } from 'date-fns'
import { Timestamp } from 'firebase/firestore'
import { mins2dur, calcSessionEarnings, fmtMoney } from '../utils'

const OT_QUICK = [
  { label: '30m', mins: 30 },
  { label: '1h', mins: 60 },
  { label: '1.5h', mins: 90 },
  { label: '2h', mins: 120 },
  { label: '3h', mins: 180 },
]

function initForm(session, workplace) {
  const now = new Date()
  if (session) {
    const startDate = session.startTs?.toDate ? session.startTs.toDate() : new Date(session.startTs)
    const endDate = session.endTs?.toDate ? session.endTs.toDate() : new Date(session.endTs)
    return {
      startDate, endDate,
      note: session.note || '',
      breakMins: String(session.bkMins || 0),
      otEnabled: (session.otMins || 0) > 0 || session.isFullDayOT,
      otMins: String(session.otMins || 0),
      isFullDayOT: session.isFullDayOT || false,
      isPaid: session.isPaid || false,
    }
  }
  return {
    startDate: now,
    endDate: now,
    note: '',
    breakMins: String(workplace?.defaultBreakMins || 0),
    otEnabled: false,
    otMins: '0',
    isFullDayOT: false,
    isPaid: false,
  }
}

// Separate date and time for the two-picker approach
function combineDateAndTime(dateSource, timeSource) {
  const d = new Date(dateSource)
  d.setHours(timeSource.getHours(), timeSource.getMinutes(), 0, 0)
  return d
}

export default function SessionDialog({ open, onClose, onSave, session, workplace }) {
  const [form, setForm] = useState(() => initForm(session, workplace))
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) { setForm(initForm(session, workplace)); setError('') }
  }, [open, session, workplace])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const totalMins = form.startDate && form.endDate
    ? Math.max(0, differenceInMinutes(form.endDate, form.startDate)) : 0
  const bkMins = parseInt(form.breakMins) || 0
  const netMins = Math.max(0, totalMins - bkMins)
  const otMins = form.otEnabled
    ? (form.isFullDayOT ? netMins : Math.min(parseInt(form.otMins) || 0, netMins))
    : 0

  const previewEarnings = workplace?.wage
    ? calcSessionEarnings({ netMins, otMins, isFullDayOT: form.isFullDayOT }, workplace)
    : null

  async function handleSave() {
    if (!form.startDate || !form.endDate) { setError('Set both start and end time'); return }
    if (form.endDate <= form.startDate) { setError('End time must be after start time'); return }
    const earnings = calcSessionEarnings({ netMins, otMins, isFullDayOT: form.isFullDayOT }, workplace)
    await onSave({
      startTs: Timestamp.fromDate(form.startDate),
      endTs: Timestamp.fromDate(form.endDate),
      durationMins: totalMins,
      netMins,
      bkMins,
      otMins,
      isFullDayOT: form.isFullDayOT,
      note: form.note.trim(),
      isPaid: form.isPaid,
      earnings: earnings?.total || null,
      baseEarnings: earnings?.base || null,
      otEarnings: earnings?.ot || null,
    })
    onClose()
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
          {session ? 'Edit Session' : 'New Session'}
          <IconButton onClick={onClose} size="small"><CloseIcon/></IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 1 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
            {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}

            {/* ── START ─────────────────────────────── */}
            <Box>
              <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mb: 1, display: 'block' }}>
                CLOCK IN
              </Typography>
              {/* Time first, then date */}
              <Box sx={{ display: 'flex', gap: 1.5 }}>
                <MobileTimePicker
                  label="Time" value={form.startDate}
                  onChange={v => v && set('startDate', combineDateAndTime(form.startDate, v))}
                  slotProps={{ textField: { fullWidth: true } }}/>
                <MobileDatePicker
                  label="Date" value={form.startDate}
                  onChange={v => v && set('startDate', combineDateAndTime(v, form.startDate))}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      InputProps: { startAdornment: <CalendarTodayIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }}/> }
                    }
                  }}/>
              </Box>
            </Box>

            {/* ── END ───────────────────────────────── */}
            <Box>
              <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mb: 1, display: 'block' }}>
                CLOCK OUT
              </Typography>
              <Box sx={{ display: 'flex', gap: 1.5 }}>
                <MobileTimePicker
                  label="Time" value={form.endDate}
                  onChange={v => v && set('endDate', combineDateAndTime(form.endDate, v))}
                  slotProps={{ textField: { fullWidth: true } }}/>
                <MobileDatePicker
                  label="Date" value={form.endDate}
                  onChange={v => v && set('endDate', combineDateAndTime(v, form.endDate))}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      InputProps: { startAdornment: <CalendarTodayIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }}/> }
                    }
                  }}/>
              </Box>
            </Box>

            {/* Duration preview */}
            {totalMins > 0 && (
              <Box sx={{
                background: '#F6F2FF', borderRadius: 3, p: 2,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Net hours</Typography>
                  <Typography variant="h6" color="primary.dark" fontWeight={700}>{mins2dur(netMins)}</Typography>
                  {bkMins > 0 && <Typography variant="caption" color="text.secondary">{mins2dur(bkMins)} break deducted</Typography>}
                </Box>
                {previewEarnings && (
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="caption" color="text.secondary">Estimated pay</Typography>
                    <Typography variant="h6" color="success.main" fontWeight={700}>
                      {fmtMoney(previewEarnings.total, workplace?.currency)}
                    </Typography>
                  </Box>
                )}
              </Box>
            )}

            <Divider/>

            {/* ── BREAK ─────────────────────────────── */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <CoffeeIcon color="action"/>
              <TextField label="Break (minutes)" type="number"
                value={form.breakMins} onChange={e => set('breakMins', e.target.value)}
                inputProps={{ min: 0 }} sx={{ maxWidth: 160 }}/>
              {workplace?.useDefaultBreak && workplace?.defaultBreakMins > 0 && (
                <Chip label="Default" size="small" color="primary" variant="outlined"/>
              )}
            </Box>

            <Divider/>

            {/* ── OVERTIME ──────────────────────────── */}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <BoltIcon sx={{ color: '#E67E22' }}/>
                <Typography variant="subtitle2" fontWeight={600}>Overtime</Typography>
              </Box>

              <FormControlLabel
                control={<Switch checked={form.otEnabled}
                  onChange={e => { set('otEnabled', e.target.checked); if (!e.target.checked) { set('isFullDayOT', false); set('otMins', '0') } }}/>}
                label="This session includes overtime"/>

              {form.otEnabled && (
                <Box sx={{ mt: 2, p: 2, background: '#FEF9F0', borderRadius: 3, border: '1px solid #F5D49A' }}>
                  {/* Full day OT — holiday rate */}
                  <FormControlLabel
                    control={
                      <Switch checked={form.isFullDayOT}
                        onChange={e => { set('isFullDayOT', e.target.checked); set('otMins', e.target.checked ? String(netMins) : '0') }}
                        sx={{ '& .Mui-checked+.MuiSwitch-track': { bgcolor: '#E67E22 !important' } }}/>
                    }
                    label={
                      <Box>
                        <Typography variant="body2" fontWeight={600} color="#7a4a08">
                          Full day overtime (holiday / special day)
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Entire shift is paid at overtime rate
                        </Typography>
                      </Box>
                    }
                  />

                  {!form.isFullDayOT && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                        How many OT hours?
                      </Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 1.5 }}>
                        {OT_QUICK.map(q => {
                          const active = parseInt(form.otMins) === q.mins
                          return (
                            <Chip key={q.label} label={q.label} clickable
                              onClick={() => set('otMins', String(q.mins))}
                              sx={{
                                bgcolor: active ? '#E67E22' : '#fff',
                                color: active ? '#fff' : '#7a4a08',
                                border: '1px solid #f5d49a',
                                fontWeight: 600,
                                '&:hover': { bgcolor: active ? '#c96a10' : '#fef3dd' }
                              }}/>
                          )
                        })}
                      </Stack>
                      <TextField label="Custom OT (minutes)" type="number"
                        value={form.otMins}
                        onChange={e => set('otMins', e.target.value)}
                        inputProps={{ min: 0, max: netMins }}
                        size="small" sx={{ maxWidth: 180 }}
                        helperText={parseInt(form.otMins) > 0 ? `= ${mins2dur(parseInt(form.otMins))}` : ''}/>
                    </Box>
                  )}

                  {previewEarnings && (
                    <Box sx={{ mt: 1.5, p: 1.5, background: 'rgba(255,255,255,0.7)', borderRadius: 2 }}>
                      <Typography variant="caption" color="#7a4a08">
                        Base: <strong>{fmtMoney(previewEarnings.base, workplace?.currency)}</strong>
                        {' + '}OT: <strong>{fmtMoney(previewEarnings.ot, workplace?.currency)}</strong>
                        {' = '}<strong>{fmtMoney(previewEarnings.total, workplace?.currency)}</strong>
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}
            </Box>

            <Divider/>

            {/* ── NOTE + PAID ───────────────────────── */}
            <TextField label="Note (optional)" value={form.note}
              onChange={e => set('note', e.target.value)}
              placeholder="e.g. evening shift, kitchen, holiday"/>

            <FormControlLabel
              control={
                <Switch checked={form.isPaid} onChange={e => set('isPaid', e.target.checked)}
                  sx={{ '& .Mui-checked+.MuiSwitch-track': { bgcolor: '#2E7D32 !important' } }}/>
              }
              label={<Typography variant="body2" color={form.isPaid ? 'success.main' : 'text.primary'} fontWeight={form.isPaid ? 600 : 400}>
                {form.isPaid ? 'Marked as paid ✓' : 'Mark as paid'}
              </Typography>}
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={onClose} variant="text" color="inherit">Cancel</Button>
          <Button onClick={handleSave} variant="contained" size="large" sx={{ px: 4 }}>
            {session ? 'Save Changes' : 'Add Session'}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  )
}
