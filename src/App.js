import { useState, useEffect, useCallback } from "react";

const SB = "https://szaasnrwguvhpehukaws.supabase.co";
const KEY = "sb_publishable_ZRy3r0IbxlShDwL2gSpmWw_mg9OIWNA";
const F = "'Inter', sans-serif";
const M = "'JetBrains Mono', monospace";

const T = {
  bg:"#070710", surface:"#0d0d1a", card:"#111120", cardHov:"#16162a",
  border:"#1c1c30", borderHov:"#28284a",
  accent:"#6366f1", accentL:"#818cf8", accentBg:"#6366f115",
  green:"#22c55e", greenBg:"#22c55e12",
  red:"#ef4444", redBg:"#ef444412",
  amber:"#f59e0b", amberBg:"#f59e0b12",
  blue:"#3b82f6", blueBg:"#3b82f612",
  purple:"#a855f7", purpleBg:"#a855f712",
  text:"#f0f0fa", sub:"#8888aa", muted:"#55556a", dim:"#22223a",
};

const fmt = n => new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(n||0);
const fmtK = n => (+n||0)>=1000?`R$${((+n||0)/1000).toFixed(1)}k`:fmt(n);
const fmtPct = n => `${(n||0).toFixed(1)}%`;
const today = () => new Date().toISOString().split("T")[0];
const uid = () => Math.random().toString(36).slice(2);

const SAUDE = {
  verde:   {color:T.green, bg:T.greenBg,  label:"Saudável", emoji:"🟢"},
  amarelo: {color:T.amber, bg:T.amberBg,  label:"Atenção",  emoji:"🟡"},
  vermelho:{color:T.red,   bg:T.redBg,    label:"Crítico",  emoji:"🔴"},
};

const ETAPAS = ["Prospecção","Qualificação","Proposta","Negociação","Fechado","Perdido"];
const EMPTY_LEAD = {empresa:"",contato:"",email:"",telefone:"",etapa:"Prospecção",valor_estimado:"",tipo_contrato:"Fee Mensal",duracao_meses:1,origem:"Indicação",data_contato:today(),proximo_passo:"",observacoes:""};
const ETAPA_C = {Prospecção:T.blue,Qualificação:T.accent,Proposta:T.purple,Negociação:T.amber,Fechado:T.green,Perdido:T.red};


// ─── AUTH ─────────────────────────────────────────────────────────────────────
async function getSession() {
  try {
    const r = await fetch(`${SB}/auth/v1/user`, {
      headers: { apikey: KEY, Authorization: `Bearer ${getToken()}` }
    });
    if (!r.ok) return null;
    return r.json();
  } catch { return null; }
}

function getToken() {
  try {
    const raw = localStorage.getItem(`sb-${SB.split("//")[1].split(".")[0]}-auth-token`);
    if (!raw) return null;
    return JSON.parse(raw)?.access_token || null;
  } catch { return null; }
}

function LoginScreen() {
  const [loading, setLoading] = useState(false);
  const [mouse, setMouse] = useState({x:0,y:0});
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMouse({x: e.clientX - rect.left, y: e.clientY - rect.top});
  };

  const loginGoogle = () => {
    setLoading(true);
    window.location.href = `${SB}/auth/v1/authorize?provider=google&redirect_to=${window.location.origin}`;
  };

  const loginEmail = async () => {
    if(!email||!pass) return setErr("Preencha email e senha");
    setLoginLoading(true); setErr("");
    try {
      const r = await fetch(`${SB}/auth/v1/token?grant_type=password`,{
        method:"POST",
        headers:{apikey:KEY,"Content-Type":"application/json"},
        body:JSON.stringify({email,password:pass})
      });
      const d = await r.json();
      if(d.access_token){
        const key=`sb-${SB.split("//")[1].split(".")[0]}-auth-token`;
        localStorage.setItem(key,JSON.stringify(d));
        window.location.reload();
      } else {
        setErr("Email ou senha incorretos");
      }
    } catch { setErr("Erro ao conectar"); }
    setLoginLoading(false);
  };

  return (
    <div onMouseMove={handleMouseMove}
      style={{minHeight:"100vh",background:"#080808",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:F,position:"relative",overflow:"hidden"}}>

      {/* Cursor glow - clean and smooth */}
      <div style={{position:"fixed",width:400,height:400,borderRadius:"50%",background:`radial-gradient(circle at center, rgba(106,170,58,0.12) 0%, rgba(90,45,138,0.08) 40%, transparent 70%)`,left:mouse.x-200,top:mouse.y-200,transition:"left 0.15s ease-out, top 0.15s ease-out",pointerEvents:"none",zIndex:1}}/>
      <div style={{position:"fixed",width:200,height:200,borderRadius:"50%",background:`radial-gradient(circle at center, rgba(106,170,58,0.2) 0%, transparent 70%)`,left:mouse.x-100,top:mouse.y-100,transition:"left 0.05s ease-out, top 0.05s ease-out",pointerEvents:"none",zIndex:1}}/>

      {/* Card */}
      <div style={{position:"relative",zIndex:10,background:"rgba(18,18,18,0.95)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:28,padding:"40px 32px",width:"100%",maxWidth:420,backdropFilter:"blur(24px)",boxShadow:"0 32px 80px rgba(0,0,0,0.6)",boxSizing:"border-box",margin:"0 16px"}}>

        {/* Logo */}
        <div style={{textAlign:"center",marginBottom:36}}>
          <img src="/Seed.png" alt="Seed Content" style={{width:200,marginBottom:20,filter:"drop-shadow(0 8px 32px rgba(106,170,58,0.4))"}}/>
          <p style={{color:"rgba(255,255,255,0.4)",fontSize:13,margin:0}}>Painel financeiro interno</p>
        </div>

        {/* Email + senha */}
        <div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:16}}>
          <input value={email} onChange={e=>setEmail(e.target.value)} type="email" placeholder="seu@email.com"
            style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:12,color:"#fff",padding:"12px 16px",fontSize:14,fontFamily:F,outline:"none",transition:"border 0.2s"}}
            onFocus={e=>e.target.style.borderColor="rgba(106,170,58,0.6)"}
            onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.1)"}
            onKeyDown={e=>e.key==="Enter"&&loginEmail()}/>
          <input value={pass} onChange={e=>setPass(e.target.value)} type="password" placeholder="••••••••"
            style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:12,color:"#fff",padding:"12px 16px",fontSize:14,fontFamily:F,outline:"none",transition:"border 0.2s"}}
            onFocus={e=>e.target.style.borderColor="rgba(106,170,58,0.6)"}
            onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.1)"}
            onKeyDown={e=>e.key==="Enter"&&loginEmail()}/>
          {err&&<div style={{fontSize:12,color:"#ff6b6b",textAlign:"center"}}>{err}</div>}
          <button onClick={loginEmail} disabled={loginLoading}
            style={{background:"linear-gradient(135deg, #6aaa3a, #5a9a2a)",border:"none",borderRadius:12,color:"#fff",padding:"13px 20px",fontSize:14,fontWeight:700,fontFamily:F,cursor:"pointer",transition:"opacity 0.15s, transform 0.1s",boxShadow:"0 4px 20px rgba(106,170,58,0.4)"}}
            onMouseEnter={e=>{e.currentTarget.style.opacity="0.9";e.currentTarget.style.transform="translateY(-1px)"}}
            onMouseLeave={e=>{e.currentTarget.style.opacity="1";e.currentTarget.style.transform="translateY(0)"}}>
            {loginLoading?"Entrando...":"Entrar"}
          </button>
        </div>

        {/* Divider */}
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
          <div style={{flex:1,height:1,background:"rgba(255,255,255,0.08)"}}/>
          <span style={{fontSize:12,color:"rgba(255,255,255,0.3)"}}>ou</span>
          <div style={{flex:1,height:1,background:"rgba(255,255,255,0.08)"}}/>
        </div>

        {/* Google button */}
        <button onClick={loginGoogle} disabled={loading}
          style={{width:"100%",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:12,padding:"12px 20px",display:"flex",alignItems:"center",justifyContent:"center",gap:10,cursor:"pointer",fontSize:13,fontWeight:600,fontFamily:F,color:"rgba(255,255,255,0.8)",transition:"all 0.15s",boxSizing:"border-box"}}
          onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,0.1)";e.currentTarget.style.borderColor="rgba(255,255,255,0.2)"}}
          onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.06)";e.currentTarget.style.borderColor="rgba(255,255,255,0.12)"}}>
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          {loading?"Redirecionando...":"Continuar com Google"}
        </button>

        <p style={{color:"rgba(255,255,255,0.2)",fontSize:11,marginTop:24,textAlign:"center"}}>Acesso restrito · apenas contas autorizadas</p>
      </div>
    </div>
  );
}

// ─── DB ───────────────────────────────────────────────────────────────────────
const api = {
  async get(table) {
    const r = await fetch(`${SB}/rest/v1/${table}?order=id.asc`,{headers:{apikey:KEY,Authorization:`Bearer ${KEY}`}});
    if(!r.ok) throw new Error(await r.text());
    return r.json();
  },
  async insert(table, row) {
    const {id,created_at,...data} = row;
    const r = await fetch(`${SB}/rest/v1/${table}`,{method:"POST",headers:{apikey:KEY,Authorization:`Bearer ${KEY}`,"Content-Type":"application/json",Prefer:"return=representation"},body:JSON.stringify(data)});
    if(!r.ok) throw new Error(await r.text());
    return (await r.json())[0];
  },
  async update(table, id, row) {
    // Remove only auto-generated fields, keep everything else including status_saude
    const data = Object.fromEntries(Object.entries(row).filter(([k])=>!["id","created_at"].includes(k)));
    const r = await fetch(`${SB}/rest/v1/${table}?id=eq.${id}`,{method:"PATCH",headers:{apikey:KEY,Authorization:`Bearer ${KEY}`,"Content-Type":"application/json",Prefer:"return=representation"},body:JSON.stringify(data)});
    if(!r.ok) throw new Error(await r.text());
    return (await r.json())[0];
  },
  async delete(table, id) {
    const r = await fetch(`${SB}/rest/v1/${table}?id=eq.${id}`,{method:"DELETE",headers:{apikey:KEY,Authorization:`Bearer ${KEY}`}});
    if(!r.ok) throw new Error(await r.text());
  }
};

function useDB(table) {
  const [rows,setRows] = useState([]);
  const [loading,setLoading] = useState(true);
  const [toast,setToast] = useState(null);
  const notify = (msg,type="ok") => {setToast({msg,type});setTimeout(()=>setToast(null),3000);};
  const reload = useCallback(()=>{
    setLoading(true);
    api.get(table).then(d=>{setRows(d);setLoading(false);}).catch(()=>setLoading(false));
  },[table]);
  useEffect(()=>{reload();},[reload]);
  const add = async row => {notify("Salvando...","loading");try{const s=await api.insert(table,row);setRows(r=>[...r,s]);notify("Salvo!");return s;}catch(e){notify("Erro ao salvar","err");}};
  const update = async(id,row) => {notify("Salvando...","loading");try{const s=await api.update(table,id,row);setRows(r=>r.map(x=>x.id===id?{...x,...s}:x));notify("Atualizado!");return s;}catch(e){notify("Erro ao salvar","err");}};
  const remove = async id => {try{await api.delete(table,id);setRows(r=>r.filter(x=>x.id!==id));notify("Removido!");}catch(e){notify("Erro","err");}};
  return {rows,setRows,loading,add,update,remove,toast,reload};
}

// ─── ATOMS ────────────────────────────────────────────────────────────────────
const iS = {background:T.surface,border:`1px solid ${T.border}`,borderRadius:10,color:T.text,padding:"10px 14px",fontSize:14,fontFamily:F,outline:"none",width:"100%",boxSizing:"border-box"};

function Toast({msg,type}){
  const c={ok:T.green,err:T.red,loading:T.amber}[type]||T.green;
  const i={ok:"✓",err:"✕",loading:"⟳"}[type]||"✓";
  return <div style={{position:"fixed",bottom:28,right:28,zIndex:999,background:T.card,border:`1px solid ${c}44`,borderRadius:12,padding:"12px 20px",display:"flex",alignItems:"center",gap:10,boxShadow:"0 16px 48px #00000080"}}><span style={{color:c}}>{i}</span><span style={{color:T.text,fontSize:13,fontWeight:500}}>{msg}</span></div>;
}

