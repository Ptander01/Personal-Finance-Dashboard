export const state = {
  selCat: null,
  selSub: null,
  selYear: 'all',
  selMonth: null,
  activeTab: 'overview',
}

export const MO = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
export const fmt  = v => '$' + Math.round(v).toLocaleString()
export const fmtd = v => '$' + Number(v).toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2})
export const fmtK = v => v >= 1000 ? '$' + (v/1000).toFixed(0) + 'K' : '$' + Math.round(v)

export const YOU  = 'rgba(0,212,200,0.85)'
export const BLS  = 'rgba(107,127,168,0.75)'
export const TOP  = 'rgba(138,184,107,0.75)'
export const YOUD = 'rgba(0,212,200,0.35)'
export const BLSD = 'rgba(107,127,168,0.35)'
export const RED  = 'rgba(225,80,80,0.75)'
export const TC   = 'rgba(210,225,250,0.78)'
export const GC   = 'rgba(255,255,255,0.07)'

export const ttO = {
  bodyColor: TC,
  backgroundColor: 'rgba(6,7,14,0.97)',
  borderColor: 'rgba(255,255,255,0.13)',
  borderWidth: 1,
}

export function hexA(hex, a) {
  if (hex.startsWith('rgba')) return hex.replace(/[\d.]+\)$/, a + ')')
  const r = parseInt(hex.slice(1,3),16)
  const g = parseInt(hex.slice(3,5),16)
  const b = parseInt(hex.slice(5,7),16)
  return `rgba(${r},${g},${b},${a})`
}

// Chart instance cache
export const charts = {}
export function mkChart(id, cfg) {
  const cv = document.getElementById(id)
  if (!cv) return null
  if (charts[id]) charts[id].destroy()
  charts[id] = new Chart(cv, cfg)
  return charts[id]
}
