// === FORM HANDLERS ===
document.getElementById("formSimulacao").addEventListener("submit", function (e) {
  e.preventDefault();
  alert("✅ Pedido de simulação enviado com sucesso!");
  this.reset();
});

document.getElementById("formTarefa").addEventListener("submit", function (e) {
  e.preventDefault();
  alert("📬 Pedido/tarefa enviada com sucesso!");
  this.reset();
});
