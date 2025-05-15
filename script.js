const datos = [];
const transacciones = [];
let chartInstance1, chartInstance2, chartInstance3, chartInstance4, chartInstance5;
let contadorID = 1;

/* === SIDEBAR Y NAVEGACIÓN === */
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
  const tabla = document.getElementById("tablaCasos");
  const buscador = document.getElementById("busqueda-container");
  tabla.style.opacity = 0;
  buscador.style.display = "flex";
  setTimeout(() => {
    tabla.style.display = "block";
    tabla.style.opacity = 1;
  }, 100);
}
function mostrarFormulario() {
  ocultarTodo();
  const seccion = document.getElementById("formulario-section");
  seccion.style.opacity = 0;
  setTimeout(() => {
    seccion.style.display = "block";
    seccion.style.opacity = 1;
  }, 100);
}
function mostrarDashboard() {
  ocultarTodo();
  const dash = document.getElementById("dashboard");
  dash.style.opacity = 0;
  setTimeout(() => {
    dash.style.display = "block";
    dash.style.opacity = 1;
    renderizarGraficosDashboard();
  }, 100);
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
function ejecutarBusqueda() {
  const tabla = document.getElementById("tablaCasos");
  const loader = document.createElement("div");
  loader.className = "tabla-loader";
  loader.innerText = "🔍 Buscando...";
  tabla.appendChild(loader);
  setTimeout(() => {
    loader.remove();
    filtrarTablaPorCUIL();
  }, 500);
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
  exportarCSV("casos.csv", encabezados, filas);
}
function descargarCSVTransacciones() {
  const encabezados = ["Usuario", "Caso", "CUIL", "Fecha", "CBU Origen", "CBU Destino", "Monto", "Moneda"];
  const filas = transacciones.map(t => [
    t.usuario, t.caso, t.cuil, t.fecha,
    t.cbu_origen, t.cbu_destino, t.monto, t.moneda
  ]);
  exportarCSV("transacciones_caso.csv", encabezados, filas);
}

/* === FILTROS DE DASHBOARD === */
function filtrarPorAnio() {
  const anio = document.getElementById("filtroAnio").value;
  const mes = document.getElementById("filtroMes").value;
  renderizarGraficosDashboard(anio, mes);
}
function filtrarPorMes() {
  filtrarPorAnio();
}

/* === DASHBOARD === */
function renderizarGraficosDashboard(anio = "", mes = "") {
  const filtro = datos.filter(d => {
    const fecha = new Date(d.fecha);
    const matchAnio = anio ? fecha.getFullYear().toString() === anio : true;
    const matchMes = mes ? (fecha.getMonth() + 1).toString().padStart(2, '0') === mes : true;
    return matchAnio && matchMes;
  });

  const totales = filtro.reduce((acc, d) => {
    acc.casos += 1;
    acc.monto += d.monto_sospechoso;
    return acc;
  }, { casos: 0, monto: 0 });

  document.getElementById("totalCasos").textContent = totales.casos;
  document.getElementById("totalMontos").textContent = (totales.monto / 1000000).toFixed(2) + 'M';

  renderGraficoEvolutivo(filtro);
  renderGraficoCanal(filtro, 'cantidad');
  renderGraficoCanal(filtro, 'monto');
  renderGraficoPorcentajeTipoRiesgo(filtro);
}

function formatMes(fecha) {
  return new Date(fecha).toLocaleDateString('es-ES', { month: 'long', year: '2-digit' }).replace('.', '');
}

function renderGraficoEvolutivo(data) {
  const agrupado = {};
  data.forEach(d => {
    const key = formatMes(d.fecha);
    if (!agrupado[key]) agrupado[key] = { monto: 0, cantidad: 0 };
    agrupado[key].monto += d.monto_sospechoso;
    agrupado[key].cantidad++;
  });

  if (chartInstance1) chartInstance1.destroy();
  chartInstance1 = new Chart(document.getElementById("graficoEvolutivo"), {
    type: "line",
    data: {
      labels: Object.keys(agrupado),
      datasets: [
        {
          label: "Monto Sospechoso (M)",
          data: Object.values(agrupado).map(x => (x.monto / 1000000).toFixed(2)),
          borderColor: "#00b894",
          tension: 0.3
        },
        {
          label: "Cantidad de Casos",
          data: Object.values(agrupado).map(x => x.cantidad),
          borderColor: "#6c5ce7",
          tension: 0.3
        }
      ]
    },
    options: { responsive: true, scales: { y: { beginAtZero: true } } }
  });
}

function renderGraficoCanal(data, tipo) {
  const agrupado = {};
  data.forEach(d => {
    const key = formatMes(d.fecha);
    if (!agrupado[key]) agrupado[key] = {};
    if (!agrupado[key][d.canal_deteccion]) agrupado[key][d.canal_deteccion] = 0;
    agrupado[key][d.canal_deteccion] += tipo === 'monto' ? d.monto_sospechoso : 1;
  });

  const meses = Object.keys(agrupado);
  const canales = [...new Set(data.map(d => d.canal_deteccion))];
  const datasets = canales.map(canal => ({
    label: canal,
    data: meses.map(m => agrupado[m]?.[canal] || 0),
    backgroundColor: tipo === 'monto' ? '#fab1a0' : '#74b9ff'
  }));

  const id = tipo === 'monto' ? "graficoCanalMonto" : "graficoCanalCantidad";
  const old = tipo === 'monto' ? chartInstance3 : chartInstance2;
  if (old) old.destroy();

  const chart = new Chart(document.getElementById(id), {
    type: "bar",
    data: { labels: meses, datasets },
    options: {
      indexAxis: 'y',
      responsive: true,
      scales: { x: { beginAtZero: true } }
    }
  });

  if (tipo === 'monto') chartInstance3 = chart;
  else chartInstance2 = chart;
}

function renderGraficoPorcentajeTipoRiesgo(data) {
  const agrupado = {};
  data.forEach(d => {
    const key = formatMes(d.fecha);
    if (!agrupado[key]) agrupado[key] = {};
    if (!agrupado[key][d.tipo_riesgo]) agrupado[key][d.tipo_riesgo] = 0;
    agrupado[key][d.tipo_riesgo]++;
  });

  const meses = Object.keys(agrupado);
  const tipos = [...new Set(data.map(d => d.tipo_riesgo))];
  const datasets = tipos.map(riesgo => ({
    label: riesgo,
    data: meses.map(m => {
      const total = Object.values(agrupado[m] || {}).reduce((a, b) => a + b, 0);
      return total ? ((agrupado[m][riesgo] || 0) / total * 100).toFixed(2) : 0;
    }),
    backgroundColor: `rgba(${Math.floor(Math.random()*255)}, ${Math.floor(Math.random()*255)}, ${Math.floor(Math.random()*255)}, 0.6)`
  }));

  if (chartInstance4) chartInstance4.destroy();
  chartInstance4 = new Chart(document.getElementById("graficoPorcentajeTipoRiesgo"), {
    type: "bar",
    data: { labels: meses, datasets },
    options: {
      responsive: true,
      scales: {
        x: { stacked: true },
        y: { stacked: true, beginAtZero: true, max: 100 }
      }
    }
  });
}

/* === MODAL BLOQUEO CUENTA === */
function abrirModalBloqueo() {
  document.getElementById("modalBloqueoCuenta").style.display = "block";
  document.getElementById("overlay").style.display = "block";
}
function cerrarModalBloqueo() {
  document.getElementById("modalBloqueoCuenta").style.display = "none";
  document.getElementById("overlay").style.display = "none";
}

/* === CARGA INICIAL === */
async function cargarCSVDesdeGitHub() {
  const url = "historico_carga_liviano.csv";
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
          caso: campos[4],
          descripcion: campos[5],
          estado: campos[6],
          prioridad: campos[7],
          tipo_riesgo: campos[8],
          canal_deteccion: campos[9],
          monto_sospechoso: parseFloat(campos[10]),
          observaciones: campos[11]
        });
        if (parseInt(campos[0]) >= contadorID) {
          contadorID = parseInt(campos[0]) + 1;
        }
      }
    });

    datos.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
    actualizarTabla();

    // Completar select filtros
    const anios = [...new Set(datos.map(d => new Date(d.fecha).getFullYear().toString()))].sort();
    const meses = [...new Set(datos.map(d => (new Date(d.fecha).getMonth() + 1).toString().padStart(2, '0')))];
    const selectAnio = document.getElementById("filtroAnio");
    const selectMes = document.getElementById("filtroMes");

    anios.forEach(y => {
      const opt = document.createElement("option");
      opt.value = y;
      opt.text = y;
      selectAnio.appendChild(opt);
    });

    meses.forEach(m => {
      const opt = document.createElement("option");
      opt.value = m;
      opt.text = m;
      selectMes.appendChild(opt);
    });

  } catch (err) {
    console.error("⚠️ Error al cargar el CSV:", err);
  }
}

cargarCSVDesdeGitHub();
