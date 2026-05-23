import { useState, useEffect, useRef } from "react";

const SUPABASE_URL = "https://szaasnrwguvhpehukaws.supabase.co";
const SUPABASE_KEY = "sb_publishable_ZRy3r0IbxlShDwL2gSpmWw_mg9OIWNA";

const FONT = "'DM Sans', sans-serif";
const MONO = "'DM Mono', monospace";
const C = {
  bg:"#0a0a0f",surface:"#13131a",card:"#1a1a24",border:"#252533",
  accent:"#7c6fff",accentSoft:"#7c6fff20",
  green:"#20d9a0",greenSoft:"#20d9a015",
  red:"#ff5f5f",redSoft:"#ff5f5f15",
  amber:"#ffb340",amberSoft:"#ffb34015",
  blue:"#4db8ff",blueSoft:"#4db8ff15",
  purple:"#c084fc",purpleSoft:"#c084fc15",
  text:"#eeeef5",muted:"#7a7a96",dim:"#404055",
};

const fmt = n => new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(n||0);
const fmtPct = n => `${(n||0).toFixed(1)}%`;
const today = () => new Date().toISOString().split("T")[0];

// ── Supabase client ───────────────────────────────────────────────────────────
const db = {
  async get(table) {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}?order=id.asc`, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
    });
    if (!r.ok) throw new Error(await r.text());
    return r.json();
  },
  async insert(table, row) {
    const { id, ...data } = row;
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: "POST",
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json", Prefer: "return=representation" },
      body: JSON.stringify(data)
    });
    if (!r.ok) throw new Error(await r.text());
    const result = await r.json();
    return result[0];
  },
  async update(table, id, row) {
    const { id: _id, created_at, ...data } = row;
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
      method: "PATCH",
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json", Prefer: "return=representation" },
      body: JSON.stringify(data)
    });
    if (!r.ok) throw new Error(await r.text());
    const result = await r.json();
    return result[0];
  },
  async delete(table, id) {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
      method: "DELETE",
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
    });
    if (!r.ok) throw new Error(await r.text());
  }
};

// ── UI Primitives ─────────────────────────────────────────────────────────────
const Card = ({children,style={}}) => <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:"20px 24px",...style}}>{children}</div>;
const Badge = ({children,color=C.accent}) => <span style={{background:color+"22",color,fontSize:11,fontWeight:600,padding:"3px 9px",borderRadius:6,whiteSpace:"nowrap"}}>{children}</span>;

function MetricCard({label,value,sub,color=C.accent,icon}) {
  return (
    <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:14,padding:"18px 20px",display:"flex",flexDirection:"column",gap:6}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span style={{fontSize:11,color:C.muted,fontWeight:500,textTransform:"uppercase",letterSpacing:"0.07em"}}>{label}</span>
        {icon&&<span style={{fontSize:18,color}}>{icon}</span>}
      </div>
      <div style={{fontSize:26,fontWeight:700,color,fontFamily:MONO,lineHeight:1}}>{value}</div>
      {sub&&<div style={{fontSize:12,color:C.muted}}>{sub}</div>}
    </div>
  );
}

function Inp({label,full,style:st={},...props}) {
  return (
    <div style={{display:"flex",flexDirection:"column",gap:5,gridColumn:full?"1/-1":undefined}}>
      {label&&<label style={{fontSize:12,color:C.muted,fontWeight:500}}>{label}</label>}
      <input {...props} style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,color:C.text,padding:"9px 12px",fontSize:14,fontFamily:FONT,outline:"none",...st}}
        onFocus={e=>e.target.style.borderColor=C.accent}
        onBlur={e=>e.target.style.borderColor=C.border}/>
    </div>
  );
}

function Textarea({label,full,...props}) {
  return (
    <div style={{display:"flex",flexDirection:"column",gap:5,gridColumn:full?"1/-1":undefined}}>
      {label&&<label style={{fontSize:12,color:C.muted,fontWeight:500}}>{label}</label>}
      <textarea {...props} rows={3} style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,color:C.text,padding:"9px 12px",fontSize:14,fontFamily:FONT,outline:"none",resize:"vertical"}}
        onFocus={e=>e.target.style.borderColor=C.accent}
        onBlur={e=>e.target.style.borderColor=C.border}/>
    </div>
  );
}

function Sel({label,options,full,...props}) {
  return (
    <div style={{display:"flex",flexDirection:"column",gap:5,gridColumn:full?"1/-1":undefined}}>
      {label&&<label style={{fontSize:12,color:C.muted,fontWeight:500}}>{label}</label>}
      <select {...props} style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,color:C.text,padding:"9px 12px",fontSize:14,fontFamily:FONT,outline:"none",cursor:"pointer"}}>
        {options.map(o=><option key={o.value??o} value={o.value??o}>{o.label??o}</option>)}
      </select>
    </div>
  );
}

function Btn({children,onClick,variant="primary",style={},small=false,disabled=false}) {
  const vs={
    primary:{background:C.accent,color:"#fff",border:"none"},
    ghost:{background:"transparent",color:C.muted,border:`1px solid ${C.border}`},
    danger:{background:C.redSoft,color:C.red,border:`1px solid ${C.red}44`},
    success:{background:C.greenSoft,color:C.green,border:`1px solid ${C.green}44`},
    edit:{background:C.blueSoft,color:C.blue,border:`1px solid ${C.blue}44`},
  };
  return (
    <button onClick={onClick} disabled={disabled} style={{borderRadius:8,cursor:disabled?"not-allowed":"pointer",fontFamily:FONT,fontWeight:600,fontSize:small?12:14,padding:small?"5px 10px":"10px 18px",display:"inline-flex",alignItems:"center",gap:6,opacity:disabled?0.5:1,whiteSpace:"nowrap",...vs[variant],...style}}
      onMouseEnter={e=>!disabled&&(e.currentTarget.style.opacity="0.8")}
      onMouseLeave={e=>!disabled&&(e.currentTarget.style.opacity="1")}>
      {children}
    </button>
  );
}

function Modal({title,onClose,children,wide=false}) {
  return (
    <div style={{position:"fixed",inset:0,background:"#00000095",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:18,padding:28,width:"100%",maxWidth:wide?700:540,maxHeight:"92vh",overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
          <h3 style={{color:C.text,fontWeight:700,fontSize:18,margin:0}}>{title}</h3>
          <Btn variant="ghost" small onClick={onClose}>✕</Btn>
        </div>
        {children}
      </div>
    </div>
  );
}

function MiniBar({value,max,color}) {
  return <div style={{background:C.border,borderRadius:4,height:6,overflow:"hidden"}}><div style={{background:color,width:`${Math.min((value/(max||1))*100,100)}%`,height:"100%",borderRadius:4}}/></div>;
}

function Toast({msg,type="success"}) {
  const color=type==="error"?C.red:type==="loading"?C.amber:C.green;
  return (
    <div style={{position:"fixed",bottom:24,right:24,zIndex:500,background:C.card,border:`1px solid ${color}44`,borderRadius:10,padding:"12px 20px",display:"flex",alignItems:"center",gap:10,boxShadow:"0 8px 32px #00000060"}}>
      <span style={{color,fontSize:16}}>{type==="loading"?"⟳":type==="error"?"✕":"✓"}</span>
      <span style={{color:C.text,fontSize:14}}>{msg}</span>
    </div>
  );
}

function EditForm({title,fields,initialValues,onSave,onClose,wide=false}) {
  const [form,setForm]=useState({...initialValues});
  const [saving,setSaving]=useState(false);
  const set=k=>e=>setForm(f=>({...f,[k]:e.target.value}));
  const handleSave=async()=>{setSaving(true);await onSave(form);setSaving(false);};
  return (
    <Modal title={title} onClose={onClose} wide={wide}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
        {fields.map(f=>{
          if(f.type==="select") return <Sel key={f.key} label={f.label} full={f.full} value={form[f.key]??""} onChange={set(f.key)} options={f.options}/>;
          if(f.type==="textarea") return <Textarea key={f.key} label={f.label} full={f.full} value={form[f.key]??""} onChange={set(f.key)}/>;
          return <Inp key={f.key} label={f.label} full={f.full} type={f.type||"text"} value={form[f.key]??""} onChange={set(f.key)}/>;
        })}
      </div>
      <div style={{display:"flex",gap:8,marginTop:22,justifyContent:"flex-end"}}>
        <Btn variant="ghost" onClick={onClose}>Cancelar</Btn>
        <Btn onClick={handleSave} disabled={saving}>{saving?"Salvando...":"Salvar alterações"}</Btn>
      </div>
    </Modal>
  );
}

// ── Charts ────────────────────────────────────────────────────────────────────
function LineChart({data,color,height=100}) {
  if(!data||data.length<2) return null;
  const w=500,min=Math.min(...data),max=Math.max(...data),range=max-min||1;
  const pts=data.map((v,i)=>{
    const x=(i/(data.length-1))*(w-20)+10;
    const y=height-((v-min)/range)*(height-16)-8;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${height}`} style={{width:"100%",height}}>
      <defs><linearGradient id={`g${color.replace("#","")}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={color} stopOpacity="0.3"/>
        <stop offset="100%" stopColor={color} stopOpacity="0"/>
      </linearGradient></defs>
      <polygon points={`10,${height} ${pts} ${(data.length-1)/(data.length-1)*(w-20)+10},${height}`} fill={`url(#g${color.replace("#","")})`}/>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"/>
      {data.map((v,i)=>{
        const x=(i/(data.length-1))*(w-20)+10;
        const y=height-((v-min)/range)*(height-16)-8;
        return <circle key={i} cx={x} cy={y} r={3} fill={color}/>;
      })}
    </svg>
  );
}

