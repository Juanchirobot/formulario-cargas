const datos = [];
const transacciones = [];
let chartInstance1, chartInstance2, chartInstance3;
let contadorID = 1;

/* === SIDEBAR COMPORTAMIENTO === */
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

/* === NAVEGACIÓN DE SECCIONES === */
function mostrarTabla() {
  document.getElementById("dashboard").style.display = "none";
  document.getElementById("formulario-section").style.display = "none";
  document.getElementById("tablaCasos").style.display = "block";
  document.getElementById("busqueda-container").style.display = "flex";
}
function mostrarFormulario() {
  document.getElementById("dashboard").style.display = "none";
  document.getElementById("tablaCasos").style.display = "none";
  document.getElementById("busqueda-container").style.display = "none";
  document.getElementById("formulario-section").style.display = "block";
}
function mostrarDashboard() {
  document.getElementById("tablaCasos").style.display = "none";
  document.getElementById("formulario-section").style.display = "none";
  document.getElementById("busqueda-container").style.display = "none";
  document.getElementById("dashboard").style.display = "block";
  renderizarGraficosDashboard();
}

/* === FORMULARIO === */
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
    <td><button type="button" onclick="this.closest('tr').remove()">❌</button></td>
  `;
  tbody.appendChild(fila);
}

document.getElementById("formulario").addEventListener("submit", (e) => {
  e.preventDefault();
  const id = contadorID++;
  const cotizacion = 1000;
  let montoARS = 0;
  const usuarioActual = usuario.value;
  const casoActual = caso.value;

  const filas = document.querySelectorAll("#tablaTransacciones tbody tr");
  filas.forEach((fila) => {
    const inputs = fila.querySelectorAll("input");
    const moneda = fila.querySelector("select").value;
    const monto = parseFloat(inputs[4].value);
    const montoConvertido = moneda === "USD" ? monto * cotizacion : monto;

    transacciones.push({
      usuario: usuarioActual,
      caso: casoActual,
      cuil: inputs[0].value,
      fecha: inputs[1].value,
      cbu_origen: inputs[2].value,
      cbu_destino: inputs[3].value,
      monto: monto,
      moneda: moneda,
    });

    montoARS += montoConvertido;
  });

  datos.push({
    id,
    usuario: usuario.value,
    fecha: fecha.value,
    caso: caso.value,
    descripcion: descripcion.value,
    estado: estado.value,
    prioridad: prioridad.value,
    tipo_riesgo: tipo_riesgo.value,
    canal_deteccion: canal_deteccion.value,
    monto_sospechoso: montoARS,
    observaciones: observaciones.value,
  });

  actualizarTabla();
  formulario.reset();
  document.querySelector("#tablaTransacciones tbody").innerHTML = "";
  mostrarTabla();
});

/* === TABLA Y BÚSQUEDA === */
function actualizarTabla() {
  const tbody = document.querySelector("#tabla tbody");
  tbody.innerHTML = "";
  datos.forEach((d) => {
    tbody.innerHTML += `
      <tr>
        <td>${d.id}</td>
        <td>${d.usuario}</td>
        <td>${d.fecha}</td>
        <td>${d.caso}</td>
        <td>${d.descripcion}</td>
        <td>${d.estado}</td>
        <td>${d.prioridad}</td>
        <td>${d.tipo_riesgo}</td>
        <td>${d.canal_deteccion}</td>
        <td>${d.monto_sospechoso.toFixed(2)}</td>
        <td>${d.observaciones}</td>
      </tr>`;
  });
}

function filtrarTablaPorCUIL() {
  const texto = document.getElementById("busqueda").value.toLowerCase();
  const filas = document.querySelectorAll("#tabla tbody tr");
  filas.forEach((fila) => {
    const caso = fila.cells[3].textContent;
    const cuil = transacciones.find((t) => t.caso === caso)?.cuil?.toLowerCase() || "";
    fila.style.display = cuil.includes(texto) ? "" : "none";
  });
}

function ordenarPorFecha() {
  datos.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
  actualizarTabla();
}

/* === CSV === */
function exportarCSV(nombre, encabezados, filas) {
  const csv = [encabezados, ...filas].map(f => f.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nombre;
  a.click();
  URL.revokeObjectURL(url);
}

function descargarCSV() {
  const encabezados = ["ID", "Usuario", "Fecha", "Caso", "Descripción", "Estado", "Prioridad", "Tipo de Riesgo", "Canal de Detección", "Monto Sospechoso (ARS)", "Observaciones"];
  const filas = datos.map(d => [
    d.id, d.usuario, d.fecha, d.caso, d.descripcion,
    d.estado, d.prioridad, d.tipo_riesgo, d.canal_deteccion,
    d.monto_sospechoso.toFixed(2), d.observaciones
  ]);
  exportarCSV("historico_carga.csv", encabezados, filas);
}

function descargarCSVTransacciones() {
  const encabezados = ["Usuario", "Caso", "CUIL", "Fecha", "CBU Origen", "CBU Destino", "Monto", "Moneda"];
  const filas = transacciones.map(t => [
    t.usuario, t.caso, t.cuil, t.fecha,
    t.cbu_origen, t.cbu_destino, t.monto, t.moneda
  ]);
  exportarCSV("transacciones_caso.csv", encabezados, filas);
}

/* === DASHBOARD === */
function renderizarGraficosDashboard() {
  renderGraficoEvolutivo();
  renderGraficoTorta();
  renderGraficoBarras();
}

function renderGraficoEvolutivo() {
  const ctx = document.getElementById("graficoEvolutivo").getContext("2d");
  const meses = {};

  datos.forEach(d => {
    const [año, mes] = d.fecha.split('-');
    const clave = `${año}-${mes}`;
    if (!meses[clave]) meses[clave] = { monto: 0, cantidad: 0 };
    meses[clave].monto += d.monto_sospechoso;
    meses[clave].cantidad += 1;
  });

  if (chartInstance1) chartInstance1.destroy();
  chartInstance1 = new Chart(ctx, {
    type: "line",
    data: {
      labels: Object.keys(meses),
      datasets: [
        {
          label: "Monto Sospechoso (ARS)",
          data: Object.values(meses).map(v => v.monto),
          borderColor: "#008080",
          backgroundColor: "rgba(0,128,128,0.1)",
          tension: 0.3
        },
        {
          label: "Cantidad de Casos",
          data: Object.values(meses).map(v => v.cantidad),
          borderColor: "#6c757d",
          backgroundColor: "rgba(108,117,125,0.1)",
          tension: 0.3
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}

function renderGraficoTorta() {
  const ctx = document.getElementById("graficoTortaTipoRiesgo").getContext("2d");
  const conteo = {};
  datos.forEach(d => {
    conteo[d.tipo_riesgo] = (conteo[d.tipo_riesgo] || 0) + 1;
  });

  if (chartInstance2) chartInstance2.destroy();
  chartInstance2 = new Chart(ctx, {
    type: "pie",
    data: {
      labels: Object.keys(conteo),
      datasets: [{
        data: Object.values(conteo),
        backgroundColor: ["#007bff", "#28a745", "#ffc107", "#dc3545", "#6f42c1"]
      }]
    },
    options: { responsive: true }
  });
}

function renderGraficoBarras() {
  const ctx = document.getElementById("graficoBarrasPrioridad").getContext("2d");
  const prioridades = {};
  datos.forEach(d => {
    const [año, mes] = d.fecha.split('-');
    const clave = `${año}-${mes}-${d.prioridad}`;
    prioridades[clave] = (prioridades[clave] || 0) + 1;
  });

  const agrupado = {};
  for (const key in prioridades) {
    const [ym, prioridad] = [key.slice(0, 7), key.slice(8)];
    if (!agrupado[prioridad]) agrupado[prioridad] = {};
    agrupado[prioridad][ym] = prioridades[key];
  }

  const mesesUnicos = [...new Set(Object.values(agrupado).flatMap(obj => Object.keys(obj)))].sort();
  const datasets = Object.keys(agrupado).map(prioridad => ({
    label: prioridad,
    data: mesesUnicos.map(m => agrupado[prioridad][m] || 0),
    borderWidth: 1,
    backgroundColor: `rgba(${Math.floor(Math.random()*200)}, ${Math.floor(Math.random()*200)}, ${Math.floor(Math.random()*200)}, 0.6)`
  }));

  if (chartInstance3) chartInstance3.destroy();
  chartInstance3 = new Chart(ctx, {
    type: "bar",
    data: {
      labels: mesesUnicos,
      datasets
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}

/* MODAL BLOQUEO CUENTA */
function abrirModalBloqueo() {
  document.getElementById("modalBloqueoCuenta").style.display = "block";
  document.getElementById("overlay").style.display = "block";
}

function cerrarModalBloqueo() {
  document.getElementById("modalBloqueoCuenta").style.display = "none";
  document.getElementById("overlay").style.display = "none";
}

/* INICIAL */
async function cargarCSVDesdeGitHub() {
  const url = "historico_carga.csv";
  try {
    const res = await fetch(url);
    const text = await res.text();
    const rows = text.trim().split("\n").slice(1);
    rows.forEach(row => {
      const campos = row.split(",").map(c => c.replace(/(^"|"$)/g, ""));
      if (campos.length >= 11) {
        datos.push({
          id: parseInt(campos[0]),
          usuario: campos[1],
          fecha: campos[2],
          caso: campos[3],
          descripcion: campos[4],
          estado: campos[5],
          prioridad: campos[6],
          tipo_riesgo: campos[7],
          canal_deteccion: campos[8],
          monto_sospechoso: parseFloat(campos[9]),
          observaciones: campos[10]
        });
        if (parseInt(campos[0]) >= contadorID) {
          contadorID = parseInt(campos[0]) + 1;
        }
      }
    });
    actualizarTabla();
  } catch (err) {
    console.error("⚠️ Error al cargar el CSV:", err);
  }
}

cargarCSVDesdeGitHub();
document.getElementById("busqueda").addEventListener("input", filtrarTablaPorCUIL);
document.getElementById("ordenarFecha").addEventListener("click", ordenarPorFecha); 

function ejecutarBusqueda() {
  filtrarTablaPorCUIL();
}

