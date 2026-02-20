const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000/api'

export function getToken() {
  return localStorage.getItem('token')
}

export function setToken(token) {
  localStorage.setItem('token', token)
}

async function api(path, options = {}) {
  const headers = options.headers || {}
  const token = getToken()
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }
  if (token) headers['Authorization'] = `Token ${token}`
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || res.statusText)
  }
  const contentType = res.headers.get('content-type') || ''
  return contentType.includes('application/json') ? res.json() : res.text()
}

export const Auth = {
  signup: (username, password, email) =>
    api('/users/signup/', { method: 'POST', body: JSON.stringify({ username, password, email }) }),
  token: (username, password) =>
    api('/users/token/', { method: 'POST', body: JSON.stringify({ username, password }) }),
  me: () => api('/users/me/'),
}

export const World = {
  getState: () => api('/world/state/'),
  patchState: (data) => api('/world/state/', { method: 'PATCH', body: JSON.stringify(data) }),
}

export const Engine = {
  entries: () => api('/engine/entries/'),
  addEntry: (payload) => api('/engine/entries/', { method: 'POST', body: JSON.stringify(payload) }),
  profile: () => api('/engine/profiles/'),
}

export const Human = {
  dilemma: () => api('/human/dilemma/today/'),
  vote: (choice, reasoning) =>
    api('/human/dilemma/today/', { method: 'POST', body: JSON.stringify({ choice, reasoning }) }),
  mission: () => api('/human/mission/today/'),
  completeMission: () => api('/human/mission/today/', { method: 'POST' }),
  match: () => api('/human/match/'),
}

export const Urgency = {
  status: () => api('/urgency/status/'),
  wishes: () => api('/urgency/wishes/'),
  addWish: (text) => api('/urgency/wishes/', { method: 'POST', body: JSON.stringify({ text }) }),
  postpone: (id) => api(`/urgency/wishes/${id}/postpone/`, { method: 'POST' }),
  slowposts: () => api('/urgency/slowpost/'),
  addSlowpost: (payload) => api('/urgency/slowpost/', { method: 'POST', body: JSON.stringify(payload) }),
  unlock: (id) => api(`/urgency/slowpost/${id}/unlock/`),
}

export const Vault = {
  snapshot: () => api('/vault/snapshot/'),
  grants: () => api('/vault/grants/'),
  addGrant: (payload) => api('/vault/grants/', { method: 'POST', body: JSON.stringify(payload) }),
}

