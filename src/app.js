import { config, yearsFrom } from './config.js'
import { overviewHTML, benchmarkHTML, incomeHTML, trendsHTML, wealthHTML } from './templates.js'
import './styles.css'
import { state, fmt, fmtd, fmtK, MO, hexA, mkChart, YOU, BLS, TOP, YOUD, BLSD, RED, TC, GC, ttO } from './state.js'
import { setData, getData, getYearKeys, getAllCatTotals, getCatTotal, getSubcatTotals,
         getMonthCatValue, getGrandTotal, getFilteredTxns } from './data.js'
import { renderOverview } from './components/overview.js'
import { renderBenchmark } from './components/benchmark.js'
import { renderIncome } from './components/income.js'
import { renderTrends } from './components/trends.js'
import { renderWealth } from './components/wealth.js'
import { renderCashflow } from './components/cashflow.js'


const TAB_META = {
  overview:  { title: 'Spending <em>Overview</em>',   desc: 'Your household spending at a glance. Filter by category in the left nav. Click any month bar to drill into that month.' },
  benchmark: { title: 'Peer <em>Comparison</em>',     desc: 'Your 2025 spending vs. national benchmarks. Fixed to 2025 data. Source: BLS CES 2024, Census ACS 2024.' },
  income:    { title: 'Income <em>and Flow</em>',      desc: 'Where money comes in and how it is allocated. 2025 full-year data. Not affected by year filter.' },
  trends:    { title: 'Financial <em>Trends</em>',     desc: 'How your finances have changed over the period in your data. Year filter applies.' },
  wealth:    { title: 'Wealth <em>Snapshot</em>',      desc: 'Balance sheet as of April 2026. Not affected by any filters.' },
  guide:     { title: 'Dashboard <em>Guide</em>',      desc: 'How to use every tab, chart, and control.' },
}

export function createApp(data) {
  setData(data)
  const D = getData()

  // Derived from the data, not hardcoded — import a different span and the
  // header and the year pills both follow it.
  const YEARS = yearsFrom(D)
  document.title = config.documentTitle

  // ── RENDER SHELL ──────────────────────────────────────────────────────────
  document.getElementById('app').innerHTML = `
<div id="app-shell">

  <div id="chrome">
    <div class="logo"><h1>${config.title.lead} <em>${config.title.accent}</em></h1><span>Dashboard · ${YEARS[0]}–${YEARS[YEARS.length-1]}</span></div>
    <div class="tabs">
      ${['overview','benchmark','income','cashflow','trends','wealth','guide'].map(t =>
        `<button class="tab${t==='overview'?' active':''}" data-tab="${t}">${
          {overview:'Overview',benchmark:'Peer Comparison',income:'Income & Flow',cashflow:'Cash Flow',
           trends:'Trends',wealth:'Wealth',guide:'? Guide'}[t]
        }</button>`
      ).join('')}
    </div>
    <div class="yr-pills">
      ${['all',...YEARS].map(y =>
        `<button class="yp${y==='all'?' active':''}" data-yr="${y}">${y==='all'?'All':y}</button>`
      ).join('')}
    </div>
    <div class="hdr-stats">
      <div class="hs"><div class="hs-l">Total Spent</div><div class="hs-v" id="hdr-spent">—</div></div>
      <div class="hs"><div class="hs-l">Avg / Month</div><div class="hs-v" id="hdr-avg">—</div></div>
      <div class="hs"><div class="hs-l">Transactions</div><div class="hs-v" id="hdr-count">—</div></div>
    </div>
  </div>

  <div id="nav">
    <button class="collapse-btn" id="nav-toggle"><span class="cb-icon">◀</span></button>
    <div id="nav-inner">
      <div class="nav-top">
        <span class="nav-hint">Filter by category</span>
        <span class="nav-hint2">Click to filter · ▶ for sub-cats · Esc to clear</span>
        <button class="all-btn active" id="nav-all">
          <div class="pc-dot" style="background:var(--accent)"></div>
          <span style="flex:1">All categories</span>
          <span class="pc-amt" id="nav-all-amt"></span>
        </button>
      </div>
      <div id="cat-nav"></div>
    </div>
  </div>

  <div id="main">
    ${['overview','benchmark','income','cashflow','trends','wealth','guide'].map(t =>
      `<div id="tab-${t}" class="view${t==='overview'?' active':''}"></div>`
    ).join('')}
  </div>

  <div id="panel">
    <button class="panel-collapse-btn" id="panel-toggle"><span class="cb-icon">▶</span></button>
    <div id="panel-inner">
      <div id="ph"><div id="ph-t">All Transactions</div><div id="ph-s">Filtered by active selection</div></div>
      <div id="sw"><input id="search" type="text" placeholder="Search merchant, category…"></div>
      <div id="sub-breakdown"></div>
      <div id="tl"></div>
    </div>
  </div>

</div>`

  // Fill tab views with their HTML
  const tabContents = { overview: overviewHTML, benchmark: benchmarkHTML, income: incomeHTML, trends: trendsHTML, wealth: wealthHTML }
  // cashflow tab uses JS-rendered content, no static HTML needed
  for (const [tab, content] of Object.entries(tabContents)) {
    const el = document.getElementById('tab-' + tab)
    if (el) el.innerHTML = content
  }
  buildNav()
  bindEvents()
  refresh()
}

