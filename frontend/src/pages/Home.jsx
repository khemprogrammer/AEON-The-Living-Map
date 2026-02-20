import React, { useEffect, useState } from 'react'
import { useNavigate, Link as RouterLink } from 'react-router-dom'
import { World as WorldAPI, Auth as AuthAPI } from '../api.js'
import LivingWorld from '../components/LivingWorld.jsx'
import { Paper, Typography, Stack, TextField, Button, Slider, Checkbox, FormControlLabel, Chip, Breadcrumbs, Link as MLink, Snackbar, Alert, Tooltip, Divider, ToggleButton, ToggleButtonGroup } from '@mui/material'
import TerrainIcon from '@mui/icons-material/Terrain'
import RefreshIcon from '@mui/icons-material/Refresh'
import AutoGraphIcon from '@mui/icons-material/AutoGraph'
import SpeedIcon from '@mui/icons-material/Speed'
import LocalFloristIcon from '@mui/icons-material/LocalFlorist'
import LandscapeIcon from '@mui/icons-material/Landscape'
import WbSunnyIcon from '@mui/icons-material/WbSunny'
import StarBorderIcon from '@mui/icons-material/StarBorder'
import HomeIcon from '@mui/icons-material/Home'
import GroupIcon from '@mui/icons-material/Group'