const Badge = ({children,color=T.accent}) => <span style={{background:color+"20",color,fontSize:11,fontWeight:600,padding:"3px 10px",borderRadius:20,whiteSpace:"nowrap"}}>{children}</span>;

function Btn({children,onClick,variant="primary",small,disabled,full,style:st={}}){
  const v={primary:{background:T.accent,color:"#fff",border:"none"},ghost:{background:"transparent",color:T.sub,border:`1px solid ${T.border}`},danger:{background:T.redBg,color:T.red,border:`1px solid ${T.red}33`},soft:{background:T.accentBg,color:T.accentL,border:`1px solid ${T.accent}33`},success:{background:T.greenBg,color:T.green,border:`1px solid ${T.green}33`}}[variant]||{};
  return <button onClick={onClick} disabled={disabled} style={{...v,borderRadius:10,cursor:disabled?"not-allowed":"pointer",fontFamily:F,fontWeight:600,fontSize:small?12:14,padding:small?"6px 12px":"10px 20px",display:"inline-flex",alignItems:"center",gap:6,opacity:disabled?0.5:1,width:full?"100%":undefined,justifyContent:full?"center":undefined,whiteSpace:"nowrap",...st}} onMouseEnter={e=>!disabled&&(e.currentTarget.style.opacity="0.8")} onMouseLeave={e=>!disabled&&(e.currentTarget.style.opacity="1")}>{children}</button>;
}

function Inp({label,full,...props}){
  return <div style={{display:"flex",flexDirection:"column",gap:5,gridColumn:full?"1/-1":undefined}}>
    {label&&<label style={{fontSize:11,color:T.sub,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.06em"}}>{label}</label>}
    <input {...props} style={{...iS,...(props.style||{})}} onFocus={e=>e.target.style.borderColor=T.accent} onBlur={e=>e.target.style.borderColor=T.border}/>
  </div>;
}

function Tex({label,full,rows:r=3,...props}){
  return <div style={{display:"flex",flexDirection:"column",gap:5,gridColumn:full?"1/-1":undefined}}>
    {label&&<label style={{fontSize:11,color:T.sub,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.06em"}}>{label}</label>}
    <textarea {...props} rows={r} style={{...iS,resize:"vertical"}} onFocus={e=>e.target.style.borderColor=T.accent} onBlur={e=>e.target.style.borderColor=T.border}/>
  </div>;
}

function Sel({label,options,full,...props}){
  return <div style={{display:"flex",flexDirection:"column",gap:5,gridColumn:full?"1/-1":undefined}}>
    {label&&<label style={{fontSize:11,color:T.sub,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.06em"}}>{label}</label>}
    <select {...props} style={{...iS,cursor:"pointer"}}>{options.map(o=><option key={o.value??o} value={o.value??o}>{o.label??o}</option>)}</select>
  </div>;
}

function Modal({title,onClose,children,wide}){
  return <div style={{position:"fixed",inset:0,background:"#00000090",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:16,backdropFilter:"blur(4px)"}} onClick={e=>e.target===e.currentTarget&&onClose()}>
    <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:20,padding:32,width:"100%",maxWidth:wide?740:520,maxHeight:"90vh",overflowY:"auto"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:28}}>
        <h3 style={{color:T.text,fontWeight:700,fontSize:18,margin:0}}>{title}</h3>
        <Btn variant="ghost" small onClick={onClose}>✕</Btn>
      </div>
      {children}
    </div>
  </div>;
}

function Card({children,style={},onClick}){
  return <div onClick={onClick} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:16,padding:"20px 24px",cursor:onClick?"pointer":undefined,transition:"all 0.15s",...style}} onMouseEnter={e=>onClick&&(e.currentTarget.style.background=T.cardHov)} onMouseLeave={e=>onClick&&(e.currentTarget.style.background=T.card)}>{children}</div>;
}

function KPI({label,value,sub,color=T.accent,icon}){
  return <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:16,padding:"18px 20px",display:"flex",flexDirection:"column",gap:8}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
      <span style={{fontSize:11,color:T.sub,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.08em"}}>{label}</span>
      {icon&&<div style={{width:34,height:34,borderRadius:10,background:color+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>{icon}</div>}
    </div>
    <div style={{fontSize:26,fontWeight:800,color,fontFamily:M,lineHeight:1}}>{value}</div>
    {sub&&<div style={{fontSize:12,color:T.muted}}>{sub}</div>}
  </div>;
}

function MiniBar({value,max,color}){
  return <div style={{background:T.border,borderRadius:4,height:5,overflow:"hidden"}}><div style={{background:color,width:`${Math.min((value/(max||1))*100,100)}%`,height:"100%",borderRadius:4,transition:"width 0.5s"}}/></div>;
}

function Stars({value,onChange}){
  return <div style={{display:"flex",gap:2}}>{[1,2,3,4,5].map(n=><button key={n} onClick={()=>onChange&&onChange(n)} style={{background:"none",border:"none",cursor:onChange?"pointer":"default",fontSize:20,color:n<=(value||0)?T.amber:T.dim,padding:1,lineHeight:1}}>★</button>)}</div>;
}

function Table({cols,rows,empty="Nenhum registro"}){
  return <div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
    <thead><tr>{cols.map(c=><th key={c.key} style={{textAlign:c.align||"left",padding:"10px 16px",color:T.muted,fontWeight:600,fontSize:11,textTransform:"uppercase",letterSpacing:"0.06em",borderBottom:`1px solid ${T.border}`}}>{c.label}</th>)}</tr></thead>
    <tbody>{rows.length===0?<tr><td colSpan={cols.length} style={{textAlign:"center",color:T.muted,padding:"32px 0"}}>{empty}</td></tr>:rows.map((row,i)=><tr key={i} style={{borderBottom:`1px solid ${T.border}22`}} onMouseEnter={e=>e.currentTarget.style.background=T.surface} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>{cols.map(c=><td key={c.key} style={{padding:"12px 16px",color:T.text,textAlign:c.align||"left",verticalAlign:"middle"}}>{c.render?c.render(row[c.key],row):row[c.key]}</td>)}</tr>)}</tbody>
  </table></div>;
}

function Pill({children,active,color=T.accent,onClick}){
  return <button onClick={onClick} style={{background:active?color+"20":"transparent",border:`1px solid ${active?color:T.border}`,color:active?color:T.sub,borderRadius:20,padding:"5px 14px",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:F,transition:"all 0.15s",whiteSpace:"nowrap"}}>{children}</button>;
}

function ContractProgress({dur,mes,valor,tipo}){
  dur=+dur||1; mes=Math.min(+mes||0,dur);
  const pct=(mes/dur)*100;
  const c=pct>=100?T.green:pct>=60?T.accent:pct>=30?T.amber:T.blue;
  const exec=tipo==="Fee Mensal"?(+valor||0)*mes:(+valor||0)*(mes/dur);
  const total=tipo==="Fee Mensal"?(+valor||0)*dur:(+valor||0);
  return <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:14,padding:16}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
      <span style={{fontSize:13,fontWeight:600,color:T.text}}>Progresso do contrato</span>
      <span style={{fontSize:20,fontWeight:800,color:c,fontFamily:M}}>{mes} / {dur}</span>
    </div>
    <div style={{background:T.border,borderRadius:6,height:8,overflow:"hidden",marginBottom:10}}><div style={{background:c,width:`${pct}%`,height:"100%",borderRadius:6}}/></div>
    <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:12}}>{Array.from({length:dur},(_,i)=><div key={i} style={{width:26,height:26,borderRadius:"50%",background:i<mes?c:T.border,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:i<mes?"#fff":T.muted,fontWeight:700}}>{i+1}</div>)}</div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
      {[["Executado",exec,c],["Total",total,T.text],["A executar",total-exec,T.muted]].map(([l,v,cl])=><div key={l} style={{background:T.card,borderRadius:10,padding:"8px 12px"}}><div style={{fontSize:10,color:T.muted,marginBottom:3,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em"}}>{l}</div><div style={{fontSize:13,fontWeight:700,color:cl,fontFamily:M}}>{fmt(v)}</div></div>)}
    </div>
  </div>;
}

function LineArea({data,color,h=90}){
  if(!data||data.length<2) return null;
  const w=400,min=Math.min(...data),max=Math.max(...data),range=max-min||1;
  const x=i=>(i/(data.length-1))*(w-20)+10;
  const y=v=>h-((v-min)/range)*(h-16)-8;
  const pts=data.map((v,i)=>`${x(i)},${y(v)}`).join(" ");
  return <svg viewBox={`0 0 ${w} ${h}`} style={{width:"100%",height:h}}>
    <defs><linearGradient id={`lg${color.replace("#","")}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity="0.25"/><stop offset="100%" stopColor={color} stopOpacity="0"/></linearGradient></defs>
    <polygon points={`10,${h} ${pts} ${x(data.length-1)},${h}`} fill={`url(#lg${color.replace("#","")})`}/>
    <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"/>
    {data.map((v,i)=><circle key={i} cx={x(i)} cy={y(v)} r={3} fill={color}/>)}
  </svg>;
}

// ─── LANÇAMENTOS POR CLIENTE ──────────────────────────────────────────────────
function LancamentosTab({clienteId,clienteNome,caixaAdd}){
  const {rows,loading,add,remove,toast}=useDB("lancamentos_clientes");
  const [modal,setModal]=useState(false);
  const [form,setForm]=useState({descricao:"",tipo:"Receita",categoria:"Projeto Avulso",valor:"",data:today(),observacoes:""});
  const s=k=>e=>setForm(f=>({...f,[k]:e.target.value}));
  const meus=rows.filter(r=>+r.cliente_id===+clienteId);
  const totalR=meus.filter(r=>r.tipo==="Receita").reduce((s,r)=>s+(+r.valor||0),0);
  const totalC=meus.filter(r=>r.tipo==="Custo").reduce((s,r)=>s+(+r.valor||0),0);

  const save=async()=>{
    if(!form.descricao||!form.valor) return;
    const lancamento={...form,cliente_id:clienteId,cliente_nome:clienteNome,valor:+form.valor};
    await add(lancamento);
    // Espelha no caixa automaticamente
    if(caixaAdd){
      await caixaAdd({
        data:form.data,
        descricao:`${clienteNome} — ${form.descricao}`,
        tipo:form.tipo==="Receita"?"Entrada":"Saída",
        categoria:form.categoria,
        valor:+form.valor
      });
    }
    setModal(false);
    setForm({descricao:"",tipo:"Receita",categoria:"Projeto Avulso",valor:"",data:today(),observacoes:""});
  };

  return <div style={{display:"flex",flexDirection:"column",gap:14}}>
    {toast&&<Toast {...toast}/>}
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
      <div style={{display:"flex",gap:16}}>
        <span style={{fontSize:13,color:T.green,fontWeight:700,fontFamily:M}}>+{fmt(totalR)}</span>
        <span style={{fontSize:13,color:T.red,fontWeight:700,fontFamily:M}}>-{fmt(totalC)}</span>
        <span style={{fontSize:13,color:T.accent,fontWeight:700,fontFamily:M}}>{fmt(totalR-totalC)} líquido</span>
      </div>
      <Btn small onClick={()=>setModal(true)}>+ Lançamento avulso</Btn>
    </div>
    {loading?<div style={{color:T.muted,textAlign:"center",padding:24}}>Carregando...</div>:
    meus.length===0?<div style={{color:T.muted,fontSize:13,textAlign:"center",padding:"24px 0",background:T.surface,borderRadius:12}}>Nenhum lançamento avulso.<br/><span style={{fontSize:12}}>Ex: diária extra, projeto pontual, consultoria...</span></div>:
    <div style={{display:"flex",flexDirection:"column",gap:8}}>
      {[...meus].sort((a,b)=>(b.data||"").localeCompare(a.data||"")).map(l=><div key={l.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:T.surface,border:`1px solid ${T.border}`,borderRadius:10,padding:"10px 14px"}}>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:13,fontWeight:600,color:T.text}}>{l.descricao}</div>
          <div style={{fontSize:11,color:T.muted,marginTop:2}}>{l.data} · {l.categoria}</div>
          {l.observacoes&&<div style={{fontSize:11,color:T.muted}}>{l.observacoes}</div>}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
          <span style={{fontFamily:M,fontWeight:700,fontSize:14,color:l.tipo==="Receita"?T.green:T.red}}>{l.tipo==="Receita"?"+":"-"}{fmt(l.valor)}</span>
          <Btn variant="danger" small onClick={()=>remove(l.id)}>✕</Btn>
        </div>
      </div>)}
    </div>}
    {modal&&<Modal title="Lançamento avulso" onClose={()=>setModal(false)}>
      <div style={{background:T.accentBg,border:`1px solid ${T.accent}33`,borderRadius:10,padding:"10px 14px",marginBottom:16,fontSize:12,color:T.accentL}}>
        ✓ Este lançamento será salvo aqui <strong>e no Caixa automaticamente</strong>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
        <Inp label="Descrição *" full value={form.descricao} onChange={s("descricao")} placeholder="Ex: Diária extra, reunião pontual..."/>
        <Sel label="Tipo" value={form.tipo} onChange={s("tipo")} options={["Receita","Custo"]}/>
        <Sel label="Categoria" value={form.categoria} onChange={s("categoria")} options={["Projeto Avulso","Diária Extra","Consultoria","Material","Deslocamento","Outros"]}/>
        <Inp label="Valor (R$) *" type="number" value={form.valor} onChange={s("valor")}/>
        <Inp label="Data" type="date" value={form.data} onChange={s("data")}/>
        <Tex label="Observações" full value={form.observacoes} onChange={s("observacoes")}/>
      </div>
      <div style={{display:"flex",gap:8,marginTop:20,justifyContent:"flex-end"}}>
        <Btn variant="ghost" onClick={()=>setModal(false)}>Cancelar</Btn>
        <Btn onClick={save}>Salvar e lançar no caixa</Btn>
      </div>
    </Modal>}
  </div>;
}


// ─── DUAL PROGRESS ────────────────────────────────────────────────────────────
function DualProgress({dur,mesExec,mesPago,valor,tipo,valorPago}){
  dur=Math.max(+dur||1,1);
  mesExec=Math.min(Math.max(+mesExec||0,0),dur);
  mesPago=Math.min(Math.max(+mesPago||0,0),dur);
  const pctExec=(mesExec/dur)*100;
  const pctPago=(mesPago/dur)*100;
  const cExec=pctExec>=100?T.green:pctExec>=60?T.accent:pctExec>=30?T.amber:T.blue;
  const cPago=pctPago>=100?T.green:pctPago>=60?T.green:pctPago>=30?T.green:T.purple;
  const valorExec=tipo==="Fee Mensal"?(+valor||0)*mesExec:(+valor||0)*(mesExec/dur);
  const valorTotal=tipo==="Fee Mensal"?(+valor||0)*dur:(+valor||0);
  const valorRecebido=+valorPago||(+valor||0)*mesPago;

  return <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:14,padding:16,display:"flex",flexDirection:"column",gap:14}}>
    {/* Barra de pagamento */}
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:8,height:8,borderRadius:"50%",background:cPago}}/>
          <span style={{fontSize:12,fontWeight:600,color:T.text}}>💰 Pagamento recebido</span>
        </div>
        <span style={{fontSize:14,fontWeight:800,color:cPago,fontFamily:M}}>{mesPago} / {dur} meses · {fmt(valorRecebido)}</span>
      </div>
      <div style={{background:T.border,borderRadius:6,height:10,overflow:"hidden",marginBottom:4}}>
        <div style={{background:cPago,width:`${pctPago}%`,height:"100%",borderRadius:6,transition:"width 0.5s"}}/>
      </div>
      <div style={{fontSize:11,color:T.muted}}>Entrada no caixa: {fmt(valorRecebido)} de {fmt(valorTotal)}</div>
    </div>

    {/* Barra de execução */}
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:8,height:8,borderRadius:"50%",background:cExec}}/>
          <span style={{fontSize:12,fontWeight:600,color:T.text}}>⚙️ Execução / entrega</span>
        </div>
        <span style={{fontSize:14,fontWeight:800,color:cExec,fontFamily:M}}>{mesExec} / {dur} meses</span>
      </div>
      <div style={{background:T.border,borderRadius:6,height:10,overflow:"hidden",marginBottom:4}}>
        <div style={{background:cExec,width:`${pctExec}%`,height:"100%",borderRadius:6,transition:"width 0.5s"}}/>
      </div>
      <div style={{fontSize:11,color:T.muted}}>Entregue: {fmt(valorExec)} de {fmt(valorTotal)}</div>
    </div>

    {/* Bolinhas dos meses */}
    <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
      {Array.from({length:dur},(_,i)=>{
        const pago=i<mesPago;
        const exec=i<mesExec;
        return <div key={i} title={`Mês ${i+1}${pago?" · Pago":""}${exec?" · Executado":""}`}
          style={{width:28,height:28,borderRadius:"50%",background:pago&&exec?T.green:pago?T.purple:exec?cExec:T.border,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:(pago||exec)?"#fff":T.muted,fontWeight:700,border:pago&&exec?`2px solid ${T.green}33`:"none"}}>
          {i+1}
        </div>;
      })}
    </div>
    <div style={{display:"flex",gap:12,fontSize:11,color:T.muted}}>
      <div style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:10,height:10,borderRadius:"50%",background:T.green}}/> Pago + executado</div>
      <div style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:10,height:10,borderRadius:"50%",background:T.purple}}/> Só pago</div>
      <div style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:10,height:10,borderRadius:"50%",background:cExec}}/> Só executado</div>
    </div>
  </div>;
}

