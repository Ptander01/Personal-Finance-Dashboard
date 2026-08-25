import { createApp } from './app.js'

async function init() {
  const res = await fetch('/data.json')
  if (!res.ok) throw new Error('Failed to load data.json')
  const data = await res.json()
  createApp(data)
}

init().catch(err => {
  document.getElementById('app').innerHTML =
    `<div style="color:#f07070;padding:40px;font-family:monospace;">Error loading data: ${err.message}</div>`
})
