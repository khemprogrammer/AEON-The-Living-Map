import React, { useEffect, useState } from 'react'
import { Urgency as API } from '../api.js'
import { Card, CardContent, Typography, Stack, TextField, Button, List, ListItem, ListItemText, ListItemIcon, Chip, Paper, Breadcrumbs, Link as MLink, Snackbar, Alert, Tooltip } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import UpdateIcon from '@mui/icons-material/Update'
import MailOutlineIcon from '@mui/icons-material/MailOutline'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import LockClockIcon from '@mui/icons-material/LockClock'

export default function UrgencyPage() {
  const [status, setStatus] = useState(null)
  const [wishes, setWishes] = useState([])
  const [wishText, setWishText] = useState('')
  const [slowposts, setSlowposts] = useState([])
  const [sp, setSp] = useState({ recipient_name: '', recipient_email: '', unlock_date: '', content: '' })
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' })

  const load = async () => {
    const s = await API.status()
    setStatus(s)
    const ws = await API.wishes()
    setWishes(ws)
    const spList = await API.slowposts()
    setSlowposts(spList)
  }
  useEffect(() => { load() }, [])

  const addWish = async (e) => {
    e.preventDefault()
    try {
      await API.addWish(wishText)
      setWishText('')
      await load()
      setSnack({ open: true, message: 'Wish added', severity: 'success' })
    } catch (err) {
      setSnack({ open: true, message: err.message || 'Failed to add wish', severity: 'error' })
    }
  }
  const postpone = async (id) => {
    try {
      await API.postpone(id)
      await load()
      setSnack({ open: true, message: 'Wish postponed', severity: 'success' })
    } catch (err) {
      setSnack({ open: true, message: err.message || 'Failed to postpone', severity: 'error' })
    }
  }
  const addSlowpost = async (e) => {
    e.preventDefault()
    try {
      await API.addSlowpost(sp)
      setSp({ recipient_name: '', recipient_email: '', unlock_date: '', content: '' })
      await load()
      setSnack({ open: true, message: 'SlowPost saved', severity: 'success' })
    } catch (err) {
      setSnack({ open: true, message: err.message || 'Failed to save SlowPost', severity: 'error' })
    }
  }

  return (
    <div className="py-6">
      <Breadcrumbs sx={{ mb: 1 }}>
        <MLink component={RouterLink} to="/urgency">Urgency</MLink>
      </Breadcrumbs>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
            <AccessTimeIcon />
            <Typography variant="h6">Urgency</Typography>
          </Stack>
          {status && (
            <>
              <Typography>Approximate days remaining: <strong>{status.days_remaining}</strong></Typography>
              {status.wish && (
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                  <FavoriteBorderIcon />
                  <Typography>Forgotten wish: {status.wish.text}</Typography>
                  <Chip label={`postponed ${status.wish.postpone_count} times`} size="small" />
                </Stack>
              )}
            </>
          )}
        </CardContent>
      </Card>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" gutterBottom>Wishes</Typography>
          <form onSubmit={addWish}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
              <Tooltip title="Write a wish to track">
                <TextField fullWidth placeholder="Add a wish" value={wishText} onChange={e => setWishText(e.target.value)} />
              </Tooltip>
              <Tooltip title="Add wish">
                <Button type="submit" variant="contained" startIcon={<FavoriteBorderIcon />}>Add</Button>
              </Tooltip>
            </Stack>
          </form>
          <List sx={{ mt: 2 }}>
            {wishes.map(w => (
              <ListItem key={w.id} secondaryAction={
                <Tooltip title="Postpone wish">
                  <Button size="small" variant="outlined" startIcon={<UpdateIcon />} onClick={() => postpone(w.id)}>Postpone</Button>
                </Tooltip>
              }>
                <ListItemText primary={w.text} />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <Typography variant="subtitle1" gutterBottom>SlowPost</Typography>
          <form onSubmit={addSlowpost}>
            <Stack spacing={2}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Tooltip title="Person who will receive your message">
                  <TextField placeholder="Recipient name" value={sp.recipient_name} onChange={e => setSp({ ...sp, recipient_name: e.target.value })} fullWidth />
                </Tooltip>
                <Tooltip title="Email address for delivery">
                  <TextField placeholder="Recipient email" value={sp.recipient_email} onChange={e => setSp({ ...sp, recipient_email: e.target.value })} fullWidth />
                </Tooltip>
              </Stack>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Tooltip title="Date when message becomes available">
                  <TextField type="date" value={sp.unlock_date} onChange={e => setSp({ ...sp, unlock_date: e.target.value })} sx={{ width: 220 }} InputLabelProps={{ shrink: true }} label="Unlock date" />
                </Tooltip>
                <Tooltip title="Write the message content">
                  <TextField label="Your letter" multiline minRows={3} value={sp.content} onChange={e => setSp({ ...sp, content: e.target.value })} fullWidth />
                </Tooltip>
              </Stack>
              <Tooltip title="Save SlowPost">
                <Button type="submit" variant="contained" startIcon={<LockClockIcon />}>Save</Button>
              </Tooltip>
            </Stack>
          </form>
          <List sx={{ mt: 2 }}>
            {slowposts.map(p => (
              <ListItem key={p.id}>
                <ListItemIcon><MailOutlineIcon /></ListItemIcon>
                <ListItemText primary={`To ${p.recipient_name || '—'}`} secondary={`Unlock on ${p.unlock_date} ${p.opened ? '(opened)' : ''}`} />
                <Chip icon={<CalendarTodayIcon />} label={p.unlock_date} size="small" />
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