function DonutChart({segments,size=130}) {
  const total=segments.reduce((s,sg)=>s+sg.value,0)||1;
  let cum=0;
  const r=45,cx=size/2,cy=size/2;
  const slices=segments.map(sg=>{
    const pct=sg.value/total;
    const start=cum*2*Math.PI-Math.PI/2; cum+=pct;
    const end=cum*2*Math.PI-Math.PI/2;
    const x1=cx+r*Math.cos(start),y1=cy+r*Math.sin(start);
    const x2=cx+r*Math.cos(end),y2=cy+r*Math.sin(end);
    return {...sg,d:`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${pct>0.5?1:0} 1 ${x2} ${y2} Z`};
  });
  return (
    <svg viewBox={`0 0 ${size} ${size}`} style={{width:size,height:size}}>
      {slices.map((sl,i)=><path key={i} d={sl.d} fill={sl.color} opacity={0.9}/>)}
      <circle cx={cx} cy={cy} r={28} fill={C.card}/>
    </svg>
  );
}

// ── Table ─────────────────────────────────────────────────────────────────────
function Table({cols,rows,emptyMsg="Nenhum registro"}) {
  return (
    <div style={{overflowX:"auto"}}>
      <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
        <thead><tr>{cols.map(c=><th key={c.key} style={{textAlign:c.align||"left",padding:"10px 14px",color:C.muted,fontWeight:500,fontSize:11,textTransform:"uppercase",letterSpacing:"0.06em",borderBottom:`1px solid ${C.border}`}}>{c.label}</th>)}</tr></thead>
        <tbody>
          {rows.length===0
            ?<tr><td colSpan={cols.length} style={{textAlign:"center",color:C.muted,padding:"32px 0"}}>{emptyMsg}</td></tr>
            :rows.map((row,i)=>(
              <tr key={i} style={{borderBottom:`1px solid ${C.border}22`}}
                onMouseEnter={e=>e.currentTarget.style.background=C.surface}
                onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                {cols.map(c=><td key={c.key} style={{padding:"11px 14px",color:C.text,textAlign:c.align||"left",verticalAlign:"middle"}}>{c.render?c.render(row[c.key],row):row[c.key]}</td>)}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}

// ── useTable hook ─────────────────────────────────────────────────────────────
function useTable(tableName) {
  const [rows,setRows]=useState([]);
  const [loading,setLoading]=useState(true);
  const [toast,setToast]=useState(null);

  const showToast=(msg,type="success")=>{
    setToast({msg,type});
    setTimeout(()=>setToast(null),3000);
  };

  useEffect(()=>{
    db.get(tableName).then(data=>{setRows(data);setLoading(false);}).catch(()=>setLoading(false));
  },[tableName]);

  const add=async(row)=>{
    showToast("Salvando...","loading");
    try {
      const saved=await db.insert(tableName,row);
      setRows(r=>[...r,saved]);
      showToast("Salvo com sucesso!");
      return saved;
    } catch(e) { showToast("Erro ao salvar","error"); }
  };

  const update=async(id,row)=>{
    showToast("Salvando...","loading");
    try {
      const saved=await db.update(tableName,id,row);
      setRows(r=>r.map(x=>x.id===id?saved:x));
      showToast("Atualizado!");
      return saved;
    } catch(e) { showToast("Erro ao atualizar","error"); }
  };

  const remove=async(id)=>{
    try {
      await db.delete(tableName,id);
      setRows(r=>r.filter(x=>x.id!==id));
      showToast("Removido!");
    } catch(e) { showToast("Erro ao remover","error"); }
  };

  return {rows,setRows,loading,add,update,remove,toast};
}

// ── DASHBOARD ─────────────────────────────────────────────────────────────────
function Dashboard({clientes,caixa,custos,investimentos,leads}) {
  const entradas=caixa.filter(c=>c.tipo==="Entrada").reduce((s,c)=>s+(+c.valor),0);
  const saidas=caixa.filter(c=>c.tipo==="Saída").reduce((s,c)=>s+(+c.valor),0);
  const saldo=entradas-saidas;
  const ativos=clientes.filter(c=>c.status==="Ativo");
  const mrr=ativos.reduce((s,c)=>s+(+c.valor_mensal),0);
  const custoTotal=custos.reduce((s,c)=>s+(+c.valor),0);
  const inv=investimentos.reduce((s,i)=>s+(+i.valor),0);
  const pipeline=(leads||[]).filter(l=>!["Fechado","Perdido"].includes(l.etapa)).reduce((s,l)=>s+(+l.valor_estimado||0),0);
  const leadsAbertos=(leads||[]).filter(l=>!["Fechado","Perdido"].includes(l.etapa)).length;
  const margem=entradas>0?(saldo/entradas)*100:0;

  const monthlyMap={};
  caixa.forEach(c=>{
    const m=c.data?.slice(0,7)||""; if(!m) return;
    if(!monthlyMap[m]) monthlyMap[m]={label:m.slice(5),entrada:0,saida:0};
    if(c.tipo==="Entrada") monthlyMap[m].entrada+=(+c.valor); else monthlyMap[m].saida+=(+c.valor);
  });
  const monthly=Object.values(monthlyMap).sort((a,b)=>a.label.localeCompare(b.label)).slice(-6);

  const catCustos=custos.reduce((acc,c)=>{acc[c.categoria]=(acc[c.categoria]||0)+(+c.valor);return acc;},{});
  const donutColors=[C.accent,C.green,C.amber,C.blue,C.purple,C.red];
  const donutSegs=Object.entries(catCustos).map(([k,v],i)=>({label:k,value:v,color:donutColors[i%6]}));
  const ETAPAS=["Prospecção","Qualificação","Proposta","Negociação","Fechado","Perdido"];
  const etapaColors=[C.blue,C.accent,C.purple,C.amber,C.green,C.red];
  const leadsPorEtapa=ETAPAS.map(e=>({label:e,value:(leads||[]).filter(l=>l.etapa===e).length}));

  return (
    <div style={{display:"flex",flexDirection:"column",gap:24}}>
      <div><h2 style={{color:C.text,fontSize:22,fontWeight:700,margin:0}}>Dashboard</h2><p style={{color:C.muted,fontSize:14,marginTop:4}}>Visão consolidada · dados em tempo real</p></div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:12}}>
        <MetricCard label="MRR" value={fmt(mrr)} sub={`${ativos.length} clientes ativos`} color={C.green} icon="↗"/>
        <MetricCard label="Saldo período" value={fmt(saldo)} sub={`Margem ${fmtPct(margem)}`} color={saldo>=0?C.green:C.red} icon="◆"/>
        <MetricCard label="Entradas" value={fmt(entradas)} color={C.accent} icon="+"/>
        <MetricCard label="Custos" value={fmt(custoTotal)} color={C.amber} icon="▲"/>
        <MetricCard label="Pipeline CRM" value={fmt(pipeline)} sub={`${leadsAbertos} leads abertos`} color={C.purple} icon="◎"/>
        <MetricCard label="Investimentos" value={fmt(inv)} color={C.blue} icon="◇"/>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:16}}>
        <Card>
          <h3 style={{color:C.text,fontSize:14,fontWeight:600,margin:"0 0 4px"}}>Receita mensal</h3>
          <p style={{color:C.muted,fontSize:12,margin:"0 0 12px"}}>Últimos 6 meses</p>
          {monthly.length===0
            ?<div style={{color:C.muted,fontSize:13,padding:"20px 0",textAlign:"center"}}>Adicione lançamentos para ver o gráfico</div>
            :<><LineChart data={monthly.map(m=>m.entrada)} color={C.green} height={110}/>
              <div style={{display:"flex",gap:4,marginTop:8}}>{monthly.map((m,i)=><div key={i} style={{flex:1,textAlign:"center"}}><div style={{fontSize:10,color:C.muted}}>{m.label}</div></div>)}</div>
            </>}
        </Card>
        <Card>
          <h3 style={{color:C.text,fontSize:14,fontWeight:600,margin:"0 0 4px"}}>Custos</h3>
          <p style={{color:C.muted,fontSize:12,margin:"0 0 12px"}}>Por categoria</p>
          {donutSegs.length===0
            ?<div style={{color:C.muted,fontSize:13,textAlign:"center",padding:"20px 0"}}>Sem custos</div>
            :<div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:12}}>
              <DonutChart segments={donutSegs} size={110}/>
              <div style={{width:"100%",display:"flex",flexDirection:"column",gap:6}}>
                {donutSegs.slice(0,4).map((s,i)=>(
                  <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div style={{display:"flex",alignItems:"center",gap:6}}><div style={{width:8,height:8,borderRadius:"50%",background:s.color,flexShrink:0}}/><span style={{fontSize:11,color:C.muted}}>{s.label}</span></div>
                    <span style={{fontSize:11,fontFamily:MONO,color:s.color}}>{fmt(s.value)}</span>
                  </div>
                ))}
              </div>
            </div>}
        </Card>
      </div>

      <Card>
        <h3 style={{color:C.text,fontSize:14,fontWeight:600,margin:"0 0 4px"}}>Entradas × Saídas</h3>
        <p style={{color:C.muted,fontSize:12,margin:"0 0 12px"}}>Comparativo mensal</p>
        {monthly.length===0
          ?<div style={{color:C.muted,fontSize:13,padding:"20px 0",textAlign:"center"}}>Sem dados suficientes</div>
          :<div style={{display:"flex",gap:4,alignItems:"flex-end",height:100}}>
            {monthly.map((m,i)=>{
              const maxV=Math.max(...monthly.flatMap(x=>[x.entrada,x.saida]),1);
              return (
                <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
                  <div style={{width:"100%",display:"flex",gap:2,alignItems:"flex-end",height:80}}>
                    <div style={{flex:1,background:C.green,opacity:.8,borderRadius:"4px 4px 0 0",height:`${(m.entrada/maxV)*80}px`,minHeight:2}}/>
                    <div style={{flex:1,background:C.red,opacity:.7,borderRadius:"4px 4px 0 0",height:`${(m.saida/maxV)*80}px`,minHeight:2}}/>
                  </div>
                  <div style={{fontSize:10,color:C.muted}}>{m.label}</div>
                </div>
              );
            })}
            <div style={{display:"flex",gap:12,marginLeft:12,alignSelf:"center"}}>
              <div style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:8,height:8,borderRadius:2,background:C.green}}/><span style={{fontSize:11,color:C.muted}}>Entrada</span></div>
              <div style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:8,height:8,borderRadius:2,background:C.red}}/><span style={{fontSize:11,color:C.muted}}>Saída</span></div>
            </div>
          </div>}
      </Card>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
        <Card>
          <h3 style={{color:C.text,fontSize:14,fontWeight:600,margin:"0 0 16px"}}>Funil comercial</h3>
          {leadsPorEtapa.filter(e=>e.value>0).length===0
            ?<div style={{color:C.muted,fontSize:13,textAlign:"center",padding:"20px 0"}}>Sem leads</div>
            :leadsPorEtapa.map((e,i)=>(
              <div key={i} style={{marginBottom:10}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:12,color:C.text}}>{e.label}</span><span style={{fontSize:12,fontFamily:MONO,color:etapaColors[i%6]}}>{e.value}</span></div>
                <MiniBar value={e.value} max={Math.max(...leadsPorEtapa.map(x=>x.value),1)} color={etapaColors[i%6]}/>
              </div>
            ))}
        </Card>
        <Card>
          <h3 style={{color:C.text,fontSize:14,fontWeight:600,margin:"0 0 16px"}}>Top clientes MRR</h3>
          {ativos.length===0
            ?<div style={{color:C.muted,fontSize:13,textAlign:"center",padding:"20px 0"}}>Sem clientes ativos</div>
            :[...ativos].sort((a,b)=>b.valor_mensal-a.valor_mensal).slice(0,5).map((c,i)=>(
              <div key={c.id} style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
                <div style={{width:24,height:24,borderRadius:"50%",background:C.accentSoft,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:C.accent,fontWeight:700,flexShrink:0}}>{i+1}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:12,color:C.text,marginBottom:3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.nome}</div>
                  <MiniBar value={+c.valor_mensal} max={Math.max(...ativos.map(x=>+x.valor_mensal),1)} color={C.accent}/>
                </div>
                <span style={{fontFamily:MONO,fontSize:12,color:C.accent,flexShrink:0}}>{fmt(c.valor_mensal)}</span>
              </div>
            ))}
        </Card>
      </div>
    </div>
  );
}

