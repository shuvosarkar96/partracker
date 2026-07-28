import { useState } from 'react'
import {
  Box, Typography, Card, CardContent, CardActions,
  Button, IconButton, Chip, Stack, Divider, Snackbar, Alert
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import WorkIcon from '@mui/icons-material/Work'
import CoffeeIcon from '@mui/icons-material/Coffee'
import BoltIcon from '@mui/icons-material/Bolt'
import { useWorkplaces } from '../hooks/useData'
import WorkplaceDialog from '../components/WorkplaceDialog'
import { mins2dur, fmtMoney } from '../utils'

export default function WorkplacesPage({ uid, activeWpId, onSwitchWp }) {
  const { workplaces, addWorkplace, updateWorkplace, deleteWorkplace } = useWorkplaces(uid)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [toast, setToast] = useState('')

  async function handleSave(data) {
    if (editing) {
      await updateWorkplace(editing.id, data)
      setToast('Workplace updated ✓')
    } else {
      const ref = await addWorkplace(data)
      if (!activeWpId) onSwitchWp(ref.id)
      setToast('Workplace added ✓')
    }
    setEditing(null)
  }

  async function handleDelete(wp) {
    if (!window.confirm(`Delete "${wp.workplace}"? All sessions will be lost.`)) return
    await deleteWorkplace(wp.id)
    if (activeWpId === wp.id) onSwitchWp(workplaces.find(w => w.id !== wp.id)?.id || null)
    setToast('Deleted')
  }

  function openEdit(wp) { setEditing(wp); setDialogOpen(true) }
  function openAdd() { setEditing(null); setDialogOpen(true) }

  return (
    <Box sx={{ flex:1, overflow:'auto', p:2, pb:10 }}>
      <Box sx={{ display:'flex', alignItems:'center', justifyContent:'space-between', mb:2 }}>
        <Typography variant="h6" fontWeight={600}>Workplaces</Typography>
        <Button startIcon={<AddIcon/>} variant="contained" onClick={openAdd} sx={{ borderRadius:3 }}>
          Add
        </Button>
      </Box>

      {workplaces.length === 0 ? (
        <Box sx={{ textAlign:'center', py:6 }}>
          <WorkIcon sx={{ fontSize:64, color:'#E7E0EC', mb:2 }}/>
          <Typography variant="h6" color="text.secondary" gutterBottom>No workplaces yet</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb:3 }}>
            Add your first workplace to start tracking hours
          </Typography>
          <Button variant="contained" startIcon={<AddIcon/>} onClick={openAdd} sx={{ borderRadius:3 }}>
            Add Workplace
          </Button>
        </Box>
      ) : workplaces.map(wp => (
        <Card key={wp.id} sx={{
          mb:1.5,
          border: wp.id === activeWpId ? '2px solid #6750A4' : '1px solid #E7E0EC',
          ...(wp.id === activeWpId ? { boxShadow:'0 0 0 4px #EADDFF' } : {})
        }}>
          <CardContent sx={{ pb:1 }}>
            <Box sx={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between' }}>
              <Box>
                <Box sx={{ display:'flex', alignItems:'center', gap:1, mb:0.5 }}>
                  <Typography variant="subtitle1" fontWeight={700}>{wp.workplace}</Typography>
                  {wp.id === activeWpId && (
                    <Chip icon={<CheckCircleIcon sx={{ fontSize:'14px !important' }}/>}
                      label="Active" size="small" color="primary" variant="filled"
                      sx={{ height:20, fontSize:'0.65rem' }}/>
                  )}
                </Box>
                <Typography variant="body2" color="text.secondary">{wp.name}</Typography>
              </Box>
              <Stack direction="row">
                <IconButton size="small" onClick={() => openEdit(wp)}><EditIcon fontSize="small"/></IconButton>
                <IconButton size="small" onClick={() => handleDelete(wp)} color="error"><DeleteIcon fontSize="small"/></IconButton>
              </Stack>
            </Box>

            <Divider sx={{ my:1 }}/>

            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {wp.wage && (
                <Chip label={`${wp.currency||'₩'}${Number(wp.wage).toLocaleString()}/hr`}
                  size="small" variant="outlined" color="primary"/>
              )}
              {wp.otWage ? (
                <Chip icon={<BoltIcon sx={{ fontSize:'12px !important' }}/>}
                  label={`OT ${wp.currency||'₩'}${Number(wp.otWage).toLocaleString()}/hr`}
                  size="small" variant="outlined" color="warning"
                  sx={{ color:'#7a4a08', borderColor:'#f5d49a' }}/>
              ) : wp.wage ? (
                <Chip icon={<BoltIcon sx={{ fontSize:'12px !important' }}/>}
                  label="OT 1.5×" size="small" variant="outlined" color="warning"
                  sx={{ color:'#7a4a08', borderColor:'#f5d49a' }}/>
              ) : null}
              {wp.useDefaultBreak && wp.defaultBreakMins > 0 && (
                <Chip icon={<CoffeeIcon sx={{ fontSize:'12px !important' }}/>}
                  label={`${mins2dur(wp.defaultBreakMins)} break`}
                  size="small" variant="outlined"/>
              )}
            </Stack>
          </CardContent>

          {wp.id !== activeWpId && (
            <CardActions sx={{ pt:0 }}>
              <Button size="small" onClick={() => onSwitchWp(wp.id)} sx={{ borderRadius:2 }}>
                Switch to this workplace
              </Button>
            </CardActions>
          )}
        </Card>
      ))}

      <WorkplaceDialog
        open={dialogOpen}
        onClose={() => { setDialogOpen(false); setEditing(null) }}
        onSave={handleSave}
        initial={editing}
      />

      <Snackbar open={!!toast} autoHideDuration={2500} onClose={() => setToast('')}
        message={toast} anchorOrigin={{ vertical:'bottom', horizontal:'center' }}/>
    </Box>
  )
}