// ─── FICHA CLIENTE ────────────────────────────────────────────────────────────
const EMPTY_C={nome:"",contato:"",email:"",telefone:"",segmento:"",status:"Ativo",valor_mensal:"",inicio:today(),tipo_contrato:"Fee Mensal",duracao_meses:1,mes_atual:0,meses_pagos:0,valor_total_pago:0,escopo_total:"",entregas:"",proposta_url:"",video_url:"",status_saude:"verde",satisfacao:3,nota_saude:"",observacoes:""};

function FichaCliente({item,isNew,onSave,onClose,caixaAdd}){
  const [form,setForm]=useState({
    ...EMPTY_C,
    ...item,
    status_saude: ["verde","amarelo","vermelho"].includes(item?.status_saude) ? item.status_saude : "verde",
    duracao_meses: Math.max(+item?.duracao_meses||1, 1),
    mes_atual: Math.max(+item?.mes_atual||0, 0),
    meses_pagos: Math.max(+item?.meses_pagos||0, 0),
    valor_total_pago: +item?.valor_total_pago||0,
    satisfacao: +item?.satisfacao||3,
    valor_mensal: item?.valor_mensal||"",
  });
  const [saving,setSaving]=useState(false);
  const [tab,setTab]=useState("contrato");
  const set=k=>e=>setForm(f=>({...f,[k]:e.target.value}));
  const saude=SAUDE[form.status_saude]||SAUDE.verde;
  const TABS=[{id:"contrato",l:"Contrato"},{id:"entregas",l:"Entregas"},{id:"saude",l:"Saúde"},{id:"lancamentos",l:"💰 Lançamentos"}];

  return <Modal title="" onClose={onClose} wide>
    {/* Header */}
    <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:24,paddingBottom:20,borderBottom:`1px solid ${T.border}`}}>
      <div style={{width:50,height:50,borderRadius:14,background:saude.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0}}>{saude.emoji}</div>
      <div style={{flex:1,minWidth:0}}>
        <input value={form.nome||""} onChange={set("nome")} placeholder="Nome do cliente" style={{background:"transparent",border:"none",outline:"none",fontSize:20,fontWeight:700,color:T.text,fontFamily:F,width:"100%"}}/>
        <div style={{display:"flex",gap:6,marginTop:4,flexWrap:"wrap"}}>
          <Badge color={saude.color}>{saude.emoji} {saude.label}</Badge>
          <Badge color={T.blue}>{form.tipo_contrato}</Badge>
          {form.valor_mensal&&<Badge color={T.green}>{fmt(form.valor_mensal)}/mês</Badge>}
        </div>
      </div>
      <div style={{display:"flex",gap:6}}>
        {["verde","amarelo","vermelho"].map(s=><button key={s} onClick={()=>setForm(f=>({...f,status_saude:s}))} style={{width:26,height:26,borderRadius:"50%",border:form.status_saude===s?`3px solid ${SAUDE[s].color}`:"2px solid transparent",background:SAUDE[s].color,cursor:"pointer",opacity:form.status_saude===s?1:0.3,transition:"all 0.15s"}}/>)}
      </div>
    </div>

    {/* Dados básicos */}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:20}}>
      <Inp label="Contato" value={form.contato||""} onChange={set("contato")}/>
      <Inp label="Email" type="email" value={form.email||""} onChange={set("email")}/>
      <Inp label="Telefone" value={form.telefone||""} onChange={set("telefone")}/>
      <Inp label="Segmento" value={form.segmento||""} onChange={set("segmento")}/>
      <Sel label="Status" value={form.status||"Ativo"} onChange={set("status")} options={["Ativo","Inativo","Pausado"]}/>
      <Inp label="Início do contrato" type="date" value={form.inicio||""} onChange={set("inicio")}/>
    </div>

    {/* Tabs */}
    <div style={{display:"flex",gap:0,marginBottom:20,borderBottom:`1px solid ${T.border}`}}>
      {TABS.map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{background:"none",border:"none",borderBottom:tab===t.id?`2px solid ${T.accent}`:"2px solid transparent",color:tab===t.id?T.accentL:T.sub,fontFamily:F,fontWeight:600,fontSize:13,padding:"8px 18px",cursor:"pointer",marginBottom:-1,transition:"all 0.15s"}}>{t.l}</button>)}
    </div>

    {tab==="contrato"&&<div style={{display:"flex",flexDirection:"column",gap:14}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <Inp label="Valor mensal (R$)" type="number" value={form.valor_mensal||""} onChange={set("valor_mensal")}/>
        <Sel label="Tipo de contrato" value={form.tipo_contrato||"Fee Mensal"} onChange={set("tipo_contrato")} options={[{value:"Fee Mensal",label:"Fee Mensal (recorrente)"},{value:"Unitário",label:"Unitário (projeto com prazo)"}]}/>
        <Sel label="Duração total" value={form.duracao_meses||1} onChange={set("duracao_meses")} options={[1,2,3,6,12,24].map(n=>({value:n,label:`${n} ${n===1?"mês":"meses"}`}))}/>
        <Sel label="Mês de execução atual" value={form.mes_atual||0} onChange={set("mes_atual")} options={Array.from({length:(+form.duracao_meses||1)+1},(_,i)=>({value:i,label:i===0?"Não iniciado":`Mês ${i} de ${form.duracao_meses}`}))}/>
        <Sel label="Meses pagos pelo cliente" value={form.meses_pagos||0} onChange={async e=>{
          const novosPagos=+e.target.value;
          const anterior=+form.meses_pagos||0;
          setForm(f=>({...f,meses_pagos:novosPagos,valor_total_pago:(+f.valor_mensal||0)*novosPagos}));
        }} options={Array.from({length:(+form.duracao_meses||1)+1},(_,i)=>({value:i,label:i===0?"Nenhum pagamento":`${i} ${i===1?"mês pago":"meses pagos"} — ${new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format((+form.valor_mensal||0)*i)}`}))}/>
        <Inp label="Valor total recebido (R$)" type="number" value={form.valor_total_pago||0} onChange={set("valor_total_pago")}/>
      </div>
      <DualProgress dur={form.duracao_meses} mesExec={form.mes_atual} mesPago={form.meses_pagos} valor={+form.valor_mensal||0} tipo={form.tipo_contrato} valorPago={+form.valor_total_pago||0}/>
      <Tex label="Escopo total contratado" full rows={3} value={form.escopo_total||""} onChange={set("escopo_total")} placeholder="O que foi contratado no total..."/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <div><Inp label="Link da proposta" value={form.proposta_url||""} onChange={set("proposta_url")} placeholder="https://drive.google.com/..."/>{form.proposta_url&&<a href={form.proposta_url} target="_blank" rel="noreferrer" style={{fontSize:12,color:T.blue,textDecoration:"none",display:"inline-flex",alignItems:"center",gap:4,marginTop:6}}>🔗 Abrir proposta →</a>}</div>
        <div><Inp label="Link do vídeo" value={form.video_url||""} onChange={set("video_url")} placeholder="https://youtube.com/..."/>{form.video_url&&<a href={form.video_url} target="_blank" rel="noreferrer" style={{fontSize:12,color:T.purple,textDecoration:"none",display:"inline-flex",alignItems:"center",gap:4,marginTop:6}}>▶ Abrir vídeo →</a>}</div>
      </div>
    </div>}

    {tab==="entregas"&&<div style={{display:"flex",flexDirection:"column",gap:14}}>
      <Tex label="O que já entregamos" full rows={5} value={form.entregas||""} onChange={set("entregas")} placeholder="Liste as entregas realizadas até agora..."/>
      <Tex label="Observações gerais" full rows={3} value={form.observacoes||""} onChange={set("observacoes")} placeholder="Notas importantes sobre este cliente..."/>
    </div>}

    {tab==="saude"&&<div style={{display:"flex",flexDirection:"column",gap:16}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <div>
          <div style={{fontSize:11,color:T.sub,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:10}}>Satisfação do cliente</div>
          <Stars value={+form.satisfacao} onChange={v=>setForm(f=>({...f,satisfacao:v}))}/>
          <div style={{fontSize:12,color:T.muted,marginTop:6}}>{["","Muito insatisfeito","Insatisfeito","Neutro","Satisfeito","Muito satisfeito"][+form.satisfacao]||"Não avaliado"}</div>
        </div>
        <Sel label="Status de saúde" value={form.status_saude||"verde"} onChange={set("status_saude")} options={[{value:"verde",label:"🟢 Saudável"},{value:"amarelo",label:"🟡 Atenção"},{value:"vermelho",label:"🔴 Crítico"}]}/>
      </div>
      <Tex label="Como está nosso trabalho para este cliente?" full rows={5} value={form.nota_saude||""} onChange={set("nota_saude")} placeholder="Está entregando resultado? Pontos de atenção? O que precisa melhorar?"/>
      <div style={{background:saude.bg,border:`1px solid ${saude.color}33`,borderRadius:12,padding:14}}>
        <div style={{fontSize:12,color:saude.color,fontWeight:600,marginBottom:4}}>Dica:</div>
        <div style={{fontSize:12,color:T.sub}}>
          {form.status_saude==="verde"&&"Ótimo! Foque em encantar e buscar oportunidades de upsell."}
          {form.status_saude==="amarelo"&&"Atenção! Agende uma reunião de alinhamento rapidamente."}
          {form.status_saude==="vermelho"&&"Urgente! Este cliente está em risco de cancelamento. Aja já."}
        </div>
      </div>
    </div>}

    {tab==="lancamentos"&&(
      isNew
        ?<div style={{color:T.muted,fontSize:13,textAlign:"center",padding:"32px 0"}}>Salve o cliente primeiro para adicionar lançamentos.</div>
        :<LancamentosTab clienteId={item.id} clienteNome={form.nome} caixaAdd={caixaAdd}/>
    )}

    <div style={{display:"flex",gap:8,marginTop:24,justifyContent:"flex-end",paddingTop:20,borderTop:`1px solid ${T.border}`}}>
      <Btn variant="ghost" onClick={onClose}>Cancelar</Btn>
      <Btn onClick={async()=>{
        setSaving(true);
        const prevMesPago = +item?.meses_pagos||0;
        const novoMesPago = +form.meses_pagos||0;
        const data={...form,valor_mensal:+form.valor_mensal||0,satisfacao:+form.satisfacao||3,duracao_meses:+form.duracao_meses||1,mes_atual:+form.mes_atual||0,meses_pagos:novoMesPago,valor_total_pago:+form.valor_total_pago||0,status_saude:form.status_saude||"verde"};
        await onSave(data);
        // Se novos meses foram pagos, lança no caixa automaticamente
        if(caixaAdd && novoMesPago > prevMesPago){
          const mesesNovos = novoMesPago - prevMesPago;
          const valorNovo = (+form.valor_mensal||0) * mesesNovos;
          await caixaAdd({
            data: today(),
            descricao: `${form.nome} — ${mesesNovos} ${mesesNovos===1?"mensalidade":"mensalidades"} recebida(s)`,
            tipo: "Entrada",
            categoria: "Receita de Serviço",
            valor: valorNovo,
          });
        }
        setSaving(false);
      }} disabled={saving}>{saving?"Salvando...":"Salvar cliente"}</Btn>
    </div>
  </Modal>;
}

// ─── CLIENTES PAGE ────────────────────────────────────────────────────────────
function Clientes({caixaAdd}){
  const {rows,loading,add,update,remove,toast,reload}=useDB("clientes");
  const [ficha,setFicha]=useState(null);
  const [isNew,setIsNew]=useState(false);
  const [search,setSearch]=useState("");
  const [filtroSaude,setFiltroSaude]=useState("todos");
  const [filtroStatus,setFiltroStatus]=useState("Todos");

  const abrir=item=>{setFicha(item);setIsNew(false);};
  const salvar=async form=>{
    const data={
      ...form,
      valor_mensal:+form.valor_mensal||0,
      satisfacao:+form.satisfacao||3,
      duracao_meses:+form.duracao_meses||1,
      mes_atual:+form.mes_atual||0,
      status_saude:form.status_saude&&["verde","amarelo","vermelho"].includes(form.status_saude)?form.status_saude:"verde",
    };
    if(isNew) await add(data);
    else await update(ficha.id,data);
    setFicha(null);
    reload();
  };

  const filtered=rows.filter(r=>{
    const ms=r.nome?.toLowerCase().includes(search.toLowerCase())||(r.segmento||"").toLowerCase().includes(search.toLowerCase())||(r.contato||"").toLowerCase().includes(search.toLowerCase());
    const mf=filtroSaude==="todos"||r.status_saude===filtroSaude;
    const ms2=filtroStatus==="Todos"||r.status===filtroStatus;
    return ms&&mf&&ms2;
  });

  const ativos=rows.filter(r=>r.status==="Ativo");
  const mrr=ativos.reduce((s,r)=>s+(+r.valor_mensal||0),0);
  const porSaude=s=>ativos.filter(r=>r.status_saude===s).length;
  const avgSat=rows.length>0?(rows.reduce((s,r)=>s+(+r.satisfacao||0),0)/rows.length).toFixed(1):0;

  return <div style={{display:"flex",flexDirection:"column",gap:24}}>
    {toast&&<Toast {...toast}/>}
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
      <div><h1 style={{color:T.text,fontSize:24,fontWeight:800,margin:0}}>Clientes</h1><p style={{color:T.sub,fontSize:14,marginTop:4}}>{ativos.length} ativos · MRR {fmt(mrr)}</p></div>
      <div style={{background:T.accentBg,border:`1px solid ${T.accent}33`,borderRadius:10,padding:"8px 16px",fontSize:12,color:T.accentL,display:"flex",alignItems:"center",gap:8}}>
        <span>◎</span> Novos clientes entram pelo <strong>CRM</strong>
      </div>
    </div>

    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:12}}>
      <KPI label="MRR" value={fmtK(mrr)} color={T.green} icon="↗"/>
      <KPI label="🟢 Saudáveis" value={porSaude("verde")} color={T.green}/>
      <KPI label="🟡 Atenção" value={porSaude("amarelo")} color={T.amber}/>
      <KPI label="🔴 Críticos" value={porSaude("vermelho")} color={T.red}/>
      <KPI label="Satisfação" value={`${avgSat}★`} color={T.amber}/>
    </div>

    <div style={{display:"flex",gap:10,flexWrap:"wrap",alignItems:"center"}}>
      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar cliente..." style={{...iS,flex:1,minWidth:200,maxWidth:320}} onFocus={e=>e.target.style.borderColor=T.accent} onBlur={e=>e.target.style.borderColor=T.border}/>
      <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
        {["todos","verde","amarelo","vermelho"].map(s=><Pill key={s} active={filtroSaude===s} color={s==="todos"?T.accent:SAUDE[s]?.color||T.accent} onClick={()=>setFiltroSaude(s)}>{s==="todos"?"Todos":SAUDE[s].emoji+" "+SAUDE[s].label}</Pill>)}
        <div style={{width:1,background:T.border,margin:"0 4px"}}/>
        {["Todos","Ativo","Inativo","Pausado"].map(s=><Pill key={s} active={filtroStatus===s} onClick={()=>setFiltroStatus(s)}>{s}</Pill>)}
      </div>
    </div>

    {loading?<div style={{color:T.sub,textAlign:"center",padding:48}}>Carregando...</div>:
    filtered.length===0?<Card><div style={{textAlign:"center",color:T.muted,padding:"32px 0",fontSize:14}}>Nenhum cliente encontrado</div></Card>:
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:14}}>
      {filtered.map(item=>{
        const saudeKey=["verde","amarelo","vermelho"].includes(item.status_saude)?item.status_saude:"verde";
        const saude=SAUDE[saudeKey];
        const dur=Math.max(+item.duracao_meses||1, 1);
        const mes=Math.min(Math.max(+item.mes_atual||0, 0), dur);
        const pct=dur>1?(mes/dur)*100:0;
        const pc=pct>=100?T.green:pct>=60?T.accent:pct>=30?T.amber:T.blue;
        return <div key={item.id} onClick={()=>abrir(item)}
          style={{background:T.card,border:`1px solid ${T.border}`,borderLeft:`3px solid ${saude.color}`,borderRadius:16,padding:20,cursor:"pointer",transition:"all 0.15s"}}
          onMouseEnter={e=>e.currentTarget.style.background=T.cardHov}
          onMouseLeave={e=>e.currentTarget.style.background=T.card}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
            <div style={{minWidth:0}}><div style={{fontWeight:700,fontSize:15,color:T.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.nome||"Sem nome"}</div><div style={{fontSize:12,color:T.sub,marginTop:2}}>{item.contato||item.segmento||"—"}</div></div>
            <Badge color={saude.color}>{saude.emoji} {saude.label}</Badge>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <div style={{fontSize:20,fontWeight:800,color:T.green,fontFamily:M}}>{fmt(item.valor_mensal)}<span style={{fontSize:11,color:T.muted,fontWeight:400}}>/mês</span></div>
            <Badge color={T.blue}>{item.tipo_contrato||"Fee Mensal"}</Badge>
          </div>
          {dur>=1&&<div style={{marginBottom:12}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:11,color:T.muted}}>💰 Pagamento</span><span style={{fontSize:11,fontWeight:700,color:T.purple,fontFamily:M}}>{Math.min(+item.meses_pagos||0,dur)}/{dur}</span></div>
            <MiniBar value={Math.min(+item.meses_pagos||0,dur)} max={dur} color={T.purple}/>
            <div style={{display:"flex",justifyContent:"space-between",marginTop:6,marginBottom:4}}><span style={{fontSize:11,color:T.muted}}>⚙️ Execução</span><span style={{fontSize:11,fontWeight:700,color:pc,fontFamily:M}}>{mes}/{dur}</span></div>
            <MiniBar value={mes} max={dur} color={pc}/>
          </div>}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",paddingTop:12,borderTop:`1px solid ${T.border}`}}>
            <Stars value={+item.satisfacao}/>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              {item.proposta_url&&<span style={{fontSize:12,color:T.blue}}>🔗</span>}
              {item.video_url&&<span style={{fontSize:12,color:T.purple}}>▶</span>}
              <span style={{fontSize:11,color:T.muted}}>Abrir ficha →</span>
            </div>
          </div>
          {item.nota_saude&&<div style={{marginTop:10,padding:"8px 12px",background:saude.bg,borderRadius:8,fontSize:12,color:saude.color,borderLeft:`2px solid ${saude.color}`}}>{item.nota_saude.slice(0,80)}{item.nota_saude.length>80?"...":""}</div>}
          <div style={{display:"flex",justifyContent:"flex-end",marginTop:10}}>
            <Btn variant="danger" small onClick={e=>{e.stopPropagation();remove(item.id);}}>Remover</Btn>
          </div>
        </div>;
      })}
    </div>}

    {ficha&&<FichaCliente item={ficha} isNew={isNew} onSave={salvar} onClose={()=>setFicha(null)} caixaAdd={caixaAdd}/>}
  </div>;
}