// ── CLIENTES ──────────────────────────────────────────────────────────────────
const clienteFields=[
  {key:"nome",label:"Nome da empresa *",full:true},
  {key:"contato",label:"Nome do contato"},{key:"email",label:"Email",type:"email"},
  {key:"telefone",label:"Telefone"},{key:"segmento",label:"Segmento"},
  {key:"valor_mensal",label:"MRR (R$)",type:"number"},
  {key:"inicio",label:"Data de início",type:"date"},
  {key:"status",label:"Status",type:"select",options:["Ativo","Inativo","Prospect"]},
  {key:"observacoes",label:"Observações",type:"textarea",full:true},
];

function Clientes() {
  const {rows,loading,add,update,remove,toast}=useTable("clientes");
  const [modal,setModal]=useState(false);
  const [editItem,setEditItem]=useState(null);
  const [search,setSearch]=useState("");
  const [form,setForm]=useState({nome:"",contato:"",email:"",telefone:"",status:"Ativo",valor_mensal:"",segmento:"",inicio:today(),observacoes:""});
  const s=k=>e=>setForm(f=>({...f,[k]:e.target.value}));

  const save=async()=>{
    if(!form.nome) return;
    await add({...form,valor_mensal:+form.valor_mensal});
    setModal(false);
    setForm({nome:"",contato:"",email:"",telefone:"",status:"Ativo",valor_mensal:"",segmento:"",inicio:today(),observacoes:""});
  };
  const saveEdit=async updated=>{ await update(editItem.id,{...updated,valor_mensal:+updated.valor_mensal}); setEditItem(null); };

  const filtered=rows.filter(c=>c.nome?.toLowerCase().includes(search.toLowerCase())||(c.segmento||"").toLowerCase().includes(search.toLowerCase()));
  const mrr=rows.filter(c=>c.status==="Ativo").reduce((s,c)=>s+(+c.valor_mensal),0);

  return (
    <div style={{display:"flex",flexDirection:"column",gap:20}}>
      {toast&&<Toast {...toast}/>}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div><h2 style={{color:C.text,fontSize:22,fontWeight:700,margin:0}}>Clientes</h2><p style={{color:C.muted,fontSize:14,marginTop:4}}>{rows.filter(c=>c.status==="Ativo").length} ativos · MRR {fmt(mrr)}</p></div>
        <Btn small onClick={()=>setModal(true)}>+ Novo cliente</Btn>
      </div>
      <Inp placeholder="Buscar..." value={search} onChange={e=>setSearch(e.target.value)}/>
      {loading?<div style={{color:C.muted,textAlign:"center",padding:40}}>Carregando...</div>:
      <Card style={{padding:0}}>
        <Table cols={[
          {key:"nome",label:"Cliente",render:(v,r)=><div><div style={{fontWeight:600}}>{v}</div><div style={{fontSize:11,color:C.muted}}>{r.contato}</div></div>},
          {key:"segmento",label:"Segmento"},
          {key:"email",label:"Email",render:v=><span style={{color:C.blue,fontSize:12}}>{v}</span>},
          {key:"valor_mensal",label:"MRR",align:"right",render:v=><span style={{fontFamily:MONO,color:C.green}}>{fmt(v)}</span>},
          {key:"status",label:"Status",render:v=><Badge color={v==="Ativo"?C.green:v==="Prospect"?C.amber:C.muted}>{v}</Badge>},
          {key:"inicio",label:"Desde"},
          {key:"id",label:"",align:"right",render:(v,r)=>(
            <div style={{display:"flex",gap:6}}>
              <Btn variant="edit" small onClick={()=>setEditItem(r)}>✎ Editar</Btn>
              <Btn variant="danger" small onClick={()=>remove(v)}>✕</Btn>
            </div>
          )},
        ]} rows={filtered} emptyMsg="Nenhum cliente"/>
      </Card>}
      {modal&&(<Modal title="Novo Cliente" onClose={()=>setModal(false)}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
          {clienteFields.map(f=>{
            if(f.type==="select") return <Sel key={f.key} label={f.label} full={f.full} value={form[f.key]} onChange={s(f.key)} options={f.options}/>;
            if(f.type==="textarea") return <Textarea key={f.key} label={f.label} full={f.full} value={form[f.key]} onChange={s(f.key)}/>;
            return <Inp key={f.key} label={f.label} full={f.full} type={f.type||"text"} value={form[f.key]} onChange={s(f.key)}/>;
          })}
        </div>
        <div style={{display:"flex",gap:8,marginTop:22,justifyContent:"flex-end"}}><Btn variant="ghost" onClick={()=>setModal(false)}>Cancelar</Btn><Btn onClick={save}>Salvar</Btn></div>
      </Modal>)}
      {editItem&&<EditForm title={`Editar: ${editItem.nome}`} fields={clienteFields} initialValues={editItem} onSave={saveEdit} onClose={()=>setEditItem(null)}/>}
    </div>
  );
}

