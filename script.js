/* ===== UTIL: Toast & Loading ===== */
const toast = document.getElementById("toast");
function showToast(msg, type="ok"){
  toast.textContent = msg;
  toast.classList.remove("error");
  if (type === "error") toast.classList.add("error");
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3200);
}
function setLoading(btn, isLoading){
  if (!btn) return;
  if (isLoading){ btn.setAttribute("aria-busy","true"); btn.disabled = true; }
  else { btn.removeAttribute("aria-busy"); btn.disabled = false; }
}

/* ===== SPA NAV + GUARD ===== */
const views = {
  login: document.getElementById("view-login"),
  home: document.getElementById("view-home"),
  "simulacao-menu": document.getElementById("view-simulacao-menu"),
  "outro-pedido": document.getElementById("view-outro-pedido"),
  "auto-form": document.getElementById("view-auto-form"),
};
function isLogged(){ return !!localStorage.getItem("partnerEmail"); }
function getPartnerEmail(){ return localStorage.getItem("partnerEmail") || ""; }

function showView(name){
  // Guard: só permite entrar fora de login se autenticado
  if (name !== "login" && !isLogged()){
    name = "login";
    showToast("Autentica-te para continuar.", "error");
  }
  Object.values(views).forEach(v => v && (v.hidden = true));
  views[name] && (views[name].hidden = false);

  // Prefill do email no formulário Automóvel
  if (name === "auto-form" && isLogged()){
    const emailField = document.getElementById("auto_email");
    if (emailField){ emailField.value = getPartnerEmail(); emailField.readOnly = true; }
  }
}

// Botões de navegação
document.querySelectorAll("[data-nav]").forEach(btn => {
  btn.addEventListener("click", () => showView(btn.dataset.nav));
});

/* ===== HEADER STATUS ===== */
const partnerStatus = document.getElementById("partnerStatus");
const partnerEmailBadge = document.getElementById("partnerEmailBadge");
const logoutBtn = document.getElementById("logoutBtn");
function showLoggedUI(email){
  partnerEmailBadge.textContent = email;
  partnerStatus.hidden = false;
  showView("home");
}
function showLoggedOutUI(){
  partnerStatus.hidden = true;
  localStorage.removeItem("partnerEmail");
  showView("login");
}
logoutBtn?.addEventListener("click", () => {
  showLoggedOutUI();
  showToast("Sessão terminada.");
});

/* ===== LOGIN (mock OTP) ===== */
const loginForm = document.getElementById("loginForm");
const loginEmail = document.getElementById("loginEmail");
const loginCode = document.getElementById("loginCode");
const sendCodeBtn = document.getElementById("sendCodeBtn");

// Ponto para validação real (whitelist + envio de código)
async function requestLoginCode(email){
  // 👉 Trocar por chamada real ao teu backend/Make/Worker:
  // return fetch("/auth/send-code", { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ email })}).then(r=>r.json());
  await new Promise(r=>setTimeout(r,600));
  return { ok:true, codeSent:true, mockCode:"123456" };
}
async function verifyLoginCode(email, code){
  // 👉 Trocar por verificação real:
  await new Promise(r=>setTimeout(r,500));
  return { ok: code === "123456" };
}

sendCodeBtn?.addEventListener("click", async () => {
  const email = (loginEmail.value || "").trim();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
    showToast("Introduz um email válido.", "error");
    return;
  }
  setLoading(sendCodeBtn, true);
  const res = await requestLoginCode(email);
  setLoading(sendCodeBtn, false);
  if (res?.ok){
    showToast("Código enviado para o teu email (mock: 123456).");
  }else{
    showToast("Não foi possível enviar código.", "error");
  }
});

loginForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = (loginEmail.value || "").trim();
  const code = (loginCode.value || "").trim();
  if (!email || !code){ showToast("Preenche email e código.", "error"); return; }
  const btn = loginForm.querySelector("button[type=submit]");
  setLoading(btn, true);
  const res = await verifyLoginCode(email, code);
  setLoading(btn, false);
  if (res?.ok){
    localStorage.setItem("partnerEmail", email);
    showLoggedUI(email);
    showToast("Sessão iniciada com sucesso.");
  }else{
    showToast("Código inválido.", "error");
  }
});

/* ===== DATAS FLEXÍVEIS ===== */
function formatDateLive(value){
  const digits = value.replace(/\D+/g, "").slice(0,8);
  const d = digits.slice(0,2), m = digits.slice(2,4), y = digits.slice(4,8);
  let out = d; if (m) out += "/" + m; if (y) out += "/" + y; return out;
}
function normalizeDMY(value){
  if (!value) return null;
  const digits = value.replace(/\D+/g, "");
  if (digits.length !== 8) return null;
  const dd = +digits.slice(0,2), mm = +digits.slice(2,4), yyyy = +digits.slice(4,8);
  const dt = new Date(yyyy, mm-1, dd);
  if (dt.getFullYear()!==yyyy || dt.getMonth()!==mm-1 || dt.getDate()!==dd) return null;
  return `${String(dd).padStart(2,"0")}/${String(mm).padStart(2,"0")}/${yyyy}`;
}
function toISOfromDMY(dmy){ const [d,m,y] = dmy.split("/"); return `${y}-${m}-${d}`; }
document.querySelectorAll(".date-input").forEach(el=>{
  el.addEventListener("input", ()=>{
    const pos = el.selectionStart || 0; const before = el.value;
    el.value = formatDateLive(el.value);
    const diff = el.value.length - before.length;
    el.setSelectionRange(pos + diff, pos + diff);
  });
  el.addEventListener("blur", ()=>{
    const norm = normalizeDMY(el.value); if (norm) el.value = norm;
  });
});

