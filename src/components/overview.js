import { state, fmt, fmtK, MO, hexA, mkChart, ttO, TC, GC, YOU, YOUD } from '../state.js'
import { getData, getYearKeys, getAllCatTotals, getCatTotal, getSubcatTotals, getMonthCatValue } from '../data.js'
import { refresh } from '../app.js'

export function renderOverview() {
  renderKPIs()
  renderDonut()
  renderTimeline()
  renderStacked()
}

function renderKPIs() {
  const D = getData()
  const cats = getAllCatTotals(state.selYear)
  const keys = getYearKeys()
  let total = keys.reduce((s, k) => s + (D.monthly_total[k] || 0), 0)
  if (state.selCat) total = getCatTotal(state.selCat, state.selYear)
  const nmo = Math.max(1, keys.length)
  document.getElementById('krow').innerHTML = [
    { l: 'Avg Monthly',  v: fmt(total/nmo),                          s: `over ${nmo} months`,    c: 'var(--accent)' },
    { l: 'Total Spend',  v: fmt(total),                              s: keys.length+' months',    c: 'rgba(80,210,130,.8)' },
    { l: 'Top Category', v: cats[0] ? cats[0][0].split(' ')[0] : '—', s: cats[0] ? fmt(cats[0][1]) : '', c: 'rgba(240,200,80,.8)' },
    { l: 'Household',    v: fmt(getCatTotal('Household', state.selYear)),  s: 'largest category', c: 'rgba(200,120,240,.8)' },
    { l: 'Food & Drink', v: fmt(getCatTotal('Food & Drink', state.selYear)), s: 'second largest', c: 'rgba(0,180,220,.8)' },
  ].map(k => `<div class="kpi" style="--kc:${k.c}"><div class="kl">${k.l}</div><div class="kv">${k.v}</div><div class="ks">${k.s}</div></div>`).join('')
}

function renderDonut() {
  const D = getData()
  const isDrill = !!state.selCat
  const drillLabel = document.getElementById('donut-drill-label')
  const desc = document.getElementById('donut-desc')
  let labels, vals, colors, borderColors

  if (isDrill) {
    const subcats = getSubcatTotals(state.selCat, state.selYear)
    const entries = Object.entries(subcats).filter(([,v]) => v > 0)
    if (!entries.length) { mkChart('donut-chart', emptyDonutCfg()); return }
    labels = entries.map(([k]) => k)
    vals   = entries.map(([,v]) => v)
    const sm = D.shade_map?.[state.selCat] || {}
    colors = labels.map(l => sm[l] || hexA(D.cat_colors[state.selCat]||'#909090', 0.5))
    borderColors = colors.map(c => c.replace(/[\d.]+\)$/, '0.6)'))
    if (drillLabel) drillLabel.innerHTML = `<span class="drill-label">${state.selCat}</span>`
    if (desc) desc.textContent = 'Sub-categories of ' + state.selCat + '. Click "All categories" to return.'
  } else {
    const cats = getAllCatTotals(state.selYear)
    labels = cats.map(([c]) => c)
    vals   = cats.map(([,v]) => v)
    colors = labels.map(c => hexA(D.cat_colors[c]||'#909090', .68))
    borderColors = labels.map(c => hexA(D.cat_colors[c]||'#909090', .35))
    if (drillLabel) drillLabel.innerHTML = ''
    if (desc) desc.textContent = 'Each slice = one parent category. Hover for amount & %. Select a category in the left nav to drill into sub-categories.'
  }

  const total = vals.reduce((s,v) => s+v, 0)
  const legend = document.getElementById('donut-legend')
  if (legend) legend.innerHTML = labels.slice(0,6).map((l,i) =>
    `<span class="lg-i"><span class="lg-sq" style="background:${colors[i]}"></span>${l.split(' ')[0]}</span>`
  ).join('')

  mkChart('donut-chart', {
    type: 'doughnut',
    data: { labels, datasets: [{ data: vals, backgroundColor: colors, borderColor: borderColors, borderWidth: 1, hoverOffset: 6 }] },
    options: { responsive: true, maintainAspectRatio: false, cutout: '52%',
      plugins: { legend: { display: false }, tooltip: { ...ttO, callbacks: { label: ctx => `${ctx.label}: ${fmt(ctx.raw)} (${(ctx.raw/total*100).toFixed(1)}%)` } } } }
  })
}

function emptyDonutCfg() {
  return { type: 'doughnut', data: { labels: ['No data'], datasets: [{ data: [1], backgroundColor: ['rgba(255,255,255,0.05)'], borderColor: ['rgba(255,255,255,0.08)'], borderWidth: 1 }] },
    options: { responsive: true, maintainAspectRatio: false, cutout: '52%', plugins: { legend: { display: false }, tooltip: { enabled: false } } } }
}

