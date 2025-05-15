let datos = [];
let transacciones = [];
let contadorID = 1;
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
  fetch("historico_carga_liviano.csv")
    .then(r => r.text())
    .then(text => {
      const rows = text.trim().split("\n").slice(1);
      rows.forEach(row => {
        const c = row.split(",");
        if (c.length >= 12) {
          const fechaOk = new Date(c[3]);
          if (!isNaN(fechaOk.getTime())) {
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
          }
        }
      });
      actualizarTabla();
    });
}
function cargarCSVTransacciones() {
  fetch("transacciones_caso_liviano.csv")
    .then(r => r.text())
    .then(text => {
      const rows = text.trim().split("\n").slice(1);
      rows.forEach(row => {
        const c = row.split(",");
        if (c.length >= 8) {
          transacciones.push({
            usuario: c[0],
            caso: c[1],
            cuil: c[2],
            fecha: c[3],
            cbu_origen: c[4],
            cbu_destino: c[5],
            monto: parseFloat(c[6]),
            moneda: c[7]
          });
        }
      });
    });
}
function actualizarTabla() {
  const tbody = document.querySelector("#tabla tbody");
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
      <td>${d.observaciones}</td>
      <td><button onclick="cargarCasoEnFormulario('${d.caso}')">✏️</button></td>`;
    tbody.appendChild(fila);
  });
}
function renderizarGraficosDashboard() {
  document.getElementById("totalCasos").textContent = datos.length;
  const monto = datos.reduce((sum, d) => sum + d.monto_sospechoso, 0);
  document.getElementById("totalMontos").textContent = (monto / 1000000).toFixed(2) + "M";
}
function cargarCasoEnFormulario(casoID) {
  const caso = datos.find(d => d.caso === casoID);
  if (!caso) return;
  mostrarFormulario();
  usuario.value = caso.usuario;
  fecha.value = caso.fecha;
  caso.value = caso.caso;
  descripcion.value = caso.descripcion;
  estado.value = caso.estado;
  prioridad.value = caso.prioridad;
  tipo_riesgo.value = caso.tipo_riesgo;
  canal_deteccion.value = caso.canal_deteccion;
  observaciones.value = caso.observaciones;

  const tbody = document.querySelector("#tablaTransacciones tbody");
  tbody.innerHTML = "";
  const transacs = transacciones.filter(t => t.caso === casoID);
  transacs.forEach(t => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td><input type="text" value="${t.cuil}" required></td>
      <td><input type="date" value="${t.fecha}" required></td>
      <td><input type="text" value="${t.cbu_origen}" required></td>
      <td><input type="text" value="${t.cbu_destino}" required></td>
      <td><input type="number" value="${t.monto}" required></td>
      <td>
        <select required>
          <option value="ARS" ${t.moneda === "ARS" ? "selected" : ""}>ARS</option>
          <option value="USD" ${t.moneda === "USD" ? "selected" : ""}>USD</option>
        </select>
      </td>
      <td><button type="button" onclick="this.closest('tr').remove()">❌</button></td>`;
    tbody.appendChild(fila);
  });
}
cargarCSVDesdeGitHub();
cargarCSVTransacciones();

function descargarCSV() {
  const headers = ["ID","Usuario","CUIL Cliente","Fecha","Caso","Descripción","Estado","Prioridad","Tipo de Riesgo","Canal de Detección","Monto Sospechoso (ARS)","Observaciones"];
  const filas = datos.map(d => [
    d.id,d.usuario,d.cuil,d.fecha,d.caso,d.descripcion,d.estado,d.prioridad,d.tipo_riesgo,d.canal_deteccion,d.monto_sospechoso,d.observaciones
  ]);
  exportarComoCSV("casos.csv", headers, filas);
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
