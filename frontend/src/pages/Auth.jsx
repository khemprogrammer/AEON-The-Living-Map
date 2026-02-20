import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Auth, setToken } from '../api.js'
import { Container, Paper, Typography, TextField, Button, Stack, ToggleButton, ToggleButtonGroup, Breadcrumbs, Link as MLink, Snackbar, Alert, Tooltip } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import LockOpenIcon from '@mui/icons-material/LockOpen'
import PersonAddIcon from '@mui/icons-material/PersonAdd'

export default function AuthPage() {
  const [mode, setMode] = useState('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' })
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      let res
      if (mode === 'login') {
        res = await Auth.token(username, password)
      } else {
        res = await Auth.signup(username, password, email)
      }
      setToken(res.token)
      setSnack({ open: true, message: 'Authenticated successfully', severity: 'success' })
      navigate('/')
    } catch (e) {
      setError(e.message)
      setSnack({ open: true, message: e.message || 'Authentication failed', severity: 'error' })
    }
  }

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Breadcrumbs sx={{ mb: 2 }}>
        <MLink component={RouterLink} to="/auth">Auth</MLink>
      </Breadcrumbs>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
          <Typography variant="h5">{mode === 'login' ? 'Login' : 'Sign Up'}</Typography>
          <ToggleButtonGroup value={mode} exclusive onChange={(_, v) => v && setMode(v)} size="small">
            <ToggleButton value="login"><LockOpenIcon sx={{ mr: 1 }} />Login</ToggleButton>
            <ToggleButton value="signup"><PersonAddIcon sx={{ mr: 1 }} />Sign Up</ToggleButton>
          </ToggleButtonGroup>
        </Stack>
        {error && <Paper elevation={0} sx={{ p: 2, mt: 2, bgcolor: 'error.light', color: 'error.contrastText' }}>{error}</Paper>}
        <form onSubmit={submit}>
          <Stack spacing={2} sx={{ mt: 2 }}>
            {mode === 'signup' && (
              <Tooltip title="We use email to create your account">
                <TextField label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
              </Tooltip>
            )}
            <Tooltip title="Your login name">
              <TextField label="Username" value={username} onChange={e => setUsername(e.target.value)} />
            </Tooltip>
            <Tooltip title="Use at least 8 characters">
              <TextField label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
            </Tooltip>
            <Stack direction="row" spacing={2}>
              <Tooltip title="Submit">
                <Button type="submit" variant="contained">{mode === 'login' ? 'Login' : 'Create account'}</Button>
              </Tooltip>
              <Button type="button" onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}>
                {mode === 'login' ? 'Need to sign up?' : 'Have an account?'}
              </Button>
            </Stack>
          </Stack>
        </form>
      </Paper>
      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack({ ...snack, open: false })}>
        <Alert onClose={() => setSnack({ ...snack, open: false })} severity={snack.severity} variant="filled">{snack.message}</Alert>
      </Snackbar>
    </Container>
  )
}
