// Auto-generated tab HTML templates

export const overviewHTML = `
<div class="krow" style="grid-template-columns:repeat(5,1fr);" id="krow"></div>

    <!-- DONUT -->
    <div class="card">
      <div class="sec-row">
        <div class="sec-hdr">
          <div style="display:flex;align-items:baseline;gap:8px;margin-bottom:2px;">
            <span class="sec-title">Spend by category — donut</span>
            <span id="donut-drill-label"></span>
          </div>
          <span class="sec-sub" id="donut-desc">Each slice = one parent category with inner sub-category ring. Hover for details. Click a parent slice to drill into sub-categories.</span>
        </div>
        <div class="lg" id="donut-legend"></div>
      </div>
      <div style="height:290px;position:relative"><canvas id="donut-chart"></canvas></div>
    </div>

    <!-- TIMELINE -->
    <div class="card">
      <div class="sec-row">
        <div class="sec-hdr">
          <span class="sec-title">Monthly spend timeline — bar chart</span>
          <span class="sec-sub">Each bar = one calendar month. <strong style="color:var(--accent)">Click any bar</strong> to drill into that month in the transaction list.</span>
        </div>
      </div>
      <div style="height:178px;position:relative"><canvas id="timeline-chart"></canvas></div>
    </div>

    <!-- STACKED BAR -->
    <div class="card">
      <div class="sec-row">
        <div class="sec-hdr">
          <div style="display:flex;align-items:baseline;gap:8px;margin-bottom:2px;">
            <span class="sec-title">Monthly category breakdown — stacked bar</span>
            <span id="stacked-drill-label"></span>
          </div>
          <span class="sec-sub" id="stacked-desc">Default: all parent categories stacked by month. Select a parent category in the left nav to drill down into its sub-categories, shown as shades of that category's color.</span>
        </div>
        <div class="lg" id="stacked-legend" style="max-width:280px;"></div>
      </div>
      <div style="height:175px;position:relative"><canvas id="stacked-chart"></canvas></div>
    </div>
  </div>

  <!-- ── BENCHMARK ─────────────────────────────────── -->
  <div
`

