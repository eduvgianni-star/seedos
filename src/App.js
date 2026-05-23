import { useState, useEffect } from "react";

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const SB_URL = "https://szaasnrwguvhpehukaws.supabase.co";
const SB_KEY = "sb_publishable_ZRy3r0IbxlShDwL2gSpmWw_mg9OIWNA";

const F = "'Inter', sans-serif";
const M = "'JetBrains Mono', monospace";

const T = {
  bg:       "#070710",
  surface:  "#0e0e1a",
  card:     "#13131f",
  cardHov:  "#18182a",
  border:   "#1e1e30",
  borderHov:"#2a2a42",
  accent:   "#6366f1",
  accentL:  "#818cf8",
  accentBg: "#6366f115",
  green:    "#22c55e",
  greenBg:  "#22c55e12",
  red:      "#ef4444",
  redBg:    "#ef444412",
  amber:    "#f59e0b",
  amberBg:  "#f59e0b12",
  blue:     "#3b82f6",
  blueBg:   "#3b82f612",
  purple:   "#a855f7",
  purpleBg: "#a855f712",
  text:     "#f1f1f8",
  sub:      "#9090b0",
  muted:    "#5a5a78",
  dim:      "#2a2a3e",
};

const fmt = n => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n || 0);
const fmtK = n => n >= 1000 ? `R$${(n/1000).toFixed(1)}k` : fmt(n);
const fmtPct = n => `${(n || 0).toFixed(1)}%`;
const today = () => new Date().toISOString().split("T")[0];

const SAUDE = {
  verde:   { color: T.green,  bg: T.greenBg,  label: "Saudável", emoji: "🟢" },
  amarelo: { color: T.amber,  bg: T.amberBg,  label: "Atenção",  emoji: "🟡" },
  vermelho:{ color: T.red,    bg: T.redBg,    label: "Crítico",  emoji: "🔴" },
};

// ─── SUPABASE ─────────────────────────────────────────────────────────────────
const db = {
  async get(table, query = "") {
    const r = await fetch(`${SB_URL}/rest/v1/${table}?order=id.asc${query}`, {
      headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` }
    });
    if (!r.ok) throw new Error(await r.text());
    return r.json();
  },
  async insert(table, row) {
    const { id, created_at, ...data } = row;
    const r = await fetch(`${SB_URL}/rest/v1/${table}`, {
      method: "POST",
      headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, "Content-Type": "application/json", Prefer: "return=representation" },
      body: JSON.stringify(data)
    });
    if (!r.ok) throw new Error(await r.text());
    return (await r.json())[0];
  },
  async update(table, id, row) {
    const { id: _id, created_at, ...data } = row;
    const r = await fetch(`${SB_URL}/rest/v1/${table}?id=eq.${id}`, {
      method: "PATCH",
      headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, "Content-Type": "application/json", Prefer: "return=representation" },
      body: JSON.stringify(data)
    });
    if (!r.ok) throw new Error(await r.text());
    return (await r.json())[0];
  },
  async delete(table, id) {
    const r = await fetch(`${SB_URL}/rest/v1/${table}?id=eq.${id}`, {
      method: "DELETE",
      headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` }
    });
    if (!r.ok) throw new Error(await r.text());
  }
};

function useDB(table) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const notify = (msg, type = "ok") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  useEffect(() => {
    db.get(table).then(d => { setRows(d); setLoading(false); }).catch(() => setLoading(false));
  }, [table]);

  const add = async row => {
    notify("Salvando...", "loading");
    try { const s = await db.insert(table, row); setRows(r => [...r, s]); notify("Salvo!"); return s; }
    catch { notify("Erro ao salvar", "err"); }
  };
  const update = async (id, row) => {
    notify("Salvando...", "loading");
    try { const s = await db.update(table, id, row); setRows(r => r.map(x => x.id === id ? s : x)); notify("Atualizado!"); return s; }
    catch { notify("Erro", "err"); }
  };
  const remove = async id => {
    try { await db.delete(table, id); setRows(r => r.filter(x => x.id !== id)); notify("Removido!"); }
    catch { notify("Erro", "err"); }
  };

  return { rows, loading, add, update, remove, toast };
}

// ─── UI ATOMS ─────────────────────────────────────────────────────────────────
function Toast({ msg, type }) {
  const colors = { ok: T.green, err: T.red, loading: T.amber };
  const icons = { ok: "✓", err: "✕", loading: "⟳" };
  return (
    <div style={{ position: "fixed", bottom: 28, right: 28, zIndex: 999, background: T.card, border: `1px solid ${colors[type]}44`, borderRadius: 12, padding: "12px 20px", display: "flex", alignItems: "center", gap: 10, boxShadow: "0 16px 48px #00000080", backdropFilter: "blur(12px)" }}>
      <span style={{ color: colors[type], fontSize: 15 }}>{icons[type]}</span>
      <span style={{ color: T.text, fontSize: 13, fontWeight: 500 }}>{msg}</span>
    </div>
  );
}

function Badge({ children, color = T.accent }) {
  return <span style={{ background: color + "20", color, fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20, whiteSpace: "nowrap", letterSpacing: "0.02em" }}>{children}</span>;
}

function Pill({ children, active, color = T.accent, onClick }) {
  return (
    <button onClick={onClick} style={{ background: active ? color + "20" : "transparent", border: `1px solid ${active ? color : T.border}`, color: active ? color : T.sub, borderRadius: 20, padding: "5px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: F, transition: "all 0.15s", whiteSpace: "nowrap" }}>
      {children}
    </button>
  );
}

function Btn({ children, onClick, variant = "primary", small, disabled, full }) {
  const v = {
    primary: { bg: T.accent, color: "#fff", border: "none" },
    ghost: { bg: "transparent", color: T.sub, border: `1px solid ${T.border}` },
    danger: { bg: T.redBg, color: T.red, border: `1px solid ${T.red}33` },
    soft: { bg: T.accentBg, color: T.accentL, border: `1px solid ${T.accent}33` },
  }[variant] || {};
  return (
    <button onClick={onClick} disabled={disabled} style={{ background: v.bg, color: v.color, border: v.border, borderRadius: 10, cursor: disabled ? "not-allowed" : "pointer", fontFamily: F, fontWeight: 600, fontSize: small ? 12 : 14, padding: small ? "6px 12px" : "10px 20px", display: "inline-flex", alignItems: "center", gap: 6, opacity: disabled ? 0.5 : 1, width: full ? "100%" : undefined, justifyContent: full ? "center" : undefined, transition: "opacity 0.15s, transform 0.1s", whiteSpace: "nowrap" }}
      onMouseEnter={e => !disabled && (e.currentTarget.style.opacity = "0.8")}
      onMouseLeave={e => !disabled && (e.currentTarget.style.opacity = "1")}>
      {children}
    </button>
  );
}

function Field({ label, full, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, gridColumn: full ? "1/-1" : undefined }}>
      {label && <label style={{ fontSize: 11, color: T.sub, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</label>}
      {children}
    </div>
  );
}

const inputStyle = { background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, color: T.text, padding: "10px 14px", fontSize: 14, fontFamily: F, outline: "none", width: "100%", boxSizing: "border-box" };

function Inp({ label, full, ...props }) {
  return (
    <Field label={label} full={full}>
      <input {...props} style={{ ...inputStyle, ...(props.style || {}) }}
        onFocus={e => e.target.style.borderColor = T.accent}
        onBlur={e => e.target.style.borderColor = T.border} />
    </Field>
  );
}

function Tex({ label, full, rows = 3, ...props }) {
  return (
    <Field label={label} full={full}>
      <textarea {...props} rows={rows} style={{ ...inputStyle, resize: "vertical" }}
        onFocus={e => e.target.style.borderColor = T.accent}
        onBlur={e => e.target.style.borderColor = T.border} />
    </Field>
  );
}

function Sel({ label, options, full, ...props }) {
  return (
    <Field label={label} full={full}>
      <select {...props} style={{ ...inputStyle, cursor: "pointer" }}>
        {options.map(o => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}
      </select>
    </Field>
  );
}

function Modal({ title, onClose, children, wide }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "#00000090", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, backdropFilter: "blur(4px)" }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 20, padding: 32, width: "100%", maxWidth: wide ? 720 : 520, maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
          <h3 style={{ color: T.text, fontWeight: 700, fontSize: 18, margin: 0 }}>{title}</h3>
          <Btn variant="ghost" small onClick={onClose}>✕</Btn>
        </div>
        {children}
      </div>
    </div>
  );
}

function Card({ children, style = {}, onClick }) {
  return (
    <div onClick={onClick} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: "20px 24px", cursor: onClick ? "pointer" : undefined, transition: "all 0.15s", ...style }}
      onMouseEnter={e => onClick && (e.currentTarget.style.background = T.cardHov)}
      onMouseLeave={e => onClick && (e.currentTarget.style.background = T.card)}>
      {children}
    </div>
  );
}

