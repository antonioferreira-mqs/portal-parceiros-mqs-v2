/* Toast & loading */
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

/* ============ LOGIN (mock) ============ */
const loginCard = document.getElementById("loginCard");
const loginForm = document.getElementById("loginForm");
const loginEmail = document.getElementById("loginEmail");
const loginCode = document.getElementById("loginCode");
const sendCodeBtn = document.getElementById("sendCodeBtn");

const partnerStatus = document.getElementById("partnerStatus");
const partnerEmailBadge = document.getElementById("partnerEmailBadge");
const logoutBtn = document.getElementById("logoutBtn");

function isLogged(){
  return !!localStorage.getItem("partnerEmail");
}
function getPartnerEmail(){
  return localStorage.getItem("partnerEmail") || "";
}
function showLoggedUI(email){
  partnerEmailBadge.textContent = email;
  partnerStatus.hidden = false;
  loginCard.hidden = true;
  const emailField = document.getElementById("auto_email");
  if (emailField){
    emailField.value = email;
    emailField.readOnly = true;
  }
}
function showLoggedOutUI(){
  partnerStatus.hidden = true;
  loginCard.hidden = false;
  const emailField = document.getElementById("auto_email");
  if (emailField){
    emailField.value = "";
    emailField.readOnly = false;
  }
}
if (isLogged()) showLoggedUI(getPartnerEmail());

logoutBtn?.addEventListener("click", () => {
  localStorage.removeItem("partnerEmail");
  showLoggedOutUI();
  showToast("Sessão terminada.");
});

/* Simular envio de código */
sendCodeBtn?.addEventListener("click", async () => {
  const email = (loginEmail.value || "").trim();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
    showToast("Introduz um email válido.", "error");
    return;
  }
  setLoading(sendCodeBtn, true);
  await new Promise(r => setTimeout(r, 600));
  showToast("Código enviado para o teu email (mock: 123456).");
  setLoading(sendCodeBtn, false);
});

loginForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = (loginEmail.value || "").trim();
  const code = (loginCode.value || "").trim();
  if (!email || !code){ showToast("Preenche email e código.", "error"); return; }
  const btn = loginForm.querySelector("button[type=submit]");
  setLoading(btn, true);
  await new Promise(r => setTimeout(r, 600));
  if (code === "123456"){ // mock
    localStorage.setItem("partnerEmail", email);
    showLoggedUI(email);
    showToast("Sessão iniciada com sucesso.");
  } else {
    showToast("Código inválido.", "error");
  }
  setLoading(btn, false);
});

/* ============ UTIL – Datas flexíveis ============ */
/** Formata amigavelmente enquanto o utilizador digita.
 *  Aceita 'ddmmaaaa', 'dd/mm/aaaa', 'dd-mm-aaaa' e permite apagar livremente. */
function formatDateLive(value){
  const digits = value.replace(/\D+/g, "").slice(0, 8); // até 8 dígitos
  const d = digits.slice(0,2);
  const m = digits.slice(2,4);
  const y = digits.slice(4,8);
  let out = d;
  if (m) out += "/" + m;
  if (y) out += "/" + y;
  return out;
}

/** Valida e normaliza para dd/mm/aaaa. Retorna null se inválida. */
function normalizeDMY(value){
  if (!value) return null;
  const digits = value.replace(/\D+/g, "");
  if (digits.length !== 8) return null;
  const dd = parseInt(digits.slice(0,2), 10);
  const mm = parseInt(digits.slice(2,4), 10);
  const yyyy = parseInt(digits.slice(4,8), 10);
  if (mm < 1 || mm > 12 || dd < 1 || dd > 31) return null;
  // checagem simples por dias do mês
  const test = new Date(yyyy, mm - 1, dd);
  if (test.getFullYear() !== yyyy || test.getMonth() !== mm - 1 || test.getDate() !== dd) return null;
  const ddS = String(dd).padStart(2, "0");
  const mmS = String(mm).padStart(2, "0");
  return `${ddS}/${mmS}/${yyyy}`;
}

/** Converte dd/mm/aaaa → aaaa-mm-dd (ISO) */
function toISOfromDMY(dmy){
  const [d,m,y] = dmy.split("/");
  return `${y}-${m}-${d}`;
}

/* Aplicar aos inputs de data */
document.querySelectorAll(".date-input").forEach(el => {
  el.addEventListener("input", () => {
    const pos = el.selectionStart || 0;
    const before = el.value;
    el.value = formatDateLive(el.value);
    // Ajuste pequeno de cursor quando se inserem/removem separadores
    const diff = el.value.length - before.length;
    el.setSelectionRange(pos + diff, pos + diff);
  });
  el.addEventListener("blur", () => {
    const norm = normalizeDMY(el.value);
    if (norm) el.value = norm;
  });
});

/* ============ RAMO AUTOMÓVEL ============ */
const formAuto = document.getElementById("formAuto");
const autoMatricula = document.getElementById("auto_matricula");
const autoNif = document.getElementById("auto_nif");
const autoChNif = document.getElementById("auto_ch_nif");
const grpCondutor = document.getElementById("auto_condutorGrupo");
const grpDP = document.getElementById("auto_dpGrupo");