export const benchmarkHTML = `
<div style="background:rgba(0,212,200,0.05);border:1px solid var(--adim);border-radius:2px;padding:9px 14px;font-size:8px;color:var(--dim);line-height:1.6;letter-spacing:.05em;">
      <strong style="color:var(--accent);">About this tab:</strong> All charts compare your 2025 actuals to national benchmarks. Year filter has no effect here.
      &nbsp;<span class="lg-sq" style="background:rgba(0,212,200,0.85);display:inline-block;vertical-align:middle;"></span> Teal = You &nbsp;
      <span class="lg-sq" style="background:rgba(107,127,168,0.75);display:inline-block;vertical-align:middle;"></span> Blue-gray = BLS national avg &nbsp;
      <span class="lg-sq" style="background:rgba(138,184,107,0.75);display:inline-block;vertical-align:middle;"></span> Green = Top quintile est.
    </div>
    <div class="card"><div class="sec-hdr"><span class="sec-title">Income vs. peer cohorts</span><span class="sec-sub">Your 2025 gross vs. five national benchmarks. Source: Census ACS 2024, CPS ASEC 2024.</span></div><div style="height:192px;position:relative"><canvas id="income-bench-chart"></canvas></div></div>
    <div class="card"><div class="sec-hdr"><span class="sec-title">Spending deviation from national average</span><span class="sec-sub"><strong style="color:var(--red)">Red →</strong> you spend more than average · <strong style="color:var(--accent)">Teal ←</strong> you spend less than average. Source: BLS Consumer Expenditure Survey 2024.</span></div><div style="height:235px;position:relative"><canvas id="deviation-chart"></canvas></div></div>
    <div class="card">
      <div class="sec-row"><div class="sec-hdr"><span class="sec-title">Category spend: you vs. peers</span><span class="sec-sub">Three bars per category: you vs. BLS average vs. top-quintile estimate.</span></div>
        <div class="lg"><span class="lg-i"><span class="lg-sq" style="background:rgba(0,212,200,0.85)"></span>You 2025</span><span class="lg-i"><span class="lg-sq" style="background:rgba(107,127,168,0.75)"></span>BLS avg</span><span class="lg-i"><span class="lg-sq" style="background:rgba(138,184,107,0.75)"></span>Top quintile</span></div>
      </div>
      <div style="height:295px;position:relative"><canvas id="cat-bench-chart"></canvas></div>
    </div>
    <div class="card">
      <div class="sec-row"><div class="sec-hdr"><span class="sec-title">Spending as % of gross income</span><span class="sec-sub">Proportional view — corrects for income-level differences.</span></div>
        <div class="lg"><span class="lg-i"><span class="lg-sq" style="background:rgba(0,212,200,0.85)"></span>You</span><span class="lg-i"><span class="lg-sq" style="background:rgba(107,127,168,0.75)"></span>BLS avg</span></div>
      </div>
      <div style="height:238px;position:relative"><canvas id="pct-bench-chart"></canvas></div>
    </div>
    <div class="card"><div class="sec-hdr"><span class="sec-title">Key findings</span><span class="sec-sub">Green = favorable · Red = above average · Teal = context</span></div>
      <div class="insight i-a"><div class="i-title">Shopping 4.0× — largest dollar deviation</div><div class="i-body">$8,033 vs. BLS $1,985. Shops ($4,736 — largely uncategorized Amazon), Personal Care ($940), Allowance_P ($855), Clothing ($703), Allowance_M ($571). The allowance lines are intentional per-partner discretionary budgets.</div></div>
      <div class="insight i-r"><div class="i-title">Healthcare 2.3× — structural, not behavioral</div><div class="i-body">$14,216 vs. BLS $6,197. BCBS marketplace premiums ($7,498/yr) are the main driver — single-earner status without employer coverage.</div></div>
      <div class="insight i-g"><div class="i-title">Transport 0.3× — biggest savings vs. avg</div><div class="i-body">$3,645 vs. $13,318 BLS average — ~$9,700 saved per year. Auto Insurance ($2,131) + Gas ($962) + Service ($347).</div></div>
      <div class="insight i-b"><div class="i-title">Gifts & donations 2.5× — intentional giving</div><div class="i-body">$5,629 (5.0% of gross): $4,530 charitable (three deliberate checks) + $1,099 personal gifts. Net of received gifts ~$4,418.</div></div>
      <div class="insight i-g"><div class="i-title">Housing 0.8× — running conservatively</div><div class="i-body">$22,070 vs. $26,266 national avg. Only 19.6% of gross income vs. 26% nationally.</div></div>
    </div>
  </div>

  <!-- ── INCOME ─────────────────────────────────────── -->
  <div
`

export const incomeHTML = `
<div class="krow" style="grid-template-columns:repeat(4,1fr);" id="income-kpis"></div>
    <div class="card"><div class="sec-hdr"><span class="sec-title">Income sources 2025 — horizontal bar</span><span class="sec-sub">Brighter teal = primary earner. Dimmer teal = secondary/one-time. Hover for % of gross.</span></div><div style="height:188px;position:relative"><canvas id="income-bar-chart"></canvas></div></div>
    <div class="card"><div class="sec-row"><div class="sec-hdr"><span class="sec-title">2025 income allocation — donut</span><span class="sec-sub">How $112K gross was split: expenses, taxes, net savings.</span></div><div class="lg"><span class="lg-i"><span class="lg-sq" style="background:rgba(0,212,200,0.85)"></span>Expenses</span><span class="lg-i"><span class="lg-sq" style="background:rgba(225,80,80,0.65)"></span>Taxes</span><span class="lg-i"><span class="lg-sq" style="background:rgba(80,210,130,0.7)"></span>Saved</span></div></div><div style="height:188px;position:relative"><canvas id="alloc-chart"></canvas></div></div>
    <div class="card"><div class="sec-hdr"><span class="sec-title">Stay-at-home parent economic value</span><span class="sec-sub">Red = market cost · Teal = your actual · Green = cash savings · Amber = foregone salary.</span></div><div style="height:188px;position:relative"><canvas id="childcare-chart"></canvas></div></div>
  </div>

  <!-- ── TRENDS ─────────────────────────────────────── -->
  <div
`