function KpiCard({ label, value, sub, color = T.accent, icon, trend }) {
  return (
    <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: "20px 22px", display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 11, color: T.sub, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</span>
        {icon && <div style={{ width: 34, height: 34, borderRadius: 10, background: color + "18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>{icon}</div>}
      </div>
      <div style={{ fontSize: 28, fontWeight: 800, color, fontFamily: M, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: T.muted }}>{sub}</div>}
    </div>
  );
}

function MiniBar({ value, max, color }) {
  return (
    <div style={{ background: T.border, borderRadius: 4, height: 5, overflow: "hidden" }}>
      <div style={{ background: color, width: `${Math.min((value / (max || 1)) * 100, 100)}%`, height: "100%", borderRadius: 4, transition: "width 0.5s" }} />
    </div>
  );
}

function Stars({ value, onChange }) {
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {[1, 2, 3, 4, 5].map(n => (
        <button key={n} onClick={() => onChange && onChange(n)}
          style={{ background: "none", border: "none", cursor: onChange ? "pointer" : "default", fontSize: 20, color: n <= (value || 0) ? T.amber : T.dim, padding: 1, lineHeight: 1 }}>★</button>
      ))}
    </div>
  );
}

// ─── CHARTS ───────────────────────────────────────────────────────────────────
function LineArea({ data, color, h = 90 }) {
  if (!data || data.length < 2) return null;
  const w = 400, min = Math.min(...data), max = Math.max(...data), range = max - min || 1;
  const x = i => (i / (data.length - 1)) * (w - 20) + 10;
  const y = v => h - ((v - min) / range) * (h - 16) - 8;
  const pts = data.map((v, i) => `${x(i)},${y(v)}`).join(" ");
  const area = `10,${h} ${pts} ${x(data.length - 1)},${h}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: h }}>
      <defs>
        <linearGradient id={`lg${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#lg${color.replace("#", "")})`} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      {data.map((v, i) => <circle key={i} cx={x(i)} cy={y(v)} r={3} fill={color} />)}
    </svg>
  );
}

function BarGroup({ months }) {
  if (!months.length) return <div style={{ color: T.muted, fontSize: 13, textAlign: "center", padding: "24px 0" }}>Adicione lançamentos para ver o gráfico</div>;
  const max = Math.max(...months.flatMap(m => [m.entrada, m.saida]), 1);
  return (
    <div style={{ display: "flex", gap: 6, alignItems: "flex-end", height: 80 }}>
      {months.map((m, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
          <div style={{ width: "100%", display: "flex", gap: 2, alignItems: "flex-end", height: 64 }}>
            <div style={{ flex: 1, background: T.green, opacity: 0.8, borderRadius: "4px 4px 0 0", height: `${(m.entrada / max) * 64}px`, minHeight: 2 }} />
            <div style={{ flex: 1, background: T.red, opacity: 0.7, borderRadius: "4px 4px 0 0", height: `${(m.saida / max) * 64}px`, minHeight: 2 }} />
          </div>
          <div style={{ fontSize: 9, color: T.muted }}>{m.label}</div>
        </div>
      ))}
      <div style={{ display: "flex", gap: 10, marginLeft: 8, alignSelf: "center", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}><div style={{ width: 8, height: 8, borderRadius: 2, background: T.green }} /><span style={{ fontSize: 10, color: T.sub }}>Entrada</span></div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}><div style={{ width: 8, height: 8, borderRadius: 2, background: T.red }} /><span style={{ fontSize: 10, color: T.sub }}>Saída</span></div>
      </div>
    </div>
  );
}

// ─── PROGRESS CONTRACT ────────────────────────────────────────────────────────
function ContractProgress({ dur, mes, valor, tipo }) {
  dur = +dur || 1; mes = Math.min(+mes || 0, dur);
  const pct = (mes / dur) * 100;
  const color = pct >= 100 ? T.green : pct >= 60 ? T.accent : pct >= 30 ? T.amber : T.blue;
  const executado = tipo === "Fee Mensal" ? valor * mes : valor * (mes / dur);
  const total = tipo === "Fee Mensal" ? valor * dur : valor;

  return (
    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 14, padding: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>Progresso do contrato</span>
        <span style={{ fontSize: 22, fontWeight: 800, color, fontFamily: M }}>{mes} / {dur}</span>
      </div>
      <div style={{ background: T.border, borderRadius: 6, height: 8, overflow: "hidden", marginBottom: 12 }}>
        <div style={{ background: color, width: `${pct}%`, height: "100%", borderRadius: 6, transition: "width 0.5s" }} />
      </div>
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 14 }}>
        {Array.from({ length: dur }, (_, i) => (
          <div key={i} style={{ width: 26, height: 26, borderRadius: "50%", background: i < mes ? color : T.border, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: i < mes ? "#fff" : T.muted, fontWeight: 700 }}>{i + 1}</div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
        {[["Executado", executado, color], ["Total", total, T.text], ["A executar", total - executado, T.muted]].map(([l, v, c]) => (
          <div key={l} style={{ background: T.card, borderRadius: 10, padding: "10px 12px" }}>
            <div style={{ fontSize: 10, color: T.muted, marginBottom: 4, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>{l}</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: c, fontFamily: M }}>{fmt(v)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── CLIENTE FICHA ────────────────────────────────────────────────────────────
const EMPTY_CLIENTE = { nome: "", contato: "", email: "", telefone: "", segmento: "", status: "Ativo", valor_mensal: "", inicio: today(), tipo_contrato: "Fee Mensal", duracao_meses: 1, mes_atual: 0, escopo_total: "", entregas: "", proposta_url: "", video_url: "", status_saude: "verde", satisfacao: 3, nota_saude: "", observacoes: "" };

function FichaCliente({ item, onSave, onClose }) {
  const [form, setForm] = useState({ ...EMPTY_CLIENTE, ...item });
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState("contrato");
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const saude = SAUDE[form.status_saude] || SAUDE.verde;

  const tabs = [{ id: "contrato", label: "Contrato" }, { id: "entregas", label: "Entregas" }, { id: "saude", label: "Saúde" }];

  return (
    <Modal title="" onClose={onClose} wide>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24, paddingBottom: 20, borderBottom: `1px solid ${T.border}` }}>
        <div style={{ width: 50, height: 50, borderRadius: 14, background: saude.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>{saude.emoji}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <input value={form.nome || ""} onChange={set("nome")} placeholder="Nome do cliente" style={{ background: "transparent", border: "none", outline: "none", fontSize: 20, fontWeight: 700, color: T.text, fontFamily: F, width: "100%" }} />
          <div style={{ display: "flex", gap: 6, marginTop: 4, flexWrap: "wrap" }}>
            <Badge color={saude.color}>{saude.emoji} {saude.label}</Badge>
            <Badge color={T.blue}>{form.tipo_contrato}</Badge>
            {form.valor_mensal && <Badge color={T.green}>{fmt(form.valor_mensal)}/mês</Badge>}
          </div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {["verde", "amarelo", "vermelho"].map(s => (
            <button key={s} onClick={() => setForm(f => ({ ...f, status_saude: s }))}
              style={{ width: 26, height: 26, borderRadius: "50%", border: form.status_saude === s ? `3px solid ${SAUDE[s].color}` : `2px solid transparent`, background: SAUDE[s].color, cursor: "pointer", opacity: form.status_saude === s ? 1 : 0.3, transition: "all 0.15s" }} />
          ))}
        </div>
      </div>

      {/* Dados básicos sempre visíveis */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
        <Inp label="Contato" value={form.contato || ""} onChange={set("contato")} />
        <Inp label="Email" type="email" value={form.email || ""} onChange={set("email")} />
        <Inp label="Telefone" value={form.telefone || ""} onChange={set("telefone")} />
        <Inp label="Segmento" value={form.segmento || ""} onChange={set("segmento")} />
        <Sel label="Status" value={form.status || "Ativo"} onChange={set("status")} options={["Ativo", "Inativo", "Pausado"]} />
        <Inp label="Início do contrato" type="date" value={form.inicio || ""} onChange={set("inicio")} />
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 20, borderBottom: `1px solid ${T.border}`, paddingBottom: 0 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ background: "none", border: "none", borderBottom: tab === t.id ? `2px solid ${T.accent}` : "2px solid transparent", color: tab === t.id ? T.accentL : T.sub, fontFamily: F, fontWeight: 600, fontSize: 13, padding: "8px 16px", cursor: "pointer", marginBottom: -1, transition: "all 0.15s" }}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "contrato" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Inp label="Valor mensal (R$)" type="number" value={form.valor_mensal || ""} onChange={set("valor_mensal")} />
            <Sel label="Tipo de contrato" value={form.tipo_contrato || "Fee Mensal"} onChange={set("tipo_contrato")}
              options={[{ value: "Fee Mensal", label: "Fee Mensal (recorrente)" }, { value: "Unitário", label: "Unitário (projeto com prazo)" }]} />
            <Sel label="Duração total" value={form.duracao_meses || 1} onChange={set("duracao_meses")}
              options={[1, 2, 3, 6, 12, 24].map(n => ({ value: n, label: `${n} ${n === 1 ? "mês" : "meses"}` }))} />
            <Sel label="Mês atual (fase)" value={form.mes_atual || 0} onChange={set("mes_atual")}
              options={Array.from({ length: (+form.duracao_meses || 1) + 1 }, (_, i) => ({ value: i, label: i === 0 ? "Não iniciado" : `Mês ${i} de ${form.duracao_meses}` }))} />
          </div>
          <ContractProgress dur={form.duracao_meses} mes={form.mes_atual} valor={+form.valor_mensal || 0} tipo={form.tipo_contrato} />
          <Tex label="Escopo total contratado" full rows={3} value={form.escopo_total || ""} onChange={set("escopo_total")} placeholder="O que foi contratado no total..." />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <Inp label="Link da proposta" value={form.proposta_url || ""} onChange={set("proposta_url")} placeholder="https://drive.google.com/..." />
              {form.proposta_url && <a href={form.proposta_url} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: T.blue, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4, marginTop: 6 }}>🔗 Abrir proposta →</a>}
            </div>
            <div>
              <Inp label="Link do vídeo" value={form.video_url || ""} onChange={set("video_url")} placeholder="https://youtube.com/..." />
              {form.video_url && <a href={form.video_url} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: T.purple, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4, marginTop: 6 }}>▶ Abrir vídeo →</a>}
            </div>
          </div>
        </div>
      )}

      {tab === "entregas" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Tex label="O que já entregamos" full rows={5} value={form.entregas || ""} onChange={set("entregas")} placeholder="Liste as entregas realizadas até agora..." />
          <Tex label="Observações gerais" full rows={3} value={form.observacoes || ""} onChange={set("observacoes")} placeholder="Notas importantes sobre este cliente..." />
        </div>
      )}

      {tab === "saude" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <div style={{ fontSize: 11, color: T.sub, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Satisfação do cliente</div>
              <Stars value={+form.satisfacao} onChange={v => setForm(f => ({ ...f, satisfacao: v }))} />
              <div style={{ fontSize: 12, color: T.muted, marginTop: 6 }}>
                {["", "Muito insatisfeito", "Insatisfeito", "Neutro", "Satisfeito", "Muito satisfeito"][+form.satisfacao] || "Não avaliado"}
              </div>
            </div>
            <Sel label="Status de saúde" value={form.status_saude || "verde"} onChange={set("status_saude")}
              options={[{ value: "verde", label: "🟢 Saudável" }, { value: "amarelo", label: "🟡 Atenção" }, { value: "vermelho", label: "🔴 Crítico" }]} />
          </div>
          <Tex label="Como está nosso trabalho para este cliente?" full rows={5} value={form.nota_saude || ""} onChange={set("nota_saude")} placeholder="Está entregando resultado? Pontos de atenção? O que precisa melhorar para renovar?" />
          <div style={{ background: saude.bg, border: `1px solid ${saude.color}33`, borderRadius: 12, padding: 14 }}>
            <div style={{ fontSize: 12, color: saude.color, fontWeight: 600, marginBottom: 4 }}>Dica para clientes {saude.label.toLowerCase()}s:</div>
            <div style={{ fontSize: 12, color: T.sub }}>
              {form.status_saude === "verde" && "Ótimo! Foque em encantar e buscar oportunidades de upsell."}
              {form.status_saude === "amarelo" && "Atenção! Agende uma reunião de alinhamento rapidamente."}
              {form.status_saude === "vermelho" && "Urgente! Este cliente está em risco de cancelamento. Aja já."}
            </div>
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 8, marginTop: 24, justifyContent: "flex-end", paddingTop: 20, borderTop: `1px solid ${T.border}` }}>
        <Btn variant="ghost" onClick={onClose}>Cancelar</Btn>
        <Btn onClick={async () => { setSaving(true); await onSave(form); setSaving(false); }} disabled={saving}>
          {saving ? "Salvando..." : "Salvar cliente"}
        </Btn>
      </div>
    </Modal>
  );
}

// ─── CLIENTES PAGE ────────────────────────────────────────────────────────────
function Clientes() {
  const { rows, loading, add, update, remove, toast } = useDB("clientes");
  const [ficha, setFicha] = useState(null);
  const [isNew, setIsNew] = useState(false);
  const [search, setSearch] = useState("");
  const [filtroSaude, setFiltroSaude] = useState("todos");
  const [filtroStatus, setFiltroStatus] = useState("Todos");

  const abrir = item => { setFicha(item); setIsNew(false); };
  const novo = () => { setFicha({ ...EMPTY_CLIENTE }); setIsNew(true); };

  const salvar = async form => {
    const data = { ...form, valor_mensal: +form.valor_mensal || 0, satisfacao: +form.satisfacao || 3, duracao_meses: +form.duracao_meses || 1, mes_atual: +form.mes_atual || 0 };
    if (isNew) await add(data); else await update(ficha.id, data);
    setFicha(null);
  };

  const filtered = rows.filter(r => {
    const ms = r.nome?.toLowerCase().includes(search.toLowerCase()) || (r.segmento || "").toLowerCase().includes(search.toLowerCase()) || (r.contato || "").toLowerCase().includes(search.toLowerCase());
    const mf = filtroSaude === "todos" || r.status_saude === filtroSaude;
    const ms2 = filtroStatus === "Todos" || r.status === filtroStatus;
    return ms && mf && ms2;
  });

  const mrr = rows.filter(r => r.status === "Ativo").reduce((s, r) => s + (+r.valor_mensal || 0), 0);
  const porSaude = s => rows.filter(r => r.status_saude === s && r.status === "Ativo").length;
  const avgSat = rows.length > 0 ? (rows.reduce((s, r) => s + (+r.satisfacao || 0), 0) / rows.length).toFixed(1) : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {toast && <Toast {...toast} />}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{ color: T.text, fontSize: 24, fontWeight: 800, margin: 0 }}>Clientes</h1>
          <p style={{ color: T.sub, fontSize: 14, marginTop: 4 }}>{rows.filter(r => r.status === "Ativo").length} ativos · MRR {fmt(mrr)}</p>
        </div>
        <Btn onClick={novo}>+ Novo cliente</Btn>
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 12 }}>
        <KpiCard label="MRR" value={fmtK(mrr)} color={T.green} icon="↗" />
        <KpiCard label="🟢 Saudáveis" value={porSaude("verde")} color={T.green} />
        <KpiCard label="🟡 Atenção" value={porSaude("amarelo")} color={T.amber} />
        <KpiCard label="🔴 Críticos" value={porSaude("vermelho")} color={T.red} />
        <KpiCard label="Satisfação" value={`${avgSat}★`} color={T.amber} />
      </div>

      {/* Filtros */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar cliente..." style={{ ...inputStyle, flex: 1, minWidth: 200, maxWidth: 320 }} onFocus={e => e.target.style.borderColor = T.accent} onBlur={e => e.target.style.borderColor = T.border} />
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {["todos", "verde", "amarelo", "vermelho"].map(s => (
            <Pill key={s} active={filtroSaude === s} color={s === "todos" ? T.accent : SAUDE[s]?.color || T.accent} onClick={() => setFiltroSaude(s)}>
              {s === "todos" ? "Todos" : SAUDE[s].emoji + " " + SAUDE[s].label}
            </Pill>
          ))}
          <div style={{ width: 1, background: T.border, margin: "0 4px" }} />
          {["Todos", "Ativo", "Inativo", "Pausado"].map(s => (
            <Pill key={s} active={filtroStatus === s} onClick={() => setFiltroStatus(s)}>{s}</Pill>
          ))}
        </div>
      </div>

      {/* Cards */}
      {loading
        ? <div style={{ color: T.sub, textAlign: "center", padding: 48 }}>Carregando...</div>
        : filtered.length === 0
          ? <Card><div style={{ textAlign: "center", color: T.muted, padding: "32px 0", fontSize: 14 }}>Nenhum cliente encontrado</div></Card>
          : <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
            {filtered.map(item => {
              const saude = SAUDE[item.status_saude] || SAUDE.verde;
              const dur = +item.duracao_meses || 1;
              const mes = Math.min(+item.mes_atual || 0, dur);
              const pct = (mes / dur) * 100;
              const progColor = pct >= 100 ? T.green : pct >= 60 ? T.accent : pct >= 30 ? T.amber : T.blue;

              return (
                <div key={item.id} onClick={() => abrir(item)}
                  style={{ background: T.card, border: `1px solid ${T.border}`, borderLeft: `3px solid ${saude.color}`, borderRadius: 16, padding: 20, cursor: "pointer", transition: "all 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.background = T.cardHov}
                  onMouseLeave={e => e.currentTarget.style.background = T.card}>

                  {/* Header do card */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 15, color: T.text, marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.nome || "Sem nome"}</div>
                      <div style={{ fontSize: 12, color: T.sub }}>{item.contato || item.segmento || "—"}</div>
                    </div>
                    <Badge color={saude.color}>{saude.emoji} {saude.label}</Badge>
                  </div>

                  {/* Valor e tipo */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: T.green, fontFamily: M }}>{fmt(item.valor_mensal)}<span style={{ fontSize: 11, color: T.muted, fontWeight: 400 }}>/mês</span></div>
                    <Badge color={T.blue}>{item.tipo_contrato || "Fee Mensal"}</Badge>
                  </div>

                  {/* Progresso */}
                  {dur > 0 && (
                    <div style={{ marginBottom: 14 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                        <span style={{ fontSize: 11, color: T.muted }}>Progresso do contrato</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: progColor, fontFamily: M }}>{mes}/{dur} meses</span>
                      </div>
                      <MiniBar value={mes} max={dur} color={progColor} />
                    </div>
                  )}

                  {/* Footer */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 12, borderTop: `1px solid ${T.border}` }}>
                    <Stars value={+item.satisfacao} />
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      {item.proposta_url && <span style={{ fontSize: 12, color: T.blue }}>🔗</span>}
                      {item.video_url && <span style={{ fontSize: 12, color: T.purple }}>▶</span>}
                      <span style={{ fontSize: 11, color: T.muted }}>Abrir ficha →</span>
                    </div>
                  </div>

                  {/* Nota de saúde */}
                  {item.nota_saude && (
                    <div style={{ marginTop: 12, padding: "8px 12px", background: saude.bg, borderRadius: 8, fontSize: 12, color: saude.color, borderLeft: `2px solid ${saude.color}` }}>
                      {item.nota_saude.slice(0, 80)}{item.nota_saude.length > 80 ? "..." : ""}
                    </div>
                  )}

                  <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
                    <Btn variant="danger" small onClick={e => { e.stopPropagation(); remove(item.id); }}>Remover</Btn>
                  </div>
                </div>
              );
            })}
          </div>}

      {ficha && <FichaCliente item={ficha} onSave={salvar} onClose={() => setFicha(null)} />}
    </div>
  );
}