// ─── PATRIMÔNIO TAB ───────────────────────────────────────────────────────────
function PatrimonioTab({db}){
  const [modal,setModal]=useState(false);
  const [edit,setEdit]=useState(null);
  const [form,setForm]=useState({descricao:"",categoria:"Caixa em banco",valor:"",data:today(),rendimento_mensal:"",observacoes:""});
  const s=k=>e=>setForm(f=>({...f,[k]:e.target.value}));
  const save=async()=>{if(!form.descricao||!form.valor)return;await db.add({...form,valor:+form.valor,rendimento_mensal:+form.rendimento_mensal||0});setModal(false);setForm({descricao:"",categoria:"Caixa em banco",valor:"",data:today(),rendimento_mensal:"",observacoes:""});};
  const saveEdit=async f=>{await db.update(edit.id,{...f,valor:+f.valor,rendimento_mensal:+f.rendimento_mensal||0});setEdit(null);};
  const total=db.rows.reduce((s,i)=>s+(+i.valor||0),0);
  const rendimento=db.rows.reduce((s,i)=>s+(+i.rendimento_mensal||0),0);

  const porCat=db.rows.reduce((acc,i)=>{acc[i.categoria]=(acc[i.categoria]||0)+(+i.valor||0);return acc;},{});
  const catColors={
    "Caixa em banco":T.green,
    "Conta corrente":T.blue,
    "Investimento CDB/CDI":T.accent,
    "Poupança":T.amber,
    "Outros":T.muted,
  };

  return <div style={{display:"flex",flexDirection:"column",gap:20}}>
    <div style={{background:T.greenBg,border:`1px solid ${T.green}33`,borderRadius:12,padding:"14px 18px",fontSize:13,color:T.green,fontWeight:500}}>
      💎 Patrimônio financeiro — dinheiro que vocês têm guardado/rendendo. Não entra no resultado operacional.
    </div>

    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:12}}>
      <KPI label="Total patrimônio" value={fmt(total)} color={T.green} icon="💎"/>
      <KPI label="Rendimento mensal" value={fmt(rendimento)} sub="Estimado/mês" color={T.accent} icon="📈"/>
      {Object.entries(porCat).map(([cat,val])=><KPI key={cat} label={cat} value={fmtK(val)} color={catColors[cat]||T.muted}/>)}
    </div>

    <div style={{display:"flex",justifyContent:"flex-end"}}><Btn small onClick={()=>setModal(true)}>+ Registrar patrimônio</Btn></div>

    <Card style={{padding:0}}>
      <Table cols={[
        {key:"descricao",label:"Descrição",render:(v,r)=><div><div style={{fontWeight:600}}>{v}</div>{r.observacoes&&<div style={{fontSize:11,color:T.muted}}>{r.observacoes}</div>}</div>},
        {key:"categoria",label:"Categoria",render:v=><Badge color={catColors[v]||T.muted}>{v}</Badge>},
        {key:"data",label:"Data"},
        {key:"rendimento_mensal",label:"Rendimento/mês",align:"right",render:v=><span style={{fontFamily:M,color:T.accent,fontWeight:600}}>{+v>0?`+${fmt(v)}`:"-"}</span>},
        {key:"valor",label:"Valor",align:"right",render:v=><span style={{fontFamily:M,fontWeight:700,color:T.green}}>{fmt(v)}</span>},
        {key:"id",label:"",align:"right",render:(v,r)=><div style={{display:"flex",gap:6}}><Btn variant="soft" small onClick={()=>setEdit(r)}>✎</Btn><Btn variant="danger" small onClick={()=>db.remove(v)}>✕</Btn></div>},
      ]} rows={db.rows}/>
    </Card>

    {modal&&<Modal title="Registrar patrimônio" onClose={()=>setModal(false)}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
        <Inp label="Descrição *" full value={form.descricao} onChange={s("descricao")} placeholder="Ex: Saldo Nubank, CDB Banco X..."/>
        <Sel label="Categoria" value={form.categoria} onChange={s("categoria")} options={["Caixa em banco","Conta corrente","Investimento CDB/CDI","Poupança","Outros"]}/>
        <Inp label="Valor atual (R$) *" type="number" value={form.valor} onChange={s("valor")}/>
        <Inp label="Rendimento mensal (R$)" type="number" value={form.rendimento_mensal} onChange={s("rendimento_mensal")} placeholder="Ex: 150"/>
        <Inp label="Data" type="date" value={form.data} onChange={s("data")}/>
        <Tex label="Observações" full value={form.observacoes} onChange={s("observacoes")} placeholder="Ex: CDI 110%, vencimento em..."/>
      </div>
      <div style={{display:"flex",gap:8,marginTop:20,justifyContent:"flex-end"}}><Btn variant="ghost" onClick={()=>setModal(false)}>Cancelar</Btn><Btn onClick={save}>Salvar</Btn></div>
    </Modal>}
    {edit&&<Modal title="Editar patrimônio" onClose={()=>setEdit(null)}>
      <QuickEdit item={edit} fields={[{k:"descricao",l:"Descrição",full:true},{k:"categoria",l:"Categoria",t:"select",opts:["Caixa em banco","Conta corrente","Investimento CDB/CDI","Poupança","Outros"]},{k:"valor",l:"Valor (R$)",t:"number"},{k:"rendimento_mensal",l:"Rendimento/mês (R$)",t:"number"},{k:"data",l:"Data",t:"date"},{k:"observacoes",l:"Observações",full:true}]} onSave={saveEdit} onClose={()=>setEdit(null)}/>
    </Modal>}
  </div>;
}

