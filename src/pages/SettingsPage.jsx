import { Box, Card, CardContent, Typography, Button, Avatar, Divider, List, ListItem, ListItemText, Alert } from '@mui/material'
import LogoutIcon from '@mui/icons-material/Logout'
import PersonOffIcon from '@mui/icons-material/PersonOff'
import GoogleIcon from '@mui/icons-material/Google'
import { signInWithPopup, linkWithPopup } from 'firebase/auth'
import { auth, googleProvider } from '../firebase'
import { useState } from 'react'

export default function SettingsPage({ user, onSignOut }) {
  const isGuest = user.isAnonymous
  const [linking, setLinking] = useState(false)
  const [linkError, setLinkError] = useState('')

  async function linkGoogle() {
    setLinking(true); setLinkError('')
    try {
      await linkWithPopup(auth.currentUser, googleProvider)
    } catch (e) {
      setLinkError(e.code === 'auth/credential-already-in-use'
        ? 'This Google account is already linked to another account.'
        : e.message)
    } finally { setLinking(false) }
  }

  return (
    <Box sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', p: 2, pb: 10 }}>
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Avatar sx={{ width: 52, height: 52, bgcolor: isGuest ? '#E7E0EC' : 'primary.main' }}
              src={user.photoURL || undefined}>
              {isGuest ? <PersonOffIcon/> : (user.displayName?.[0] || '?')}
            </Avatar>
            <Box>
              <Typography variant="subtitle1" fontWeight={600}>
                {isGuest ? 'Guest User' : (user.displayName || 'User')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {isGuest ? 'Not signed in' : user.email}
              </Typography>
            </Box>
          </Box>

          {isGuest ? (
            <>
              <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
                You're using guest mode. Your data is not backed up and will be lost if you clear the app or switch devices.
              </Alert>
              {linkError && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{linkError}</Alert>}
              <Button fullWidth variant="contained" startIcon={<GoogleIcon/>}
                onClick={linkGoogle} disabled={linking}
                sx={{ borderRadius: 3, mb: 1 }}>
                {linking ? 'Linking…' : 'Link Google account to save data'}
              </Button>
              <Typography variant="caption" color="text.secondary" display="block" textAlign="center">
                Linking keeps all your existing data and backs it up to the cloud.
              </Typography>
              <Divider sx={{ my: 2 }}/>
            </>
          ) : (
            <Box sx={{ background: '#F6F2FF', borderRadius: 2, p: 1.5, mb: 2 }}>
              <Typography variant="caption" color="primary.dark" fontWeight={600} display="block">
                ☁️ Cloud sync active
              </Typography>
              <Typography variant="caption" color="text.secondary">
                All your data is automatically saved and synced across devices.
              </Typography>
            </Box>
          )}

          <Button fullWidth variant="outlined" color="error" startIcon={<LogoutIcon/>}
            onClick={onSignOut} sx={{ borderRadius: 3 }}>
            {isGuest ? 'Exit guest mode' : 'Sign Out'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="subtitle2" gutterBottom>About</Typography>
          <List dense disablePadding>
            {[['App','Partracker'],['Version','2.0.0'],['License','MIT']].map(([k,v]) => (
              <ListItem key={k} disablePadding sx={{ py: 0.5 }}>
                <ListItemText primary={k} secondary={v}
                  primaryTypographyProps={{ variant:'caption', color:'text.secondary' }}
                  secondaryTypographyProps={{ variant:'body2', fontWeight:500 }}/>
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
    </Box>
  )
}