// ─── FINANCEIRO PAGE ──────────────────────────────────────────────────────────
function Financeiro() {
  const caixaDB = useDB("caixa");
  const custosDB = useDB("custos");
  const invDB = useDB("investimentos");
  const [aba, setAba] = useState("caixa");

  const entradas = caixaDB.rows.filter(c => c.tipo === "Entrada").reduce((s, c) => s + (+c.valor), 0);
  const saidas = caixaDB.rows.filter(c => c.tipo === "Saída").reduce((s, c) => s + (+c.valor), 0);
  const custoTotal = custosDB.rows.reduce((s, c) => s + (+c.valor), 0);
  const invTotal = invDB.rows.reduce((s, i) => s + (+i.valor), 0);
  const lucro = entradas - saidas - custoTotal;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {(caixaDB.toast || custosDB.toast || invDB.toast) && <Toast {...(caixaDB.toast || custosDB.toast || invDB.toast)} />}
      <div>
        <h1 style={{ color: T.text, fontSize: 24, fontWeight: 800, margin: 0 }}>Financeiro</h1>
        <p style={{ color: T.sub, fontSize: 14, marginTop: 4 }}>Caixa, custos e investimentos</p>
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 12 }}>
        <KpiCard label="Entradas" value={fmtK(entradas)} color={T.green} icon="↗" />
        <KpiCard label="Saídas" value={fmtK(saidas)} color={T.red} icon="↘" />
        <KpiCard label="Custos fixos" value={fmtK(custoTotal)} color={T.amber} icon="▲" />
        <KpiCard label="Resultado" value={fmtK(lucro)} color={lucro >= 0 ? T.green : T.red} icon="◆" />
        <KpiCard label="Investimentos" value={fmtK(invTotal)} color={T.blue} icon="◇" />
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 6, borderBottom: `1px solid ${T.border}` }}>
        {[{ id: "caixa", label: "Caixa" }, { id: "custos", label: "Custos" }, { id: "investimentos", label: "Investimentos" }, { id: "dre", label: "DRE" }].map(t => (
          <button key={t.id} onClick={() => setAba(t.id)} style={{ background: "none", border: "none", borderBottom: aba === t.id ? `2px solid ${T.accent}` : "2px solid transparent", color: aba === t.id ? T.accentL : T.sub, fontFamily: F, fontWeight: 600, fontSize: 13, padding: "10px 18px", cursor: "pointer", marginBottom: -1, transition: "all 0.15s" }}>
            {t.label}
          </button>
        ))}
      </div>

      {aba === "caixa" && <CaixaTab db={caixaDB} />}
      {aba === "custos" && <CustosTab db={custosDB} />}
      {aba === "investimentos" && <InvestTab db={invDB} />}
      {aba === "dre" && <DRETab caixa={caixaDB.rows} custos={custosDB.rows} inv={invDB.rows} />}
    </div>
  );
}