/* ===== FORM OUTRO (placeholder de exemplo) ===== */
const formOutro = document.getElementById("formOutro");
formOutro?.addEventListener("submit", async (e)=>{
  e.preventDefault();
  const btn = formOutro.querySelector("button[type=submit]");
  setLoading(btn,true);
  await new Promise(r=>setTimeout(r,700));
  setLoading(btn,false);
  showToast("Pedido registado (Tarefas).");
  formOutro.reset();
});

/* ===== AUTOMÓVEL ===== */
const formAuto = document.getElementById("formAuto");
const autoMatricula = document.getElementById("auto_matricula");
const autoNif = document.getElementById("auto_nif");
const autoChNif = document.getElementById("auto_ch_nif");
const grpCondutor = document.getElementById("auto_condutorGrupo");
const grpDP = document.getElementById("auto_dpGrupo");

function onlyDigits(el){ if(!el) return; el.value = el.value.replace(/\D+/g, "").slice(0,9); }
[autoNif, autoChNif].forEach(el => el && el.addEventListener("input", ()=>onlyDigits(el)));

autoMatricula?.addEventListener("input", ()=>{
  let v = autoMatricula.value.toUpperCase().replace(/[^0-9A-Z]/g,"").slice(0,6);
  if (v.length>4) v = v.slice(0,2)+"-"+v.slice(2,4)+"-"+v.slice(4);
  else if (v.length>2) v = v.slice(0,2)+"-"+v.slice(2);
  autoMatricula.value = v;
});

/* Mostrar/ocultar Condutor Habitual */
formAuto?.querySelectorAll('input[name="auto_tomadorCondutor"]').forEach(r=>{
  r.addEventListener("change", ()=>{
    const isNao = formAuto.auto_tomadorCondutor.value === "NAO";
    grpCondutor.hidden = !isNao;
    ["auto_ch_nome","auto_ch_nif","auto_ch_dn","auto_ch_dcarta"].forEach(id=>{
      const el = document.getElementById(id); if (!el) return;
      isNao ? el.setAttribute("required","") : el.removeAttribute("required");
    });
  });
});

/* Danos Próprios extras */
const dpCheckboxes = formAuto ? formAuto.querySelectorAll('input[name="auto_coberturas"]') : [];
dpCheckboxes.forEach(cb=>cb.addEventListener("change", ()=>{
  const hasDP = Array.from(dpCheckboxes).some(c => c.checked && c.value==="Danos Próprios");
  grpDP.hidden = !hasDP;
  const franquia = document.getElementById("auto_dp_franquia");
  const capital = document.getElementById("auto_dp_capital");
  if (hasDP){ franquia.setAttribute("required",""); capital.setAttribute("required",""); }
  else { franquia.removeAttribute("required"); capital.removeAttribute("required"); }
}));

/* ===== LIBAX LOOKUP por NIF ===== */
async function fetchLibaxClientByNIF(nif){
  // 👉 Substitui pela tua integração real (Worker/Make):
  // return fetch(`/libax/client?nif=${nif}`).then(r=>r.json());
  await new Promise(r=>setTimeout(r,500));
  // MOCK: devolve dados apenas se NIF terminar em '1'
  if (nif?.endsWith("1")){
    return {
      ok:true,
      data:{
        nome:"Cliente Exemplo",
        dataNascimento:"1989-07-21",
        morada:"4000-001 Porto, Rua Exemplo 1",
        email:"cliente.exemplo@dominio.pt",
        telefone:"912345671"
      }
    };
  }
  return { ok:false };
}

autoNif?.addEventListener("blur", async ()=>{
  const nif = autoNif.value.trim();
  if (!/^\d{9}$/.test(nif)) return;
  const res = await fetchLibaxClientByNIF(nif);
  if (res?.ok && res.data){
    const d = res.data;
    if (d.nome) document.getElementById("auto_nome").value = d.nome;
    if (d.morada) document.getElementById("auto_morada").value = d.morada;
    if (d.email) document.getElementById("auto_contact_email").value = d.email;
    if (d.telefone) document.getElementById("auto_phone").value = d.telefone;
    if (d.dataNascimento){
      const [y,m,da] = d.dataNascimento.split("-");
      const norm = `${da}/${m}/${y}`;
      document.getElementById("auto_dn").value = norm;
    }
    showToast("Dados carregados do LIBAX.");
  }
});

