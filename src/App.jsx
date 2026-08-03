import { useState, useEffect } from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from './firebase'
import {
  ThemeProvider, CssBaseline, Box,
  BottomNavigation, BottomNavigationAction,
  CircularProgress, Typography
} from '@mui/material'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import PaymentsIcon from '@mui/icons-material/Payments'
import BusinessIcon from '@mui/icons-material/Business'
import SettingsIcon from '@mui/icons-material/Settings'
import theme from './theme'
import LoginPage from './pages/LoginPage'
import ClockPage from './pages/ClockPage'
import HistoryPage from './pages/HistoryPage'
import PaymentPage from './pages/PaymentPage'
import WorkplacesPage from './pages/WorkplacesPage'
import SettingsPage from './pages/SettingsPage'
import { useWorkplaces, useSettings } from './hooks/useData'

const pageStyle = {
  flex: 1,
  overflowY: 'auto',
  overflowX: 'hidden',
  WebkitOverflowScrolling: 'touch',
  width: '100%',
}

function AppShell({ user }) {
  const [tab, setTab] = useState(0)
  const { workplaces } = useWorkplaces(user.uid)
  const { settings, updateSettings } = useSettings(user.uid)
  const activeWpId = settings.activeWorkplaceId || workplaces[0]?.id || null
  const switchWp = (id) => updateSettings({ activeWorkplaceId: id })

  const pages = [
    <ClockPage uid={user.uid} workplaces={workplaces} activeWpId={activeWpId} onSwitchWp={switchWp}/>,
    <HistoryPage uid={user.uid} workplaces={workplaces} activeWpId={activeWpId}/>,
    <PaymentPage uid={user.uid} workplaces={workplaces} activeWpId={activeWpId}/>,
    <WorkplacesPage uid={user.uid} activeWpId={activeWpId} onSwitchWp={switchWp}/>,
    <SettingsPage user={user} onSignOut={() => signOut(auth)}/>,
  ]

  return (
    <Box sx={{
      width: '100%',
      maxWidth: 480,
      mx: 'auto',
      height: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      bgcolor: 'background.default',
    }}>
      {/* Header */}
      <Box sx={{
        px: 2, py: 1.5,
        borderBottom: '1px solid #E7E0EC',
        background: '#FFFBFE',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
        width: '100%',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{
            width: 30, height: 30, borderRadius: 1.5, flexShrink: 0,
            background: 'linear-gradient(135deg,#6750A4,#9C7CDB)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2"/>
              <polyline points="12,6 12,12 16,14" stroke="white" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Box>
          <Typography variant="h6" fontWeight={700} color="primary.dark"
            sx={{ letterSpacing: -0.3 }}>
            Partracker
          </Typography>
        </Box>
        <Typography variant="caption" color="text.secondary"
          noWrap sx={{ maxWidth: 160 }}>
          {workplaces.find(w => w.id === activeWpId)?.workplace || ''}
        </Typography>
      </Box>

      {/* Active page */}
      <Box sx={pageStyle}>
        {pages[tab]}
      </Box>

      {/* Bottom nav */}
      <BottomNavigation value={tab} onChange={(_, v) => setTab(v)}
        sx={{ borderTop: '1px solid #E7E0EC', flexShrink: 0, height: 60, width: '100%' }}>
        <BottomNavigationAction label="Clock" icon={<AccessTimeIcon/>}/>
        <BottomNavigationAction label="History" icon={<CalendarMonthIcon/>}/>
        <BottomNavigationAction label="Payment" icon={<PaymentsIcon/>}/>
        <BottomNavigationAction label="Places" icon={<BusinessIcon/>}/>
        <BottomNavigationAction label="Settings" icon={<SettingsIcon/>}/>
      </BottomNavigation>
    </Box>
  )
}

export default function App() {
  const [user, setUser] = useState(undefined)

  useEffect(() => {
    return onAuthStateChanged(auth, u => setUser(u || null))
  }, [])

  if (user === undefined) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline/>
        <Box sx={{
          height: '100dvh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 2
        }}>
          <Box sx={{
            width: 48, height: 48, borderRadius: 2,
            background: 'linear-gradient(135deg,#6750A4,#9C7CDB)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2"/>
              <polyline points="12,6 12,12 16,14" stroke="white" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Box>
          <CircularProgress size={24} thickness={3}/>
        </Box>
      </ThemeProvider>
    )
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline/>
      {user ? <AppShell user={user}/> : <LoginPage/>}
    </ThemeProvider>
  )
}