function CaixaTab({ db }) {
  const [modal, setModal] = useState(false);
  const [edit, setEdit] = useState(null);
  const [form, setForm] = useState({ data: today(), descricao: "", tipo: "Entrada", categoria: "Receita de Serviço", valor: "" });
  const s = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const save = async () => { if (!form.descricao || !form.valor) return; await db.add({ ...form, valor: +form.valor }); setModal(false); setForm({ data: today(), descricao: "", tipo: "Entrada", categoria: "Receita de Serviço", valor: "" }); };
  const saveEdit = async f => { await db.update(edit.id, { ...f, valor: +f.valor }); setEdit(null); };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", justifyContent: "flex-end" }}><Btn small onClick={() => setModal(true)}>+ Lançamento</Btn></div>
      <Card style={{ padding: 0 }}>
        <SimpleTable
          cols={[
            { key: "data", label: "Data", w: 100 },
            { key: "descricao", label: "Descrição", render: (v, r) => <div><div>{v}</div><div style={{ fontSize: 11, color: T.muted }}>{r.categoria}</div></div> },
            { key: "tipo", label: "Tipo", render: v => <Badge color={v === "Entrada" ? T.green : T.red}>{v}</Badge> },
            { key: "valor", label: "Valor", align: "right", render: (v, r) => <span style={{ fontFamily: M, fontWeight: 700, color: r.tipo === "Entrada" ? T.green : T.red }}>{r.tipo === "Entrada" ? "+" : "-"}{fmt(v)}</span> },
            { key: "id", label: "", align: "right", render: (v, r) => <div style={{ display: "flex", gap: 6 }}><Btn variant="soft" small onClick={() => setEdit(r)}>✎</Btn><Btn variant="danger" small onClick={() => db.remove(v)}>✕</Btn></div> },
          ]}
          rows={[...db.rows].sort((a, b) => (b.data || "").localeCompare(a.data || ""))}
        />
      </Card>
      {modal && <Modal title="Novo Lançamento" onClose={() => setModal(false)}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <Inp label="Data" type="date" value={form.data} onChange={s("data")} />
          <Sel label="Tipo" value={form.tipo} onChange={s("tipo")} options={["Entrada", "Saída"]} />
          <Inp label="Descrição *" full value={form.descricao} onChange={s("descricao")} />
          <Sel label="Categoria" value={form.categoria} onChange={s("categoria")} options={["Receita de Serviço", "Projeto Avulso", "Aluguel", "Pessoal", "TI / Software", "Marketing", "Outros"]} />
          <Inp label="Valor (R$) *" type="number" value={form.valor} onChange={s("valor")} />
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 20, justifyContent: "flex-end" }}><Btn variant="ghost" onClick={() => setModal(false)}>Cancelar</Btn><Btn onClick={save}>Salvar</Btn></div>
      </Modal>}
      {edit && <QuickEdit title="Editar lançamento" item={edit} fields={[{ k: "data", l: "Data", t: "date" }, { k: "tipo", l: "Tipo", t: "select", opts: ["Entrada", "Saída"] }, { k: "descricao", l: "Descrição", full: true }, { k: "categoria", l: "Categoria", t: "select", opts: ["Receita de Serviço", "Projeto Avulso", "Aluguel", "Pessoal", "TI / Software", "Marketing", "Outros"] }, { k: "valor", l: "Valor (R$)", t: "number" }]} onSave={saveEdit} onClose={() => setEdit(null)} />}
    </div>
  );
}