// ── CAIXA ─────────────────────────────────────────────────────────────────────
const caixaFields=[
  {key:"data",label:"Data",type:"date"},{key:"tipo",label:"Tipo",type:"select",options:["Entrada","Saída"]},
  {key:"descricao",label:"Descrição *",full:true},
  {key:"categoria",label:"Categoria",type:"select",options:["Receita de Serviço","Projeto Avulso","Aluguel","Pessoal","TI / Software","Marketing","Outros"]},
  {key:"valor",label:"Valor (R$) *",type:"number"},
];

function Caixa() {
  const {rows,loading,add,update,remove,toast}=useTable("caixa");
  const [modal,setModal]=useState(false);
  const [editItem,setEditItem]=useState(null);
  const [form,setForm]=useState({data:today(),descricao:"",tipo:"Entrada",categoria:"Receita de Serviço",valor:""});
  const s=k=>e=>setForm(f=>({...f,[k]:e.target.value}));

  const save=async()=>{
    if(!form.descricao||!form.valor) return;
    await add({...form,valor:+form.valor});
    setModal(false);
    setForm({data:today(),descricao:"",tipo:"Entrada",categoria:"Receita de Serviço",valor:""});
  };
  const saveEdit=async updated=>{ await update(editItem.id,{...updated,valor:+updated.valor}); setEditItem(null); };
  const entradas=rows.filter(c=>c.tipo==="Entrada").reduce((s,c)=>s+(+c.valor),0);
  const saidas=rows.filter(c=>c.tipo==="Saída").reduce((s,c)=>s+(+c.valor),0);

  return (
    <div style={{display:"flex",flexDirection:"column",gap:20}}>
      {toast&&<Toast {...toast}/>}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div><h2 style={{color:C.text,fontSize:22,fontWeight:700,margin:0}}>Fluxo de Caixa</h2><p style={{color:C.muted,fontSize:14,marginTop:4}}>Saldo: {fmt(entradas-saidas)}</p></div>
        <Btn small onClick={()=>setModal(true)}>+ Lançamento</Btn>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
        <MetricCard label="Entradas" value={fmt(entradas)} color={C.green} icon="↗"/>
        <MetricCard label="Saídas" value={fmt(saidas)} color={C.red} icon="↘"/>
        <MetricCard label="Saldo" value={fmt(entradas-saidas)} color={entradas>=saidas?C.green:C.red} icon="◆"/>
      </div>
      {loading?<div style={{color:C.muted,textAlign:"center",padding:40}}>Carregando...</div>:
      <Card style={{padding:0}}>
        <Table cols={[
          {key:"data",label:"Data"},{key:"descricao",label:"Descrição",render:(v,r)=><div><div>{v}</div><div style={{fontSize:11,color:C.muted}}>{r.categoria}</div></div>},
          {key:"tipo",label:"Tipo",render:v=><Badge color={v==="Entrada"?C.green:C.red}>{v}</Badge>},
          {key:"valor",label:"Valor",align:"right",render:(v,r)=><span style={{fontFamily:MONO,fontWeight:600,color:r.tipo==="Entrada"?C.green:C.red}}>{r.tipo==="Entrada"?"+":"-"}{fmt(v)}</span>},
          {key:"id",label:"",align:"right",render:(v,r)=>(
            <div style={{display:"flex",gap:6}}><Btn variant="edit" small onClick={()=>setEditItem(r)}>✎</Btn><Btn variant="danger" small onClick={()=>remove(v)}>✕</Btn></div>
          )},
        ]} rows={[...rows].sort((a,b)=>(b.data||"").localeCompare(a.data||""))}/>
      </Card>}
      {modal&&(<Modal title="Novo Lançamento" onClose={()=>setModal(false)}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
          {caixaFields.map(f=>{
            if(f.type==="select") return <Sel key={f.key} label={f.label} full={f.full} value={form[f.key]} onChange={s(f.key)} options={f.options}/>;
            return <Inp key={f.key} label={f.label} full={f.full} type={f.type||"text"} value={form[f.key]} onChange={s(f.key)}/>;
          })}
        </div>
        <div style={{display:"flex",gap:8,marginTop:22,justifyContent:"flex-end"}}><Btn variant="ghost" onClick={()=>setModal(false)}>Cancelar</Btn><Btn onClick={save}>Salvar</Btn></div>
      </Modal>)}
      {editItem&&<EditForm title="Editar lançamento" fields={caixaFields} initialValues={editItem} onSave={saveEdit} onClose={()=>setEditItem(null)}/>}
    </div>
  );
}

