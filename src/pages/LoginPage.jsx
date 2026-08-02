import { useState, useEffect } from 'react'
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  updateProfile
} from 'firebase/auth'
import { auth, googleProvider } from '../firebase'
import {
  Box, Button, TextField, Typography, Divider,
  Tab, Tabs, Alert, CircularProgress, Paper
} from '@mui/material'
import GoogleIcon from '@mui/icons-material/Google'
import PersonOffIcon from '@mui/icons-material/PersonOff'
import AccessTimeIcon from '@mui/icons-material/AccessTime'

export default function LoginPage() {
  const [tab, setTab] = useState(0)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleGoogle() {
    setError(''); setLoading(true)
    try {
      await signInWithPopup(auth, googleProvider)
    } catch (e) {
      setError(
        e.code === 'auth/popup-blocked'
          ? 'Popup was blocked. Please allow popups for this site in your browser settings.'
          : e.code === 'auth/popup-closed-by-user'
          ? 'Sign-in cancelled.'
          : e.code === 'auth/operation-not-allowed'
          ? 'Google sign-in is not enabled. Go to Firebase Console → Authentication → Sign-in method → enable Google.'
          : e.message
      )
      setLoading(false)
    }
  }

  async function handleEmail(e) {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      if (tab === 0) {
        await signInWithEmailAndPassword(auth, email, password)
      } else {
        if (!name.trim()) { setError('Please enter your name'); setLoading(false); return }
        const cred = await createUserWithEmailAndPassword(auth, email, password)
        await updateProfile(cred.user, { displayName: name.trim() })
      }
    } catch (e) {
      setError(
        e.code === 'auth/operation-not-allowed' ? 'Email sign-in not enabled in Firebase Console'
        : e.code === 'auth/invalid-credential' ? 'Wrong email or password'
        : e.code === 'auth/user-not-found' ? 'No account with this email'
        : e.code === 'auth/email-already-in-use' ? 'Email already registered'
        : e.code === 'auth/weak-password' ? 'Password must be at least 6 characters'
        : e.message
      )
    } finally { setLoading(false) }
  }

  async function handleGuest() {
    setError(''); setLoading(true)
    try { await signInAnonymously(auth) }
    catch (e) {
      setError(
        e.code === 'auth/operation-not-allowed'
          ? 'Enable Anonymous sign-in in Firebase Console → Authentication → Sign-in method'
          : e.message
      )
      setLoading(false)
    }
  }

  return (
    <Box sx={{
      minHeight: '100dvh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', overflowY: 'auto',
      background: 'linear-gradient(145deg, #EADDFF 0%, #FFFBFE 50%, #E8DEF8 100%)',
      p: 3
    }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Box sx={{
          width: 72, height: 72, borderRadius: 4, overflow: 'hidden',
          mx: 'auto', mb: 2, boxShadow: '0 4px 20px rgba(103,80,164,0.3)'
        }}>
          <img src="favicon.svg" width="72" height="72" alt="Partracker" style={{ display: 'block' }}/>
        </Box>
        <Typography variant="h4" fontWeight={700} color="primary.dark">Partracker</Typography>
        <Typography variant="body2" color="text.secondary" mt={0.5}>
          Your part-time job hours tracker
        </Typography>
      </Box>

      <Paper elevation={0} sx={{
        width: '100%', maxWidth: 400, p: 3, borderRadius: 4,
        border: '1px solid #E7E0EC', background: 'rgba(255,255,255,0.95)'
      }}>
        <Button fullWidth variant="outlined" size="large"
          startIcon={loading ? <CircularProgress size={18}/> : <GoogleIcon/>}
          onClick={handleGoogle} disabled={loading}
          sx={{ borderRadius: 3, mb: 2, borderColor: '#dadce0', color: '#3c4043',
            '&:hover': { background: '#F8F9FA', borderColor: '#dadce0' } }}>
          Continue with Google
        </Button>

        <Divider sx={{ my: 2 }}>
          <Typography variant="caption" color="text.secondary">or use email</Typography>
        </Divider>

        <Tabs value={tab} onChange={(_, v) => { setTab(v); setError('') }}
          variant="fullWidth" sx={{ mb: 2 }}>
          <Tab label="Sign In"/>
          <Tab label="Register"/>
        </Tabs>

        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2, fontSize: '0.8rem' }}>{error}</Alert>}

        <Box component="form" onSubmit={handleEmail}>
          {tab === 1 && (
            <TextField label="Full Name" value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Shuvo" sx={{ mb: 2 }}/>
          )}
          <TextField label="Email" type="email" value={email}
            onChange={e => setEmail(e.target.value)} required sx={{ mb: 2 }}/>
          <TextField label="Password" type="password" value={password}
            onChange={e => setPassword(e.target.value)} required sx={{ mb: 3 }}
            helperText={tab === 1 ? 'Minimum 6 characters' : ''}/>
          <Button type="submit" fullWidth variant="contained" size="large"
            disabled={loading} sx={{ borderRadius: 3 }}>
            {loading ? <CircularProgress size={22} sx={{ color: 'white' }}/>
              : tab === 0 ? 'Sign In' : 'Create Account'}
          </Button>
        </Box>

        <Divider sx={{ my: 2 }}>
          <Typography variant="caption" color="text.secondary">or</Typography>
        </Divider>

        <Button fullWidth variant="text" startIcon={<PersonOffIcon/>}
          onClick={handleGuest} disabled={loading}
          sx={{ borderRadius: 3, color: 'text.secondary' }}>
          Continue without account
        </Button>
        <Typography variant="caption" color="text.secondary"
          sx={{ display: 'block', textAlign: 'center', mt: 1 }}>
          Guest data is saved only on this device.
        </Typography>
      </Paper>
    </Box>
  )
}