function CustosTab({ db }) {
  const [modal, setModal] = useState(false);
  const [edit, setEdit] = useState(null);
  const [form, setForm] = useState({ nome: "", categoria: "Pessoal", valor: "", recorrente: false, mes: today().slice(0, 7) });
  const s = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const save = async () => { if (!form.nome || !form.valor) return; await db.add({ ...form, valor: +form.valor }); setModal(false); };
  const saveEdit = async f => { await db.update(edit.id, { ...f, valor: +f.valor, recorrente: f.recorrente === "true" || f.recorrente === true }); setEdit(null); };
  const total = db.rows.reduce((s, c) => s + (+c.valor), 0);
  const fixos = db.rows.filter(c => c.recorrente === true || c.recorrente === "true").reduce((s, c) => s + (+c.valor), 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 13, color: T.sub }}>Total: {fmt(total)} · Fixos: {fmt(fixos)} · Variáveis: {fmt(total - fixos)}</div>
        <Btn small onClick={() => setModal(true)}>+ Custo</Btn>
      </div>
      <Card style={{ padding: 0 }}>
        <SimpleTable
          cols={[
            { key: "nome", label: "Descrição" },
            { key: "categoria", label: "Categoria", render: v => <Badge color={T.amber}>{v}</Badge> },
            { key: "mes", label: "Mês" },
            { key: "recorrente", label: "Tipo", render: v => <Badge color={(v === true || v === "true") ? T.red : T.muted}>{(v === true || v === "true") ? "Fixo" : "Variável"}</Badge> },
            { key: "valor", label: "Valor", align: "right", render: v => <span style={{ fontFamily: M, fontWeight: 700, color: T.amber }}>{fmt(v)}</span> },
            { key: "id", label: "", align: "right", render: (v, r) => <div style={{ display: "flex", gap: 6 }}><Btn variant="soft" small onClick={() => setEdit(r)}>✎</Btn><Btn variant="danger" small onClick={() => db.remove(v)}>✕</Btn></div> },
          ]}
          rows={db.rows}
        />
      </Card>
      {modal && <Modal title="Novo Custo" onClose={() => setModal(false)}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <Inp label="Descrição *" full value={form.nome} onChange={s("nome")} />
          <Sel label="Categoria" value={form.categoria} onChange={s("categoria")} options={["Pessoal", "Aluguel", "TI / Software", "Marketing", "Administrativo", "Logística", "Outros"]} />
          <Inp label="Valor (R$) *" type="number" value={form.valor} onChange={s("valor")} />
          <Inp label="Mês" type="month" value={form.mes} onChange={s("mes")} />
          <Sel label="Tipo" value={form.recorrente} onChange={e => setForm(f => ({ ...f, recorrente: e.target.value === "true" }))} options={[{ value: "false", label: "Variável" }, { value: "true", label: "Fixo (recorrente)" }]} />
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 20, justifyContent: "flex-end" }}><Btn variant="ghost" onClick={() => setModal(false)}>Cancelar</Btn><Btn onClick={save}>Salvar</Btn></div>
      </Modal>}
      {edit && <QuickEdit title="Editar custo" item={edit} fields={[{ k: "nome", l: "Descrição", full: true }, { k: "categoria", l: "Categoria", t: "select", opts: ["Pessoal", "Aluguel", "TI / Software", "Marketing", "Administrativo", "Logística", "Outros"] }, { k: "valor", l: "Valor (R$)", t: "number" }, { k: "mes", l: "Mês", t: "month" }]} onSave={saveEdit} onClose={() => setEdit(null)} />}
    </div>
  );
}

function InvestTab({ db }) {
  const [modal, setModal] = useState(false);
  const [edit, setEdit] = useState(null);
  const [form, setForm] = useState({ descricao: "", categoria: "Equipamento", valor: "", data: today(), retorno_esperado: "" });
  const s = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const save = async () => { if (!form.descricao || !form.valor) return; await db.add({ ...form, valor: +form.valor }); setModal(false); };
  const saveEdit = async f => { await db.update(edit.id, { ...f, valor: +f.valor }); setEdit(null); };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", justifyContent: "flex-end" }}><Btn small onClick={() => setModal(true)}>+ Investimento</Btn></div>
      <Card style={{ padding: 0 }}>
        <SimpleTable
          cols={[
            { key: "descricao", label: "Descrição" },
            { key: "categoria", label: "Categoria", render: v => <Badge color={T.blue}>{v}</Badge> },
            { key: "data", label: "Data" },
            { key: "retorno_esperado", label: "Retorno esperado", render: v => <span style={{ fontSize: 12, color: T.muted }}>{v}</span> },
            { key: "valor", label: "Valor", align: "right", render: v => <span style={{ fontFamily: M, fontWeight: 700, color: T.blue }}>{fmt(v)}</span> },
            { key: "id", label: "", align: "right", render: (v, r) => <div style={{ display: "flex", gap: 6 }}><Btn variant="soft" small onClick={() => setEdit(r)}>✎</Btn><Btn variant="danger" small onClick={() => db.remove(v)}>✕</Btn></div> },
          ]}
          rows={db.rows}
        />
      </Card>
      {modal && <Modal title="Novo Investimento" onClose={() => setModal(false)}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <Inp label="Descrição *" full value={form.descricao} onChange={s("descricao")} />
          <Sel label="Categoria" value={form.categoria} onChange={s("categoria")} options={["Equipamento", "Capacitação", "Infraestrutura", "Marketing", "Tecnologia", "Outros"]} />
          <Inp label="Valor (R$) *" type="number" value={form.valor} onChange={s("valor")} />
          <Inp label="Data" type="date" value={form.data} onChange={s("data")} />
          <Inp label="Retorno esperado" full value={form.retorno_esperado} onChange={s("retorno_esperado")} />
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 20, justifyContent: "flex-end" }}><Btn variant="ghost" onClick={() => setModal(false)}>Cancelar</Btn><Btn onClick={save}>Salvar</Btn></div>
      </Modal>}
      {edit && <QuickEdit title="Editar investimento" item={edit} fields={[{ k: "descricao", l: "Descrição", full: true }, { k: "categoria", l: "Categoria", t: "select", opts: ["Equipamento", "Capacitação", "Infraestrutura", "Marketing", "Tecnologia", "Outros"] }, { k: "valor", l: "Valor (R$)", t: "number" }, { k: "data", l: "Data", t: "date" }, { k: "retorno_esperado", l: "Retorno esperado", full: true }]} onSave={saveEdit} onClose={() => setEdit(null)} />}
    </div>
  );
}