// ── CUSTOS ────────────────────────────────────────────────────────────────────
const custoFields=[
  {key:"nome",label:"Descrição *",full:true},
  {key:"categoria",label:"Categoria",type:"select",options:["Pessoal","Aluguel","TI / Software","Marketing","Administrativo","Logística","Outros"]},
  {key:"valor",label:"Valor (R$) *",type:"number"},
  {key:"mes",label:"Mês",type:"month"},
  {key:"recorrente",label:"Tipo",type:"select",options:[{value:"false",label:"Variável"},{value:"true",label:"Fixo (recorrente)"}]},
];

function Custos() {
  const {rows,loading,add,update,remove,toast}=useTable("custos");
  const [modal,setModal]=useState(false);
  const [editItem,setEditItem]=useState(null);
  const [form,setForm]=useState({nome:"",categoria:"Pessoal",valor:"",recorrente:false,mes:today().slice(0,7)});
  const s=k=>e=>setForm(f=>({...f,[k]:e.target.value}));
  const save=async()=>{if(!form.nome||!form.valor) return; await add({...form,valor:+form.valor}); setModal(false);};
  const saveEdit=async updated=>{ await update(editItem.id,{...updated,valor:+updated.valor,recorrente:updated.recorrente==="true"||updated.recorrente===true}); setEditItem(null); };
  const total=rows.reduce((s,c)=>s+(+c.valor),0);
  const fixos=rows.filter(c=>c.recorrente===true||c.recorrente==="true").reduce((s,c)=>s+(+c.valor),0);

  return (
    <div style={{display:"flex",flexDirection:"column",gap:20}}>
      {toast&&<Toast {...toast}/>}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div><h2 style={{color:C.text,fontSize:22,fontWeight:700,margin:0}}>Custos e Despesas</h2><p style={{color:C.muted,fontSize:14,marginTop:4}}>Total: {fmt(total)} · Fixos: {fmt(fixos)}</p></div>
        <Btn small onClick={()=>setModal(true)}>+ Novo custo</Btn>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
        <MetricCard label="Total" value={fmt(total)} color={C.red}/>
        <MetricCard label="Fixos" value={fmt(fixos)} color={C.amber} sub="Recorrentes"/>
        <MetricCard label="Variáveis" value={fmt(total-fixos)} color={C.muted}/>
      </div>
      {loading?<div style={{color:C.muted,textAlign:"center",padding:40}}>Carregando...</div>:
      <Card style={{padding:0}}>
        <Table cols={[
          {key:"nome",label:"Descrição"},
          {key:"categoria",label:"Categoria",render:v=><Badge color={C.amber}>{v}</Badge>},
          {key:"mes",label:"Mês"},
          {key:"recorrente",label:"Tipo",render:v=><Badge color={(v===true||v==="true")?C.red:C.muted}>{(v===true||v==="true")?"Fixo":"Variável"}</Badge>},
          {key:"valor",label:"Valor",align:"right",render:v=><span style={{fontFamily:MONO,color:C.amber,fontWeight:600}}>{fmt(v)}</span>},
          {key:"id",label:"",align:"right",render:(v,r)=>(
            <div style={{display:"flex",gap:6}}><Btn variant="edit" small onClick={()=>setEditItem(r)}>✎</Btn><Btn variant="danger" small onClick={()=>remove(v)}>✕</Btn></div>
          )},
        ]} rows={rows}/>
      </Card>}
      {modal&&(<Modal title="Novo Custo" onClose={()=>setModal(false)}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
          {custoFields.map(f=>{
            if(f.type==="select") return <Sel key={f.key} label={f.label} full={f.full} value={form[f.key]} onChange={f.key==="recorrente"?e=>setForm(ff=>({...ff,recorrente:e.target.value==="true"})):s(f.key)} options={f.options}/>;
            return <Inp key={f.key} label={f.label} full={f.full} type={f.type||"text"} value={form[f.key]} onChange={s(f.key)}/>;
          })}
        </div>
        <div style={{display:"flex",gap:8,marginTop:22,justifyContent:"flex-end"}}><Btn variant="ghost" onClick={()=>setModal(false)}>Cancelar</Btn><Btn onClick={save}>Salvar</Btn></div>
      </Modal>)}
      {editItem&&<EditForm title="Editar custo" fields={custoFields} initialValues={editItem} onSave={saveEdit} onClose={()=>setEditItem(null)}/>}
    </div>
  );
}

