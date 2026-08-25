import { mkChart, ttO, TC, GC, YOU, YOUD, fmt, fmtK } from '../state.js'
import { getData } from '../data.js'
const getB = () => getData().benchmarks

// The year the income and allocation views describe. Latest year with a full
// twelve months of data, falling back to the latest year present.
const BENCH_YEAR = () => {
  const D = getData()
  const years = Object.keys(D.by_year_total).sort()
  const full = years.filter(y =>
    Object.keys(D.monthly_total).filter(k => k.startsWith(y + '-')).length === 12)
  return (full.length ? full[full.length - 1] : years[years.length - 1])
}

export function renderIncome() {
  renderIncomeKPIs()
  renderIncomeBar()
  renderAllocChart()
  renderChildcareChart()
}

function renderIncomeKPIs(){
  const ni=getB().net_income_by_year;
  document.getElementById('income-kpis').innerHTML=[
    {l:'Gross income 2025',v:fmt(getB().income.you_2025),s:'All sources combined',c:'var(--accent)'},
    {l:'2026 annualized pace',v:fmt(getB().income.you_2026_annualized),s:'Based on Q1 actual',c:'rgba(80,210,130,.8)'},
    {l:'2025 savings rate',v:((ni['2025'].you/getB().income.you_2025)*100).toFixed(1)+'%',s:fmt(ni['2025'].you)+' net saved',c:'rgba(240,200,80,.8)'},
    {l:'Childcare cash savings',v:fmt(getB().childcare.your_savings_vs_avg),s:'vs. 2-child daycare avg',c:'rgba(200,120,240,.8)'},
  ].map(k=>`<div class="kpi" style="--kc:${k.c}"><div class="kl">${k.l}</div><div class="kv">${k.v}</div><div class="ks">${k.s}</div></div>`).join('');
}
function renderIncomeBar(){
  // Derived from the data: every income source for the benchmark year, largest first.
  const src=Object.entries(getData().sankey[BENCH_YEAR()].income_sources).sort((a,b)=>b[1]-a[1]);
  mkChart('income-bar-chart',{type:'bar',
    data:{labels:src.map(d=>d[0]),
      datasets:[{data:src.map(d=>d[1]),backgroundColor:src.map((_,i)=>i<2?YOU:YOUD),borderRadius:3,borderSkipped:false}]},
    options:{indexAxis:'y',responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{...ttO,callbacks:{label:ctx=>`${fmt(ctx.raw)} — ${(ctx.raw/getB().income.you_2025*100).toFixed(1)}% of gross`}}},
      scales:{x:{ticks:{color:TC,font:{size:9},callback:v=>fmtK(v)},grid:{color:GC}},y:{ticks:{color:TC,font:{size:10}},grid:{color:GC}}}}
  });
}
function renderAllocChart(){
  const g=getB().income.you_2025,taxes=getB().income.taxes_2025,saved=getB().net_income_by_year['2025'].you;
  mkChart('alloc-chart',{type:'doughnut',
    data:{labels:['Total Expenses','Taxes Paid','Net Saved'],
      datasets:[{data:[g-taxes-saved,taxes,saved],backgroundColor:[YOU,'rgba(225,80,80,0.65)','rgba(80,210,130,0.70)'],borderColor:['rgba(0,212,200,0.3)','rgba(225,80,80,0.3)','rgba(80,210,130,0.3)'],borderWidth:1,hoverOffset:4}]},
    options:{responsive:true,maintainAspectRatio:false,cutout:'56%',plugins:{legend:{display:false},tooltip:{...ttO,callbacks:{label:ctx=>`${ctx.label}: ${fmt(ctx.raw)} (${(ctx.raw/g*100).toFixed(1)}%)`}}}}
  });
}
function renderChildcareChart(){
  const cc=getB().childcare;
  mkChart('childcare-chart',{type:'bar',
    data:{labels:['Nat. avg — 2 kids','Full-time nanny','Your actual spend','Savings vs. daycare','Foregone salary est.'],
      datasets:[{data:[cc.national_avg_2_children,cc.nanny_annual,cc.your_actual,cc.your_savings_vs_avg,cc.foregone_salary],backgroundColor:['rgba(225,80,80,0.60)','rgba(225,80,80,0.50)',YOU,'rgba(80,210,130,0.70)','rgba(240,180,60,0.60)'],borderRadius:3,borderSkipped:false}]},
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{...ttO,callbacks:{label:ctx=>fmt(ctx.raw)}}},
      scales:{x:{ticks:{color:TC,font:{size:9},maxRotation:20},grid:{color:GC}},y:{ticks:{color:TC,font:{size:9},callback:v=>fmtK(v)},grid:{color:GC}}}}
  });
}
