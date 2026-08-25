import { state } from './state.js'

let D = null

export function setData(data) { D = data }
export function getData() { return D }

export function getYearKeys() {
  const keys = Object.keys(D.monthly_total).sort()
  if (state.selYear === 'all') return keys
  return keys.filter(k => k.startsWith(state.selYear + '-'))
}

export function getAllCatTotals(yr) {
  const m = {}
  if (yr === 'all') {
    for (const y of Object.keys(D.by_year_cat))
      for (const [c, v] of Object.entries(D.by_year_cat[y]))
        m[c] = (m[c] || 0) + v
  } else {
    Object.assign(m, D.by_year_cat[String(yr)] || {})
  }
  return Object.entries(m).sort((a, b) => b[1] - a[1])
}

export function getCatTotal(cat, yr) {
  if (yr === 'all') {
    let t = 0
    for (const y of Object.keys(D.by_year_cat)) t += (D.by_year_cat[y][cat] || 0)
    return t
  }
  return (D.by_year_cat[String(yr)] || {})[cat] || 0
}

export function getSubcatTotals(parent, yr) {
  if (yr === 'all') return D.subcat_all?.[parent] || {}
  return (D.subcat_by_year?.[String(yr)] || {})[parent] || {}
}

export function getMonthCatValue(monthKey, cat, sub) {
  const mc = D.monthly_subcat?.[monthKey] || {}
  if (sub) return (mc[cat] || {})[sub] || 0
  return Object.values(mc[cat] || {}).reduce((s, v) => s + v, 0)
}

export function getGrandTotal(yr) {
  const keys = yr === 'all'
    ? Object.keys(D.monthly_total)
    : Object.keys(D.monthly_total).filter(k => k.startsWith(yr + '-'))
  return keys.reduce((s, k) => s + (D.monthly_total[k] || 0), 0)
}

export function getCatGrandTotal(cat, yr) {
  if (yr === 'all') {
    let t = 0
    for (const y of Object.keys(D.by_year_cat)) t += (D.by_year_cat[y][cat] || 0)
    return t
  }
  return (D.by_year_cat[String(yr)] || {})[cat] || 0
}

export function getFilteredTxns() {
  let t = D.transactions || []
  if (state.selYear !== 'all') t = t.filter(x => x.year === +state.selYear)
  if (state.selCat) t = t.filter(x => x.parent === state.selCat)
  if (state.selSub) t = t.filter(x => x.category === state.selSub)
  if (state.selMonth) {
    const [y, m] = state.selMonth.split('-')
    t = t.filter(x => x.year === +y && x.month === +m)
  }
  return t
}
