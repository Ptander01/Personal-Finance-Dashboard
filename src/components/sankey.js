import { sankey, sankeyLinkHorizontal, sankeyLeft } from 'd3-sankey'
import { select } from 'd3'
import { state, fmt, fmtK, hexA } from '../state.js'
import { getData } from '../data.js'

// ── COLOR MAP ─────────────────────────────────────────────────────────────────
// Node colours. Category nodes keep the palette from the data; income and
// other nodes are assigned deterministically from their name, so any set of
// income sources gets stable, distinct colours without being listed here.
const PALETTE = ['#7ecfb2','#70c8d0','#f07878','#b0a0f0','#f0c96e','#a8d870',
                 '#f0a870','#f0c0d0','#6eb8f0','#c8a0f0','#909090']

// Stable colour for any node name. Expense categories use the palette that came
// with the data; everything else (income sources, the savings and tax nodes)
// hashes its own name into PALETTE, so no name has to be listed here and any
// dataset gets distinct, repeatable colours.
function hashIndex(name) {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0
  return h % PALETTE.length
}

function nodeColor(name) {
  const cc = (getData().cat_colors) || {}
  return cc[name] || PALETTE[hashIndex(name)]
}

// ── BUILD SANKEY GRAPH ────────────────────────────────────────────────────────
function buildGraph(yrData, drillCat) {
  const nodes = []
  const links = []
  const nodeIndex = {}

  function addNode(name) {
    if (nodeIndex[name] === undefined) {
      nodeIndex[name] = nodes.length
      nodes.push({ name })
    }
    return nodeIndex[name]
  }

  function addLink(source, target, value) {
    if (value <= 0) return
    links.push({ source: addNode(source), target: addNode(target), value: Math.round(value) })
  }

  const { income_sources, total_income, net_savings, expense_categories, expense_subcategories } = yrData

  // Layer 1: Income sources → Gross Income
  for (const [src, amt] of Object.entries(income_sources)) {
    if (amt > 100) addLink(src, 'Gross Income', amt)
  }

  // Layer 2: Gross Income → Net Savings + Total Expenses
  if (net_savings > 0) addLink('Gross Income', 'Net Savings', net_savings)
  addLink('Gross Income', 'Total Expenses', Math.min(total_income, Object.values(expense_categories).reduce((s,v)=>s+v,0)))

  // Layer 3: Total Expenses → expense categories (or sub-cats if drilling)
  if (drillCat && expense_subcategories[drillCat]) {
    // Drill: show sub-categories of selected expense category
    addLink('Total Expenses', drillCat, expense_categories[drillCat] || 0)
    for (const [sub, amt] of Object.entries(expense_subcategories[drillCat])) {
      if (amt > 50) addLink(drillCat, sub, amt)
    }
  } else {
    for (const [cat, amt] of Object.entries(expense_categories)) {
      if (amt > 100) addLink('Total Expenses', cat, amt)
    }
  }

  return { nodes, links }
}

