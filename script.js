const datos = [];
const transacciones = [];
let chartInstance;
let contadorID = 1;

// Mostrar formulario de nuevo caso
function abrirModalFormulario() {
  document.getElementById('modalFormulario').style.display = 'block';
  document.getElementById('overlay').style.display = 'block';
}

// Mostrar modal de gráficos
function abrirGraficos() {
  document.getElementById('modalGraficos').style.display = 'block';
  document.getElementById('overlay').style.display = 'block';
  renderizarGraficos();
}

// Cerrar formularios y gráficos
function cerrarModales() {
  document.getElementById('modalFormulario').style.display = 'none';
  document.getElementById('modalGraficos').style.display = 'none';
  document.getElementById('overlay').style.display = 'none';
}

// Agregar nueva fila de transacción
function agregarTransaccion() {
  const tbody = document.querySelector('#tablaTransacciones tbody');
  const fila = document.createElement('tr');
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

// Guardar nuevo caso y transacciones
document.getElementById('formulario').addEventListener('submit', async e => {
  e.preventDefault();

  const id = contadorID++;
  const usuarioActual = usuario.value;
  const casoActual = caso.value;
  let montoARS = 0;

  const filas = document.querySelectorAll('#tablaTransacciones tbody tr');

  // Si hay USD, obtener cotización online
  let cotizacion = 0;
  const hayUSD = Array.from(filas).some(f => f.querySelector('select').value === 'USD');

  if (hayUSD) {
    try {
      const res = await fetch('https://api.exchangerate.host/latest?base=USD&symbols=ARS');
      const json = await res.json();
      cotizacion = json.rates.ARS;
    } catch (err) {
      alert("❌ Error al obtener la cotización del dólar. Intenta nuevamente.");
      return;
    }
  }

  // Cargar transacciones y calcular monto total en ARS
  filas.forEach(f => {
    const inputs = f.querySelectorAll('input');
    const moneda = f.querySelector('select').value;
    const monto = parseFloat(inputs[4].value);
    const montoConvertido = moneda === 'USD' ? monto * cotizacion : monto;

    transacciones.push({
      usuario: usuarioActual,
      caso: casoActual,
      cuil: inputs[0].value,
      fecha: inputs[1].value,
      cbu_origen: inputs[2].value,
      cbu_destino: inputs[3].value,
      monto: monto,
      moneda: moneda
    });

    montoARS += montoConvertido;
  });

  // Guardar caso completo
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
    observaciones: observaciones.value
  });

  actualizarTabla();
  cerrarModales();
  formulario.reset();
  document.querySelector('#tablaTransacciones tbody').innerHTML = '';
});

// Mostrar casos en la tabla principal
function actualizarTabla() {
  const tbody = document.querySelector('#tabla tbody');
  tbody.innerHTML = '';
  datos.forEach(d => {
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

// Filtro de casos por usuario
function filtrarTabla() {
  const texto = document.getElementById('busqueda').value.toLowerCase();
  const filas = document.querySelectorAll('#tabla tbody tr');
  filas.forEach(f => {
    f.style.display = f.cells[1].textContent.toLowerCase().includes(texto) ? '' : 'none';
  });
}

// Descargar archivo CSV de casos
function descargarCSV() {
  const encabezados = ['ID','Usuario','Fecha','Caso','Descripción','Estado','Prioridad','Tipo de Riesgo','Canal de Detección','Monto Sospechoso (ARS)','Observaciones'];
  const filas = datos.map(d => [d.id, d.usuario, d.fecha, d.caso, d.descripcion, d.estado, d.prioridad, d.tipo_riesgo, d.canal_deteccion, d.monto_sospechoso.toFixed(2), d.observaciones]);
  const csv = [encabezados, ...filas].map(f => f.join(",")).join("\n");
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'casos.csv';
  a.click();
  URL.revokeObjectURL(url);
}

// Descargar archivo CSV de transacciones
function descargarCSVTransacciones() {
  const encabezados = ['Usuario','Caso','CUIL','Fecha','CBU Origen','CBU Destino','Monto','Moneda'];
  const filas = transacciones.map(t => [t.usuario, t.caso, t.cuil, t.fecha, t.cbu_origen, t.cbu_destino, t.monto, t.moneda]);
  const csv = [encabezados, ...filas].map(f => f.join(",")).join("\n");
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'transacciones_caso.csv';
  a.click();
  URL.revokeObjectURL(url);
}

// Cargar casos iniciales desde GitHub CSV
async function cargarCSVDesdeGitHub() {
  const url = 'historico_carga.csv';
  try {
    const res = await fetch(url);
    const text = await res.text();
    const rows = text.trim().split('\n').slice(1);

    rows.forEach(row => {
      const campos = row.split(',').map(c => c.replace(/(^"|"$)/g, ''));
      if (campos.length >= 10) {
        datos.push({
          id: contadorID++,
          usuario: campos[0],
          fecha: campos[1],
          caso: campos[2],
          descripcion: campos[3],
          estado: campos[4],
          prioridad: campos[5],
          tipo_riesgo: campos[6],
          canal_deteccion: campos[7],
          monto_sospechoso: parseFloat(campos[8]),
          observaciones: campos[9]
        });
      }
    });

    actualizarTabla();
  } catch (err) {
    console.error("⚠️ Error al cargar el CSV desde GitHub:", err);
  }
}

// Crear gráfico de barras por caso/fecha
function renderizarGraficos() {
  const ctx = document.getElementById('chartCasos').getContext('2d');
  const resumen = {};

  datos.forEach(d => {
    const clave = `${d.fecha} - ${d.caso}`;
    resumen[clave] = (resumen[clave] || 0) + d.monto_sospechoso;
  });

  if (chartInstance) chartInstance.destroy();

  chartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: Object.keys(resumen),
      datasets: [{
        label: 'Monto Sospechoso (ARS)',
        data: Object.values(resumen),
        backgroundColor: 'rgba(0, 128, 128, 0.7)',
        borderColor: 'rgba(0, 128, 128, 1)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: true },
        tooltip: { enabled: true }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: value => `$${value.toLocaleString('es-AR')}`
          }
        },
        x: {
          ticks: { maxRotation: 90, minRotation: 45 }
        }
      }
    }
  });
}

// Carga inicial
cargarCSVDesdeGitHub();
