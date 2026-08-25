import { mkChart, ttO, TC, GC, YOU, YOUD, BLS, BLSD, TOP, RED, fmt, fmtK, hexA } from '../state.js'
import { getData } from '../data.js'
const getB = () => getData().benchmarks

export function renderWealth() {
  renderWealthTab()
}

function renderWealthTab(){
  const sw=getB().savings_wealth;
  mkChart('assets-chart',{type:'doughnut',
    data:{labels:['Investments','Liquid Savings','Home Equity'],datasets:[{data:[sw.retirement_you,sw.liquid_savings_you,sw.home_equity_you],backgroundColor:[YOU,'rgba(80,210,130,0.7)','rgba(240,180,60,0.65)'],borderColor:[hexA('#00d4c8',.3),'rgba(80,210,130,0.3)','rgba(240,180,60,0.3)'],borderWidth:1,hoverOffset:4}]},
    options:{responsive:true,maintainAspectRatio:false,cutout:'58%',plugins:{legend:{display:false},tooltip:{...ttO,callbacks:{label:ctx=>`${ctx.label}: ${fmt(ctx.raw)}`}}}}
  });
  mkChart('ret-bench-chart',{type:'bar',
    data:{labels:['Median peer 35–44','Average peer 35–44','Fidelity 1× target','Your investments'],datasets:[{data:[sw.retirement_median_35_44,sw.retirement_avg_35_44,sw.fidelity_1x_target,sw.retirement_you],backgroundColor:[BLS,BLSD,TOP,YOU],borderRadius:3,borderSkipped:false}]},
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{...ttO,callbacks:{label:ctx=>fmt(ctx.raw)}}},
      scales:{x:{ticks:{color:TC,font:{size:9},maxRotation:20},grid:{color:GC}},y:{ticks:{color:TC,font:{size:9},callback:v=>fmtK(v)},grid:{color:GC}}}}
  });
  const ta=sw.retirement_you+sw.liquid_savings_you+sw.home_equity_you;
  mkChart('waterfall-chart',{type:'bar',
    data:{labels:['Total Assets','→ Investments','→ Liquid Savings','→ Home Equity','− Mortgage','= Net Worth'],datasets:[{data:[ta,sw.retirement_you,sw.liquid_savings_you,sw.home_equity_you,sw.mortgage_you,ta-sw.mortgage_you],backgroundColor:[YOU,YOU,'rgba(80,210,130,0.7)','rgba(240,180,60,0.65)','rgba(225,80,80,0.65)',YOU],borderRadius:3,borderSkipped:false}]},
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{...ttO,callbacks:{label:ctx=>fmt(ctx.raw)}}},
      scales:{x:{ticks:{color:TC,font:{size:9}},grid:{color:GC}},y:{ticks:{color:TC,font:{size:9},callback:v=>fmtK(v)},grid:{color:GC}}}}
  });
  mkChart('saverate-chart',{type:'bar',
    data:{labels:['US avg savings rate','Recommended (15%+)','Your 2025 rate','Your 2026 projected'],datasets:[{data:[4.6,15,25.2,47.0],backgroundColor:[BLS,TOP,YOU,YOU],borderRadius:3,borderSkipped:false}]},
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{...ttO,callbacks:{label:ctx=>ctx.raw.toFixed(1)+'%'}}},
      scales:{x:{ticks:{color:TC,font:{size:9}},grid:{color:GC}},y:{ticks:{color:TC,font:{size:9},callback:v=>v+'%'},grid:{color:GC}}}}
  });
}
