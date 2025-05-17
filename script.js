let datos = [];
let transacciones = [];
let contadorID = 1000;
let chartInstance1, chartInstance2, chartInstance3, chartInstance4;

function expandSidebar() {
  document.querySelector('.sidebar').classList.add('expanded');
}
function collapseSidebar() {
  document.querySelector('.sidebar').classList.remove('expanded');
  document.getElementById('submenu-casos').classList.remove('show');
}
function toggleSubmenu(id) {
  document.getElementById(id).classList.toggle('show');
}
function ocultarTodo() {
  document.getElementById("dashboard").style.display = "none";
  document.getElementById("formulario-section").style.display = "none";
  document.getElementById("tablaCasos").style.display = "none";
  document.getElementById("busqueda-container").style.display = "none";
}
function mostrarTabla() {
  ocultarTodo();
  document.getElementById("busqueda-container").style.display = "flex";
  document.getElementById("tablaCasos").style.display = "block";
  actualizarTabla();
}
function mostrarFormulario() {
  ocultarTodo();
  document.getElementById("formulario-section").style.display = "block";
  document.getElementById("formulario").reset();
  document.querySelector("#tablaTransacciones tbody").innerHTML = "";
}
function mostrarDashboard() {
  ocultarTodo();
  document.getElementById("dashboard").style.display = "block";
  renderizarGraficosDashboard();
}
function ejecutarBusqueda() {
  const input = document.getElementById("busqueda").value.toLowerCase();
  const filas = document.querySelectorAll("#tabla tbody tr");
  filas.forEach((fila) => {
    const cuilCliente = fila.cells[2]?.textContent?.toLowerCase() || "";
    fila.style.display = cuilCliente.includes(input) || input === "" ? "" : "none";
  });
}
function cargarCSVDesdeGitHub() {
  fetch("https://raw.githubusercontent.com/Juanchirobot/formulario-cargas/main/historico_carga_liviano.csv")
    .then(r => r.text())
    .then(text => {
      const rows = text.trim().split("\n").slice(1);
      rows.forEach((row, i) => {
        const c = row.split(",");
        if (c.length === 12) {
          datos.push({
            id: parseInt(c[0]),
            usuario: c[1],
            cuil: c[2],
            fecha: c[3],
            caso: c[4],
            descripcion: c[5],
            estado: c[6],
            prioridad: c[7],
            tipo_riesgo: c[8],
            canal_deteccion: c[9],
            monto_sospechoso: parseFloat(c[10]),
            observaciones: c[11]
          });
        } else {
          console.warn("Fila inválida (col:", c.length, ") en línea:", i + 2, row);
        }
      });
      actualizarTabla();
      renderizarGraficosDashboard();
    })
    .catch(err => console.error("Error cargando CSV:", err));
}
function actualizarTabla() {
  const tbody = document.querySelector("#tabla tbody");
  if (!tbody) return;
  tbody.innerHTML = "";
  datos.forEach(d => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${d.id}</td>
      <td>${d.usuario}</td>
      <td>${d.cuil}</td>
      <td>${d.fecha}</td>
      <td>${d.caso}</td>
      <td>${d.descripcion}</td>
      <td>${d.estado}</td>
      <td>${d.prioridad}</td>
      <td>${d.tipo_riesgo}</td>
      <td>${d.canal_deteccion}</td>
      <td>${d.monto_sospechoso}</td>
      <td>${d.observaciones}</td>`;
    tbody.appendChild(fila);
  });
}
function renderizarGraficosDashboard() {
  document.getElementById("totalCasos").textContent = datos.length;
  const monto = datos.reduce((sum, d) => sum + d.monto_sospechoso, 0);
  document.getElementById("totalMontos").textContent = (monto / 1000000).toFixed(2) + "M";
}
function agregarTransaccion() {
  const tbody = document.querySelector("#tablaTransacciones tbody");
  const fila = document.createElement("tr");
  fila.innerHTML = `
    <td><input type="text" required></td>
    <td><input type="date" required></td>
    <td><input type="text" required></td>
    <td><input type="text" required></td>
    <td><input type="number" step="0.01" required></td>
    <td>
      <select required>
        <option value="ARS">ARS</option>
        <option value="USD">USD</option>
      </select>
    </td>
    <td><button type="button" onclick="this.closest('tr').remove()">❌</button></td>`;
  tbody.appendChild(fila);
}
function abrirModalBloqueo() {
  document.getElementById("modalBloqueoCuenta").style.display = "block";
  document.getElementById("overlay").style.display = "block";
}
function cerrarModalBloqueo() {
  document.getElementById("modalBloqueoCuenta").style.display = "none";
  document.getElementById("overlay").style.display = "none";
}
function descargarCSV() {
  const headers = ["ID","Usuario","CUIL Cliente","Fecha","Caso","Descripción","Estado","Prioridad","Tipo de Riesgo","Canal de Detección","Monto Sospechoso (ARS)","Observaciones"];
  const filas = datos.map(d => [
    d.id,d.usuario,d.cuil,d.fecha,d.caso,d.descripcion,d.estado,d.prioridad,d.tipo_riesgo,d.canal_deteccion,d.monto_sospechoso,d.observaciones
  ]);
  exportarComoCSV("hisotrico_carga.csv", headers, filas);
}
function descargarCSVTransacciones() {
  const headers = ["Usuario","Caso","CUIL","Fecha","CBU Origen","CBU Destino","Monto","Moneda"];
  const filas = transacciones.map(t => [
    t.usuario,t.caso,t.cuil,t.fecha,t.cbu_origen,t.cbu_destino,t.monto,t.moneda
  ]);
  exportarComoCSV("transacciones.csv", headers, filas);
}
function exportarComoCSV(nombre, encabezados, filas) {
  const contenido = [encabezados, ...filas].map(fila => fila.join(",")).join("\n");
  const blob = new Blob([contenido], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = nombre;
  a.click();
  URL.revokeObjectURL(a.href);
}
cargarCSVDesdeGitHub();
