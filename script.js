
// ========== VARIABLES GLOBALES ==========
let datos = [];
let transacciones = [];
let contadorID = 1000;
let chartInstance1, chartInstance2, chartInstance3, chartInstance4;

// ========== FUNCIONES DE UI ==========
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

// ========== FUNCIONES DE DATOS ==========
function cargarCSVDesdeGitHub() {
  fetch("https://raw.githubusercontent.com/Juanchirobot/formulario-cargas/main/historico_carga_liviano.csv")
    .then(r => r.text())
    .then(text => {
      const rows = text.trim().split("\n").slice(1);
      rows.forEach(row => {
        const c = row.split(",");
        if (c.length >= 12) {
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
      });
      actualizarTabla();
      renderizarGraficosDashboard();
      cargarFiltros();
    });
  fetch("https://raw.githubusercontent.com/Juanchirobot/formulario-cargas/main/transacciones_caso_liviano.csv")
    .then(r => r.text())
    .then(text => {
      const rows = text.trim().split("\n").slice(1);
      rows.forEach(row => {
        const t = row.split(",");
        if (t.length >= 7) {
          transacciones.push({
            caso: t[0],
            cuil: t[1],
            fecha: t[2],
            cbu_origen: t[3],
            cbu_destino: t[4],
            monto: parseFloat(t[5]),
            moneda: t[6]
          });
        }
      });
    });
}

// ========== TABLA Y FORMULARIO ==========
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
      <td>${d.observaciones}</td>`;

  const btnEditar = document.createElement("button");
  btnEditar.textContent = "✏️";
  btnEditar.className = "btn";
  btnEditar.onclick = () => cargarCasoEnFormulario(d.caso);
  fila.appendChild(document.createElement("td")).appendChild(btnEditar);
    tbody.appendChild(fila);
  });
}

document.getElementById("formulario").addEventListener("submit", function(e) {
  e.preventDefault();
  const nuevoID = datos.length + 1;
  const casoID = "CASO-" + String(nuevoID).padStart(5, "0");

  let montoTotal = 0;
  const nuevasTransacciones = [];
  document.querySelectorAll("#tablaTransacciones tbody tr").forEach(row => {
    const cells = row.querySelectorAll("input, select");
    const t = {
      caso: casoID,
      cuil: cells[0].value,
      fecha: cells[1].value,
      cbu_origen: cells[2].value,
      cbu_destino: cells[3].value,
      monto: parseFloat(cells[4].value),
      moneda: cells[5].value
    };
    nuevasTransacciones.push(t);
    montoTotal += t.moneda === "USD" ? t.monto * 1000 : t.monto;
  });

  const nuevoCaso = {
    id: nuevoID,
    usuario: document.getElementById("usuario").value,
    cuil: nuevasTransacciones[0]?.cuil || "",
    fecha: document.getElementById("fecha").value,
    caso: casoID,
    descripcion: document.getElementById("descripcion").value,
    estado: document.getElementById("estado").value,
    prioridad: document.getElementById("prioridad").value,
    tipo_riesgo: document.getElementById("tipo_riesgo").value,
    canal_deteccion: document.getElementById("canal_deteccion").value,
    monto_sospechoso: montoTotal,
    observaciones: document.getElementById("observaciones").value
  };

  datos.push(nuevoCaso);
  transacciones.push(...nuevasTransacciones);
  actualizarTabla();
  mostrarTabla();
});

function agregarTransaccion() {
  const fila = document.createElement("tr");
  fila.innerHTML = `
    <td><input type="text" required></td>
    <td><input type="date" required></td>
    <td><input type="text" required></td>
    <td><input type="text" required></td>
    <td><input type="number" required></td>
    <td>
      <select required>
        <option value="ARS">ARS</option>
        <option value="USD">USD</option>
      </select>
    </td>
    <td><button type="button" onclick="this.closest('tr').remove()">❌</button></td>`;
  document.querySelector("#tablaTransacciones tbody").appendChild(fila);
}

// ========== GRAFICOS Y FILTROS ==========
function renderizarGraficosDashboard() {
  if (chartInstance1) chartInstance1.destroy();
  if (chartInstance2) chartInstance2.destroy();
  if (chartInstance3) chartInstance3.destroy();
  if (chartInstance4) chartInstance4.destroy();

  document.getElementById("totalCasos").textContent = datos.length;
  const monto = datos.reduce((sum, d) => sum + d.monto_sospechoso, 0);
  document.getElementById("totalMontos").textContent = (monto / 1e6).toFixed(2) + "M";

  const meses = {};
  datos.forEach(d => {
    const date = new Date(d.fecha);
    if (!isNaN(date)) {
      const mes = date.toLocaleDateString("es-AR", { year: '2-digit', month: 'short' });
      if (!meses[mes]) meses[mes] = { casos: 0, monto: 0 };
      meses[mes].casos++;
      meses[mes].monto += d.monto_sospechoso;
    }
  });

  const labels = Object.keys(meses);
  const casosPorMes = labels.map(m => meses[m].casos);
  const montosPorMes = labels.map(m => (meses[m].monto / 1e6).toFixed(2));

  chartInstance1 = new Chart(document.getElementById("graficoEvolutivo"), {
    type: 'line',
    data: {
      labels,
      datasets: [
        { label: "Casos", data: casosPorMes, borderColor: "blue", fill: false },
        { label: "Montos (M)", data: montosPorMes, borderColor: "orange", fill: false }
      ]
    }
  });

  const canal = {};
  datos.forEach(d => {
    canal[d.canal_deteccion] = (canal[d.canal_deteccion] || 0) + 1;
  });

  chartInstance2 = new Chart(document.getElementById("graficoCanalCantidad"), {
    type: "bar",
    data: {
      labels: Object.keys(canal),
      datasets: [{ label: "Cantidad", data: Object.values(canal), backgroundColor: "teal" }]
    },
    options: { indexAxis: 'y' }
  });

  const canalMontos = {};
  datos.forEach(d => {
    canalMontos[d.canal_deteccion] = (canalMontos[d.canal_deteccion] || 0) + d.monto_sospechoso;
  });

  chartInstance3 = new Chart(document.getElementById("graficoCanalMonto"), {
    type: "bar",
    data: {
      labels: Object.keys(canalMontos),
      datasets: [{ label: "Montos", data: Object.values(canalMontos).map(m => (m / 1e6).toFixed(2)), backgroundColor: "salmon" }]
    },
    options: { indexAxis: 'y' }
  });

  const porTipo = {};
  datos.forEach(d => {
    const mes = new Date(d.fecha).toLocaleDateString("es-AR", { year: '2-digit', month: 'short' });
    if (!porTipo[mes]) porTipo[mes] = {};
    porTipo[mes][d.tipo_riesgo] = (porTipo[mes][d.tipo_riesgo] || 0) + 1;
  });

  const tipos = Array.from(new Set(datos.map(d => d.tipo_riesgo)));
  const tipoDatasets = tipos.map(tipo => ({
    label: tipo,
    data: Object.keys(porTipo).map(m => porTipo[m][tipo] || 0),
    stack: "stack1"
  }));

  chartInstance4 = new Chart(document.getElementById("graficoPorcentajeTipoRiesgo"), {
    type: "bar",
    data: {
      labels: Object.keys(porTipo),
      datasets: tipoDatasets
    },
    options: { scales: { x: { stacked: true }, y: { stacked: true } } }
  });
}

function cargarFiltros() {
  const años = [...new Set(datos.map(d => new Date(d.fecha).getFullYear()))].sort();
  const selectAnio = document.getElementById("filtroAnio");
  años.forEach(a => {
    const op = document.createElement("option");
    op.value = a;
    op.textContent = a;
    selectAnio.appendChild(op);
  });
}

function descargarCSV() {
  let contenido = "ID,Usuario,CUIL,Fecha,Caso,Descripción,Estado,Prioridad,Tipo de Riesgo,Canal de Detección,Monto Sospechoso,Observaciones\n";
  datos.forEach(d => {
    contenido += `${d.id},${d.usuario},${d.cuil},${d.fecha},${d.caso},${d.descripcion},${d.estado},${d.prioridad},${d.tipo_riesgo},${d.canal_deteccion},${d.monto_sospechoso},${d.observaciones}\n`;
  });
  const blob = new Blob([contenido], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "historico_carga_liviano.csv";
  a.click();
}

function descargarCSVTransacciones() {
  let contenido = "Caso,CUIL,Fecha,CBU Origen,CBU Destino,Monto,Moneda\n";
  transacciones.forEach(t => {
    contenido += `${t.caso},${t.cuil},${t.fecha},${t.cbu_origen},${t.cbu_destino},${t.monto},${t.moneda}\n`;
  });
  const blob = new Blob([contenido], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "transacciones_caso_liviano.csv";
  a.click();
}

window.onload = cargarCSVDesdeGitHub;


function cargarCasoEnFormulario(casoID) {
  const caso = datos.find(d => d.caso === casoID);
  if (!caso) return;
  mostrarFormulario();
  document.getElementById("usuario").value = caso.usuario;
  document.getElementById("fecha").value = caso.fecha;
  document.getElementById("caso").value = caso.caso;
  document.getElementById("descripcion").value = caso.descripcion;
  document.getElementById("estado").value = caso.estado;
  document.getElementById("prioridad").value = caso.prioridad;
  document.getElementById("tipo_riesgo").value = caso.tipo_riesgo;
  document.getElementById("canal_deteccion").value = caso.canal_deteccion;
  document.getElementById("observaciones").value = caso.observaciones;

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