function renderTimeline() {
  const D = getData()
  const keys = getYearKeys()
  if (!keys.length) return
  const col = state.selCat ? (D.cat_colors[state.selCat]||'#00d4c8') : '#00d4c8'
  const totals = keys.map(k => D.monthly_total[k]||0)
  const filtered = keys.map(k => {
    if (!state.selCat) return D.monthly_total[k]||0
    return getMonthCatValue(k, state.selCat, state.selSub)
  })
  mkChart('timeline-chart', {
    type: 'bar',
    data: { labels: keys.map(k => { const[y,m]=k.split('-'); return m==='01'?y:MO[+m-1] }),
      datasets: [
        { label: 'Total', data: totals, backgroundColor: keys.map(k => state.selMonth===k ? hexA(col,0.9) : hexA(col,0.32)), borderRadius: 2, borderSkipped: false },
        { label: 'Filtered', data: filtered, backgroundColor: hexA(col,0.78), borderRadius: 2, borderSkipped: false }
      ] },
    options: { responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { ...ttO, callbacks: { label: ctx => `${ctx.dataset.label}: ${fmt(ctx.raw)}` } } },
      scales: { x: { ticks: { color: TC, font: { size: 9 }, autoSkip: true, maxTicksLimit: 18 }, grid: { color: GC } }, y: { ticks: { color: TC, font: { size: 9 }, callback: v => fmtK(v) }, grid: { color: GC } } },
      onClick: (e, els) => { if (!els.length) return; const k=keys[els[0].index]; state.selMonth = state.selMonth===k?null:k; refresh() } }
  })
}

function renderStacked() {
  const D = getData()
  const keys = getYearKeys()
  if (!keys.length) return
  const isDrill = !!state.selCat
  const drillLabel = document.getElementById('stacked-drill-label')
  const desc = document.getElementById('stacked-desc')
  const legend = document.getElementById('stacked-legend')
  let datasets

  if (isDrill) {
    const subcats = getSubcatTotals(state.selCat, state.selYear)
    const subEntries = Object.entries(subcats).sort((a,b)=>b[1]-a[1])
    const sm = D.shade_map?.[state.selCat] || {}
    datasets = subEntries.map(([sub]) => ({
      label: sub,
      data: keys.map(k => getMonthCatValue(k, state.selCat, sub)),
      backgroundColor: sm[sub] || hexA(D.cat_colors[state.selCat]||'#909090', 0.5),
      stack: 's', borderRadius: 0, borderSkipped: false
    }))
    if (drillLabel) drillLabel.innerHTML = `<span class="drill-label">${state.selCat}</span>`
    if (desc) desc.textContent = state.selCat + ' broken into sub-categories by month.'
    if (legend) legend.innerHTML = subEntries.slice(0,8).map(([sub]) =>
      `<span class="lg-i"><span class="lg-sq" style="background:${sm[sub]||'#888'}"></span>${sub}</span>`).join('')
  } else {
    const allCats = getAllCatTotals('all').map(([c]) => c)
    datasets = allCats.map(cat => ({
      label: cat,
      data: keys.map(k => getMonthCatValue(k, cat, null)),
      backgroundColor: hexA(D.cat_colors[cat]||'#909090', .68),
      stack: 's', borderRadius: 0, borderSkipped: false
    }))
    if (drillLabel) drillLabel.innerHTML = ''
    if (desc) desc.textContent = 'All parent categories stacked by month. Select a category to drill into sub-categories.'
    if (legend) legend.innerHTML = allCats.slice(0,7).map(c =>
      `<span class="lg-i"><span class="lg-sq" style="background:${hexA(D.cat_colors[c]||'#909090',.68)}"></span>${c.split(' ')[0]}</span>`).join('')
  }

  mkChart('stacked-chart', {
    type: 'bar',
    data: { labels: keys.map(k => { const[y,m]=k.split('-'); return m==='01'?y:MO[+m-1] }), datasets },
    options: { responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { ...ttO, callbacks: { label: ctx => `${ctx.dataset.label}: ${fmt(ctx.raw)}` } } },
      scales: { x: { ticks: { color: TC, font: { size: 9 }, autoSkip: true, maxTicksLimit: 18 }, grid: { color: GC }, stacked: true },
                y: { ticks: { color: TC, font: { size: 9 }, callback: v => fmtK(v) }, grid: { color: GC }, stacked: true } } }
  })
}