// ── INVESTIMENTOS ─────────────────────────────────────────────────────────────
const invFields=[
  {key:"descricao",label:"Descrição *",full:true},
  {key:"categoria",label:"Categoria",type:"select",options:["Equipamento","Capacitação","Infraestrutura","Marketing","Tecnologia","Outros"]},
  {key:"valor",label:"Valor (R$) *",type:"number"},
  {key:"data",label:"Data",type:"date",full:true},
  {key:"retorno_esperado",label:"Retorno esperado",full:true},
];

function Investimentos() {
  const {rows,loading,add,update,remove,toast}=useTable("investimentos");
  const [modal,setModal]=useState(false);
  const [editItem,setEditItem]=useState(null);
  const [form,setForm]=useState({descricao:"",categoria:"Equipamento",valor:"",data:today(),retorno_esperado:""});
  const s=k=>e=>setForm(f=>({...f,[k]:e.target.value}));
  const save=async()=>{if(!form.descricao||!form.valor) return; await add({...form,valor:+form.valor}); setModal(false);};
  const saveEdit=async updated=>{ await update(editItem.id,{...updated,valor:+updated.valor}); setEditItem(null); };
  const total=rows.reduce((s,i)=>s+(+i.valor),0);
  const porCat=rows.reduce((acc,i)=>{acc[i.categoria]=(acc[i.categoria]||0)+(+i.valor);return acc;},{});

  return (
    <div style={{display:"flex",flexDirection:"column",gap:20}}>
      {toast&&<Toast {...toast}/>}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div><h2 style={{color:C.text,fontSize:22,fontWeight:700,margin:0}}>Investimentos</h2><p style={{color:C.muted,fontSize:14,marginTop:4}}>Total aportado: {fmt(total)}</p></div>
        <Btn small onClick={()=>setModal(true)}>+ Novo</Btn>
      </div>
      {Object.keys(porCat).length>0&&<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:12}}>{Object.entries(porCat).map(([cat,val],i)=><MetricCard key={cat} label={cat} value={fmt(val)} color={[C.blue,C.accent,C.green,C.amber][i%4]}/>)}</div>}
      {loading?<div style={{color:C.muted,textAlign:"center",padding:40}}>Carregando...</div>:
      <Card style={{padding:0}}>
        <Table cols={[
          {key:"descricao",label:"Descrição"},
          {key:"categoria",label:"Categoria",render:v=><Badge color={C.blue}>{v}</Badge>},
          {key:"data",label:"Data"},
          {key:"retorno_esperado",label:"Retorno esperado",render:v=><span style={{color:C.muted,fontSize:12}}>{v}</span>},
          {key:"valor",label:"Valor",align:"right",render:v=><span style={{fontFamily:MONO,color:C.blue,fontWeight:600}}>{fmt(v)}</span>},
          {key:"id",label:"",align:"right",render:(v,r)=>(
            <div style={{display:"flex",gap:6}}><Btn variant="edit" small onClick={()=>setEditItem(r)}>✎</Btn><Btn variant="danger" small onClick={()=>remove(v)}>✕</Btn></div>
          )},
        ]} rows={rows}/>
      </Card>}
      {modal&&(<Modal title="Novo Investimento" onClose={()=>setModal(false)}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
          {invFields.map(f=>{
            if(f.type==="select") return <Sel key={f.key} label={f.label} full={f.full} value={form[f.key]} onChange={s(f.key)} options={f.options}/>;
            return <Inp key={f.key} label={f.label} full={f.full} type={f.type||"text"} value={form[f.key]} onChange={s(f.key)}/>;
          })}
        </div>
        <div style={{display:"flex",gap:8,marginTop:22,justifyContent:"flex-end"}}><Btn variant="ghost" onClick={()=>setModal(false)}>Cancelar</Btn><Btn onClick={save}>Salvar</Btn></div>
      </Modal>)}
      {editItem&&<EditForm title="Editar investimento" fields={invFields} initialValues={editItem} onSave={saveEdit} onClose={()=>setEditItem(null)}/>}
    </div>
  );
}

// ── DRE ───────────────────────────────────────────────────────────────────────
function DRE({caixa,custos,investimentos}) {
  const receitas=caixa.filter(c=>c.tipo==="Entrada").reduce((s,c)=>s+(+c.valor),0);
  const custosDiretos=custos.filter(c=>["Pessoal","TI / Software"].includes(c.categoria)).reduce((s,c)=>s+(+c.valor),0);
  const lucroBruto=receitas-custosDiretos;
  const despOp=custos.filter(c=>!["Pessoal","TI / Software"].includes(c.categoria)).reduce((s,c)=>s+(+c.valor),0);
  const ebitda=lucroBruto-despOp;
  const inv=investimentos.reduce((s,i)=>s+(+i.valor),0);
  const lucroLiq=ebitda-inv;
  const margBruta=receitas>0?(lucroBruto/receitas)*100:0;
  const margLiq=receitas>0?(lucroLiq/receitas)*100:0;
  const linhas=[
    {label:"Receita bruta",valor:receitas,destaque:true,color:C.green},
    {label:"(-) Custos diretos (pessoal + TI)",valor:-custosDiretos,color:C.red},
    {label:"= Lucro bruto",valor:lucroBruto,destaque:true,color:lucroBruto>=0?C.green:C.red,sub:`Margem bruta: ${fmtPct(margBruta)}`},
    {label:"(-) Despesas operacionais",valor:-despOp,color:C.amber},
    {label:"= EBITDA",valor:ebitda,destaque:true,color:ebitda>=0?C.green:C.red},
    {label:"(-) Investimentos",valor:-inv,color:C.blue},
    {label:"= Resultado líquido",valor:lucroLiq,destaque:true,color:lucroLiq>=0?C.green:C.red,sub:`Margem líquida: ${fmtPct(margLiq)}`},
  ];
  return (
    <div style={{display:"flex",flexDirection:"column",gap:20}}>
      <div><h2 style={{color:C.text,fontSize:22,fontWeight:700,margin:0}}>DRE Simplificado</h2><p style={{color:C.muted,fontSize:14,marginTop:4}}>Demonstração do Resultado</p></div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
        <MetricCard label="Receita bruta" value={fmt(receitas)} color={C.green}/>
        <MetricCard label="EBITDA" value={fmt(ebitda)} color={ebitda>=0?C.green:C.red} sub={`Margem ${fmtPct(receitas>0?(ebitda/receitas)*100:0)}`}/>
        <MetricCard label="Resultado líquido" value={fmt(lucroLiq)} color={lucroLiq>=0?C.green:C.red} sub={`Margem ${fmtPct(margLiq)}`}/>
      </div>
      <Card>
        {linhas.map((l,i)=>(
          <div key={i}>
            {l.destaque&&i>0&&<div style={{height:1,background:C.border,margin:"8px 0"}}/>}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:l.destaque?"10px 14px":"6px 14px",background:l.destaque?C.surface:"transparent",borderRadius:l.destaque?8:0,margin:l.destaque?"4px 0":0}}>
              <div>
                <span style={{fontSize:l.destaque?14:13,color:l.destaque?C.text:C.muted,fontWeight:l.destaque?600:400}}>{l.label}</span>
                {l.sub&&<div style={{fontSize:11,color:C.muted,marginTop:2}}>{l.sub}</div>}
              </div>
              <span style={{fontFamily:MONO,fontWeight:l.destaque?700:400,fontSize:l.destaque?15:13,color:l.color}}>{fmt(Math.abs(l.valor))}</span>
            </div>
            {l.destaque&&<div style={{height:1,background:C.border,margin:"8px 0"}}/>}
          </div>
        ))}
      </Card>
    </div>
  );
}