// ── RENDER ────────────────────────────────────────────────────────────────────
export function renderSankey(containerId, year, drillCat) {
  const D = getData()
  const yrData = D.sankey?.[String(year)]
  if (!yrData) {
    document.getElementById(containerId).innerHTML =
      `<div style="color:var(--muted);padding:24px;font-size:10px;letter-spacing:.2em;">No flow data for ${year}</div>`
    return
  }

  const container = document.getElementById(containerId)
  container.innerHTML = ''

  const W = container.clientWidth || 800
  const H = container.clientHeight || 420
  const PAD = { top: 16, right: 160, bottom: 16, left: 160 }

  const graph = buildGraph(yrData, drillCat)
  if (!graph.nodes.length) return

  // D3 Sankey layout
  const sankeyLayout = sankey()
    .nodeWidth(14)
    .nodePadding(10)
    .nodeAlign(sankeyLeft)
    .extent([[PAD.left, PAD.top], [W - PAD.right, H - PAD.bottom]])

  let sankeyGraph
  try {
    sankeyGraph = sankeyLayout({
      nodes: graph.nodes.map(d => ({ ...d })),
      links: graph.links.map(d => ({ ...d }))
    })
  } catch (e) {
    container.innerHTML = `<div style="color:var(--red);padding:16px;font-size:9px;">Layout error: ${e.message}</div>`
    return
  }

  // SVG
  const svg = select(container)
    .append('svg')
    .attr('width', W)
    .attr('height', H)
    .style('overflow', 'visible')

  // Gradient defs for links
  const defs = svg.append('defs')

  // Links
  const linkGroup = svg.append('g').attr('fill', 'none')
  linkGroup.selectAll('path')
    .data(sankeyGraph.links)
    .join('path')
    .attr('d', sankeyLinkHorizontal())
    .attr('stroke-width', d => Math.max(1, d.width))
    .attr('stroke', d => {
      const srcColor = nodeColor(d.source.name)
      const id = `grad-${d.index}`
      const grad = defs.append('linearGradient')
        .attr('id', id)
        .attr('gradientUnits', 'userSpaceOnUse')
        .attr('x1', d.source.x1).attr('x2', d.target.x0)
      grad.append('stop').attr('offset', '0%').attr('stop-color', srcColor).attr('stop-opacity', 0.5)
      grad.append('stop').attr('offset', '100%').attr('stop-color', nodeColor(d.target.name)).attr('stop-opacity', 0.3)
      return `url(#${id})`
    })
    .attr('opacity', 0.7)
    .on('mouseover', function(event, d) {
      select(this).attr('opacity', 1)
      showTooltip(event, `${d.source.name} → ${d.target.name}`, fmt(d.value),
        `${(d.value / yrData.total_income * 100).toFixed(1)}% of gross income`)
    })
    .on('mousemove', moveTooltip)
    .on('mouseleave', function() { select(this).attr('opacity', 0.7); hideTooltip() })

  // Nodes
  const nodeGroup = svg.append('g')
  const nodeEl = nodeGroup.selectAll('g')
    .data(sankeyGraph.nodes)
    .join('g')
    .attr('cursor', d => isExpenseCategory(d.name) ? 'pointer' : 'default')
    .on('click', (event, d) => {
      if (isExpenseCategory(d.name)) {
        // Dispatch custom event to parent for drill-down
        container.dispatchEvent(new CustomEvent('sankey-drill', { detail: { cat: d.name }, bubbles: true }))
      }
    })
    .on('mouseover', (event, d) => {
      const pct = (d.value / yrData.total_income * 100).toFixed(1)
      showTooltip(event, d.name, fmt(d.value), `${pct}% of gross income · ${isExpenseCategory(d.name) ? 'click to drill into sub-categories' : ''}`)
    })
    .on('mousemove', moveTooltip)
    .on('mouseleave', hideTooltip)

  // Node rect
  nodeEl.append('rect')
    .attr('x', d => d.x0)
    .attr('y', d => d.y0)
    .attr('width', d => d.x1 - d.x0)
    .attr('height', d => Math.max(2, d.y1 - d.y0))
    .attr('fill', d => nodeColor(d.name))
    .attr('rx', 2)
    .attr('opacity', 0.85)

  // Node labels
  nodeEl.append('text')
    .attr('x', d => d.x0 < W / 2 ? d.x1 + 8 : d.x0 - 8)
    .attr('y', d => (d.y0 + d.y1) / 2)
    .attr('dy', '0.35em')
    .attr('text-anchor', d => d.x0 < W / 2 ? 'start' : 'end')
    .attr('font-family', 'DM Mono, monospace')
    .attr('font-size', d => d.name === 'Gross Income' ? 11 : 9)
    .attr('fill', d => nodeColor(d.name))
    .attr('opacity', 0.9)
    .text(d => d.name)

  // Value labels on larger nodes
  nodeEl.filter(d => d.y1 - d.y0 > 18)
    .append('text')
    .attr('x', d => d.x0 < W / 2 ? d.x1 + 8 : d.x0 - 8)
    .attr('y', d => (d.y0 + d.y1) / 2 + 13)
    .attr('dy', '0.35em')
    .attr('text-anchor', d => d.x0 < W / 2 ? 'start' : 'end')
    .attr('font-family', 'Bebas Neue, sans-serif')
    .attr('font-size', 11)
    .attr('fill', d => nodeColor(d.name))
    .attr('opacity', 0.55)
    .attr('letter-spacing', '0.04em')
    .text(d => fmtK(d.value))
}

function isExpenseCategory(name) {
  const expCats = ['Household','Food & Drink','Health and Fitness','Shopping','Travel',
    'Car & Transport','Bills and Utilities','Children','Gifts','Uncategorized','Pets']
  return expCats.includes(name)
}

// ── TOOLTIP ───────────────────────────────────────────────────────────────────
function getOrCreateTooltip() {
  let tt = document.getElementById('sankey-tooltip')
  if (!tt) {
    tt = document.createElement('div')
    tt.id = 'sankey-tooltip'
    tt.style.cssText = 'position:fixed;background:rgba(6,7,14,0.97);border:1px solid rgba(255,255,255,0.13);border-radius:2px;padding:9px 13px;pointer-events:none;opacity:0;z-index:8000;transition:opacity .1s;min-width:160px;font-family:DM Mono,monospace;'
    document.body.appendChild(tt)
  }
  return tt
}

function showTooltip(event, title, amount, sub) {
  const tt = getOrCreateTooltip()
  tt.innerHTML = `
    <div style="font-family:Cormorant Garamond,serif;font-size:14px;color:rgba(235,245,255,0.9);margin-bottom:3px;">${title}</div>
    <div style="font-family:Bebas Neue,sans-serif;font-size:22px;color:#00d4c8;letter-spacing:.04em;">${amount}</div>
    <div style="font-size:7.5px;color:rgba(160,185,220,0.52);letter-spacing:.2em;margin-top:3px;">${sub}</div>`
  tt.style.opacity = '1'
  moveTooltip(event)
}

function moveTooltip(event) {
  const tt = getOrCreateTooltip()
  const tw = tt.offsetWidth || 180, th = tt.offsetHeight || 80
  let lx = event.clientX + 14, ly = event.clientY - 20
  if (lx + tw > window.innerWidth - 8) lx = event.clientX - tw - 14
  if (ly + th > window.innerHeight - 8) ly = event.clientY - th - 10
  tt.style.left = lx + 'px'; tt.style.top = ly + 'px'
}

function hideTooltip() {
  const tt = document.getElementById('sankey-tooltip')
  if (tt) tt.style.opacity = '0'
}
