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