/* Mostrar/ocultar condutor habitual */
if (formAuto){
  formAuto.querySelectorAll('input[name="auto_tomadorCondutor"]').forEach(r => {
    r.addEventListener("change", () => {
      const isNao = formAuto.auto_tomadorCondutor.value === "NAO";
      grpCondutor.hidden = !isNao;
      ["auto_ch_nome","auto_ch_nif","auto_ch_dn","auto_ch_dcarta"].forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        isNao ? el.setAttribute("required","") : el.removeAttribute("required");
      });
    });
  });

  /* Danos próprios extra */
  const dpCheckboxes = formAuto.querySelectorAll('input[name="auto_coberturas"]');
  dpCheckboxes.forEach(cb => cb.addEventListener("change", () => {
    const hasDP = Array.from(dpCheckboxes).some(c => c.checked && c.value === "Danos Próprios");
    grpDP.hidden = !hasDP;
    const franquia = document.getElementById("auto_dp_franquia");
    const capital = document.getElementById("auto_dp_capital");
    if (hasDP) { franquia.setAttribute("required",""); capital.setAttribute("required",""); }
    else { franquia.removeAttribute("required"); capital.removeAttribute("required"); }
  }));

  /* Máscaras leves */
  function onlyDigits(el){ if(!el) return; el.value = el.value.replace(/\D+/g, "").slice(0,9); }
  [autoNif, autoChNif].forEach(el => el && el.addEventListener("input", () => onlyDigits(el)));

  autoMatricula && autoMatricula.addEventListener("input", () => {
    let v = autoMatricula.value.toUpperCase().replace(/[^0-9A-Z]/g, "").slice(0,6);
    if (v.length > 4) v = v.slice(0,2) + "-" + v.slice(2,4) + "-" + v.slice(4);
    else if (v.length > 2) v = v.slice(0,2) + "-" + v.slice(2);
    autoMatricula.value = v;
  });

  /* Validação */
  function validateAuto() {
    let ok = true;
    formAuto.querySelectorAll("[required]").forEach(el => {
      if (el.offsetParent === null) return;
      if (!el.value.trim()){ ok = false; el.setAttribute("aria-invalid","true");
        el.addEventListener("input", () => el.removeAttribute("aria-invalid"), { once:true }); }
    });

    // NIFs
    const nif = autoNif.value.trim();
    if (!/^\d{9}$/.test(nif)) ok = false;
    if (!grpCondutor.hidden){
      const chNif = autoChNif.value.trim();
      if (!/^\d{9}$/.test(chNif)) ok = false;
    }

    // Matrícula
    if (!/^[0-9A-Z]{2}-[0-9A-Z]{2}-[0-9A-Z]{2}$/.test(autoMatricula.value.trim())) ok = false;

    // Datas — normalização
    const dates = ["auto_dn","auto_dcarta"];
    if (!grpCondutor.hidden){ dates.push("auto_ch_dn","auto_ch_dcarta"); }
    for (const id of dates){
      const el = document.getElementById(id);
      const norm = normalizeDMY(el.value);
      if (!norm){ ok = false; el.setAttribute("aria-invalid","true"); }
      else el.value = norm; // aplica normalizado
    }

    // Danos próprios
    if (!grpDP.hidden){
      const franquia = document.getElementById("auto_dp_franquia").value;
      const capital = document.getElementById("auto_dp_capital").value.trim();
      if (!franquia || !capital) ok = false;
    }
    return ok;
  }

  /* Serialização payload */
  function serializeAuto() {
    const fd = new FormData(formAuto);
    const coberturas = Array.from(formAuto.querySelectorAll('input[name="auto_coberturas"]:checked')).map(c => c.value);

    const dn = normalizeDMY(fd.get("auto_dn"));
    const dc = normalizeDMY(fd.get("auto_dcarta"));
    const ch_dn_norm = normalizeDMY(fd.get("auto_ch_dn") || "");
    const ch_dc_norm = normalizeDMY(fd.get("auto_ch_dcarta") || "");

    const payload = {
      ramo: "Automovel",
      parceiroEmail: fd.get("auto_email"),
      tomador: {
        nome: fd.get("auto_nome"),
        nif: fd.get("auto_nif"),
        morada: fd.get("auto_morada"),
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
    return payload;
  }

  /* Submeter (trocar pelo teu endpoint) */
  async function submitAutoToBackend(payload){
    // Ex.: return fetch("https://teu-endpoint", {method:"POST", headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload)}).then(r=>r.json());
    await new Promise(r => setTimeout(r, 900));
    return { ok:true, trelloCardId:"CRD-AX73Z1" };
  }

  formAuto.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!validateAuto()){
      showToast("Revê os campos assinalados a vermelho.", "error");
      return;
    }
    const btn = formAuto.querySelector("button");
    setLoading(btn, true);
    try{
      const payload = serializeAuto();
      const res = await submitAutoToBackend(payload);
      if (res?.ok){
        const id = res.trelloCardId ? ` (ID: ${res.trelloCardId})` : "";
        showToast("🚗 Pedido Automóvel submetido com sucesso" + id + "!");
        formAuto.reset();
        grpCondutor.hidden = true;
        grpDP.hidden = true;
        // se sessão iniciada, volta a preencher email
        if (isLogged()){
          const email = getPartnerEmail();
          document.getElementById("auto_email").value = email;
          document.getElementById("auto_email").readOnly = true;
        }
      } else {
        showToast("Não foi possível submeter o pedido. Tenta novamente.", "error");
      }
    }catch(err){
      console.error(err);
      showToast("Erro de rede. Verifica a ligação.", "error");
    }finally{
      setLoading(btn, false);
    }
  });
}

/* Prefill do email se já logado ao carregar a página */
window.addEventListener("DOMContentLoaded", () => {
  if (isLogged()){
    const email = getPartnerEmail();
    showLoggedUI(email);
  }
});