// ── NAV ───────────────────────────────────────────────────────────────────────
function buildNav() {
  const D = getData()
  const cats = getAllCatTotals('all')
  const total = cats.reduce((s, [,v]) => s + v, 0)
  document.getElementById('nav-all-amt').textContent = fmt(total)
  const nav = document.getElementById('cat-nav')
  nav.innerHTML = ''

  for (const [pc, pcTotal] of cats) {
    const col = D.cat_colors[pc] || '#909090'
    const subs = D.subcat_all?.[pc] || {}
    const subEntries = Object.entries(subs).sort((a,b) => b[1]-a[1])
    const wrap = document.createElement('div')

    const pcBtn = document.createElement('button')
    pcBtn.className = 'pc-btn'
    pcBtn.id = 'nav-pc-' + pc.replace(/\W/g,'')
    pcBtn.style.setProperty('--pc-color', col)
    pcBtn.innerHTML = `<div class="pc-dot" style="background:${col}"></div>
      <span class="pc-name">${pc}</span>
      <span class="pc-amt">${fmt(pcTotal)}</span>
      <span class="pc-arrow" id="arrow-${pc.replace(/\W/g,'')}">▶</span>`
    pcBtn.addEventListener('click', e => {
      const arrow = pcBtn.querySelector('.pc-arrow')
      if (arrow && e.clientX >= arrow.getBoundingClientRect().left - 4) {
        toggleSubList(pc); return
      }
      selectCat(state.selCat === pc && !state.selSub ? null : pc, null)
    })
    wrap.appendChild(pcBtn)

    const scList = document.createElement('div')
    scList.className = 'sc-list'
    scList.id = 'sclist-' + pc.replace(/\W/g,'')
    for (const [cat, catTotal] of subEntries) {
      const shade = (D.shade_map?.[pc] || {})[cat] || hexA(col, 0.5)
      const scBtn = document.createElement('button')
      scBtn.className = 'sc-btn'
      scBtn.id = 'nav-sc-' + cat.replace(/\W/g,'')
      scBtn.innerHTML = `<div class="sc-dot" style="background:${shade}"></div>
        <span class="sc-name">${cat}</span><span class="sc-amt">${fmt(catTotal)}</span>`
      scBtn.addEventListener('click', e => {
        e.stopPropagation()
        selectCat(pc, state.selSub === cat ? null : cat)
      })
      scList.appendChild(scBtn)
    }
    wrap.appendChild(scList)
    nav.appendChild(wrap)
  }
}