// ─── FINANCEIRO ───────────────────────────────────────────────────────────────
function Financeiro({caixaDB,custosDB,invDB}){
  const [aba,setAba]=useState("caixa");
  const patrimonioDB=useDB("patrimonio");
  const entradas=caixaDB.rows.filter(c=>c.tipo==="Entrada").reduce((s,c)=>s+(+c.valor),0);
  const saidas=caixaDB.rows.filter(c=>c.tipo==="Saída").reduce((s,c)=>s+(+c.valor),0);
  const custoTotal=custosDB.rows.reduce((s,c)=>s+(+c.valor),0);
  const invTotal=invDB.rows.reduce((s,i)=>s+(+i.valor),0);
  const resultado=entradas-saidas-custoTotal;
  const margem=entradas>0?((entradas-saidas-custoTotal)/entradas)*100:0;

  return <div style={{display:"flex",flexDirection:"column",gap:24}}>
    {(caixaDB.toast||custosDB.toast||invDB.toast)&&<Toast {...(caixaDB.toast||custosDB.toast||invDB.toast)}/>}
    <div><h1 style={{color:T.text,fontSize:24,fontWeight:800,margin:0}}>Financeiro</h1><p style={{color:T.sub,fontSize:14,marginTop:4}}>Caixa, custos e investimentos</p></div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:12}}>
      <KPI label="Entradas" value={fmtK(entradas)} sub="Receitas do caixa" color={T.green} icon="↗"/>
      <KPI label="Saídas" value={fmtK(saidas)} color={T.red} icon="↘"/>
      <KPI label="Custos fixos" value={fmtK(custoTotal)} color={T.amber} icon="▲"/>
      <KPI label="Resultado" value={fmtK(resultado)} sub={`Margem ${fmtPct(margem)}`} color={resultado>=0?T.green:T.red} icon="◆"/>
      <KPI label="Investimentos" value={fmtK(invTotal)} sub="Equip. e capacitação" color={T.blue} icon="◇"/>
      <KPI label="Patrimônio" value={fmtK(patrimonioDB.rows.reduce((s,i)=>s+(+i.valor||0),0))} sub="Guardado/rendendo" color={T.green} icon="💎"/>
    </div>
    <div style={{display:"flex",gap:0,borderBottom:`1px solid ${T.border}`}}>
      {[{id:"caixa",l:"💰 Caixa"},{id:"custos",l:"📋 Custos"},{id:"investimentos",l:"🔧 Investimentos"},{id:"patrimonio",l:"💎 Patrimônio"},{id:"dre",l:"📊 DRE"}].map(t=><button key={t.id} onClick={()=>setAba(t.id)} style={{background:"none",border:"none",borderBottom:aba===t.id?`2px solid ${T.accent}`:"2px solid transparent",color:aba===t.id?T.accentL:T.sub,fontFamily:F,fontWeight:600,fontSize:13,padding:"10px 18px",cursor:"pointer",marginBottom:-1,transition:"all 0.15s"}}>{t.l}</button>)}
    </div>
    {aba==="caixa"&&<CaixaTab db={caixaDB}/>}
    {aba==="custos"&&<CustosTab db={custosDB}/>}
    {aba==="investimentos"&&<InvestTab db={invDB}/>}
    {aba==="patrimonio"&&<PatrimonioTab db={patrimonioDB}/>}
    {aba==="dre"&&<DRETab caixa={caixaDB.rows} custos={custosDB.rows} inv={invDB.rows}/>}
  </div>;
}

function CaixaTab({db}){
  const [modal,setModal]=useState(false);
  const [edit,setEdit]=useState(null);
  const [form,setForm]=useState({data:today(),descricao:"",tipo:"Entrada",categoria:"Receita de Serviço",valor:""});
  const s=k=>e=>setForm(f=>({...f,[k]:e.target.value}));
  const save=async()=>{if(!form.descricao||!form.valor)return;await db.add({...form,valor:+form.valor});setModal(false);setForm({data:today(),descricao:"",tipo:"Entrada",categoria:"Receita de Serviço",valor:""});};
  const saveEdit=async f=>{await db.update(edit.id,{...f,valor:+f.valor});setEdit(null);};

  // Agrupa por cliente para mostrar origem
  const rows=[...db.rows].sort((a,b)=>(b.data||"").localeCompare(a.data||""));

  return <div style={{display:"flex",flexDirection:"column",gap:14}}>
    <div style={{background:T.accentBg,border:`1px solid ${T.accent}33`,borderRadius:10,padding:"10px 16px",fontSize:12,color:T.accentL}}>
      💡 Lançamentos de clientes (avulsos e mensalidades) aparecem aqui automaticamente.
    </div>
    <div style={{display:"flex",justifyContent:"flex-end"}}><Btn small onClick={()=>setModal(true)}>+ Lançamento manual</Btn></div>
    <Card style={{padding:0}}>
      <Table cols={[
        {key:"data",label:"Data"},
        {key:"descricao",label:"Descrição",render:(v,r)=><div><div style={{fontWeight:600}}>{v}</div><div style={{fontSize:11,color:T.muted}}>{r.categoria}</div></div>},
        {key:"tipo",label:"Tipo",render:v=><Badge color={v==="Entrada"?T.green:T.red}>{v}</Badge>},
        {key:"valor",label:"Valor",align:"right",render:(v,r)=><span style={{fontFamily:M,fontWeight:700,color:r.tipo==="Entrada"?T.green:T.red}}>{r.tipo==="Entrada"?"+":"-"}{fmt(v)}</span>},
        {key:"id",label:"",align:"right",render:(v,r)=><div style={{display:"flex",gap:6}}><Btn variant="soft" small onClick={()=>setEdit(r)}>✎</Btn><Btn variant="danger" small onClick={()=>db.remove(v)}>✕</Btn></div>},
      ]} rows={rows}/>
    </Card>
    {modal&&<Modal title="Lançamento manual" onClose={()=>setModal(false)}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
        <Inp label="Data" type="date" value={form.data} onChange={s("data")}/>
        <Sel label="Tipo" value={form.tipo} onChange={s("tipo")} options={["Entrada","Saída"]}/>
        <Inp label="Descrição *" full value={form.descricao} onChange={s("descricao")}/>
        <Sel label="Categoria" value={form.categoria} onChange={s("categoria")} options={["Receita de Serviço","Projeto Avulso","Aluguel","Pessoal","TI / Software","Marketing","Outros"]}/>
        <Inp label="Valor (R$) *" type="number" value={form.valor} onChange={s("valor")}/>
      </div>
      <div style={{display:"flex",gap:8,marginTop:20,justifyContent:"flex-end"}}><Btn variant="ghost" onClick={()=>setModal(false)}>Cancelar</Btn><Btn onClick={save}>Salvar</Btn></div>
    </Modal>}
    {edit&&<Modal title="Editar lançamento" onClose={()=>setEdit(null)}>
      <QuickEdit item={edit} fields={[{k:"data",l:"Data",t:"date"},{k:"tipo",l:"Tipo",t:"select",opts:["Entrada","Saída"]},{k:"descricao",l:"Descrição",full:true},{k:"categoria",l:"Categoria",t:"select",opts:["Receita de Serviço","Projeto Avulso","Aluguel","Pessoal","TI / Software","Marketing","Outros"]},{k:"valor",l:"Valor (R$)",t:"number"}]} onSave={saveEdit} onClose={()=>setEdit(null)}/>
    </Modal>}
  </div>;
}

