/* Utilitários de UX */
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
  if (isLoading){
    btn.setAttribute("aria-busy", "true");
    btn.disabled = true;
  } else {
    btn.removeAttribute("aria-busy");
    btn.disabled = false;
  }
}

/* ================================
   RAMO AUTOMÓVEL – lógica & UX
   ================================ */

const formAuto = document.getElementById("formAuto");
const autoMatricula = document.getElementById("auto_matricula");
const autoNif = document.getElementById("auto_nif");
const autoChNif = document.getElementById("auto_ch_nif");
const grpCondutor = document.getElementById("auto_condutorGrupo");
const grpDP = document.getElementById("auto_dpGrupo");

/* 1) Mostrar/esconder “Condutor Habitual” quando NÃO */
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

  /* 2) Mostrar/esconder grupo de Danos Próprios */
  const dpCheckboxes = formAuto.querySelectorAll('input[name="auto_coberturas"]');
  dpCheckboxes.forEach(cb => cb.addEventListener("change", () => {
    const hasDP = Array.from(dpCheckboxes).some(c => c.checked && c.value === "Danos Próprios");
    grpDP.hidden = !hasDP;
    const franquia = document.getElementById("auto_dp_franquia");
    const capital = document.getElementById("auto_dp_capital");
    if (hasDP) {
      franquia.setAttribute("required","");
      capital.setAttribute("required","");
    } else {
      franquia.removeAttribute("required");
      capital.removeAttribute("required");
    }
  }));

  /* 3) Máscaras leves / normalizações */
  function onlyDigits(el){ if(!el) return; el.value = el.value.replace(/\D+/g, "").slice(0,9); }
  [autoNif, autoChNif].forEach(el => el && el.addEventListener("input", () => onlyDigits(el)));

  autoMatricula && autoMatricula.addEventListener("input", () => {
    let v = autoMatricula.value.toUpperCase().replace(/[^0-9A-Z]/g, "").slice(0,6);
    // auto-inserir hífens: 00-XX-00
    if (v.length > 4) v = v.slice(0,2) + "-" + v.slice(2,4) + "-" + v.slice(4);
    else if (v.length > 2) v = v.slice(0,2) + "-" + v.slice(2);
    autoMatricula.value = v;
  });

  /* 4) Validação específica */
  function validateAuto() {
    let ok = true;

    // base
    formAuto.querySelectorAll("[required]").forEach(el => {
      if (el.offsetParent === null) return; // skip hidden
      if (!el.value.trim()) {
        ok = false;
        el.setAttribute("aria-invalid", "true");
        el.addEventListener("input", () => el.removeAttribute("aria-invalid"), { once: true });
      }
    });

    // padrões
    const nif = autoNif.value.trim();
    if (!/^\d{9}$/.test(nif)) ok = false;

    if (!/^[0-9A-Z]{2}-[0-9A-Z]{2}-[0-9A-Z]{2}$/.test(autoMatricula.value.trim())) ok = false;

    // se grupo CH visível, validar NIF
    if (!grpCondutor.hidden) {
      if (!/^\d{9}$/.test(autoChNif.value.trim())) ok = false;
    }

    // se DP, garantir franquia/capital
    if (!grpDP.hidden) {
      const franquia = document.getElementById("auto_dp_franquia").value;
      const capital = document.getElementById("auto_dp_capital").value.trim();
      if (!franquia || !capital) ok = false;
    }

    return ok;
  }

  /* 5) Serialização → JSON (pronto para backend/Trello/email) */
  function serializeAuto() {
    const fd = new FormData(formAuto);
    const coberturas = Array.from(formAuto.querySelectorAll('input[name="auto_coberturas"]:checked')).map(c => c.value);

    const payload = {
      ramo: "Automovel",
      parceiroEmail: fd.get("auto_email"),
      tomador: {
        nome: fd.get("auto_nome"),
        nif: fd.get("auto_nif"),
        morada: fd.get("auto_morada"),
        dataNascimento: fd.get("auto_dn"),
        dataCarta: fd.get("auto_dcarta"),
      },
      condutorHabitual: (fd.get("auto_tomadorCondutor") === "NAO") ? {
        nome: fd.get("auto_ch_nome"),
        nif: fd.get("auto_ch_nif"),
        dataNascimento: fd.get("auto_ch_dn"),
        dataCarta: fd.get("auto_ch_dcarta"),
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

  /* 6) Submissão real (liga ao teu backend aqui) */
  async function submitAutoToBackend(payload){
    // 👉 TROCAR PELO TEU ENDPOINT (Make/Zapier/Cloudflare Worker/Apps Script/Server)
    // return fetch("/api/submit", { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(payload) })
    //   .then(r => r.json());

    // Simulação para manter UX:
    await new Promise(res => setTimeout(res, 900));
    return { ok:true, trelloCardId: "CRD-AX73Z1" };
  }

  /* 7) Handler de envio */
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

      if (res && res.ok){
        const id = res.trelloCardId ? ` (ID: ${res.trelloCardId})` : "";
        showToast("🚗 Pedido Automóvel submetido com sucesso" + id + "!");
        formAuto.reset();
        // reset de grupos condicionais
        grpCondutor.hidden = true;
        grpDP.hidden = true;
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