function toggleSubList(pc) {
  const list  = document.getElementById('sclist-' + pc.replace(/\W/g,''))
  const arrow = document.getElementById('arrow-'  + pc.replace(/\W/g,''))
  if (list)  list.classList.toggle('open')
  if (arrow) arrow.classList.toggle('open')
}

function selectCat(cat, sub) {
  state.selCat = cat; state.selSub = sub; state.selMonth = null
  document.querySelectorAll('.pc-btn, .sc-btn, .all-btn').forEach(b => b.classList.remove('active'))
  if (!cat) {
    document.getElementById('nav-all')?.classList.add('active')
  } else {
    document.getElementById('nav-pc-' + cat.replace(/\W/g,''))?.classList.add('active')
    if (sub) {
      document.getElementById('nav-sc-' + sub.replace(/\W/g,''))?.classList.add('active')
      const list = document.getElementById('sclist-' + cat.replace(/\W/g,''))
      if (list && !list.classList.contains('open')) toggleSubList(cat)
    }
  }
  refresh()
}

// ── EVENTS ────────────────────────────────────────────────────────────────────
function bindEvents() {
  // Tab clicks
  document.querySelectorAll('.tab').forEach(btn => {
    btn.addEventListener('click', () => {
      state.activeTab = btn.dataset.tab
      document.querySelectorAll('.tab').forEach(b => b.classList.remove('active'))
      btn.classList.add('active')
      document.querySelectorAll('.view').forEach(v => v.classList.remove('active'))
      document.getElementById('tab-' + state.activeTab)?.classList.add('active')
      renderActiveTab()
    })
  })

  // Year pills
  document.querySelectorAll('.yp').forEach(btn => {
    btn.addEventListener('click', () => {
      state.selYear = btn.dataset.yr === 'all' ? 'all' : +btn.dataset.yr
      state.selMonth = null
      document.querySelectorAll('.yp').forEach(b => b.classList.remove('active'))
      btn.classList.add('active')
      refresh()
    })
  })

  // Nav collapse
  document.getElementById('nav-toggle')?.addEventListener('click', () => {
    const nav = document.getElementById('nav')
    const collapsed = nav.classList.toggle('collapsed')
    document.documentElement.style.setProperty('--nav-w', collapsed ? '0px' : '210px')
    setTimeout(renderActiveTab, 240)
  })

  // Panel collapse
  document.getElementById('panel-toggle')?.addEventListener('click', () => {
    const panel = document.getElementById('panel')
    const collapsed = panel.classList.toggle('collapsed')
    document.documentElement.style.setProperty('--panel-w', collapsed ? '0px' : '256px')
    setTimeout(renderActiveTab, 240)
  })

  // Search
  document.getElementById('search')?.addEventListener('input', renderTxnList)

  // Escape clears filter
  window.addEventListener('keydown', e => {
    if (e.key === 'Escape') selectCat(null, null)
  })

  // Resize
  let rsz
  window.addEventListener('resize', () => {
    clearTimeout(rsz); rsz = setTimeout(renderActiveTab, 80)
  })
}

// ── HEADER STATS ──────────────────────────────────────────────────────────────
function updateHeader() {
  const keys = getYearKeys()
  let total = keys.reduce((s, k) => s + (getData().monthly_total[k] || 0), 0)
  if (state.selCat) total = getCatTotal(state.selCat, state.selYear)
  const nmo = Math.max(1, keys.length)
  document.getElementById('hdr-spent').textContent = fmt(total)
  document.getElementById('hdr-avg').textContent   = fmt(total / nmo)
  // Transaction count
  const txns = getFilteredTxns()
  document.getElementById('hdr-count').textContent = txns.length.toLocaleString()
}

