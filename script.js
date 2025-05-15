function renderizarGraficosDashboard() {
  const ctx1 = document.getElementById("graficoEvolutivo").getContext("2d");
  const ctx2 = document.getElementById("graficoCanalCantidad").getContext("2d");
  const ctx3 = document.getElementById("graficoCanalMonto").getContext("2d");
  const ctx4 = document.getElementById("graficoPorcentajeTipoRiesgo").getContext("2d");

  const agrupado = {};
  datos.forEach(d => {
    const mes = new Date(d.fecha).toLocaleDateString("es-AR", { month: "short", year: "2-digit" });
    if (!agrupado[mes]) agrupado[mes] = { casos: 0, monto: 0 };
    agrupado[mes].casos++;
    agrupado[mes].monto += d.monto_sospechoso;
  });

  const labels = Object.keys(agrupado);
  const casos = labels.map(l => agrupado[l].casos);
  const montos = labels.map(l => (agrupado[l].monto / 1000000).toFixed(2));

  if (chartInstance1) chartInstance1.destroy();
  chartInstance1 = new Chart(ctx1, {
    type: "line",
    data: {
      labels,
      datasets: [
        { label: "Casos", data: casos, borderColor: "#3b82f6", fill: false },
        { label: "Monto (M)", data: montos, borderColor: "#ef4444", fill: false }
      ]
    },
    options: { responsive: true, plugins: { legend: { position: "top" } } }
  });

  const canalCantidad = {};
  const canalMonto = {};
  datos.forEach(d => {
    canalCantidad[d.canal_deteccion] = (canalCantidad[d.canal_deteccion] || 0) + 1;
    canalMonto[d.canal_deteccion] = (canalMonto[d.canal_deteccion] || 0) + d.monto_sospechoso;
  });

  if (chartInstance2) chartInstance2.destroy();
  chartInstance2 = new Chart(ctx2, {
    type: "bar",
    data: {
      labels: Object.keys(canalCantidad),
      datasets: [{ label: "Cantidad de Casos", data: Object.values(canalCantidad), backgroundColor: "#0ea5e9" }]
    }
  });

  if (chartInstance3) chartInstance3.destroy();
  chartInstance3 = new Chart(ctx3, {
    type: "bar",
    data: {
      labels: Object.keys(canalMonto),
      datasets: [{ label: "Monto Total ($)", data: Object.values(canalMonto), backgroundColor: "#f59e0b" }]
    }
  });

  const riesgoMensual = {};
  datos.forEach(d => {
    const mes = new Date(d.fecha).toLocaleDateString("es-AR", { month: "short", year: "2-digit" });
    if (!riesgoMensual[mes]) riesgoMensual[mes] = {};
    riesgoMensual[mes][d.tipo_riesgo] = (riesgoMensual[mes][d.tipo_riesgo] || 0) + 1;
  });

  const tipos = [...new Set(datos.map(d => d.tipo_riesgo))];
  const datasets = tipos.map(tipo => ({
    label: tipo,
    data: Object.keys(riesgoMensual).map(m => riesgoMensual[m][tipo] || 0),
    stack: "Stack 0"
  }));

  if (chartInstance4) chartInstance4.destroy();
  chartInstance4 = new Chart(ctx4, {
    type: "bar",
    data: { labels: Object.keys(riesgoMensual), datasets },
    options: {
      responsive: true,
      plugins: { legend: { position: "top" } },
      scales: { x: { stacked: true }, y: { stacked: true } }
    }
  });
}
