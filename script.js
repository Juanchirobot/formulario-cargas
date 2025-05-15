const datos = [];
const transacciones = [];
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

function ejecutarBusqueda() {
  const input = document.getElementById("busqueda").value.toLowerCase();
  const filas = document.querySelectorAll("#tabla tbody tr");

  filas.forEach((fila) => {
    const cuil = fila.cells[2]?.textContent?.toLowerCase() || ""; // índice 2: CUIL Cliente
    fila.style.display = cuil.includes(input) ? "" : "none";
  });
}

// 🔁 REEMPLAZAR DESDE AQUÍ
function actualizarTabla() {
  const tbody = document.querySelector("#tabla tbody");
  tbody.innerHTML = "";
  datos.forEach((d) => {
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
      <td>${d.monto_sospechoso.toFixed(2)}</td>
      <td>${d.observaciones}</td>`;
    fila.addEventListener("click", () => cargarCasoEnFormulario(d.caso));
    tbody.appendChild(fila);
  });
}
// 🔁 HASTA AQUÍ


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

  datos.splice(datos.findIndex(d => d.caso === casoID), 1);
  const nuevasTrans = transacciones.filter(t => t.caso !== casoID);
  transacciones.length = 0;
  transacciones.push(...nuevasTrans);
}

function parsearFecha(f) {
  const fecha = new Date(f);
  return isNaN(fecha.getTime()) ? null : fecha;
}

// 🔁 REEMPLAZAR DESDE AQUÍ
function cargarCSVDesdeGitHub() {
  fetch("historico_carga_liviano.csv")
    .then(r => r.text())
    .then(text => {
      const rows = text.trim().split("\n").slice(1);
      rows.forEach(row => {
        const c = row.split(",");
        if (c.length >= 12) {
          const fechaFormateada = new Date(c[3]);
          if (isNaN(fechaFormateada.getTime())) return;

          datos.push({
            id: parseInt(c[0]),
            usuario: c[1],
            cuil: c[2],
            fecha: c[3], // mantiene el string original con formato válido YYYY-MM-DD
            caso: c[4],
            descripcion: c[5],
            estado: c[6],
            prioridad: c[7],
            tipo_riesgo: c[8],
            canal_deteccion: c[9],
            monto_sospechoso: parseFloat(c[10]),
            observaciones: c[11]
          });

          if (parseInt(c[0]) >= contadorID) {
            contadorID = parseInt(c[0]) + 1;
          }
        }
      });

      datos.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
      actualizarTabla();
    })
    .catch(err => console.error("Error al cargar CSV:", err));
}
// 🔁 HASTA AQUÍ


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

document.getElementById("formulario").addEventListener("submit", (e) => {
  e.preventDefault();
  const id = contadorID++;
  const cotizacion = 1000;
  let montoARS = 0;
  const casoID = caso.value;
  const usuarioActual = usuario.value;

  const filas = document.querySelectorAll("#tablaTransacciones tbody tr");
  filas.forEach((fila) => {
    const inputs = fila.querySelectorAll("input");
    const moneda = fila.querySelector("select").value;
    const monto = parseFloat(inputs[4].value);
    const montoConvertido = moneda === "USD" ? monto * cotizacion : monto;

    transacciones.push({
      usuario: usuarioActual,
      caso: casoID,
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
    usuario: usuarioActual,
    fecha: fecha.value,
    caso: casoID,
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

function abrirModalBloqueo() {
  document.getElementById("modalBloqueoCuenta").style.display = "block";
  document.getElementById("overlay").style.display = "block";
}
function cerrarModalBloqueo() {
  document.getElementById("modalBloqueoCuenta").style.display = "none";
  document.getElementById("overlay").style.display = "none";
}

cargarCSVDesdeGitHub();
