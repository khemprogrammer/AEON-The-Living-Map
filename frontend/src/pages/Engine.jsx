import React, { useEffect, useState } from 'react'
import { Engine as API } from '../api.js'
import { Typography, Paper, Stack, TextField, Button, List, ListItem, ListItemIcon, ListItemText, Chip, Breadcrumbs, Link as MLink, Snackbar, Alert, Tooltip } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import SettingsIcon from '@mui/icons-material/Settings'
import NoteAltIcon from '@mui/icons-material/NoteAlt'
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions'

export default function EnginePage() {
  const [entries, setEntries] = useState([])
  const [text, setText] = useState('')
  const [mood, setMood] = useState('')
  const [profile, setProfile] = useState(null)
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' })

  const load = async () => {
    const [es, p] = await Promise.all([API.entries(), API.profile()])
    setEntries(es)
    setProfile(p)
  }
  useEffect(() => { load() }, [])

  const add = async (e) => {
    e.preventDefault()
    try {
      await API.addEntry({ entry_type: 'text', content_text: text, mood })
      setText('')
      setMood('')
      await load()
      setSnack({ open: true, message: 'Entry added', severity: 'success' })
    } catch (err) {
      setSnack({ open: true, message: err.message || 'Failed to add entry', severity: 'error' })
    }
  }

  return (
    <div className="py-6">
      <Breadcrumbs sx={{ mb: 1 }}>
        <MLink component={RouterLink} to="/engine">Engine</MLink>
      </Breadcrumbs>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
        <SettingsIcon />
        <Typography variant="h5">Inner Engine</Typography>
      </Stack>
      {profile && (
        <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>Patterns</Typography>
          <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.100', fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
            {JSON.stringify(profile, null, 2)}
          </Paper>
        </Paper>
      )}
      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <form onSubmit={add}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
            <Tooltip title="Describe your day briefly">
              <TextField fullWidth placeholder="Today I..." value={text} onChange={e => setText(e.target.value)} />
            </Tooltip>
            <Tooltip title="Optional mood label">
              <TextField sx={{ width: 200 }} placeholder="Mood" value={mood} onChange={e => setMood(e.target.value)} />
            </Tooltip>
            <Tooltip title="Save entry">
              <Button type="submit" variant="contained">Add</Button>
            </Tooltip>
          </Stack>
        </form>
      </Paper>
      <Paper elevation={2} sx={{ p: 2 }}>
        <Typography variant="subtitle2" gutterBottom>Recent Entries</Typography>
        <List>
          {entries.map(e => (
            <ListItem key={e.id}>
              <ListItemIcon><NoteAltIcon /></ListItemIcon>
              <ListItemText primary={e.content_text} />
              <Chip icon={<EmojiEmotionsIcon />} label={e.mood || '—'} variant="outlined" />
            </ListItem>
          ))}
        </List>
        <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack({ ...snack, open: false })}>
          <Alert onClose={() => setSnack({ ...snack, open: false })} severity={snack.severity} variant="filled">{snack.message}</Alert>
        </Snackbar>
      </Paper>
    </div>
  )
}
