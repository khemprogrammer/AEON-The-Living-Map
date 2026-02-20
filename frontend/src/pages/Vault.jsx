import React, { useEffect, useState } from 'react'
import { Vault as API } from '../api.js'
import { Card, CardContent, Typography, Stack, TextField, Button, List, ListItem, ListItemIcon, ListItemText, Paper, Breadcrumbs, Link as MLink, Snackbar, Alert, Tooltip } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import LockIcon from '@mui/icons-material/Lock'
import RedeemIcon from '@mui/icons-material/Redeem'
import MailOutlineIcon from '@mui/icons-material/MailOutline'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'

export default function VaultPage() {
  const [snap, setSnap] = useState(null)
  const [grants, setGrants] = useState([])
  const [grant, setGrant] = useState({ recipient_email: '', release_date: '' })
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' })

  const load = async () => {
    const s = await API.snapshot()
    setSnap(s)
    const g = await API.grants()
    setGrants(g)
  }
  useEffect(() => { load() }, [])

  const add = async (e) => {
    e.preventDefault()
    try {
      await API.addGrant(grant)
      setGrant({ recipient_email: '', release_date: '' })
      await load()
      setSnack({ open: true, message: 'Grant added', severity: 'success' })
    } catch (err) {
      setSnack({ open: true, message: err.message || 'Failed to add grant', severity: 'error' })
    }
  }

  return (
    <div className="py-6">
      <Breadcrumbs sx={{ mb: 1 }}>
        <MLink component={RouterLink} to="/vault">Vault</MLink>
      </Breadcrumbs>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
            <LockIcon />
            <Typography variant="h6">Vault Snapshot</Typography>
          </Stack>
          {snap && (
            <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.100', fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
              {JSON.stringify(snap, null, 2)}
            </Paper>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
            <RedeemIcon />
            <Typography variant="h6">Grants</Typography>
          </Stack>
          <form onSubmit={add}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
              <Tooltip title="Email recipient for grant">
                <TextField placeholder="Recipient email" value={grant.recipient_email} onChange={e => setGrant({ ...grant, recipient_email: e.target.value })} fullWidth />
              </Tooltip>
              <Tooltip title="Date when grant becomes available">
                <TextField type="date" value={grant.release_date} onChange={e => setGrant({ ...grant, release_date: e.target.value })} sx={{ width: 220 }} InputLabelProps={{ shrink: true }} label="Release date" />
              </Tooltip>
              <Tooltip title="Add grant">
                <Button type="submit" variant="contained">Add</Button>
              </Tooltip>
            </Stack>
          </form>
          <List sx={{ mt: 2 }}>
            {grants.map(g => (
              <ListItem key={g.id}>
                <ListItemIcon><MailOutlineIcon /></ListItemIcon>
                <ListItemText primary={g.recipient_email} />
                <Stack direction="row" spacing={1} alignItems="center">
                  <CalendarTodayIcon fontSize="small" />
                  <Typography variant="body2">{g.release_date}</Typography>
                </Stack>
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack({ ...snack, open: false })}>
        <Alert onClose={() => setSnack({ ...snack, open: false })} severity={snack.severity} variant="filled">{snack.message}</Alert>
      </Snackbar>
    </div>
  )
}
