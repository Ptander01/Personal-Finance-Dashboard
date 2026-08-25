import { mkChart, ttO, TC, GC, YOU, BLS, TOP, YOUD, BLSD, RED, fmt, fmtK } from '../state.js'
import { getData } from '../data.js'
const getB = () => getData().benchmarks

export function renderBenchmark() {
  renderBenchmarkTab()
}

function renderBenchmarkTab(){
  const YOU2='rgba(0,212,200,0.85)',BLS2='rgba(107,127,168,0.75)',TOP2='rgba(138,184,107,0.75)';
  mkChart('income-bench-chart',{type:'bar',
    data:{labels:getB().income.comparison.map(d=>d.label),
      datasets:[{data:getB().income.comparison.map(d=>d.value),backgroundColor:[BLS2,BLS2,BLS2,BLS2,BLSD,YOU2],borderRadius:3,borderSkipped:false}]},
    options:{indexAxis:'y',responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{...ttO,callbacks:{label:ctx=>fmt(ctx.raw)}}},
      scales:{x:{ticks:{color:TC,font:{size:9},callback:v=>fmtK(v)},grid:{color:GC}},y:{ticks:{color:TC,font:{size:10}},grid:{color:GC}}}}
  });
  const catKeys=Object.keys(getB().spending_annual.categories);
  const devs=catKeys.map(c=>Math.round(getB().spending_annual.categories[c].you-getB().spending_annual.categories[c].bls_avg));
  mkChart('deviation-chart',{type:'bar',
    data:{labels:catKeys,datasets:[{label:'$ vs BLS avg',data:devs,backgroundColor:devs.map(v=>v>=0?RED:YOU2),borderRadius:3,borderSkipped:false}]},
    options:{indexAxis:'y',responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{...ttO,callbacks:{label:ctx=>{
            const cat=ctx.label;
            const cats=getB().spending_annual.categories;
            const cd=cats[cat]||{};
            const you=cd.you||0, avg=cd.bls_avg||0, diff=ctx.raw;
            const dir=diff>=0?'▲ OVER':'▼ UNDER';
            return [
              dir+' by '+(diff>=0?'+':'')+fmt(diff),
              'You spent: '+fmt(you),
              'National avg: '+fmt(avg),
              avg?'Multiple: '+(you/avg).toFixed(1)+'×':''
            ].filter(Boolean);
          }}}},
      scales:{x:{ticks:{color:TC,font:{size:9},callback:v=>(v>=0?'+':'')+fmtK(v)},grid:{color:GC}},y:{ticks:{color:TC,font:{size:10}},grid:{color:GC}}}}
  });
  mkChart('cat-bench-chart',{type:'bar',
    data:{labels:catKeys,datasets:[
      {label:'You (2025)',data:catKeys.map(c=>getB().spending_annual.categories[c].you),backgroundColor:YOU2,borderRadius:3,borderSkipped:false,barPercentage:.28},
      {label:'BLS national avg',data:catKeys.map(c=>getB().spending_annual.categories[c].bls_avg),backgroundColor:BLS2,borderRadius:3,borderSkipped:false,barPercentage:.28},
      {label:'Top quintile est.',data:catKeys.map(c=>getB().spending_annual.categories[c].bls_top),backgroundColor:TOP2,borderRadius:3,borderSkipped:false,barPercentage:.28},
    ]},
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{...ttO,callbacks:{label:ctx=>`${ctx.dataset.label}: ${fmt(ctx.raw)}`}}},
      scales:{x:{ticks:{color:TC,font:{size:9},maxRotation:30},grid:{color:GC}},y:{ticks:{color:TC,font:{size:9},callback:v=>fmtK(v)},grid:{color:GC}}}}
  });
  const pctCats=Object.keys(getB().spending_pct_income.categories);
  mkChart('pct-bench-chart',{type:'bar',
    data:{labels:pctCats,datasets:[
      {label:'You (% of gross)',data:pctCats.map(c=>getB().spending_pct_income.categories[c].you),backgroundColor:YOU2,borderRadius:3,borderSkipped:false,barPercentage:.38},
      {label:'BLS avg (%)',data:pctCats.map(c=>getB().spending_pct_income.categories[c].bls),backgroundColor:BLS2,borderRadius:3,borderSkipped:false,barPercentage:.38},
    ]},
    options:{indexAxis:'y',responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{...ttO,callbacks:{label:ctx=>`${ctx.dataset.label}: ${ctx.raw.toFixed(1)}%`}}},
      scales:{x:{ticks:{color:TC,font:{size:9},callback:v=>v+'%'},grid:{color:GC}},y:{ticks:{color:TC,font:{size:10}},grid:{color:GC}}}}
  });
}
