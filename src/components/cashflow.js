import { renderSankey } from './sankey.js'
import { getData } from '../data.js'
import { fmt, fmtK } from '../state.js'

let drillCat = null

export function renderCashflow() {
  const view = document.getElementById('tab-cashflow')
  if (!view) return

  const D = getData()

  // Get active year — default to 2025 if 'all' selected
  const years = Object.keys(getData().by_year_total).map(Number).sort((a,b)=>a-b)
  const selYr = window._sankeyYear || 2025

  const yrData = D.sankey?.[String(selYr)]

  // ── RENDER VIEW HTML ──────────────────────────────────────────────────────
  view.innerHTML = `
    <div class="tab-page-header injected-header">
      <span class="tab-page-title">Cash <em>Flow</em></span>
      <span class="tab-page-desc">Interactive Sankey diagram showing income sources → net savings + expense categories. Click any expense category node to drill into its sub-categories.</span>
    </div>

    <!-- YEAR SELECTOR -->
    <div class="card" style="padding:10px 14px;">
      <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;">
        <span style="font-size:8px;letter-spacing:.35em;text-transform:uppercase;color:var(--muted);">Flow Year</span>
        <div style="display:flex;gap:4px;">
          ${years.map(y => `<button class="yp${y===selYr?' active':''}" data-sankey-yr="${y}" style="font-size:8px;">${y}</button>`).join('')}
        </div>
        ${drillCat ? `
          <div style="display:flex;align-items:center;gap:8px;margin-left:auto;">
            <span style="font-size:8px;color:var(--accent);letter-spacing:.15em;">Drilling: ${drillCat}</span>
            <button id="sankey-reset-drill" style="padding:3px 10px;border-radius:2px;background:rgba(0,212,200,0.08);border:1px solid var(--adim);color:var(--accent);font-size:8px;letter-spacing:.2em;cursor:pointer;font-family:var(--mono);">← Back</button>
          </div>
        ` : `<span style="font-size:8px;color:var(--muted);margin-left:auto;letter-spacing:.12em;">Click expense node to drill into sub-categories</span>`}
      </div>
    </div>

    <!-- SUMMARY KPIs -->
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:9px;">
      ${yrData ? [
        { l:'Gross Income',  v: fmt(yrData.total_income),   c:'var(--accent)' },
        { l:'Total Expenses',v: fmt(yrData.total_expenses), c:'rgba(225,80,80,.8)' },
        { l:'Net Savings',   v: fmt(yrData.net_savings),    c: yrData.net_savings >= 0 ? 'rgba(80,210,130,.8)' : 'rgba(225,80,80,.8)' },
        { l:'Savings Rate',  v: yrData.total_income > 0 ? (yrData.net_savings/yrData.total_income*100).toFixed(1)+'%' : '—', c:'rgba(240,200,80,.8)' },
      ].map(k => `<div class="kpi" style="--kc:${k.c}"><div class="kl">${k.l}</div><div class="kv">${k.v}</div></div>`).join('') : ''}
    </div>

    <!-- SANKEY DIAGRAM -->
    <div class="card" style="padding:14px;">
      <div class="sec-row" style="margin-bottom:10px;">
        <div class="sec-hdr">
          <span class="sec-title">Income → Savings + Expenses — Sankey Flow</span>
          <span class="sec-sub">
            Left nodes = income sources · Center = gross income node · Right = where money went.
            ${drillCat ? `Drilling into <strong style="color:var(--accent)">${drillCat}</strong> sub-categories.` : 'Click any expense category to drill into its sub-categories.'}
          </span>
        </div>
      </div>
      <div id="sankey-container" style="height:420px;width:100%;position:relative;"></div>
    </div>

    <!-- INCOME TABLE -->
    <div class="card">
      <div class="sec-hdr" style="margin-bottom:10px;">
        <span class="sec-title">Income Sources — ${selYr}</span>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
        ${yrData ? Object.entries(yrData.income_sources)
          .filter(([,v]) => v > 0)
          .sort((a,b) => b[1]-a[1])
          .map(([src, amt]) => {
            const pct = (amt / yrData.total_income * 100).toFixed(1)
            return `<div style="display:grid;grid-template-columns:1fr auto;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid rgba(255,255,255,0.05);">
              <span style="font-size:9px;color:var(--dim);">${src}</span>
              <div style="text-align:right">
                <span style="font-family:var(--display);font-size:13px;color:var(--accent);">${fmt(amt)}</span>
                <span style="font-size:7.5px;color:var(--muted);margin-left:6px;">${pct}%</span>
              </div>
            </div>`
          }).join('') : ''}
      </div>
    </div>

    <!-- EXPENSE TABLE -->
    <div class="card">
      <div class="sec-hdr" style="margin-bottom:10px;">
        <span class="sec-title">Expense Breakdown — ${selYr}</span>
      </div>
      ${yrData ? Object.entries(yrData.expense_categories)
        .sort((a,b) => b[1]-a[1])
        .map(([cat, amt]) => {
          const pct = (amt / yrData.total_expenses * 100).toFixed(1)
          const maxAmt = Math.max(...Object.values(yrData.expense_categories))
          const barW = (amt / maxAmt * 100).toFixed(1)
          return `<div style="margin-bottom:8px;">
            <div style="display:flex;justify-content:space-between;margin-bottom:3px;">
              <span style="font-size:9px;color:var(--dim);">${cat}</span>
              <span style="font-family:var(--display);font-size:12px;color:var(--text);">${fmt(amt)} <span style="font-size:8px;color:var(--muted);font-family:var(--mono);">${pct}%</span></span>
            </div>
            <div style="height:3px;background:rgba(255,255,255,0.05);border-radius:1px;overflow:hidden;">
              <div style="height:100%;width:${barW}%;background:rgba(0,212,200,0.45);border-radius:1px;"></div>
            </div>
          </div>`
        }).join('') : ''}
    </div>
  `

  // ── BIND EVENTS ───────────────────────────────────────────────────────────
  // Year pills
  view.querySelectorAll('[data-sankey-yr]').forEach(btn => {
    btn.addEventListener('click', () => {
      window._sankeyYear = +btn.dataset.sankeyYr
      drillCat = null
      renderCashflow()
    })
  })

  // Reset drill
  view.querySelector('#sankey-reset-drill')?.addEventListener('click', () => {
    drillCat = null
    renderSankey('sankey-container', selYr, null)
    renderCashflow()
  })

  // Sankey drill event
  view.querySelector('#sankey-container')?.addEventListener('sankey-drill', e => {
    drillCat = e.detail.cat
    renderCashflow()
  })

  // ── RENDER SANKEY ─────────────────────────────────────────────────────────
  // Small delay to let DOM settle
  setTimeout(() => {
    renderSankey('sankey-container', selYr, drillCat)
  }, 50)
}