export const trendsHTML = `
<div class="card"><div class="sec-row"><div class="sec-hdr"><span class="sec-title">Net income by year + peer benchmark line</span><span class="sec-sub">Teal = surplus · Red = deficit. Dashed line = estimated peer household.</span></div><div class="lg"><span class="lg-i"><span class="lg-sq" style="background:rgba(0,212,200,0.85)"></span>Surplus</span><span class="lg-i"><span class="lg-sq" style="background:rgba(225,80,80,0.75)"></span>Deficit</span><span class="lg-i" style="gap:5px"><span style="width:16px;height:2px;border-top:2px dashed rgba(107,127,168,0.7);display:inline-block;"></span>Peer est.</span></div></div><div style="height:205px;position:relative"><canvas id="net-income-chart"></canvas></div></div>
    <div class="card"><div class="sec-hdr"><span class="sec-title">Year-over-year spend by category</span><span class="sec-sub">One group per category. Light → dark = 2022 → 2025.</span></div><div style="height:275px;position:relative"><canvas id="yoy-chart"></canvas></div></div>
    <div class="card"><div class="sec-hdr"><span class="sec-title">3-month rolling average</span><span class="sec-sub">Faint bars = raw monthly · Solid line = smoothed 3-month trend.</span></div><div style="height:172px;position:relative"><canvas id="rolling-chart"></canvas></div></div>
  </div>

  <!-- ── WEALTH ─────────────────────────────────────── -->
  <div
`

export const wealthHTML = `
<div style="display:grid;grid-template-columns:1fr 1fr;gap:11px;">
      <div class="card"><div class="sec-hdr"><span class="sec-title">Asset snapshot</span><span class="sec-sub">Investments · Liquid savings · Home equity. Excludes mortgage.</span></div><div class="lg" style="margin-bottom:8px;"><span class="lg-i"><span class="lg-sq" style="background:rgba(0,212,200,0.85)"></span>Investments</span><span class="lg-i"><span class="lg-sq" style="background:rgba(80,210,130,0.7)"></span>Savings</span><span class="lg-i"><span class="lg-sq" style="background:rgba(240,180,60,0.65)"></span>Equity</span></div><div style="height:185px;position:relative"><canvas id="assets-chart"></canvas></div></div>
      <div class="card"><div class="sec-hdr"><span class="sec-title">Retirement vs. benchmarks</span><span class="sec-sub">Median/avg peers (35–44) · Fidelity 1× target · Your balance. Source: Fed SCF 2022.</span></div><div class="lg" style="margin-bottom:8px;"><span class="lg-i"><span class="lg-sq" style="background:rgba(107,127,168,0.75)"></span>Peers</span><span class="lg-i"><span class="lg-sq" style="background:rgba(138,184,107,0.75)"></span>Target</span><span class="lg-i"><span class="lg-sq" style="background:rgba(0,212,200,0.85)"></span>You</span></div><div style="height:185px;position:relative"><canvas id="ret-bench-chart"></canvas></div></div>
    </div>
    <div class="card"><div class="sec-hdr"><span class="sec-title">Net worth waterfall</span><span class="sec-sub">Total assets → components → mortgage subtracted (red) → net worth.</span></div><div style="height:188px;position:relative"><canvas id="waterfall-chart"></canvas></div></div>
    <div class="card"><div class="sec-hdr"><span class="sec-title">Savings rate vs. benchmarks</span><span class="sec-sub">US avg · recommended min · your 2025 · your 2026 projected.</span></div><div style="height:148px;position:relative"><canvas id="saverate-chart"></canvas></div></div>
  </div>

  <!-- ── GUIDE ──────────────────────────────────────── -->
  <div
`