// ── PAGE HEADER ───────────────────────────────────────────────────────────────
export function renderPageHeader(tabId) {
  const view = document.getElementById('tab-' + tabId)
  if (!view) return
  // Remove previously injected headers
  view.querySelectorAll('.injected-header').forEach(el => el.remove())
  const meta = TAB_META[tabId]
  if (!meta) return
  const hdr = document.createElement('div')
  hdr.className = 'tab-page-header injected-header'
  hdr.innerHTML = `<span class="tab-page-title">${meta.title}</span><span class="tab-page-desc">${meta.desc}</span>`
  view.insertBefore(hdr, view.firstChild)
}

// ── SUB BREAKDOWN (right panel) ───────────────────────────────────────────────
function renderSubBreakdown() {
  const D = getData()
  const wrap = document.getElementById('sub-breakdown')
  if (!wrap) return
  const subcats = state.selCat
    ? getSubcatTotals(state.selCat, state.selYear)
    : Object.entries(D.subcat_all || {}).reduce((acc, [, subs]) => {
        for (const [k,v] of Object.entries(subs)) acc[k] = (acc[k]||0) + v
        return acc
      }, {})
  const entries = Object.entries(subcats).sort((a,b)=>b[1]-a[1]).slice(0,10)
  if (!entries.length) { wrap.innerHTML = ''; return }
  const maxV = entries[0][1]
  const total = entries.reduce((s,[,v])=>s+v,0)
  const col = state.selCat ? (D.cat_colors[state.selCat]||'#00d4c8') : '#00d4c8'
  const yrLbl = state.selYear === 'all' ? 'All years' : String(state.selYear)
  wrap.innerHTML = `<div style="padding:9px 12px;">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:7px;">
      <span style="font-size:7px;letter-spacing:.38em;text-transform:uppercase;color:var(--muted);">${state.selCat||'Top sub-categories'} · ${yrLbl}</span>
      <span style="font-size:8px;color:var(--dim);">${fmt(total)}</span>
    </div>
    ${entries.map(([cat,v]) => {
      const shade = (state.selCat && D.shade_map?.[state.selCat])
        ? D.shade_map[state.selCat][cat] || hexA(col, 0.5)
        : hexA(col, 0.55)
      return `<div style="display:grid;grid-template-columns:96px 1fr 54px;align-items:center;gap:5px;margin-bottom:4px;">
        <span style="font-size:8px;color:var(--dim);text-align:right;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${cat}</span>
        <div style="height:10px;background:rgba(255,255,255,0.04);border-radius:1px;overflow:hidden;">
          <div style="height:100%;width:${(v/maxV*100).toFixed(1)}%;background:${shade};border-radius:1px;"></div>
        </div>
        <span style="font-size:8.5px;font-family:var(--display);color:var(--text);">${fmt(v)}</span>
      </div>`
    }).join('')}
  </div>`
}

// ── TRANSACTION LIST ──────────────────────────────────────────────────────────
function renderTxnList() {
  const D = getData()
  const q = (document.getElementById('search')?.value || '').toLowerCase()
  let txns = getFilteredTxns()
  if (q) txns = txns.filter(t =>
    t.name.toLowerCase().includes(q) ||
    t.category.toLowerCase().includes(q) ||
    t.parent.toLowerCase().includes(q)
  )
  txns = [...txns].sort((a,b) => new Date(b.date) - new Date(a.date)).slice(0, 300)
  document.getElementById('ph-t').textContent = state.selCat || 'All Transactions'
  document.getElementById('ph-s').textContent = txns.length.toLocaleString() + ' transactions'
    + (state.selMonth ? ' · ' + state.selMonth : '')
    + (state.selYear !== 'all' ? ' · ' + state.selYear : '')
  document.getElementById('tl').innerHTML = txns.map(t => {
    const col = D.cat_colors[t.parent] || '#909090'
    const [m, d] = t.date.split('/')
    return `<div class="ti">
      <div class="td2" style="background:${col};opacity:.7"></div>
      <div style="flex:1;min-width:0"><div class="tn2">${t.name}</div><div class="tc2">${t.category}</div></div>
      <div style="text-align:right"><div class="ta">${fmtd(t.amount)}</div><div class="tc2">${MO[+m-1]} ${d}</div></div>
    </div>`
  }).join('')
}