function CustosTab({db}){
  const [modal,setModal]=useState(false);
  const [edit,setEdit]=useState(null);
  const [form,setForm]=useState({nome:"",categoria:"Pessoal",valor:"",recorrente:false,mes:today().slice(0,7)});
  const s=k=>e=>setForm(f=>({...f,[k]:e.target.value}));
  const save=async()=>{if(!form.nome||!form.valor)return;await db.add({...form,valor:+form.valor});setModal(false);};
  const saveEdit=async f=>{await db.update(edit.id,{...f,valor:+f.valor,recorrente:f.recorrente==="true"||f.recorrente===true});setEdit(null);};
  const total=db.rows.reduce((s,c)=>s+(+c.valor),0);
  const fixos=db.rows.filter(c=>c.recorrente===true||c.recorrente==="true").reduce((s,c)=>s+(+c.valor),0);

  return <div style={{display:"flex",flexDirection:"column",gap:14}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
      <div style={{fontSize:13,color:T.sub}}>Total: <strong style={{color:T.amber}}>{fmt(total)}</strong> · Fixos: {fmt(fixos)} · Variáveis: {fmt(total-fixos)}</div>
      <Btn small onClick={()=>setModal(true)}>+ Custo</Btn>
    </div>
    <Card style={{padding:0}}>
      <Table cols={[
        {key:"nome",label:"Descrição"},
        {key:"categoria",label:"Categoria",render:v=><Badge color={T.amber}>{v}</Badge>},
        {key:"mes",label:"Mês"},
        {key:"recorrente",label:"Tipo",render:v=><Badge color={(v===true||v==="true")?T.red:T.muted}>{(v===true||v==="true")?"Fixo":"Variável"}</Badge>},
        {key:"valor",label:"Valor",align:"right",render:v=><span style={{fontFamily:M,fontWeight:700,color:T.amber}}>{fmt(v)}</span>},
        {key:"id",label:"",align:"right",render:(v,r)=><div style={{display:"flex",gap:6}}><Btn variant="soft" small onClick={()=>setEdit(r)}>✎</Btn><Btn variant="danger" small onClick={()=>db.remove(v)}>✕</Btn></div>},
      ]} rows={db.rows}/>
    </Card>
    {modal&&<Modal title="Novo Custo" onClose={()=>setModal(false)}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
        <Inp label="Descrição *" full value={form.nome} onChange={s("nome")}/>
        <Sel label="Categoria" value={form.categoria} onChange={s("categoria")} options={["Pessoal","Aluguel","TI / Software","Marketing","Administrativo","Logística","Outros"]}/>
        <Inp label="Valor (R$) *" type="number" value={form.valor} onChange={s("valor")}/>
        <Inp label="Mês" type="month" value={form.mes} onChange={s("mes")}/>
        <Sel label="Tipo" value={form.recorrente} onChange={e=>setForm(f=>({...f,recorrente:e.target.value==="true"}))} options={[{value:"false",label:"Variável"},{value:"true",label:"Fixo (recorrente)"}]}/>
      </div>
      <div style={{display:"flex",gap:8,marginTop:20,justifyContent:"flex-end"}}><Btn variant="ghost" onClick={()=>setModal(false)}>Cancelar</Btn><Btn onClick={save}>Salvar</Btn></div>
    </Modal>}
    {edit&&<Modal title="Editar custo" onClose={()=>setEdit(null)}><QuickEdit item={edit} fields={[{k:"nome",l:"Descrição",full:true},{k:"categoria",l:"Categoria",t:"select",opts:["Pessoal","Aluguel","TI / Software","Marketing","Administrativo","Logística","Outros"]},{k:"valor",l:"Valor (R$)",t:"number"},{k:"mes",l:"Mês",t:"month"}]} onSave={saveEdit} onClose={()=>setEdit(null)}/></Modal>}
  </div>;
}

function InvestTab({db}){
  const [modal,setModal]=useState(false);
  const [edit,setEdit]=useState(null);
  const [form,setForm]=useState({descricao:"",categoria:"Equipamento",valor:"",data:today(),retorno_esperado:""});
  const s=k=>e=>setForm(f=>({...f,[k]:e.target.value}));
  const save=async()=>{if(!form.descricao||!form.valor)return;await db.add({...form,valor:+form.valor});setModal(false);};
  const saveEdit=async f=>{await db.update(edit.id,{...f,valor:+f.valor});setEdit(null);};
  const total=db.rows.reduce((s,i)=>s+(+i.valor),0);

  return <div style={{display:"flex",flexDirection:"column",gap:14}}>
    <div style={{background:T.blueBg,border:`1px solid ${T.blue}33`,borderRadius:10,padding:"10px 16px",fontSize:12,color:T.blue}}>
      💡 Registre aqui equipamentos comprados, cursos, ferramentas, infraestrutura — tudo que você investe na empresa.
    </div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
      <div style={{fontSize:13,color:T.sub}}>Total investido na empresa: <strong style={{color:T.blue,fontFamily:M}}>{fmt(total)}</strong></div>
      <Btn small onClick={()=>setModal(true)}>+ Novo investimento</Btn>
    </div>
    <Card style={{padding:0}}>
      <Table cols={[
        {key:"descricao",label:"Descrição"},
        {key:"categoria",label:"Categoria",render:v=><Badge color={T.blue}>{v}</Badge>},
        {key:"data",label:"Data"},
        {key:"retorno_esperado",label:"Retorno / Obs.",render:v=><span style={{fontSize:12,color:T.muted}}>{v}</span>},
        {key:"valor",label:"Valor",align:"right",render:v=><span style={{fontFamily:M,fontWeight:700,color:T.blue}}>{fmt(v)}</span>},
        {key:"id",label:"",align:"right",render:(v,r)=><div style={{display:"flex",gap:6}}><Btn variant="soft" small onClick={()=>setEdit(r)}>✎</Btn><Btn variant="danger" small onClick={()=>db.remove(v)}>✕</Btn></div>},
      ]} rows={db.rows}/>
    </Card>
    {modal&&<Modal title="Novo investimento na empresa" onClose={()=>setModal(false)}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
        <Inp label="Descrição *" full value={form.descricao} onChange={s("descricao")} placeholder="Ex: Notebook, Curso de Marketing, Adobe Suite..."/>
        <Sel label="Categoria" value={form.categoria} onChange={s("categoria")} options={["Equipamento","Capacitação / Curso","Infraestrutura","Marketing","Tecnologia","Software","Outros"]}/>
        <Inp label="Valor (R$) *" type="number" value={form.valor} onChange={s("valor")}/>
        <Inp label="Data" type="date" value={form.data} onChange={s("data")}/>
        <Inp label="Retorno / Observação" full value={form.retorno_esperado} onChange={s("retorno_esperado")} placeholder="Ex: Aumenta produtividade, necessário para projeto X..."/>
      </div>
      <div style={{display:"flex",gap:8,marginTop:20,justifyContent:"flex-end"}}><Btn variant="ghost" onClick={()=>setModal(false)}>Cancelar</Btn><Btn onClick={save}>Salvar</Btn></div>
    </Modal>}
    {edit&&<Modal title="Editar" onClose={()=>setEdit(null)}><QuickEdit item={edit} fields={[{k:"descricao",l:"Descrição",full:true},{k:"categoria",l:"Categoria",t:"select",opts:["Patrimônio em Banco","Equipamento","Capacitação","Infraestrutura","Marketing","Tecnologia","Outros"]},{k:"valor",l:"Valor (R$)",t:"number"},{k:"data",l:"Data",t:"date"},{k:"retorno_esperado",l:"Retorno / Obs.",full:true}]} onSave={saveEdit} onClose={()=>setEdit(null)}/></Modal>}
  </div>;
}

function DRETab({caixa,custos,inv}){
  const receitas=caixa.filter(c=>c.tipo==="Entrada").reduce((s,c)=>s+(+c.valor),0);
  const custosDiretos=custos.filter(c=>["Pessoal","TI / Software"].includes(c.categoria)).reduce((s,c)=>s+(+c.valor),0);
  const lucroBruto=receitas-custosDiretos;
  const despOp=custos.filter(c=>!["Pessoal","TI / Software"].includes(c.categoria)).reduce((s,c)=>s+(+c.valor),0);
  const ebitda=lucroBruto-despOp;
  const invTotal=inv.reduce((s,i)=>s+(+i.valor),0);
  const lucroLiq=ebitda;
  const linhas=[
    {label:"Receita total (caixa)",valor:receitas,destaque:true,color:T.green},
    {label:"(-) Custos diretos (pessoal + TI)",valor:-custosDiretos,color:T.red},
    {label:"= Lucro bruto",valor:lucroBruto,destaque:true,color:lucroBruto>=0?T.green:T.red,sub:`Margem ${fmtPct(receitas>0?(lucroBruto/receitas)*100:0)}`},
    {label:"(-) Despesas operacionais",valor:-despOp,color:T.amber},
    {label:"= Resultado operacional (EBITDA)",valor:ebitda,destaque:true,color:ebitda>=0?T.green:T.red,sub:`Margem ${fmtPct(receitas>0?(ebitda/receitas)*100:0)}`},
    {label:"Patrimônio investido (referência)",valor:invTotal,color:T.blue,info:true},
  ];
  return <Card>
    {linhas.map((l,i)=><div key={i}>
      {l.destaque&&i>0&&<div style={{height:1,background:T.border,margin:"8px 0"}}/>}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:l.destaque?"12px 16px":"7px 16px",background:l.destaque?T.surface:l.info?T.blueBg:"transparent",borderRadius:l.destaque||l.info?10:0,margin:l.destaque||l.info?"4px 0":0}}>
        <div><span style={{fontSize:l.destaque?14:13,color:l.destaque?T.text:T.sub,fontWeight:l.destaque?600:400}}>{l.label}</span>{l.sub&&<div style={{fontSize:11,color:T.muted,marginTop:2}}>{l.sub}</div>}</div>
        <span style={{fontFamily:M,fontWeight:l.destaque?700:400,fontSize:l.destaque?16:13,color:l.color}}>{fmt(Math.abs(l.valor))}</span>
      </div>
      {l.destaque&&<div style={{height:1,background:T.border,margin:"8px 0"}}/>}
    </div>)}
  </Card>;
}