function DRETab({ caixa, custos, inv }) {
  const receitas = caixa.filter(c => c.tipo === "Entrada").reduce((s, c) => s + (+c.valor), 0);
  const custosDiretos = custos.filter(c => ["Pessoal", "TI / Software"].includes(c.categoria)).reduce((s, c) => s + (+c.valor), 0);
  const lucroBruto = receitas - custosDiretos;
  const despOp = custos.filter(c => !["Pessoal", "TI / Software"].includes(c.categoria)).reduce((s, c) => s + (+c.valor), 0);
  const ebitda = lucroBruto - despOp;
  const invTotal = inv.reduce((s, i) => s + (+i.valor), 0);
  const lucroLiq = ebitda - invTotal;

  const linhas = [
    { label: "Receita bruta", valor: receitas, destaque: true, color: T.green },
    { label: "(-) Custos diretos", valor: -custosDiretos, color: T.red },
    { label: "= Lucro bruto", valor: lucroBruto, destaque: true, color: lucroBruto >= 0 ? T.green : T.red, sub: `Margem ${fmtPct(receitas > 0 ? (lucroBruto / receitas) * 100 : 0)}` },
    { label: "(-) Despesas operacionais", valor: -despOp, color: T.amber },
    { label: "= EBITDA", valor: ebitda, destaque: true, color: ebitda >= 0 ? T.green : T.red },
    { label: "(-) Investimentos", valor: -invTotal, color: T.blue },
    { label: "= Resultado líquido", valor: lucroLiq, destaque: true, color: lucroLiq >= 0 ? T.green : T.red, sub: `Margem ${fmtPct(receitas > 0 ? (lucroLiq / receitas) * 100 : 0)}` },
  ];

  return (
    <Card>
      {linhas.map((l, i) => (
        <div key={i}>
          {l.destaque && i > 0 && <div style={{ height: 1, background: T.border, margin: "8px 0" }} />}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: l.destaque ? "12px 16px" : "7px 16px", background: l.destaque ? T.surface : "transparent", borderRadius: l.destaque ? 10 : 0, margin: l.destaque ? "4px 0" : 0 }}>
            <div>
              <span style={{ fontSize: l.destaque ? 14 : 13, color: l.destaque ? T.text : T.sub, fontWeight: l.destaque ? 600 : 400 }}>{l.label}</span>
              {l.sub && <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>{l.sub}</div>}
            </div>
            <span style={{ fontFamily: M, fontWeight: l.destaque ? 700 : 400, fontSize: l.destaque ? 16 : 13, color: l.color }}>{fmt(Math.abs(l.valor))}</span>
          </div>
          {l.destaque && <div style={{ height: 1, background: T.border, margin: "8px 0" }} />}
        </div>
      ))}
    </Card>
  );
}

// ─── CRM PAGE ─────────────────────────────────────────────────────────────────
const ETAPAS = ["Prospecção", "Qualificação", "Proposta", "Negociação", "Fechado", "Perdido"];
const ETAPA_C = { Prospecção: T.blue, Qualificação: T.accent, Proposta: T.purple, Negociação: T.amber, Fechado: T.green, Perdido: T.red };
const EMPTY_LEAD = { empresa: "", contato: "", email: "", telefone: "", etapa: "Prospecção", valor_estimado: "", origem: "Indicação", data_contato: today(), proximo_passo: "", observacoes: "" };

