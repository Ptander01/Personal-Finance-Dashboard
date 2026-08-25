import { mkChart, ttO, TC, GC, YOU, YOUD, BLS, RED, fmt, fmtK, MO } from '../state.js'
import { getData } from '../data.js'
const getB = () => getData().benchmarks

export function renderTrends() {
  renderNetIncomeChart()
  renderYoY()
  renderRolling()
}

function renderNetIncomeChart(){
  const ni=getB().net_income_by_year,yrs=Object.keys(ni);
  mkChart('net-income-chart',{type:'bar',
    data:{labels:yrs,datasets:[
      {type:'bar',label:'Your net income',data:yrs.map(y=>ni[y].you),backgroundColor:yrs.map(y=>ni[y].you>=0?YOU:RED),borderRadius:3,borderSkipped:false,order:2},
      {type:'line',label:'Peer est.',data:yrs.map(y=>ni[y].peer_est),borderColor:BLS,backgroundColor:'transparent',borderDash:[5,4],pointRadius:4,pointBackgroundColor:BLS,borderWidth:1.5,order:1}
    ]},
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{...ttO,callbacks:{label:ctx=>`${ctx.dataset.label}: ${(ctx.raw>=0?'+':'')}${fmt(ctx.raw)}`}}},
      scales:{x:{ticks:{color:TC,font:{size:10}},grid:{color:GC}},y:{ticks:{color:TC,font:{size:9},callback:v=>(v<0?'-':'')+fmtK(Math.abs(v))},grid:{color:GC}}}}
  });
}
function renderYoY(){
  const CC=getData().cat_colors;
  const yrs=Object.keys(getData().by_year_total).map(Number).sort((a,b)=>a-b),cats=Object.keys(CC).filter(c=>c!=='Bills & Utilities');
  mkChart('yoy-chart',{type:'bar',
    data:{labels:cats,datasets:yrs.map((y,i)=>({label:String(y),data:cats.map(c=>(getData().by_year_cat[y]||{})[c]||0),backgroundColor:`rgba(0,212,200,${[0.28,0.46,0.64,0.88][i]})`,borderRadius:2,borderSkipped:false,barPercentage:.25}))},
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{...ttO,callbacks:{label:ctx=>`${ctx.dataset.label}: ${fmt(ctx.raw)}`}}},
      scales:{x:{ticks:{color:TC,font:{size:9},maxRotation:30},grid:{color:GC}},y:{ticks:{color:TC,font:{size:9},callback:v=>fmtK(v)},grid:{color:GC}}}}
  });
}
function renderRolling(){
  const keys=Object.keys(getData().monthly_total).sort(),vals=keys.map(k=>getData().monthly_total[k]||0);
  const rolling=vals.map((_,i)=>{const s=vals.slice(Math.max(0,i-2),i+1);return Math.round(s.reduce((a,v)=>a+v,0)/s.length);});
  mkChart('rolling-chart',{type:'bar',
    data:{labels:keys.map(k=>{const[y,m]=k.split('-');return m==='01'?y:MO[+m-1];}),
      datasets:[{type:'bar',data:vals,backgroundColor:YOUD,borderRadius:1,borderSkipped:false,order:2,label:'Monthly'},
        {type:'line',data:rolling,borderColor:YOU,backgroundColor:'transparent',borderWidth:2,pointRadius:0,order:1,label:'3mo avg'}]},
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{...ttO,callbacks:{label:ctx=>`${ctx.dataset.label}: ${fmt(ctx.raw)}`}}},
      scales:{x:{ticks:{color:TC,font:{size:9},autoSkip:true,maxTicksLimit:18},grid:{color:GC}},y:{ticks:{color:TC,font:{size:9},callback:v=>fmtK(v)},grid:{color:GC}}}}
  });
}