// ─── CRM ──────────────────────────────────────────────────────────────────────
function CRM({clientesAdd}){
  const {rows,loading,add,update,remove,toast}=useDB("leads");
  const [view,setView]=useState("kanban");
  const [modal,setModal]=useState(false);
  const [edit,setEdit]=useState(null);
  const [search,setSearch]=useState("");
  const [form,setForm]=useState({...EMPTY_LEAD});
  const s=k=>e=>setForm(f=>({...f,[k]:e.target.value}));

  const save=async()=>{if(!form.empresa)return;await add({...form,valor_estimado:+form.valor_estimado||0,duracao_meses:+form.duracao_meses||1});setModal(false);setForm({...EMPTY_LEAD});};
  const saveEdit=async f=>{await update(edit.id,{...f,valor_estimado:+f.valor_estimado||0});setEdit(null);};
  const moveEtapa=async(id,etapa)=>{
    const r=rows.find(x=>x.id===id);
    if(!r) return;
    await update(id,{...r,etapa});
    if(etapa==="Fechado" && r.etapa!=="Fechado" && clientesAdd){
      const criado = await clientesAdd({
        ...EMPTY_C,
        nome:r.empresa,
        contato:r.contato||"",
        email:r.email||"",
        telefone:r.telefone||"",
        valor_mensal:+r.valor_estimado||0,
        tipo_contrato:r.tipo_contrato||"Fee Mensal",
        duracao_meses:+r.duracao_meses||1,
        mes_atual:0,
        inicio:today(),
        status:"Ativo",
        status_saude:"verde",
        satisfacao:3,
      });
      if(criado) alert("✓ "+r.empresa+" foi cadastrado automaticamente em Clientes!");
    }
  };

  // Fechar lead e virar cliente com 1 clique
  const fecharComoCliente=async(lead)=>{
    if(!clientesAdd) return;
    const criado = await clientesAdd({
      ...EMPTY_C,
      nome:lead.empresa||"",
      contato:lead.contato||"",
      email:lead.email||"",
      telefone:lead.telefone||"",
      segmento:"",
      valor_mensal:+lead.valor_estimado||0,
      tipo_contrato:lead.tipo_contrato||"Fee Mensal",
      duracao_meses:Math.max(+lead.duracao_meses||1,1),
      mes_atual:0,
      inicio:today(),
      status:"Ativo",
      status_saude:"verde",
      satisfacao:3,
      escopo_total:"",
      entregas:"",
      proposta_url:"",
      video_url:"",
      nota_saude:"",
      observacoes:"",
    });
    await update(lead.id,{...lead,etapa:"Fechado"});
    if(criado) alert("✓ "+lead.empresa+" cadastrado em Clientes! Abra a ficha para completar os dados.");
  };

  const pipeline=rows.filter(l=>!["Fechado","Perdido"].includes(l.etapa)).reduce((s,l)=>s+(+l.valor_estimado||0),0);
  const fechados=rows.filter(l=>l.etapa==="Fechado").reduce((s,l)=>s+(+l.valor_estimado||0),0);
  const taxa=rows.length>0?(rows.filter(l=>l.etapa==="Fechado").length/rows.length)*100:0;
  const filtered=rows.filter(l=>l.empresa?.toLowerCase().includes(search.toLowerCase())||(l.contato||"").toLowerCase().includes(search.toLowerCase()));

  return <div style={{display:"flex",flexDirection:"column",gap:24}}>
    {toast&&<Toast {...toast}/>}
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
      <div><h1 style={{color:T.text,fontSize:24,fontWeight:800,margin:0}}>CRM Comercial</h1><p style={{color:T.sub,fontSize:14,marginTop:4}}>{rows.length} leads · Pipeline {fmt(pipeline)}</p></div>
      <div style={{display:"flex",gap:8}}>
        <Pill active={view==="kanban"} onClick={()=>setView("kanban")}>⊞ Kanban</Pill>
        <Pill active={view==="list"} onClick={()=>setView("list")}>≡ Lista</Pill>
        <Btn onClick={()=>setModal(true)}>+ Novo lead</Btn>
      </div>
    </div>

    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:12}}>
      <KPI label="Pipeline" value={fmtK(pipeline)} color={T.accent} icon="◎"/>
      <KPI label="Fechados" value={fmtK(fechados)} color={T.green} icon="✓"/>
      <KPI label="Leads ativos" value={rows.filter(l=>!["Fechado","Perdido"].includes(l.etapa)).length} color={T.blue}/>
      <KPI label="Conversão" value={fmtPct(taxa)} color={T.purple}/>
    </div>

    <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar empresa ou contato..." style={{...iS,maxWidth:360}} onFocus={e=>e.target.style.borderColor=T.accent} onBlur={e=>e.target.style.borderColor=T.border}/>

    {loading?<div style={{color:T.sub,textAlign:"center",padding:48}}>Carregando...</div>:
    view==="kanban"?
    <div style={{display:"flex",gap:12,overflowX:"auto",paddingBottom:8}}>
      {ETAPAS.map(etapa=>{
        const etLeads=filtered.filter(l=>l.etapa===etapa);
        const cor=ETAPA_C[etapa];
        return <div key={etapa} style={{minWidth:230,flex:"0 0 230px",background:T.surface,border:`1px solid ${T.border}`,borderRadius:14,padding:14}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}><div style={{width:8,height:8,borderRadius:"50%",background:cor}}/><span style={{fontSize:13,fontWeight:700,color:T.text}}>{etapa}</span></div>
            <Badge color={cor}>{etLeads.length}</Badge>
          </div>
          {etLeads.length===0&&<div style={{color:T.dim,fontSize:12,textAlign:"center",padding:"16px 0"}}>Sem leads</div>}
          {etLeads.map(lead=><div key={lead.id} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:12,padding:12,marginBottom:8}}>
            <div style={{fontWeight:700,fontSize:13,color:T.text,marginBottom:4}}>{lead.empresa}</div>
            {lead.contato&&<div style={{fontSize:11,color:T.muted,marginBottom:6}}>{lead.contato}</div>}
            {lead.valor_estimado>0&&<div style={{fontSize:13,fontFamily:M,color:cor,marginBottom:6,fontWeight:700}}>{fmt(lead.valor_estimado)}</div>}
            {lead.origem&&<Badge color={T.blue}>{lead.origem}</Badge>}
            {lead.proximo_passo&&<div style={{fontSize:11,color:T.muted,marginTop:8,borderTop:`1px solid ${T.border}`,paddingTop:8}}>→ {lead.proximo_passo}</div>}
            <div style={{display:"flex",gap:4,marginTop:10,flexWrap:"wrap"}}>
              <Btn variant="soft" small onClick={()=>setEdit(lead)}>✎</Btn>
              <select onChange={e=>moveEtapa(lead.id,e.target.value)} value={lead.etapa} style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:6,color:T.sub,fontSize:11,padding:"4px 6px",fontFamily:F,cursor:"pointer",flex:1}}>
                {ETAPAS.map(e=><option key={e} value={e}>{e}</option>)}
              </select>
              <Btn variant="danger" small onClick={()=>remove(lead.id)}>✕</Btn>
            </div>
            {lead.etapa==="Negociação"&&<Btn variant="success" small full style={{marginTop:8}} onClick={()=>fecharComoCliente(lead)}>✓ Fechar e virar cliente</Btn>}
          </div>)}
        </div>;
      })}
    </div>:
    <Card style={{padding:0}}>
      <Table cols={[
        {key:"empresa",label:"Empresa",render:(v,r)=><div><div style={{fontWeight:600}}>{v}</div><div style={{fontSize:11,color:T.muted}}>{r.contato}</div></div>},
        {key:"etapa",label:"Etapa",render:v=><Badge color={ETAPA_C[v]||T.muted}>{v}</Badge>},
        {key:"origem",label:"Origem"},
        {key:"valor_estimado",label:"Valor",align:"right",render:v=><span style={{fontFamily:M,color:T.purple,fontWeight:700}}>{fmt(v)}</span>},
        {key:"proximo_passo",label:"Próximo passo",render:v=><span style={{fontSize:12,color:T.muted}}>{v}</span>},
        {key:"id",label:"",align:"right",render:(v,r)=><div style={{display:"flex",gap:6}}>
          {r.etapa==="Negociação"&&<Btn variant="success" small onClick={()=>fecharComoCliente(r)}>✓ Fechar</Btn>}
          <Btn variant="soft" small onClick={()=>setEdit(r)}>✎</Btn>
          <Btn variant="danger" small onClick={()=>remove(v)}>✕</Btn>
        </div>},
      ]} rows={filtered}/>
    </Card>}

    {modal&&<Modal title="Novo Lead" onClose={()=>setModal(false)} wide>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
        <Inp label="Empresa *" full value={form.empresa} onChange={s("empresa")}/>
        <Inp label="Contato" value={form.contato} onChange={s("contato")}/>
        <Inp label="Email" type="email" value={form.email} onChange={s("email")}/>
        <Inp label="Telefone" value={form.telefone} onChange={s("telefone")}/>
        <Sel label="Etapa" value={form.etapa} onChange={s("etapa")} options={ETAPAS}/>
        <Inp label="Valor estimado (R$)" type="number" value={form.valor_estimado} onChange={s("valor_estimado")}/>
        <Sel label="Tipo de contrato" value={form.tipo_contrato||"Fee Mensal"} onChange={s("tipo_contrato")} options={[{value:"Fee Mensal",label:"Fee Mensal (recorrente)"},{value:"Unitário",label:"Unitário (projeto com prazo)"}]}/>
        <Sel label="Duração estimada" value={form.duracao_meses||1} onChange={s("duracao_meses")} options={[1,2,3,6,12,24].map(n=>({value:n,label:`${n} ${n===1?"mês":"meses"}`}))}/>
        <Sel label="Origem" value={form.origem} onChange={s("origem")} options={["Indicação","LinkedIn","Site","Cold Outreach","Evento","Instagram","Outro"]}/>
        <Inp label="Data do contato" type="date" value={form.data_contato} onChange={s("data_contato")}/>
        <Inp label="Próximo passo" full value={form.proximo_passo} onChange={s("proximo_passo")}/>
        <Tex label="Observações" full value={form.observacoes} onChange={s("observacoes")}/>
      </div>
      <div style={{display:"flex",gap:8,marginTop:20,justifyContent:"flex-end"}}><Btn variant="ghost" onClick={()=>setModal(false)}>Cancelar</Btn><Btn onClick={save}>Salvar lead</Btn></div>
    </Modal>}
    {edit&&<Modal title={`Editar: ${edit.empresa}`} onClose={()=>setEdit(null)} wide>
      <QuickEdit item={edit} fields={[{k:"empresa",l:"Empresa",full:true},{k:"contato",l:"Contato"},{k:"email",l:"Email",t:"email"},{k:"telefone",l:"Telefone"},{k:"etapa",l:"Etapa",t:"select",opts:ETAPAS},{k:"valor_estimado",l:"Valor estimado",t:"number"},{k:"tipo_contrato",l:"Tipo de contrato",t:"select",opts:["Fee Mensal","Unitário"]},{k:"duracao_meses",l:"Duração (meses)",t:"number"},{k:"origem",l:"Origem",t:"select",opts:["Indicação","LinkedIn","Site","Cold Outreach","Evento","Instagram","Outro"]},{k:"proximo_passo",l:"Próximo passo",full:true},{k:"observacoes",l:"Observações",t:"textarea",full:true}]} onSave={saveEdit} onClose={()=>setEdit(null)}/>
    </Modal>}
  </div>;
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({clientes,caixa,custos,investimentos,leads,lancamentos,patrimonio}){
  const ativos=clientes.filter(c=>c.status==="Ativo");
  const mrr=ativos.reduce((s,c)=>s+(+c.valor_mensal||0),0);
  const entradas=caixa.filter(c=>c.tipo==="Entrada").reduce((s,c)=>s+(+c.valor),0);
  const receitaClientes=ativos.reduce((s,c)=>s+(+c.valor_total_pago||0),0);
  const saidas=caixa.filter(c=>c.tipo==="Saída").reduce((s,c)=>s+(+c.valor),0);
  const custoTotal=custos.reduce((s,c)=>s+(+c.valor),0);
  const invTotal=investimentos.reduce((s,i)=>s+(+i.valor),0);
  const resultado=entradas-saidas-custoTotal;
  const margem=entradas>0?(resultado/entradas)*100:0;
  const pipeline=leads.filter(l=>!["Fechado","Perdido"].includes(l.etapa)).reduce((s,l)=>s+(+l.valor_estimado||0),0);
  const totalRecebido=ativos.reduce((s,c)=>s+(+c.valor_total_pago||0),0);
  const avulsosTotal=lancamentos.filter(l=>l.tipo==="Receita").reduce((s,l)=>s+(+l.valor||0),0);

  const porSaude=s=>ativos.filter(c=>c.status_saude===s).length;
  const criticos=ativos.filter(c=>c.status_saude==="vermelho");
  const atencao=ativos.filter(c=>c.status_saude==="amarelo");
  const avgSat=ativos.length>0?(ativos.reduce((s,c)=>s+(+c.satisfacao||0),0)/ativos.length).toFixed(1):0;

  const monthlyMap={};
  caixa.forEach(c=>{const m=c.data?.slice(0,7)||"";if(!m)return;if(!monthlyMap[m])monthlyMap[m]={label:m.slice(5),entrada:0,saida:0};if(c.tipo==="Entrada")monthlyMap[m].entrada+=(+c.valor);else monthlyMap[m].saida+=(+c.valor);});
  const monthly=Object.values(monthlyMap).sort((a,b)=>a.label.localeCompare(b.label)).slice(-6);

  return <div style={{display:"flex",flexDirection:"column",gap:24}}>
    <div><h1 style={{color:T.text,fontSize:24,fontWeight:800,margin:0}}>Dashboard</h1><p style={{color:T.sub,fontSize:14,marginTop:4}}>Visão executiva · tudo integrado em tempo real</p></div>

    {/* Alertas */}
    {(criticos.length>0||atencao.length>0)&&<div style={{background:T.redBg,border:`1px solid ${T.red}33`,borderRadius:14,padding:"14px 18px",display:"flex",alignItems:"center",gap:16,flexWrap:"wrap"}}>
      <span style={{fontSize:14,color:T.red,fontWeight:700}}>⚠️ {criticos.length+atencao.length} cliente(s) precisam de atenção</span>
      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
        {[...criticos,...atencao].map(c=><Badge key={c.id} color={SAUDE[c.status_saude].color}>{SAUDE[c.status_saude].emoji} {c.nome}</Badge>)}
      </div>
    </div>}

    {/* KPIs */}
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:12}}>
      <KPI label="Total entradas" value={fmtK(entradas)} sub={`Tudo que entrou no caixa`} color={T.green} icon="↗"/>
      <KPI label="MRR" value={fmtK(mrr)} sub={`${ativos.length} clientes ativos`} color={T.blue} icon="◆"/>
      <KPI label="Pipeline CRM" value={fmtK(pipeline)} sub={`${leads.filter(l=>!["Fechado","Perdido"].includes(l.etapa)).length} leads abertos`} color={T.purple} icon="◎"/>
      <KPI label="Investimentos" value={fmtK(invTotal)} sub="Equip. e capacitação" color={T.blue} icon="◇"/>
      <KPI label="Patrimônio" value={fmtK((patrimonio||[]).reduce((s,i)=>s+(+i.valor||0),0))} sub="Guardado/rendendo" color={T.green} icon="💎"/>
      <KPI label="Resultado" value={fmtK(resultado)} sub={`Margem ${fmtPct(margem)}`} color={T.green} icon="✓"/>
    </div>

    {/* Saúde + Receita */}
    <div style={{display:"grid",gridTemplateColumns:"1fr 2fr",gap:16}}>
      <Card>
        <div style={{fontSize:13,fontWeight:700,color:T.text,marginBottom:18}}>Saúde da carteira</div>
        {[["verde","🟢 Saudáveis",T.green],["amarelo","🟡 Atenção",T.amber],["vermelho","🔴 Críticos",T.red]].map(([k,l,c])=><div key={k} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <span style={{fontSize:13,color:T.sub}}>{l}</span>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:60}}><MiniBar value={porSaude(k)} max={ativos.length||1} color={c}/></div>
            <span style={{fontSize:18,fontWeight:800,color:c,fontFamily:M,minWidth:24,textAlign:"right"}}>{porSaude(k)}</span>
          </div>
        </div>)}
        <div style={{height:1,background:T.border,margin:"12px 0"}}/>
        <div style={{fontSize:12,color:T.muted}}>Satisfação média: <strong style={{color:T.amber}}>{avgSat} ★</strong></div>
      </Card>
      <Card>
        <div style={{fontSize:13,fontWeight:700,color:T.text,marginBottom:4}}>Receita mensal</div>
        <p style={{color:T.muted,fontSize:12,margin:"0 0 14px"}}>Últimos 6 meses · entradas no caixa</p>
        {monthly.length===0?<div style={{color:T.muted,fontSize:13,textAlign:"center",padding:"24px 0"}}>Adicione lançamentos para ver o gráfico</div>:<>
          <LineArea data={monthly.map(m=>m.entrada)} color={T.green} h={90}/>
          <div style={{display:"flex",gap:4,marginTop:8}}>{monthly.map((m,i)=><div key={i} style={{flex:1,textAlign:"center",fontSize:10,color:T.muted}}>{m.label}</div>)}</div>
        </>}
      </Card>
    </div>

    {/* Alertas detalhe + Top clientes */}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
      <Card>
        <div style={{fontSize:13,fontWeight:700,color:T.text,marginBottom:16}}>Clientes que precisam de atenção</div>
        {criticos.length===0&&atencao.length===0?<div style={{color:T.green,fontSize:13}}>✓ Todos os clientes estão saudáveis!</div>:
        [...criticos,...atencao].slice(0,5).map(c=>{
          const s=SAUDE[c.status_saude]||SAUDE.verde;
          return <div key={c.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10,padding:"10px 14px",background:s.bg,borderRadius:10,border:`1px solid ${s.color}22`}}>
            <div><div style={{fontSize:13,fontWeight:600,color:T.text}}>{c.nome}</div>{c.nota_saude&&<div style={{fontSize:11,color:T.muted,marginTop:2}}>{c.nota_saude.slice(0,50)}...</div>}</div>
            <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4}}>
              <Badge color={s.color}>{s.emoji}</Badge>
              <span style={{fontSize:11,color:T.muted,fontFamily:M}}>{fmt(c.valor_mensal)}/mês</span>
            </div>
          </div>;
        })}
      </Card>
      <Card>
        <div style={{fontSize:13,fontWeight:700,color:T.text,marginBottom:16}}>Top clientes por MRR</div>
        {ativos.length===0?<div style={{color:T.muted,fontSize:13}}>Sem clientes ativos</div>:
        [...ativos].sort((a,b)=>(+b.valor_mensal||0)-(+a.valor_mensal||0)).slice(0,5).map((c,i)=><div key={c.id} style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
          <div style={{width:26,height:26,borderRadius:"50%",background:T.accentBg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:T.accentL,fontWeight:800,flexShrink:0}}>{i+1}</div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:13,color:T.text,marginBottom:4,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.nome}</div>
            <MiniBar value={+c.valor_mensal||0} max={Math.max(...ativos.map(x=>+x.valor_mensal||0),1)} color={T.accent}/>
          </div>
          <span style={{fontFamily:M,fontSize:13,color:T.accentL,flexShrink:0,fontWeight:700}}>{fmt(c.valor_mensal)}</span>
        </div>)}
      </Card>
    </div>

    {/* Resumo financeiro */}
    <Card>
      <div style={{fontSize:13,fontWeight:700,color:T.text,marginBottom:16}}>Resumo financeiro consolidado</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:12}}>
        {[["MRR esperado",mrr,T.green],["Total recebido clientes",totalRecebido,T.accent],["Avulsos no período",avulsosTotal,T.purple],["Total entradas caixa",entradas,T.green],["Total custos",custoTotal,T.amber],["Resultado",resultado,resultado>=0?T.green:T.red],["Patrimônio investido",invTotal,T.blue]].map(([l,v,c])=><div key={l} style={{background:T.surface,borderRadius:12,padding:"12px 16px"}}>
          <div style={{fontSize:11,color:T.muted,marginBottom:6,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em"}}>{l}</div>
          <div style={{fontSize:16,fontWeight:800,color:c,fontFamily:M}}>{fmt(v)}</div>
        </div>)}
      </div>
    </Card>
  </div>;
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function QuickEdit({item,fields,onSave,onClose}){
  const [form,setForm]=useState({...item});
  const [saving,setSaving]=useState(false);
  const set=k=>e=>setForm(f=>({...f,[k]:e.target.value}));
  return <div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
      {fields.map(f=>{
        if(f.t==="select") return <Sel key={f.k} label={f.l} full={f.full} value={form[f.k]??""} onChange={set(f.k)} options={f.opts}/>;
        if(f.t==="textarea") return <Tex key={f.k} label={f.l} full={f.full} value={form[f.k]??""} onChange={set(f.k)}/>;
        return <Inp key={f.k} label={f.l} full={f.full} type={f.t||"text"} value={form[f.k]??""} onChange={set(f.k)}/>;
      })}
    </div>
    <div style={{display:"flex",gap:8,marginTop:22,justifyContent:"flex-end"}}>
      <Btn variant="ghost" onClick={onClose}>Cancelar</Btn>
      <Btn onClick={async()=>{setSaving(true);await onSave(form);setSaving(false);}} disabled={saving}>{saving?"Salvando...":"Salvar"}</Btn>
    </div>
  </div>;
}

// ─── NAV + ROOT ───────────────────────────────────────────────────────────────
const NAV=[
  {id:"dashboard",label:"Dashboard",icon:"▣"},
  {id:"clientes",label:"Clientes",icon:"◉"},
  {id:"financeiro",label:"Financeiro",icon:"◆"},
  {id:"crm",label:"CRM",icon:"◎"},
];

export default function App(){
  const [page,setPage]=useState("dashboard");
  const [collapsed,setCollapsed]=useState(false);
  const [user,setUser]=useState(undefined); // undefined=loading, null=not logged in

  useEffect(()=>{
    // Check for OAuth callback token in URL
    const hash = window.location.hash;
    if(hash && hash.includes("access_token")) {
      const params = new URLSearchParams(hash.replace("#",""));
      const token = params.get("access_token");
      const refresh = params.get("refresh_token");
      if(token) {
        const key = `sb-${SB.split("//")[1].split(".")[0]}-auth-token`;
        localStorage.setItem(key, JSON.stringify({access_token:token,refresh_token:refresh}));
        window.location.hash = "";
      }
    }
    getSession().then(u=>setUser(u||null));
  },[]);

  const logout = () => {
    const key = `sb-${SB.split("//")[1].split(".")[0]}-auth-token`;
    localStorage.removeItem(key);
    setUser(null);
  };

  // All hooks MUST be called before any conditional returns (React rules)
  const clientesDB=useDB("clientes");
  const caixaDB=useDB("caixa");
  const custosDB=useDB("custos");
  const invDB=useDB("investimentos");
  const leadsDB=useDB("leads");
  const lancDB=useDB("lancamentos_clientes");
  const patrimonioDBroot=useDB("patrimonio");

  if(user===undefined) return (
    <div style={{minHeight:"100vh",background:"#080808",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:16}}>
      <div style={{width:48,height:48,borderRadius:14,background:"linear-gradient(135deg,#6aaa3a,#7c3aed)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>🌱</div>
      <div style={{color:"rgba(255,255,255,0.4)",fontSize:14,fontFamily:F}}>Carregando...</div>
    </div>
  );

  if(!user) return <LoginScreen/>;

  // Função que adiciona no caixa (passada para componentes filhos)
  const caixaAdd=async(row)=>{
    return await caixaDB.add(row);
  };

  // Função que adiciona cliente (passada para o CRM)
  const clientesAdd=async(row)=>{
    return await clientesDB.add(row);
  };

  const pages={
    dashboard:<Dashboard clientes={clientesDB.rows} caixa={caixaDB.rows} custos={custosDB.rows} investimentos={invDB.rows} leads={leadsDB.rows} lancamentos={lancDB.rows} patrimonio={patrimonioDBroot.rows}/>,
    clientes:<Clientes caixaAdd={caixaAdd}/>,
    financeiro:<Financeiro caixaDB={caixaDB} custosDB={custosDB} invDB={invDB}/>,
    crm:<CRM clientesAdd={clientesAdd}/>,
  };

  return <div style={{display:"flex",minHeight:"100vh",background:T.bg,fontFamily:F,color:T.text}}>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet"/>

    <aside style={{width:collapsed?60:220,background:T.surface,borderRight:`1px solid ${T.border}`,display:"flex",flexDirection:"column",transition:"width 0.2s",flexShrink:0,overflow:"hidden"}}>
      <div style={{padding:collapsed?"20px 0":"20px 20px",borderBottom:`1px solid ${T.border}`,display:"flex",alignItems:"center",justifyContent:collapsed?"center":"space-between",minHeight:68}}>
        {!collapsed&&<div>
          <div style={{fontSize:16,fontWeight:800,color:T.text,letterSpacing:"-0.02em"}}>Agência<span style={{color:T.accent}}>OS</span></div>
          <div style={{fontSize:11,color:T.green,marginTop:2}}>● Conectado</div>
        </div>}
        <button onClick={()=>setCollapsed(c=>!c)} style={{background:"transparent",border:"none",color:T.muted,cursor:"pointer",fontSize:16,padding:4,lineHeight:1,flexShrink:0}}>{collapsed?"→":"←"}</button>
      </div>

      <nav style={{flex:1,padding:"12px 0"}}>
        {NAV.map(item=><button key={item.id} onClick={()=>setPage(item.id)} style={{width:"100%",background:page===item.id?T.accentBg:"transparent",border:"none",borderLeft:page===item.id?`2px solid ${T.accent}`:"2px solid transparent",color:page===item.id?T.accentL:T.sub,padding:collapsed?"13px 0":"13px 20px",display:"flex",alignItems:"center",justifyContent:collapsed?"center":"flex-start",gap:12,cursor:"pointer",fontFamily:F,fontSize:13,fontWeight:page===item.id?700:500,textAlign:"left",transition:"all 0.15s"}}>
          <span style={{fontSize:16,flexShrink:0}}>{item.icon}</span>
          {!collapsed&&<span style={{whiteSpace:"nowrap"}}>{item.label}</span>}
        </button>)}
      </nav>

      {!collapsed&&<div style={{padding:"14px 20px",borderTop:`1px solid ${T.border}`}}>
        <div style={{fontSize:11,color:T.sub,marginBottom:8,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>👤 {user?.email||""}</div>
        <button onClick={logout} style={{background:"transparent",border:`1px solid ${T.border}`,borderRadius:8,color:T.muted,fontSize:11,padding:"5px 10px",cursor:"pointer",fontFamily:F,width:"100%",marginBottom:8}}>Sair da conta</button>
        <div style={{fontSize:10,color:T.dim,lineHeight:1.6}}>Dados salvos · Supabase 🇧🇷</div>
      </div>}
    </aside>

    <main style={{flex:1,overflowY:"auto",padding:"36px 40px",minWidth:0}}>
      {pages[page]}
    </main>
  </div>;
}
