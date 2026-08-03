import { useState } from 'react'
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  updateProfile,
  GoogleAuthProvider,
  signInWithCredential,
  fetchSignInMethodsForEmail,
  sendPasswordResetEmail
} from 'firebase/auth'
import { auth, googleProvider } from '../firebase'
import {
  Box, Button, TextField, Typography, Divider,
  Tab, Tabs, Alert, CircularProgress, Paper, Link
} from '@mui/material'
import GoogleIcon from '@mui/icons-material/Google'
import PersonOffIcon from '@mui/icons-material/PersonOff'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth'

const isNative = !!(window.Capacitor?.isNativePlatform?.())

// ── FORGOT PASSWORD VIEW ───────────────────────────────────────────────────
function ForgotPassword({ onBack }) {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleReset(e) {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      await sendPasswordResetEmail(auth, email)
      setSent(true)
    } catch (e) {
      setError(
        e.code === 'auth/user-not-found' ? 'No account found with this email'
        : e.code === 'auth/invalid-email' ? 'Invalid email address'
        : e.message
      )
    } finally { setLoading(false) }
  }

  return (
    <Box>
      <Button startIcon={<ArrowBackIcon/>} onClick={onBack}
        sx={{ mb: 2, color: 'text.secondary' }} variant="text" size="small">
        Back to sign in
      </Button>
      <Typography variant="h6" fontWeight={600} mb={0.5}>Reset password</Typography>
      <Typography variant="body2" color="text.secondary" mb={2}>
        Enter your email and we'll send a reset link.
      </Typography>
      {sent ? (
        <Alert severity="success" sx={{ borderRadius: 2 }}>
          Reset link sent to <strong>{email}</strong>. Check your inbox.
        </Alert>
      ) : (
        <Box component="form" onSubmit={handleReset}>
          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
          <TextField label="Email" type="email" value={email}
            onChange={e => setEmail(e.target.value)} required sx={{ mb: 2 }}/>
          <Button type="submit" fullWidth variant="contained"
            disabled={loading} sx={{ borderRadius: 3 }}>
            {loading ? <CircularProgress size={22} sx={{ color: 'white' }}/> : 'Send Reset Link'}
          </Button>
        </Box>
      )}
    </Box>
  )
}

// ── MAIN LOGIN ─────────────────────────────────────────────────────────────
export default function LoginPage() {
  const [tab, setTab] = useState(0)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showForgot, setShowForgot] = useState(false)

  async function handleGoogle() {
    setError(''); setLoading(true)
    try {
      if (isNative) {
        await GoogleAuth.initialize({
          clientId: '198539573236-dul6jl4pm3pah4p6celb5b1meppfq1pq.apps.googleusercontent.com',
          scopes: ['profile', 'email'],
          grantOfflineAccess: true,
        })
        const googleUser = await GoogleAuth.signIn()
        const idToken = googleUser?.authentication?.idToken
        if (!idToken) throw new Error('Google sign-in failed — no token received')
        const credential = GoogleAuthProvider.credential(idToken)
        await signInWithCredential(auth, credential)
      } else {
        await signInWithPopup(auth, googleProvider)
      }
    } catch (e) {
      // "already linked" means user exists with email — just sign them in with Google
      if (e.code === 'auth/credential-already-in-use' ||
          e.code === 'auth/email-already-in-use' ||
          e.message?.includes('already linked')) {
        setError('This Google account is already associated with an email account. Please sign in with email/password instead.')
      } else {
        setError(
          e.code === 'auth/popup-blocked' ? 'Allow popups for this site in browser settings'
          : e.code === 'auth/popup-closed-by-user' ? 'Sign-in cancelled'
          : e.code === 'auth/operation-not-allowed' ? 'Google sign-in not enabled in Firebase Console'
          : e.message || 'Google sign-in failed'
        )
      }
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
        e.code === 'auth/invalid-credential' ? 'Wrong email or password'
        : e.code === 'auth/user-not-found' ? 'No account found with this email'
        : e.code === 'auth/wrong-password' ? 'Wrong password'
        : e.code === 'auth/email-already-in-use' ? 'Email already registered — try signing in'
        : e.code === 'auth/weak-password' ? 'Password must be at least 6 characters'
        : e.code === 'auth/operation-not-allowed' ? 'Email sign-in not enabled in Firebase Console'
        : e.code === 'auth/too-many-requests' ? 'Too many attempts. Try again later or reset your password.'
        : e.message
      )
      setLoading(false)
    }
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
      {/* Logo */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Box sx={{
          width: 72, height: 72, borderRadius: 4,
          background: 'linear-gradient(135deg, #6750A4, #9C7CDB)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          mx: 'auto', mb: 2, boxShadow: '0 4px 20px rgba(103,80,164,0.3)'
        }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2"/>
            <polyline points="12,6 12,12 16,14" stroke="white" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
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
        {showForgot ? (
          <ForgotPassword onBack={() => setShowForgot(false)}/>
        ) : (
          <>
            {/* Google */}
            <Button fullWidth variant="outlined" size="large"
              startIcon={loading ? <CircularProgress size={18}/> : <GoogleIcon/>}
              onClick={handleGoogle} disabled={loading}
              sx={{ borderRadius: 3, mb: 2, borderColor: '#dadce0', color: '#3c4043',
                '&:hover': { background: '#F8F9FA' } }}>
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

            {error && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: 2, fontSize: '0.8rem' }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleEmail}>
              {tab === 1 && (
                <TextField label="Full Name" value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Shuvo" sx={{ mb: 2 }}/>
              )}
              <TextField label="Email" type="email" value={email}
                onChange={e => setEmail(e.target.value)} required sx={{ mb: 2 }}/>
              <TextField label="Password" type="password" value={password}
                onChange={e => setPassword(e.target.value)} required
                sx={{ mb: tab === 0 ? 1 : 3 }}
                helperText={tab === 1 ? 'Minimum 6 characters' : ''}/>

              {tab === 0 && (
                <Box sx={{ textAlign: 'right', mb: 2 }}>
                  <Link component="button" type="button" variant="caption"
                    onClick={() => { setShowForgot(true); setError('') }}
                    sx={{ color: 'primary.main', cursor: 'pointer' }}>
                    Forgot password?
                  </Link>
                </Box>
              )}

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
          </>
        )}
      </Paper>
    </Box>
  )
}
