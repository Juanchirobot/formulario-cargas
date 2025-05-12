const datos = [];
let chartInstance;

function abrirModalFormulario() {
  document.getElementById('modalFormulario').style.display = 'block';
  document.getElementById('overlay').style.display = 'block';
}

function abrirGraficos() {
  document.getElementById('modalGraficos').style.display = 'block';
  document.getElementById('overlay').style.display = 'block';
  renderizarGraficos();
}

function cerrarModales() {
  document.getElementById('modalFormulario').style.display = 'none';
  document.getElementById('modalGraficos').style.display = 'none';
  document.getElementById('overlay').style.display = 'none';
}

document.getElementById('formulario').addEventListener('submit', e => {
  e.preventDefault();
  const nuevo = {
    usuario: usuario.value,
    fecha: fecha.value,
    caso: caso.value,
    descripcion: descripcion.value,
    estado: estado.value,
    prioridad: prioridad.value,
    tipo_riesgo: tipo_riesgo.value,
    canal_deteccion: canal_deteccion.value,
    monto_sospechoso: parseFloat(monto_sospechoso.value),
    observaciones: observaciones.value
  };
  datos.push(nuevo);
  actualizarTabla();
  cerrarModales();
  formulario.reset();
});

function actualizarTabla() {
  const tbody = document.querySelector('#tabla tbody');
  tbody.innerHTML = '';
  datos.forEach(d => {
    tbody.innerHTML += `<tr><td>${d.usuario}</td><td>${d.fecha}</td><td>${d.caso}</td><td>${d.descripcion}</td><td>${d.estado}</td><td>${d.prioridad}</td><td>${d.tipo_riesgo}</td><td>${d.canal_deteccion}</td><td>${d.monto_sospechoso}</td><td>${d.observaciones}</td></tr>`;
  });
}

function filtrarTabla() {
  const texto = document.getElementById('busqueda').value.toLowerCase();
  const filas = document.querySelectorAll('#tabla tbody tr');
  filas.forEach(fila => {
    fila.style.display = fila.cells[0].textContent.toLowerCase().includes(texto) ? '' : 'none';
  });
}

async function cargarCSVDesdeGitHub() {
  const url = 'https://raw.githubusercontent.com/Juanchirobot/formulario-cargas/main/historico_carga.csv';
  try {
    const response = await fetch(url);
    const text = await response.text();
    const rows = text.trim().split('\n').slice(1);
    rows.forEach(row => {
      const valores = row.split(',').map(v => v.replace(/(^"|"$)/g, ''));
      if (valores.length === 10) {
        datos.push({
          usuario: valores[0],
          fecha: valores[1],
          caso: valores[2],
          descripcion: valores[3],
          estado: valores[4],
          prioridad: valores[5],
          tipo_riesgo: valores[6],
          canal_deteccion: valores[7],
          monto_sospechoso: parseFloat(valores[8]),
          observaciones: valores[9]
        });
      }
    });
    actualizarTabla();
  } catch (err) {
    console.error('Error al cargar el CSV:', err);
  }
}

function renderizarGraficos() {
  const ctx = document.getElementById('chartCasos').getContext('2d');
  const resumen = {};
  datos.forEach(d => {
    const clave = `${d.fecha} - ${d.caso}`;
    resumen[clave] = (resumen[clave] || 0) + d.monto_sospechoso;
  });

  if (chartInstance) {
    chartInstance.destroy();
  }

  chartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: Object.keys(resumen),
      datasets: [{
        label: 'Monto Sospechoso',
        data: Object.values(resumen),
        backgroundColor: 'rgba(75, 192, 192, 0.7)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

function descargarCSV() {
  const encabezados = ['Usuario','Fecha','Caso','Descripción','Estado','Prioridad','Tipo de Riesgo','Canal de Detección','Monto Sospechoso','Observaciones'];
  const filas = datos.map(d => [d.usuario, d.fecha, d.caso, d.descripcion, d.estado, d.prioridad, d.tipo_riesgo, d.canal_deteccion, d.monto_sospechoso, d.observaciones]);
  const csv = [encabezados, ...filas].map(e => e.join(",")).join("\n");
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'casos.csv';
  a.click();
  URL.revokeObjectURL(url);
}

cargarCSVDesdeGitHub();

const transacciones = [];

function agregarTransaccion() {
  const tbody = document.querySelector('#tablaTransacciones tbody');
  const fila = document.createElement('tr');
  fila.innerHTML = `
    <td><input type="text" required></td>
    <td><input type="date" required></td>
    <td><input type="text" required></td>
    <td><input type="text" required></td>
    <td><input type="number" step="0.01" required></td>
    <td><input type="text" required></td>
    <td><button type="button" onclick="this.closest('tr').remove()">❌</button></td>
  `;
  tbody.appendChild(fila);
}

document.getElementById('formulario').addEventListener('submit', e => {
  e.preventDefault();

  const casoActual = caso.value;
  const usuarioActual = usuario.value;

  const transaccionesFilas = document.querySelectorAll('#tablaTransacciones tbody tr');
  transaccionesFilas.forEach(fila => {
    const celdas = fila.querySelectorAll('input');
    transacciones.push({
      usuario: usuarioActual,
      caso: casoActual,
      cuil: celdas[0].value,
      fecha: celdas[1].value,
      cbu_origen: celdas[2].value,
      cbu_destino: celdas[3].value,
      monto: parseFloat(celdas[4].value),
      moneda: celdas[5].value
    });
  });

  // Agrega el caso principal
  const nuevo = {
    usuario: usuario.value,
    fecha: fecha.value,
    caso: caso.value,
    descripcion: descripcion.value,
    estado: estado.value,
    prioridad: prioridad.value,
    tipo_riesgo: tipo_riesgo.value,
    canal_deteccion: canal_deteccion.value,
    monto_sospechoso: parseFloat(monto_sospechoso.value),
    observaciones: observaciones.value
  };
  datos.push(nuevo);
  actualizarTabla();
  cerrarModales();
  formulario.reset();
  document.querySelector('#tablaTransacciones tbody').innerHTML = '';
});

function descargarCSVTransacciones() {
  const encabezados = ['Usuario','Caso','CUIL','Fecha','CBU Origen','CBU Destino','Monto','Moneda'];
  const filas = transacciones.map(t => [
    t.usuario, t.caso, t.cuil, t.fecha, t.cbu_origen, t.cbu_destino, t.monto, t.moneda
  ]);
  const csv = [encabezados, ...filas].map(e => e.join(",")).join("\n");
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'transacciones_caso.csv';
  a.click();
  URL.revokeObjectURL(url);
}
