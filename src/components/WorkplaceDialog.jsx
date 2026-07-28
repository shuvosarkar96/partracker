import { useState, useEffect } from 'react'
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, MenuItem, Box, Typography,
  Switch, FormControlLabel, Divider, IconButton
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { CURRENCIES } from '../utils'

const EMPTY = {
  name: '', workplace: '', currency: '₩',
  wage: '', otWage: '',
  defaultBreakMins: '', useDefaultBreak: false
}

export default function WorkplaceDialog({ open, onClose, onSave, initial }) {
  const [form, setForm] = useState(EMPTY)

  useEffect(() => {
    setForm(initial ? { ...EMPTY, ...initial } : EMPTY)
  }, [initial, open])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  async function handleSave() {
    if (!form.name || !form.workplace) return
    await onSave({
      name: form.name.trim(),
      workplace: form.workplace.trim(),
      currency: form.currency,
      wage: parseFloat(form.wage) || null,
      otWage: parseFloat(form.otWage) || null,
      defaultBreakMins: form.useDefaultBreak ? (parseInt(form.defaultBreakMins) || 0) : 0,
      useDefaultBreak: form.useDefaultBreak
    })
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {initial ? 'Edit Workplace' : 'New Workplace'}
        <IconButton onClick={onClose} size="small"><CloseIcon/></IconButton>
      </DialogTitle>
      <DialogContent sx={{ pt: 1 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField label="Your Name" value={form.name} onChange={e => set('name', e.target.value)} required/>
          <TextField label="Workplace / Company" value={form.workplace} onChange={e => set('workplace', e.target.value)} required/>
          <TextField select label="Currency" value={form.currency} onChange={e => set('currency', e.target.value)}>
            {CURRENCIES.map(c => <MenuItem key={c.code} value={c.code}>{c.label}</MenuItem>)}
          </TextField>
          <Divider><Typography variant="caption" color="text.secondary">Wages</Typography></Divider>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <TextField label="Basic Hourly Wage" type="number" value={form.wage}
              onChange={e => set('wage', e.target.value)} inputProps={{ min: 0 }}/>
            <TextField label="Overtime Hourly Wage" type="number" value={form.otWage}
              onChange={e => set('otWage', e.target.value)} inputProps={{ min: 0 }}
              helperText="Blank = 1.5× basic"/>
          </Box>
          <Divider><Typography variant="caption" color="text.secondary">Default Break</Typography></Divider>
          <FormControlLabel
            control={<Switch checked={!!form.useDefaultBreak} onChange={e => set('useDefaultBreak', e.target.checked)}/>}
            label={<Box><Typography variant="body2">Auto-add break to every entry</Typography>
              <Typography variant="caption" color="text.secondary">e.g. 8am–5pm shift with 1hr break → 8 net hours</Typography></Box>}
          />
          {form.useDefaultBreak && (
            <TextField label="Default Break Duration (minutes)" type="number"
              value={form.defaultBreakMins} onChange={e => set('defaultBreakMins', e.target.value)}
              inputProps={{ min: 0, max: 480 }}
              helperText="You can override this per session"/>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} variant="text">Cancel</Button>
        <Button onClick={handleSave} variant="contained"
          disabled={!form.name || !form.workplace}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  )
}
