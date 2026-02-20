import React, { useEffect, useState } from 'react'
import { Human as API } from '../api.js'
import { Card, CardContent, Typography, Stack, TextField, Button, Paper, Breadcrumbs, Link as MLink, Snackbar, Alert, Tooltip } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import TaskAltIcon from '@mui/icons-material/TaskAlt'
import PersonSearchIcon from '@mui/icons-material/PersonSearch'

export default function HumanPage() {
  const [dilemma, setDilemma] = useState(null)
  const [choice, setChoice] = useState('')
  const [reason, setReason] = useState('')
  const [mission, setMission] = useState(null)
  const [match, setMatch] = useState(null)
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' })

  const load = async () => {
    const d = await API.dilemma()
    setDilemma(d)
    const m = await API.mission()
    setMission(m)
    const f = await API.match()
    setMatch(f)
  }
  useEffect(() => { load() }, [])

  const vote = async () => {
    try {
      await API.vote(choice || 'A', reason)
      await load()
      setSnack({ open: true, message: 'Vote recorded', severity: 'success' })
    } catch (err) {
      setSnack({ open: true, message: err.message || 'Failed to vote', severity: 'error' })
    }
  }

  const complete = async () => {
    try {
      await API.completeMission()
      await load()
      setSnack({ open: true, message: 'Mission marked complete', severity: 'success' })
    } catch (err) {
      setSnack({ open: true, message: err.message || 'Failed to complete mission', severity: 'error' })
    }
  }

  return (
    <div className="py-6">
      <Breadcrumbs sx={{ mb: 1 }}>
        <MLink component={RouterLink} to="/human">Human</MLink>
      </Breadcrumbs>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
            <HelpOutlineIcon />
            <Typography variant="h6">Global Dilemma</Typography>
          </Stack>
          {dilemma && (
            <>
              <Typography>{dilemma.question_text}</Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 2 }}>
                <Tooltip title="Enter your choice">
                  <TextField fullWidth placeholder="Your choice" value={choice} onChange={e => setChoice(e.target.value)} />
                </Tooltip>
                <Tooltip title="Provide brief reasoning">
                  <TextField fullWidth placeholder="One sentence of reasoning" value={reason} onChange={e => setReason(e.target.value)} />
                </Tooltip>
                <Tooltip title="Submit your vote">
                  <Button variant="contained" onClick={vote} disabled={dilemma.voted}>Vote</Button>
                </Tooltip>
              </Stack>
              {dilemma.tally && (
                <Paper elevation={0} sx={{ p: 2, mt: 2, bgcolor: 'grey.100', fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                  {JSON.stringify(dilemma.tally, null, 2)}
                </Paper>
              )}
            </>
          )}
        </CardContent>
      </Card>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
            <TaskAltIcon />
            <Typography variant="h6">Stranger Mission</Typography>
          </Stack>
          {mission && (
            <>
              <Typography>{mission.text}</Typography>
              <Tooltip title="Mark mission as completed">
                <Button variant="contained" color="success" sx={{ mt: 2 }} onClick={complete} disabled={mission.completed}>Mark Completed</Button>
              </Tooltip>
            </>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
            <PersonSearchIcon />
            <Typography variant="h6">FrequencyMatch</Typography>
          </Stack>
          {match && (
            <Typography>Your closest match: {match.match_username || '—'} (score {match.score.toFixed(2)})</Typography>
          )}
        </CardContent>
      </Card>
      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack({ ...snack, open: false })}>
        <Alert onClose={() => setSnack({ ...snack, open: false })} severity={snack.severity} variant="filled">{snack.message}</Alert>
      </Snackbar>
    </div>
  )
}