function CRM() {
  const { rows, loading, add, update, remove, toast } = useDB("leads");
  const [view, setView] = useState("kanban");
  const [modal, setModal] = useState(false);
  const [edit, setEdit] = useState(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ ...EMPTY_LEAD });
  const s = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const save = async () => { if (!form.empresa) return; await add({ ...form, valor_estimado: +form.valor_estimado || 0 }); setModal(false); setForm({ ...EMPTY_LEAD }); };
  const saveEdit = async f => { await update(edit.id, { ...f, valor_estimado: +f.valor_estimado || 0 }); setEdit(null); };
  const moveEtapa = async (id, etapa) => { const r = rows.find(x => x.id === id); if (r) await update(id, { ...r, etapa }); };

  const pipeline = rows.filter(l => !["Fechado", "Perdido"].includes(l.etapa)).reduce((s, l) => s + (+l.valor_estimado || 0), 0);
  const fechados = rows.filter(l => l.etapa === "Fechado").reduce((s, l) => s + (+l.valor_estimado || 0), 0);
  const taxa = rows.length > 0 ? (rows.filter(l => l.etapa === "Fechado").length / rows.length) * 100 : 0;

  const filtered = rows.filter(l => l.empresa?.toLowerCase().includes(search.toLowerCase()) || (l.contato || "").toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {toast && <Toast {...toast} />}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{ color: T.text, fontSize: 24, fontWeight: 800, margin: 0 }}>CRM Comercial</h1>
          <p style={{ color: T.sub, fontSize: 14, marginTop: 4 }}>{rows.length} leads · Pipeline {fmt(pipeline)}</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Pill active={view === "kanban"} onClick={() => setView("kanban")}>⊞ Kanban</Pill>
          <Pill active={view === "list"} onClick={() => setView("list")}>≡ Lista</Pill>
          <Btn onClick={() => setModal(true)}>+ Novo lead</Btn>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 12 }}>
        <KpiCard label="Pipeline" value={fmtK(pipeline)} color={T.accent} icon="◎" />
        <KpiCard label="Fechados" value={fmtK(fechados)} color={T.green} icon="✓" />
        <KpiCard label="Leads ativos" value={rows.filter(l => !["Fechado", "Perdido"].includes(l.etapa)).length} color={T.blue} />
        <KpiCard label="Conversão" value={fmtPct(taxa)} color={T.purple} />
      </div>

      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar empresa ou contato..." style={{ ...inputStyle, maxWidth: 360 }} onFocus={e => e.target.style.borderColor = T.accent} onBlur={e => e.target.style.borderColor = T.border} />

      {loading ? <div style={{ color: T.sub, textAlign: "center", padding: 48 }}>Carregando...</div> :
        view === "kanban" ? (
          <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 8 }}>
            {ETAPAS.map(etapa => {
              const etLeads = filtered.filter(l => l.etapa === etapa);
              const cor = ETAPA_C[etapa];
              return (
                <div key={etapa} style={{ minWidth: 220, flex: "0 0 220px", background: T.surface, border: `1px solid ${T.border}`, borderRadius: 14, padding: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: cor }} />
                      <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{etapa}</span>
                    </div>
                    <Badge color={cor}>{etLeads.length}</Badge>
                  </div>
                  {etLeads.length === 0 && <div style={{ color: T.dim, fontSize: 12, textAlign: "center", padding: "16px 0" }}>Sem leads</div>}
                  {etLeads.map(lead => (
                    <div key={lead.id} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: 12, marginBottom: 8 }}>
                      <div style={{ fontWeight: 700, fontSize: 13, color: T.text, marginBottom: 4 }}>{lead.empresa}</div>
                      {lead.contato && <div style={{ fontSize: 11, color: T.muted, marginBottom: 6 }}>{lead.contato}</div>}
                      {lead.valor_estimado > 0 && <div style={{ fontSize: 13, fontFamily: M, color: cor, marginBottom: 6, fontWeight: 700 }}>{fmt(lead.valor_estimado)}</div>}
                      {lead.origem && <Badge color={T.blue}>{lead.origem}</Badge>}
                      {lead.proximo_passo && <div style={{ fontSize: 11, color: T.muted, marginTop: 8, borderTop: `1px solid ${T.border}`, paddingTop: 8 }}>→ {lead.proximo_passo}</div>}
                      <div style={{ display: "flex", gap: 4, marginTop: 10, flexWrap: "wrap" }}>
                        <Btn variant="soft" small onClick={() => setEdit(lead)}>✎</Btn>
                        <select onChange={e => moveEtapa(lead.id, e.target.value)} value={lead.etapa}
                          style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 6, color: T.sub, fontSize: 11, padding: "4px 6px", fontFamily: F, cursor: "pointer", flex: 1 }}>
                          {ETAPAS.map(e => <option key={e} value={e}>{e}</option>)}
                        </select>
                        <Btn variant="danger" small onClick={() => remove(lead.id)}>✕</Btn>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        ) : (
          <Card style={{ padding: 0 }}>
            <SimpleTable
              cols={[
                { key: "empresa", label: "Empresa", render: (v, r) => <div><div style={{ fontWeight: 600 }}>{v}</div><div style={{ fontSize: 11, color: T.muted }}>{r.contato}</div></div> },
                { key: "etapa", label: "Etapa", render: v => <Badge color={ETAPA_C[v] || T.muted}>{v}</Badge> },
                { key: "origem", label: "Origem" },
                { key: "valor_estimado", label: "Valor", align: "right", render: v => <span style={{ fontFamily: M, color: T.purple, fontWeight: 700 }}>{fmt(v)}</span> },
                { key: "proximo_passo", label: "Próximo passo", render: v => <span style={{ fontSize: 12, color: T.muted }}>{v}</span> },
                { key: "id", label: "", align: "right", render: (v, r) => <div style={{ display: "flex", gap: 6 }}><Btn variant="soft" small onClick={() => setEdit(r)}>✎</Btn><Btn variant="danger" small onClick={() => remove(v)}>✕</Btn></div> },
              ]}
              rows={filtered}
            />
          </Card>
        )}

      {modal && <Modal title="Novo Lead" onClose={() => setModal(false)} wide>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <Inp label="Empresa *" full value={form.empresa} onChange={s("empresa")} />
          <Inp label="Contato" value={form.contato} onChange={s("contato")} />
          <Inp label="Email" type="email" value={form.email} onChange={s("email")} />
          <Inp label="Telefone" value={form.telefone} onChange={s("telefone")} />
          <Sel label="Etapa" value={form.etapa} onChange={s("etapa")} options={ETAPAS} />
          <Inp label="Valor estimado (R$)" type="number" value={form.valor_estimado} onChange={s("valor_estimado")} />
          <Sel label="Origem" value={form.origem} onChange={s("origem")} options={["Indicação", "LinkedIn", "Site", "Cold Outreach", "Evento", "Instagram", "Outro"]} />
          <Inp label="Data do contato" type="date" value={form.data_contato} onChange={s("data_contato")} />
          <Inp label="Próximo passo" full value={form.proximo_passo} onChange={s("proximo_passo")} />
          <Tex label="Observações" full value={form.observacoes} onChange={s("observacoes")} />
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 20, justifyContent: "flex-end" }}><Btn variant="ghost" onClick={() => setModal(false)}>Cancelar</Btn><Btn onClick={save}>Salvar lead</Btn></div>
      </Modal>}
      {edit && <QuickEdit title={`Editar: ${edit.empresa}`} item={edit} wide fields={[{ k: "empresa", l: "Empresa", full: true }, { k: "contato", l: "Contato" }, { k: "email", l: "Email", t: "email" }, { k: "telefone", l: "Telefone" }, { k: "etapa", l: "Etapa", t: "select", opts: ETAPAS }, { k: "valor_estimado", l: "Valor estimado", t: "number" }, { k: "origem", l: "Origem", t: "select", opts: ["Indicação", "LinkedIn", "Site", "Cold Outreach", "Evento", "Instagram", "Outro"] }, { k: "proximo_passo", l: "Próximo passo", full: true }, { k: "observacoes", l: "Observações", t: "textarea", full: true }]} onSave={saveEdit} onClose={() => setEdit(null)} />}
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({ clientes, caixa, custos, investimentos, leads }) {
  const ativos = clientes.filter(c => c.status === "Ativo");
  const mrr = ativos.reduce((s, c) => s + (+c.valor_mensal || 0), 0);
  const entradas = caixa.filter(c => c.tipo === "Entrada").reduce((s, c) => s + (+c.valor), 0);
  const saidas = caixa.filter(c => c.tipo === "Saída").reduce((s, c) => s + (+c.valor), 0);
  const custoTotal = custos.reduce((s, c) => s + (+c.valor), 0);
  const inv = investimentos.reduce((s, i) => s + (+i.valor), 0);
  const resultado = entradas - saidas - custoTotal;
  const margem = entradas > 0 ? (resultado / entradas) * 100 : 0;
  const pipeline = leads.filter(l => !["Fechado", "Perdido"].includes(l.etapa)).reduce((s, l) => s + (+l.valor_estimado || 0), 0);

  const porSaude = s => ativos.filter(c => c.status_saude === s).length;
  const criticos = ativos.filter(c => c.status_saude === "vermelho");
  const atencao = ativos.filter(c => c.status_saude === "amarelo");

  const monthlyMap = {};
  caixa.forEach(c => {
    const m = c.data?.slice(0, 7) || ""; if (!m) return;
    if (!monthlyMap[m]) monthlyMap[m] = { label: m.slice(5), entrada: 0, saida: 0 };
    if (c.tipo === "Entrada") monthlyMap[m].entrada += (+c.valor); else monthlyMap[m].saida += (+c.valor);
  });
  const monthly = Object.values(monthlyMap).sort((a, b) => a.label.localeCompare(b.label)).slice(-6);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h1 style={{ color: T.text, fontSize: 24, fontWeight: 800, margin: 0 }}>Dashboard</h1>
        <p style={{ color: T.sub, fontSize: 14, marginTop: 4 }}>Visão executiva da agência</p>
      </div>

      {/* KPIs principais */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 }}>
        <KpiCard label="MRR" value={fmtK(mrr)} sub={`${ativos.length} clientes ativos`} color={T.green} icon="↗" />
        <KpiCard label="Resultado" value={fmtK(resultado)} sub={`Margem ${fmtPct(margem)}`} color={resultado >= 0 ? T.green : T.red} icon="◆" />
        <KpiCard label="Entradas" value={fmtK(entradas)} color={T.accent} icon="+" />
        <KpiCard label="Pipeline" value={fmtK(pipeline)} sub={`${leads.filter(l => !["Fechado", "Perdido"].includes(l.etapa)).length} leads`} color={T.purple} icon="◎" />
        <KpiCard label="Custos" value={fmtK(custoTotal)} color={T.amber} icon="▲" />
      </div>

      {/* Saúde da carteira + Receita */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 16 }}>
        <Card>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 18 }}>Saúde da carteira</div>
          {[["verde", "🟢 Saudáveis", T.green], ["amarelo", "🟡 Atenção", T.amber], ["vermelho", "🔴 Críticos", T.red]].map(([k, l, c]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <span style={{ fontSize: 13, color: T.sub }}>{l}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <MiniBar value={porSaude(k)} max={ativos.length || 1} color={c} />
                <span style={{ fontSize: 16, fontWeight: 800, color: c, fontFamily: M, minWidth: 24, textAlign: "right" }}>{porSaude(k)}</span>
              </div>
            </div>
          ))}
          <div style={{ height: 1, background: T.border, margin: "14px 0" }} />
          <div style={{ fontSize: 12, color: T.muted }}>Satisfação média: <span style={{ color: T.amber, fontWeight: 700 }}>{ativos.length > 0 ? (ativos.reduce((s, c) => s + (+c.satisfacao || 0), 0) / ativos.length).toFixed(1) : 0} ★</span></div>
        </Card>

        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>Receita mensal</div>
            <div style={{ display: "flex", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}><div style={{ width: 8, height: 8, borderRadius: 2, background: T.green }} /><span style={{ fontSize: 10, color: T.sub }}>Entrada</span></div>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}><div style={{ width: 8, height: 8, borderRadius: 2, background: T.red }} /><span style={{ fontSize: 10, color: T.sub }}>Saída</span></div>
            </div>
          </div>
          <p style={{ color: T.muted, fontSize: 12, margin: "0 0 14px" }}>Últimos 6 meses</p>
          {monthly.length === 0
            ? <div style={{ color: T.muted, fontSize: 13, textAlign: "center", padding: "24px 0" }}>Adicione lançamentos para ver o gráfico</div>
            : <>
              <LineArea data={monthly.map(m => m.entrada)} color={T.green} h={90} />
              <div style={{ display: "flex", gap: 4, marginTop: 8 }}>
                {monthly.map((m, i) => <div key={i} style={{ flex: 1, textAlign: "center", fontSize: 10, color: T.muted }}>{m.label}</div>)}
              </div>
            </>}
        </Card>
      </div>

      {/* Alertas + Top clientes */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Card>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 16 }}>⚠️ Clientes que precisam de atenção</div>
          {criticos.length === 0 && atencao.length === 0
            ? <div style={{ color: T.green, fontSize: 13 }}>✓ Todos os clientes estão saudáveis!</div>
            : [...criticos, ...atencao].slice(0, 5).map(c => {
              const saude = SAUDE[c.status_saude] || SAUDE.verde;
              return (
                <div key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, padding: "8px 12px", background: saude.bg, borderRadius: 10, border: `1px solid ${saude.color}22` }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{c.nome}</div>
                    {c.nota_saude && <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>{c.nota_saude.slice(0, 50)}...</div>}
                  </div>
                  <Badge color={saude.color}>{saude.emoji}</Badge>
                </div>
              );
            })}
        </Card>

        <Card>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 16 }}>Top clientes por MRR</div>
          {ativos.length === 0
            ? <div style={{ color: T.muted, fontSize: 13 }}>Sem clientes ativos</div>
            : [...ativos].sort((a, b) => (+b.valor_mensal || 0) - (+a.valor_mensal || 0)).slice(0, 5).map((c, i) => (
              <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <div style={{ width: 26, height: 26, borderRadius: "50%", background: T.accentBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: T.accentL, fontWeight: 800, flexShrink: 0 }}>{i + 1}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, color: T.text, marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.nome}</div>
                  <MiniBar value={+c.valor_mensal || 0} max={Math.max(...ativos.map(x => +x.valor_mensal || 0), 1)} color={T.accent} />
                </div>
                <span style={{ fontFamily: M, fontSize: 13, color: T.accentL, flexShrink: 0, fontWeight: 700 }}>{fmt(c.valor_mensal)}</span>
              </div>
            ))}
        </Card>
      </div>

      {/* Barras mensais + DRE rápida */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Card>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 14 }}>Entradas × Saídas</div>
          <BarGroup months={monthly} />
        </Card>
        <Card>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 16 }}>Resumo financeiro</div>
          {[["Receita total", entradas, T.green], ["Total custos", custoTotal, T.amber], ["Total saídas", saidas, T.red], ["Resultado", resultado, resultado >= 0 ? T.green : T.red]].map(([l, v, c]) => (
            <div key={l} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontSize: 13, color: T.sub }}>{l}</span>
              <span style={{ fontSize: 15, fontWeight: 700, color: c, fontFamily: M }}>{fmt(v)}</span>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function SimpleTable({ cols, rows, emptyMsg = "Nenhum registro" }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr>{cols.map(c => <th key={c.key} style={{ textAlign: c.align || "left", padding: "10px 16px", color: T.muted, fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: `1px solid ${T.border}` }}>{c.label}</th>)}</tr>
        </thead>
        <tbody>
          {rows.length === 0
            ? <tr><td colSpan={cols.length} style={{ textAlign: "center", color: T.muted, padding: "32px 0" }}>{emptyMsg}</td></tr>
            : rows.map((row, i) => (
              <tr key={i} style={{ borderBottom: `1px solid ${T.border}22` }}
                onMouseEnter={e => e.currentTarget.style.background = T.surface}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                {cols.map(c => <td key={c.key} style={{ padding: "12px 16px", color: T.text, textAlign: c.align || "left", verticalAlign: "middle" }}>{c.render ? c.render(row[c.key], row) : row[c.key]}</td>)}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}

function QuickEdit({ title, item, fields, onSave, onClose, wide }) {
  const [form, setForm] = useState({ ...item });
  const [saving, setSaving] = useState(false);
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <Modal title={title} onClose={onClose} wide={wide}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {fields.map(f => {
          if (f.t === "select") return <Sel key={f.k} label={f.l} full={f.full} value={form[f.k] ?? ""} onChange={set(f.k)} options={f.opts} />;
          if (f.t === "textarea") return <Tex key={f.k} label={f.l} full={f.full} value={form[f.k] ?? ""} onChange={set(f.k)} />;
          return <Inp key={f.k} label={f.l} full={f.full} type={f.t || "text"} value={form[f.k] ?? ""} onChange={set(f.k)} />;
        })}
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 22, justifyContent: "flex-end" }}>
        <Btn variant="ghost" onClick={onClose}>Cancelar</Btn>
        <Btn onClick={async () => { setSaving(true); await onSave(form); setSaving(false); }} disabled={saving}>{saving ? "Salvando..." : "Salvar"}</Btn>
      </div>
    </Modal>
  );
}

// ─── NAV ──────────────────────────────────────────────────────────────────────
const NAV = [
  { id: "dashboard", label: "Dashboard", icon: "▣" },
  { id: "clientes", label: "Clientes", icon: "◉" },
  { id: "financeiro", label: "Financeiro", icon: "◆" },
  { id: "crm", label: "CRM", icon: "◎" },
];

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);

  const clientesDB = useDB("clientes");
  const caixaDB = useDB("caixa");
  const custosDB = useDB("custos");
  const investDB = useDB("investimentos");
  const leadsDB = useDB("leads");

  const pages = {
    dashboard: <Dashboard clientes={clientesDB.rows} caixa={caixaDB.rows} custos={custosDB.rows} investimentos={investDB.rows} leads={leadsDB.rows} />,
    clientes: <Clientes />,
    financeiro: <Financeiro />,
    crm: <CRM />,
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: T.bg, fontFamily: F, color: T.text }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet" />

      {/* Sidebar */}
      <aside style={{ width: collapsed ? 64 : 220, background: T.surface, borderRight: `1px solid ${T.border}`, display: "flex", flexDirection: "column", transition: "width 0.2s", flexShrink: 0, overflow: "hidden" }}>
        {/* Logo */}
        <div style={{ padding: collapsed ? "20px 0" : "20px 20px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "space-between", minHeight: 68 }}>
          {!collapsed && (
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: T.text, letterSpacing: "-0.02em" }}>Agência<span style={{ color: T.accent }}>OS</span></div>
              <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>● Supabase conectado</div>
            </div>
          )}
          <button onClick={() => setCollapsed(c => !c)} style={{ background: "transparent", border: "none", color: T.muted, cursor: "pointer", fontSize: 16, padding: 4, lineHeight: 1, flexShrink: 0 }}>
            {collapsed ? "→" : "←"}
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "12px 0" }}>
          {NAV.map(item => (
            <button key={item.id} onClick={() => setPage(item.id)} style={{
              width: "100%", background: page === item.id ? T.accentBg : "transparent",
              border: "none", borderLeft: page === item.id ? `2px solid ${T.accent}` : "2px solid transparent",
              color: page === item.id ? T.accentL : T.sub,
              padding: collapsed ? "13px 0" : "13px 20px",
              display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "flex-start",
              gap: 12, cursor: "pointer", fontFamily: F, fontSize: 13, fontWeight: page === item.id ? 700 : 500,
              textAlign: "left", transition: "all 0.15s",
            }}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>{item.icon}</span>
              {!collapsed && <span style={{ whiteSpace: "nowrap" }}>{item.label}</span>}
            </button>
          ))}
        </nav>

        {!collapsed && (
          <div style={{ padding: "16px 20px", borderTop: `1px solid ${T.border}` }}>
            <div style={{ fontSize: 10, color: T.dim, lineHeight: 1.6 }}>
              Dados salvos permanentemente<br />no Supabase (São Paulo)
            </div>
          </div>
        )}
      </aside>

      {/* Main */}
      <main style={{ flex: 1, overflowY: "auto", padding: "36px 40px", minWidth: 0 }}>
        {pages[page]}
      </main>
    </div>
  );
}