export default function Home() {
  const [world, setWorld] = useState(null)
  const [error, setError] = useState('')
  const [seed, setSeed] = useState('')
  const [forestCapMax, setForestCapMax] = useState(6000)
  const [autoLOD, setAutoLOD] = useState(true)
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' })
  const [consistency, setConsistency] = useState(0.5)
  const [neglect, setNeglect] = useState(0.0)
  const [stress, setStress] = useState(0.5)
  const [breakthroughs, setBreakthroughs] = useState(0)
  const [dreamsActive, setDreamsActive] = useState(0)
  const [dreamsPostponed, setDreamsPostponed] = useState(0)
  const [relType, setRelType] = useState('family')
  const [relHealth, setRelHealth] = useState(0.7)
  const [relationships, setRelationships] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    (async () => {
      try {
        await AuthAPI.me()
      } catch {
        navigate('/auth')
        return
      }
      try {
        const data = await WorldAPI.getState()
        setWorld(data)
        setSeed(String(data.terrain_seed ?? ''))
        setConsistency(Number(data.habit_consistency ?? 0.5))
        setNeglect(Number(data.neglect ?? 0.0))
        setStress(Number(data.stress_level ?? 0.5))
        setBreakthroughs(Number(data.breakthroughs ?? 0))
      } catch (e) {
        setError(e.message)
      }
    })()
  }, [])

  const saveSeed = async (e) => {
    e.preventDefault()
    const val = parseInt(seed, 10)
    if (!Number.isFinite(val)) return
    try {
      const updated = await WorldAPI.patchState({ terrain_seed: val })
      setWorld(updated)
      setSnack({ open: true, message: 'World updated', severity: 'success' })
    } catch (err) {
      setSnack({ open: true, message: err.message || 'Failed to update world', severity: 'error' })
    }
  }
  const patchWorld = async (payload, msg) => {
    try {
      const updated = await WorldAPI.patchState(payload)
      setWorld(updated)
      if (updated.habit_consistency !== undefined) setConsistency(updated.habit_consistency)
      if (updated.neglect !== undefined) setNeglect(updated.neglect)
      if (updated.stress_level !== undefined) setStress(updated.stress_level)
      if (updated.breakthroughs !== undefined) setBreakthroughs(updated.breakthroughs)
      setSnack({ open: true, message: msg || 'Updated', severity: 'success' })
    } catch (err) {
      setSnack({ open: true, message: err.message || 'Update failed', severity: 'error' })
    }
  }

  return (
    <div className="py-6">
      <Breadcrumbs sx={{ mb: 1 }}>
        <MLink component={RouterLink} to="/">World</MLink>
      </Breadcrumbs>
      <Typography variant="h4" gutterBottom>The Living World</Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>Your inner landscape rendered in real time.</Typography>
      {error && <Paper elevation={0} sx={{ p: 2, bgcolor: 'error.light', color: 'error.contrastText', mb: 2 }}>{error}</Paper>}
      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <form onSubmit={saveSeed}>
          <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
            <Tooltip title="Seed controls terrain determinism">
              <Chip icon={<TerrainIcon />} label="Seed" />
            </Tooltip>
            <Tooltip title="Enter a numeric seed">
              <TextField size="small" value={seed} onChange={e => setSeed(e.target.value)} sx={{ width: 160 }} />
            </Tooltip>
            <Tooltip title="Morph landscape to the new seed">
              <Button type="submit" variant="contained" startIcon={<RefreshIcon />}>Regenerate</Button>
            </Tooltip>
            <Tooltip title="Maximum number of trees (adaptive with Auto LOD)">
              <Chip icon={<AutoGraphIcon />} label="Forest cap max" />
            </Tooltip>
            <Tooltip title="Raise or lower the allowed density cap">
              <Slider value={forestCapMax} onChange={(_, v) => setForestCapMax(parseInt(v, 10))} min={0} max={10000} step={100} sx={{ width: 240 }} />
            </Tooltip>
            <Chip label={forestCapMax} variant="outlined" />
            <Tooltip title="Automatically adjust forest density to keep frame rate smooth">
              <Chip icon={<SpeedIcon />} label="Auto LOD" />
            </Tooltip>
            <Tooltip title="Toggle adaptive density">
              <FormControlLabel control={<Checkbox checked={autoLOD} onChange={e => setAutoLOD(e.target.checked)} />} label="Enabled" />
            </Tooltip>
          </Stack>
        </form>
      </Paper>
      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
          <LocalFloristIcon />
          <Typography variant="h6">Garden — Habits</Typography>
        </Stack>
        <Stack spacing={2}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
            <Tooltip title="Overall habit consistency">
              <Slider value={consistency} min={0} max={1} step={0.05} onChange={(_, v) => setConsistency(v)} onChangeCommitted={(_, v) => patchWorld({ habit_consistency: v }, 'Garden updated')} sx={{ width: 240 }} />
            </Tooltip>
            <Chip label={`Consistency ${Math.round(consistency * 100)}%`} variant="outlined" />
            <Tooltip title="Neglect level impacts lushness">
              <Slider value={neglect} min={0} max={1} step={0.05} onChange={(_, v) => setNeglect(v)} onChangeCommitted={(_, v) => patchWorld({ neglect: v }, 'Neglect updated')} sx={{ width: 240 }} />
            </Tooltip>
            <Chip label={`Neglect ${Math.round(neglect * 100)}%`} variant="outlined" />
          </Stack>
        </Stack>
      </Paper>
      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
          <LandscapeIcon />
          <Typography variant="h6">Terrain — Emotional Journey</Typography>
        </Stack>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
          <Tooltip title="Number of breakthroughs shapes mountain height">
            <TextField type="number" label="Breakthroughs" value={breakthroughs} onChange={e => setBreakthroughs(parseInt(e.target.value || '0', 10))} sx={{ width: 160 }} />
          </Tooltip>
          <Button variant="contained" onClick={() => patchWorld({ breakthroughs }, 'Breakthroughs updated')}>Apply</Button>
          <Tooltip title="Stress level controls jaggedness">
            <Slider value={stress} min={0} max={1} step={0.05} onChange={(_, v) => setStress(v)} onChangeCommitted={(_, v) => patchWorld({ stress_level: v }, 'Stress updated')} sx={{ width: 240 }} />
          </Tooltip>
          <Chip label={`Stress ${Math.round(stress * 100)}%`} variant="outlined" />
        </Stack>
      </Paper>
      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
          <WbSunnyIcon />
          <Typography variant="h6">Weather — Quick Set</Typography>
        </Stack>
        <Stack direction="row" spacing={1} flexWrap="wrap">
          <Tooltip title="Focused & energized">
            <Button size="small" variant="outlined" onClick={() => patchWorld({ stress_level: 0.2, neglect: 0.0 }, 'Weather set: Focused')}>Focused</Button>
          </Tooltip>
          <Tooltip title="Anxious or overwhelmed">
            <Button size="small" variant="outlined" onClick={() => patchWorld({ stress_level: 0.7 }, 'Weather set: Anxious')}>Anxious</Button>
          </Tooltip>
          <Tooltip title="Sad or low">
            <Button size="small" variant="outlined" onClick={() => patchWorld({ stress_level: 0.6, neglect: 0.3 }, 'Weather set: Low')}>Low</Button>
          </Tooltip>
          <Tooltip title="Genuinely happy">
            <Button size="small" variant="outlined" onClick={() => patchWorld({ stress_level: 0.15, neglect: 0.0, habit_consistency: Math.max(consistency, 0.7) }, 'Weather set: Happy')}>Happy</Button>
          </Tooltip>
        </Stack>
      </Paper>
      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
          <StarBorderIcon />
          <Typography variant="h6">Sky — Dreams</Typography>
        </Stack>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
          <TextField type="number" label="Active goals" value={dreamsActive} onChange={e => setDreamsActive(parseInt(e.target.value || '0', 10))} sx={{ width: 160 }} />
          <TextField type="number" label="Postponed goals" value={dreamsPostponed} onChange={e => setDreamsPostponed(parseInt(e.target.value || '0', 10))} sx={{ width: 180 }} />
          <Chip label={`Stars: dynamic`} variant="outlined" />
        </Stack>
      </Paper>
      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
          <HomeIcon />
          <Typography variant="h6">Relationships — Landmarks</Typography>
        </Stack>
        <Stack spacing={2}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
            <ToggleButtonGroup value={relType} exclusive onChange={(_, v) => v && setRelType(v)} size="small">
              <ToggleButton value="family"><HomeIcon sx={{ mr: 1 }} />Family</ToggleButton>
              <ToggleButton value="friendship"><GroupIcon sx={{ mr: 1 }} />Friendship</ToggleButton>
              <ToggleButton value="mentor"><StarBorderIcon sx={{ mr: 1 }} />Mentor</ToggleButton>
            </ToggleButtonGroup>
            <Stack direction="row" spacing={2} alignItems="center">
              <Typography variant="body2">Health</Typography>
              <Slider value={relHealth} min={0} max={1} step={0.05} onChange={(_, v) => setRelHealth(v)} sx={{ width: 180 }} />
              <Chip label={`${Math.round(relHealth * 100)}%`} variant="outlined" />
              <Button variant="contained" onClick={() => setRelationships(prev => [...prev, { type: relType, health: relHealth }])}>Add</Button>
            </Stack>
          </Stack>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {relationships.map((r, i) => (
              <Chip key={i} label={`${r.type} • ${Math.round(r.health * 100)}%`} onDelete={() => setRelationships(prev => prev.filter((_, idx) => idx !== i))} />
            ))}
          </Stack>
        </Stack>
      </Paper>
      <LivingWorld world={world} forestCapMax={forestCapMax} autoLOD={autoLOD} dreamsActive={dreamsActive} dreamsPostponed={dreamsPostponed} relationships={relationships} />
      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack({ ...snack, open: false })}>
        <Alert onClose={() => setSnack({ ...snack, open: false })} severity={snack.severity} variant="filled">{snack.message}</Alert>
      </Snackbar>
    </div>
  )
}