// ── RENDER DISPATCH ───────────────────────────────────────────────────────────
function renderActiveTab() {
  renderPageHeader(state.activeTab)
  if (state.activeTab === 'overview')  renderOverview()
  else if (state.activeTab === 'benchmark') renderBenchmark()
  else if (state.activeTab === 'income')    renderIncome()
  else if (state.activeTab === 'trends')    renderTrends()
  else if (state.activeTab === 'wealth')    renderWealth()
  else if (state.activeTab === 'cashflow')  renderCashflow()
  else if (state.activeTab === 'guide')     renderGuide()
}

function renderGuide() {
  const view = document.getElementById('tab-guide')
  if (view.querySelector('.guide-content')) return
  const div = document.createElement('div')
  div.className = 'guide-content card'
  div.innerHTML = `
    <span class="sec-title" style="margin-bottom:12px;display:block;">How to use this dashboard</span>
    <div style="font-size:8px;letter-spacing:.3em;text-transform:uppercase;color:var(--muted);margin-bottom:8px;">Global Controls</div>
    ${[
      ['Year pills (top bar)', 'Filter all charts to a specific year. "All" shows the full 4-year history. Peer Comparison and Wealth tabs always show 2025 regardless.'],
      ['Left nav — category tree', 'Click ▶ to expand sub-categories. Click the category name to filter all charts. Click a sub-category to drill deeper. Press Escape to clear.'],
      ['Right panel', 'Live transaction list filtered by all active selections. Search by merchant name. Click any month bar to filter to that month.'],
      ['Collapse buttons', 'The ◀ and ▶ buttons on the nav and panel edges collapse those sidebars to give the charts more room.'],
    ].map(([t,b]) => `<div style="background:rgba(255,255,255,0.03);border:1px solid var(--border);border-radius:2px;padding:9px 11px;margin-bottom:7px;">
      <div style="font-size:8.5px;color:var(--accent);margin-bottom:3px;letter-spacing:.1em;">${t}</div>
      <div style="font-size:8px;color:var(--dim);line-height:1.55;">${b}</div>
    </div>`).join('')}
    <div style="font-size:8px;letter-spacing:.3em;text-transform:uppercase;color:var(--muted);margin:14px 0 8px;">Color Key</div>
    ${[
      ['rgba(0,212,200,0.85)','Teal — You / your data','Every chart throughout'],
      ['rgba(107,127,168,0.75)','Blue-gray — National benchmark','Peer Comparison, Wealth'],
      ['rgba(138,184,107,0.75)','Green — Top quintile / target','Peer Comparison, savings rate'],
      ['rgba(225,80,80,0.75)','Red — Negative / liability / above avg','Deficit bars, mortgage, deviation'],
      ['rgba(80,210,130,0.75)','Lime — Savings / positive outcome','Income donut, childcare, assets'],
      ['rgba(240,180,60,0.75)','Amber — Home equity / opportunity','Asset donut, foregone salary'],
    ].map(([c,l,w]) => `<div style="display:flex;align-items:center;gap:8px;margin-bottom:5px;">
      <span style="width:10px;height:10px;border-radius:1px;background:${c};flex-shrink:0;display:inline-block;"></span>
      <span style="font-size:8.5px;color:var(--dim);flex:1;">${l}</span>
      <span style="font-size:8px;color:var(--muted);">${w}</span>
    </div>`).join('')}`
  view.appendChild(div)
}

function refresh() {
  updateHeader()
  renderSubBreakdown()
  renderActiveTab()
  renderTxnList()
}

// Export for use in chart components
export { selectCat, refresh, renderTxnList, renderSubBreakdown }
