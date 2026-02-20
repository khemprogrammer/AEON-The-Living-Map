import React, { useMemo, useState, useEffect } from 'react'
import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import { AppBar, Toolbar, Button, Typography, ThemeProvider, createTheme, CssBaseline, Container, Tooltip, IconButton, GlobalStyles } from '@mui/material'
import LandscapeIcon from '@mui/icons-material/Landscape'
import SettingsIcon from '@mui/icons-material/Settings'
import PeopleAltIcon from '@mui/icons-material/PeopleAlt'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import LockIcon from '@mui/icons-material/Lock'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import LightModeIcon from '@mui/icons-material/LightMode'
import Home from './pages/Home.jsx'
import AuthPage from './pages/Auth.jsx'
import EnginePage from './pages/Engine.jsx'
import HumanPage from './pages/Human.jsx'
import UrgencyPage from './pages/Urgency.jsx'
import VaultPage from './pages/Vault.jsx'
import { getToken, setToken } from './api.js'

export default function App() {
  const navigate = useNavigate()
  const token = getToken()
  const logout = () => {
    setToken('')
    navigate('/auth')
  }
  const [mode, setMode] = useState(() => localStorage.getItem('aeon-theme') === 'dark' ? 'dark' : 'light')
  useEffect(() => { localStorage.setItem('aeon-theme', mode) }, [mode])
  const baseTokens = {
    primary: '#4F46E5',
    secondary: '#22C55E',
    error: '#EF4444',
    warning: '#F59E0B',
    success: '#22C55E',
    info: '#0EA5E9',
    backgroundLight: '#f8f9fb',
    backgroundDark: '#0f1115',
    surfaceLight: '#ffffff',
    surfaceDark: '#10141a',
    headingFont: 'Poppins, Inter, Roboto, Arial, sans-serif',
    bodyFont: 'Inter, Roboto, Arial, sans-serif',
    weightBold: 700,
    weightSemi: 600,
    weightMedium: 500,
    letterSpacing: 0.2,
    radius: 12
  }
  const stored = (() => { try { const r = localStorage.getItem('aeon-brand'); return r ? JSON.parse(r) : {} } catch { return {} } })()
  const tokens = { ...baseTokens, ...stored }
  const theme = useMemo(() => createTheme({
    palette: {
      mode,
      primary: { main: tokens.primary },
      secondary: { main: tokens.secondary },
      success: { main: tokens.success },
      warning: { main: tokens.warning },
      error: { main: tokens.error },
      info: { main: tokens.info },
      background: { default: mode === 'dark' ? tokens.backgroundDark : tokens.backgroundLight, paper: mode === 'dark' ? tokens.surfaceDark : tokens.surfaceLight }
    },
    typography: {
      fontFamily: tokens.bodyFont,
      h1: { fontFamily: tokens.headingFont, fontWeight: tokens.weightBold, letterSpacing: tokens.letterSpacing },
      h2: { fontFamily: tokens.headingFont, fontWeight: tokens.weightBold, letterSpacing: tokens.letterSpacing },
      h3: { fontFamily: tokens.headingFont, fontWeight: tokens.weightSemi, letterSpacing: tokens.letterSpacing },
      h4: { fontFamily: tokens.headingFont, fontWeight: tokens.weightSemi, letterSpacing: tokens.letterSpacing },
      h5: { fontFamily: tokens.headingFont, fontWeight: tokens.weightMedium, letterSpacing: tokens.letterSpacing },
      h6: { fontFamily: tokens.headingFont, fontWeight: tokens.weightMedium, letterSpacing: tokens.letterSpacing },
      button: { fontWeight: tokens.weightMedium }
    },
    shape: { borderRadius: tokens.radius },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            transition: 'transform 120ms ease, box-shadow 120ms ease',
            '&:hover': { transform: 'translateY(-1px)', boxShadow: '0 6px 16px rgba(0,0,0,0.15)' },
            '&.Mui-focusVisible': { boxShadow: `0 0 0 3px ${tokens.primary}55` }
          }
        }
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            transition: 'box-shadow 150ms ease',
            '&:hover': { boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }
          }
        }
      },
      MuiChip: {
        styleOverrides: {
          root: { transition: 'transform 120ms ease', '&:hover': { transform: 'translateY(-1px)' } }
        }
      }
    }
  }), [mode])
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GlobalStyles styles={{ body: { fontFamily: tokens.bodyFont } }} />
      <div className="h-full flex flex-col">
        <AppBar position="static" color="default" elevation={1}>
          <Toolbar className="flex gap-2">
            <Typography variant="h6" className="flex-1">AEON</Typography>
            <Button component={Link} to="/" color="inherit" startIcon={<LandscapeIcon />}>World</Button>
            <Button component={Link} to="/engine" color="inherit" startIcon={<SettingsIcon />}>Engine</Button>
            <Button component={Link} to="/human" color="inherit" startIcon={<PeopleAltIcon />}>Human</Button>
            <Button component={Link} to="/urgency" color="inherit" startIcon={<AccessTimeIcon />}>Urgency</Button>
            <Button component={Link} to="/vault" color="inherit" startIcon={<LockIcon />}>Vault</Button>
            <Tooltip title={mode === 'dark' ? 'Switch to light' : 'Switch to dark'}>
              <IconButton onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')} color="inherit">
                {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
            </Tooltip>
            {token ? (
              <Button onClick={logout} color="error" variant="outlined">Logout</Button>
            ) : (
              <Button component={Link} to="/auth" color="primary" variant="outlined">Login</Button>
            )}
          </Toolbar>
        </AppBar>
        <Container maxWidth="lg" className="flex-1 py-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/engine" element={<EnginePage />} />
            <Route path="/human" element={<HumanPage />} />
            <Route path="/urgency" element={<UrgencyPage />} />
            <Route path="/vault" element={<VaultPage />} />
          </Routes>
        </Container>
      </div>
    </ThemeProvider>
  )
}