// ── CRM ───────────────────────────────────────────────────────────────────────
const ETAPAS=["Prospecção","Qualificação","Proposta","Negociação","Fechado","Perdido"];
const ETAPA_COLORS={Prospecção:C.blue,Qualificação:C.accent,Proposta:C.purple,Negociação:C.amber,Fechado:C.green,Perdido:C.red};

const leadFields=[
  {key:"empresa",label:"Empresa *",full:true},
  {key:"contato",label:"Nome do contato"},{key:"email",label:"Email",type:"email"},
  {key:"telefone",label:"Telefone"},
  {key:"etapa",label:"Etapa",type:"select",options:ETAPAS},
  {key:"valor_estimado",label:"Valor estimado (R$)",type:"number"},
  {key:"origem",label:"Origem",type:"select",options:["Indicação","LinkedIn","Site","Cold Outreach","Evento","Instagram","Outro"]},
  {key:"data_contato",label:"Data do contato",type:"date"},
  {key:"proximo_passo",label:"Próximo passo",full:true},
  {key:"observacoes",label:"Observações",type:"textarea",full:true},
];

function CRM() {
  const {rows,loading,add,update,remove,toast}=useTable("leads");
  const [modal,setModal]=useState(false);
  const [editItem,setEditItem]=useState(null);
  const [view,setView]=useState("kanban");
  const [search,setSearch]=useState("");
  const [filterEtapa,setFilterEtapa]=useState("Todas");
  const [form,setForm]=useState({empresa:"",contato:"",email:"",telefone:"",etapa:"Prospecção",valor_estimado:"",origem:"Indicação",data_contato:today(),proximo_passo:"",observacoes:""});
  const s=k=>e=>setForm(f=>({...f,[k]:e.target.value}));

  const save=async()=>{
    if(!form.empresa) return;
    await add({...form,valor_estimado:+form.valor_estimado});
    setModal(false);
    setForm({empresa:"",contato:"",email:"",telefone:"",etapa:"Prospecção",valor_estimado:"",origem:"Indicação",data_contato:today(),proximo_passo:"",observacoes:""});
  };
  const saveEdit=async updated=>{ await update(editItem.id,{...updated,valor_estimado:+updated.valor_estimado}); setEditItem(null); };
  const moveEtapa=async(id,etapa)=>{ await update(id,{...rows.find(r=>r.id===id),etapa}); };

  const pipeline=rows.filter(l=>!["Fechado","Perdido"].includes(l.etapa)).reduce((s,l)=>s+(+l.valor_estimado||0),0);
  const fechados=rows.filter(l=>l.etapa==="Fechado").reduce((s,l)=>s+(+l.valor_estimado||0),0);
  const taxaConv=rows.length>0?(rows.filter(l=>l.etapa==="Fechado").length/rows.length)*100:0;

  const filtered=rows.filter(l=>{
    const ms=l.empresa?.toLowerCase().includes(search.toLowerCase())||(l.contato||"").toLowerCase().includes(search.toLowerCase());
    const me=filterEtapa==="Todas"||l.etapa===filterEtapa;
    return ms&&me;
  });

  return (
    <div style={{display:"flex",flexDirection:"column",gap:20}}>
      {toast&&<Toast {...toast}/>}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div><h2 style={{color:C.text,fontSize:22,fontWeight:700,margin:0}}>CRM Comercial</h2><p style={{color:C.muted,fontSize:14,marginTop:4}}>{rows.length} leads · Pipeline {fmt(pipeline)}</p></div>
        <div style={{display:"flex",gap:8}}>
          <Btn variant={view==="kanban"?"primary":"ghost"} small onClick={()=>setView("kanban")}>⊞ Kanban</Btn>
          <Btn variant={view==="list"?"primary":"ghost"} small onClick={()=>setView("list")}>≡ Lista</Btn>
          <Btn small onClick={()=>setModal(true)}>+ Novo lead</Btn>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:12}}>
        <MetricCard label="Pipeline" value={fmt(pipeline)} color={C.accent} icon="◎"/>
        <MetricCard label="Fechados" value={fmt(fechados)} color={C.green} icon="✓"/>
        <MetricCard label="Leads ativos" value={rows.filter(l=>!["Fechado","Perdido"].includes(l.etapa)).length} color={C.blue}/>
        <MetricCard label="Conversão" value={fmtPct(taxaConv)} color={C.purple}/>
      </div>
      <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
        <Inp placeholder="Buscar empresa ou contato..." value={search} onChange={e=>setSearch(e.target.value)} style={{flex:1,minWidth:200}}/>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          {["Todas",...ETAPAS].map(e=>(
            <button key={e} onClick={()=>setFilterEtapa(e)} style={{background:filterEtapa===e?(ETAPA_COLORS[e]||C.accent)+"33":"transparent",border:`1px solid ${filterEtapa===e?(ETAPA_COLORS[e]||C.accent):C.border}`,color:filterEtapa===e?(ETAPA_COLORS[e]||C.accent):C.muted,borderRadius:8,padding:"5px 12px",fontSize:12,fontFamily:FONT,cursor:"pointer",fontWeight:600}}>
              {e}
            </button>
          ))}
        </div>
      </div>
      {loading?<div style={{color:C.muted,textAlign:"center",padding:40}}>Carregando...</div>:
      view==="kanban"?(
        <div style={{display:"flex",gap:12,overflowX:"auto",paddingBottom:8}}>
          {ETAPAS.map(etapa=>{
            const etLeads=filtered.filter(l=>l.etapa===etapa);
            const cor=ETAPA_COLORS[etapa];
            return (
              <div key={etapa} style={{minWidth:220,flex:"0 0 220px",background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:14}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}><div style={{width:8,height:8,borderRadius:"50%",background:cor}}/><span style={{fontSize:13,fontWeight:600,color:C.text}}>{etapa}</span></div>
                  <Badge color={cor}>{etLeads.length}</Badge>
                </div>
                {etLeads.length===0&&<div style={{color:C.dim,fontSize:12,textAlign:"center",padding:"16px 0"}}>Nenhum lead</div>}
                {etLeads.map(lead=>(
                  <div key={lead.id} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:12,marginBottom:8}}>
                    <div style={{fontWeight:600,fontSize:13,color:C.text,marginBottom:4}}>{lead.empresa}</div>
                    {lead.contato&&<div style={{fontSize:11,color:C.muted,marginBottom:4}}>{lead.contato}</div>}
                    {lead.valor_estimado>0&&<div style={{fontSize:12,fontFamily:MONO,color:cor,marginBottom:6}}>{fmt(lead.valor_estimado)}</div>}
                    {lead.origem&&<Badge color={C.blue}>{lead.origem}</Badge>}
                    {lead.proximo_passo&&<div style={{fontSize:11,color:C.muted,marginTop:6,borderTop:`1px solid ${C.border}`,paddingTop:6}}>→ {lead.proximo_passo}</div>}
                    <div style={{display:"flex",gap:4,marginTop:8,flexWrap:"wrap"}}>
                      <Btn variant="edit" small onClick={()=>setEditItem(lead)}>✎</Btn>
                      <select onChange={e=>moveEtapa(lead.id,e.target.value)} value={lead.etapa}
                        style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:6,color:C.muted,fontSize:11,padding:"3px 6px",fontFamily:FONT,cursor:"pointer",flex:1}}>
                        {ETAPAS.map(e=><option key={e} value={e}>{e}</option>)}
                      </select>
                      <Btn variant="danger" small onClick={()=>remove(lead.id)}>✕</Btn>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      ):(
        <Card style={{padding:0}}>
          <Table cols={[
            {key:"empresa",label:"Empresa",render:(v,r)=><div><div style={{fontWeight:600}}>{v}</div><div style={{fontSize:11,color:C.muted}}>{r.contato}</div></div>},
            {key:"etapa",label:"Etapa",render:v=><Badge color={ETAPA_COLORS[v]||C.muted}>{v}</Badge>},
            {key:"origem",label:"Origem"},
            {key:"valor_estimado",label:"Valor est.",align:"right",render:v=><span style={{fontFamily:MONO,color:C.purple}}>{fmt(v)}</span>},
            {key:"data_contato",label:"Contato"},
            {key:"proximo_passo",label:"Próximo passo",render:v=><span style={{fontSize:12,color:C.muted}}>{v}</span>},
            {key:"id",label:"",align:"right",render:(v,r)=>(
              <div style={{display:"flex",gap:6}}><Btn variant="edit" small onClick={()=>setEditItem(r)}>✎</Btn><Btn variant="danger" small onClick={()=>remove(v)}>✕</Btn></div>
            )},
          ]} rows={filtered} emptyMsg="Nenhum lead"/>
        </Card>
      )}
      {modal&&(<Modal title="Novo Lead" onClose={()=>setModal(false)} wide>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
          {leadFields.map(f=>{
            if(f.type==="select") return <Sel key={f.key} label={f.label} full={f.full} value={form[f.key]} onChange={s(f.key)} options={f.options}/>;
            if(f.type==="textarea") return <Textarea key={f.key} label={f.label} full={f.full} value={form[f.key]} onChange={s(f.key)}/>;
            return <Inp key={f.key} label={f.label} full={f.full} type={f.type||"text"} value={form[f.key]} onChange={s(f.key)}/>;
          })}
        </div>
        <div style={{display:"flex",gap:8,marginTop:22,justifyContent:"flex-end"}}><Btn variant="ghost" onClick={()=>setModal(false)}>Cancelar</Btn><Btn onClick={save}>Salvar lead</Btn></div>
      </Modal>)}
      {editItem&&<EditForm title={`Editar: ${editItem.empresa}`} fields={leadFields} initialValues={editItem} onSave={saveEdit} onClose={()=>setEditItem(null)} wide/>}
    </div>
  );
}

// ── ROOT ──────────────────────────────────────────────────────────────────────
const NAV=[
  {id:"dashboard",label:"Dashboard",icon:"◈"},
  {id:"crm",label:"CRM Comercial",icon:"◎"},
  {id:"clientes",label:"Clientes",icon:"◉"},
  {id:"caixa",label:"Caixa",icon:"◆"},
  {id:"custos",label:"Custos",icon:"▲"},
  {id:"investimentos",label:"Investimentos",icon:"◇"},
  {id:"dre",label:"DRE",icon:"▣"},
];

export default function App() {
  const [page,setPage]=useState("dashboard");
  const [sideOpen,setSideOpen]=useState(true);

  // load all tables for dashboard & DRE
  const clientesT=useTable("clientes");
  const caixaT=useTable("caixa");
  const custosT=useTable("custos");
  const investT=useTable("investimentos");
  const leadsT=useTable("leads");

  const pages={
    dashboard:<Dashboard clientes={clientesT.rows} caixa={caixaT.rows} custos={custosT.rows} investimentos={investT.rows} leads={leadsT.rows}/>,
    crm:<CRM/>,
    clientes:<Clientes/>,
    caixa:<Caixa/>,
    custos:<Custos/>,
    investimentos:<Investimentos/>,
    dre:<DRE caixa={caixaT.rows} custos={custosT.rows} investimentos={investT.rows}/>,
  };

  return (
    <div style={{display:"flex",minHeight:"100vh",background:C.bg,fontFamily:FONT,color:C.text}}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet"/>
      <aside style={{width:sideOpen?220:60,background:C.surface,borderRight:`1px solid ${C.border}`,display:"flex",flexDirection:"column",transition:"width 0.2s",flexShrink:0,overflow:"hidden"}}>
        <div style={{padding:"18px 14px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"space-between",minHeight:64}}>
          {sideOpen&&<div><div style={{fontSize:15,fontWeight:700,color:C.text,whiteSpace:"nowrap"}}>AgênciaOS</div><div style={{fontSize:11,color:C.muted}}>Salvo no Supabase ✓</div></div>}
          <button onClick={()=>setSideOpen(o=>!o)} style={{background:"transparent",border:"none",color:C.muted,cursor:"pointer",fontSize:16,padding:4,lineHeight:1,flexShrink:0}}>{sideOpen?"←":"→"}</button>
        </div>
        <nav style={{flex:1,padding:"10px 0"}}>
          {NAV.map(item=>(
            <button key={item.id} onClick={()=>setPage(item.id)} style={{width:"100%",background:page===item.id?C.accentSoft:"transparent",border:"none",borderLeft:page===item.id?`2px solid ${C.accent}`:"2px solid transparent",color:page===item.id?C.accent:C.muted,padding:sideOpen?"11px 18px":"11px 0",display:"flex",alignItems:"center",justifyContent:sideOpen?"flex-start":"center",gap:10,cursor:"pointer",fontFamily:FONT,fontSize:13,fontWeight:page===item.id?600:400,textAlign:"left",transition:"all 0.15s"}}>
              <span style={{fontSize:15,flexShrink:0}}>{item.icon}</span>
              {sideOpen&&<span style={{whiteSpace:"nowrap"}}>{item.label}</span>}
            </button>
          ))}
        </nav>
        {sideOpen&&<div style={{padding:"14px 18px",borderTop:`1px solid ${C.border}`}}>
          <div style={{display:"flex",alignItems:"center",gap:6,fontSize:12,color:C.green}}><span>●</span><span>Conectado ao Supabase</span></div>
          <div style={{fontSize:10,color:C.dim,marginTop:4}}>Dados salvos permanentemente</div>
        </div>}
      </aside>
      <main style={{flex:1,overflowY:"auto",padding:"32px 36px",minWidth:0}}>
        {pages[page]}
      </main>
    </div>
  );
}