/* Validação */
function validateAuto() {
  let ok = true;
  formAuto.querySelectorAll("[required]").forEach(el => {
    if (el.offsetParent === null) return;
    if (!el.value.trim()){ ok = false; el.setAttribute("aria-invalid","true");
      el.addEventListener("input", ()=>el.removeAttribute("aria-invalid"), { once:true }); }
  });

  // NIFs
  const nif = autoNif.value.trim(); if (!/^\d{9}$/.test(nif)) ok = false;
  if (!grpCondutor.hidden){
    const chNif = (autoChNif.value||"").trim();
    if (!/^\d{9}$/.test(chNif)) ok = false;
  }

  // Matrícula
  if (!/^[0-9A-Z]{2}-[0-9A-Z]{2}-[0-9A-Z]{2}$/.test(document.getElementById("auto_matricula").value.trim())) ok = false;

  // Datas — normaliza
  const dates = ["auto_dn","auto_dcarta"];
  if (!grpCondutor.hidden){ dates.push("auto_ch_dn","auto_ch_dcarta"); }
  for (const id of dates){
    const el = document.getElementById(id);
    const norm = normalizeDMY(el.value);
    if (!norm){ ok = false; el.setAttribute("aria-invalid","true"); }
    else el.value = norm;
  }

  // Danos próprios
  if (!grpDP.hidden){
    const franquia = document.getElementById("auto_dp_franquia").value;
    const capital = document.getElementById("auto_dp_capital").value.trim();
    if (!franquia || !capital) ok = false;
  }
  return ok;
}

/* Serialização */
function serializeAuto() {
  const fd = new FormData(formAuto);
  const coberturas = Array.from(formAuto.querySelectorAll('input[name="auto_coberturas"]:checked')).map(c => c.value);
  const dn = normalizeDMY(fd.get("auto_dn"));
  const dc = normalizeDMY(fd.get("auto_dcarta"));
  const ch_dn_norm = normalizeDMY(fd.get("auto_ch_dn") || "");
  const ch_dc_norm = normalizeDMY(fd.get("auto_ch_dcarta") || "");

  return {
    ramo: "Automovel",
    parceiroEmail: fd.get("auto_email"),
    tomador: {
      nome: fd.get("auto_nome"),
      nif: fd.get("auto_nif"),
      morada: fd.get("auto_morada"),
      email: fd.get("auto_contact_email") || null,
      telefone: fd.get("auto_phone") || null,
      dataNascimento: dn ? toISOfromDMY(dn) : null,
      dataCarta: dc ? toISOfromDMY(dc) : null,
    },
    condutorHabitual: (fd.get("auto_tomadorCondutor") === "NAO") ? {
      nome: fd.get("auto_ch_nome"),
      nif: fd.get("auto_ch_nif"),
      dataNascimento: ch_dn_norm ? toISOfromDMY(ch_dn_norm) : null,
      dataCarta: ch_dc_norm ? toISOfromDMY(ch_dc_norm) : null,
    } : "TOMADOR",
    veiculo: {
      matricula: (fd.get("auto_matricula") || "").toUpperCase(),
      modelo: fd.get("auto_marcaModelo")
    },
    coberturas,
    danosProprios: coberturas.includes("Danos Próprios") ? {
      franquia: fd.get("auto_dp_franquia") || null,
      capitalSeguro: fd.get("auto_dp_capital") || null
    } : null,
    premioReferencia: fd.get("auto_premioRef") || null,
    consent: document.getElementById("auto_consent").checked,
    submittedAt: new Date().toISOString(),
    userAgent: navigator.userAgent
  };
}

/* Submissão (troca pelo teu endpoint) */
async function submitAutoToBackend(payload){
  // Ex.: return fetch("https://teu-endpoint", {method:"POST", headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload)}).then(r=>r.json());
  await new Promise(r => setTimeout(r, 900));
  return { ok:true, trelloCardId:"CRD-AX73Z1" };
}

formAuto?.addEventListener("submit", async (e)=>{
  e.preventDefault();
  if (!validateAuto()){ showToast("Revê os campos assinalados a vermelho.", "error"); return; }
  const btn = formAuto.querySelector("button[type=submit]");
  setLoading(btn, true);
  try{
    const payload = serializeAuto();
    const res = await submitAutoToBackend(payload);
    if (res?.ok){
      const id = res.trelloCardId ? ` (ID: ${res.trelloCardId})` : "";
      showToast("🚗 Pedido Automóvel submetido com sucesso" + id + "!");
      formAuto.reset();
      grpCondutor.hidden = true; grpDP.hidden = true;
      if (isLogged()){ const email = getPartnerEmail(); const f = document.getElementById("auto_email"); f.value = email; f.readOnly = true; }
    } else {
      showToast("Não foi possível submeter o pedido.", "error");
    }
  }catch(err){
    console.error(err);
    showToast("Erro de rede. Verifica a ligação.", "error");
  }finally{
    setLoading(btn, false);
  }
});

/* Boot: mostra login ou home conforme sessão */
window.addEventListener("DOMContentLoaded", ()=>{
  if (isLogged()){
    const email = getPartnerEmail();
    partnerEmailBadge.textContent = email;
    partnerStatus.hidden = false;
    showView("home");
  } else {
    showView("login");
  }
});

