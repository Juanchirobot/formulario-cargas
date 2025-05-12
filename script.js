document.getElementById('dataForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const nombre = document.getElementById('nombre').value;
  const email = document.getElementById('email').value;
  const fecha = document.getElementById('fecha').value;
  const cuil_origen = document.getElementById('cuil_origen').value;

  const transacciones = [];
  const filas = document.querySelectorAll('#tablaTransacciones tbody tr');
  filas.forEach(row => {
    const cells = row.querySelectorAll('input');
    transacciones.push({
      fecha: cells[0].value,
      tipo: cells[1].value,
      cuil_origen: cells[2].value,
      cbu_origen: cells[3].value,
      cbu_destino: cells[4].value,
      cuil_destino: cells[5].value,
      monto: cells[6].value
    });
  });

  // Por ahora solo guardamos una fila por caso, podrías expandir esto para CSV múltiple
  let csv = "Nombre,Email,Fecha,CUIL_ORIGEN,Fecha_Transaccion,Tipo_Transaccion,CUIL_Origen,Cbu_Origen,Cbu_Destino,CUIL_Destino,Monto\n";

  transacciones.forEach(tx => {
    csv += `${nombre},${email},${fecha},${cuil_origen},${tx.fecha},${tx.tipo},${tx.cuil_origen},${tx.cbu_origen},${tx.cbu_destino},${tx.cuil_destino},${tx.monto}\n`;
  });

  descargarCSV(csv);
  closeModal();
  document.getElementById('dataForm').reset();
  document.querySelector('#tablaTransacciones tbody').innerHTML = '';
});

function descargarCSV(contenido) {
  const blob = new Blob([contenido], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  link.setAttribute("href", URL.createObjectURL(blob));
  link.setAttribute("download", "datos_carga.csv");
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function openModal() {
  document.getElementById('dataModal').style.display = 'block';
}

function closeModal() {
  document.getElementById('dataModal').style.display = 'none';
}

function agregarFilaTransaccion() {
  const tbody = document.querySelector('#tablaTransacciones tbody');
  const fila = document.createElement('tr');

  for (let i = 0; i < 7; i++) {
    const celda = document.createElement('td');
    const input = document.createElement('input');
    input.type = (i === 0) ? 'date' : (i === 6 ? 'number' : 'text');
    celda.appendChild(input);
    fila.appendChild(celda);
  }

  const celdaEliminar = document.createElement('td');
  const btnEliminar = document.createElement('button');
  btnEliminar.textContent = 'Eliminar';
  btnEliminar.onclick = () => fila.remove();
  celdaEliminar.appendChild(btnEliminar);
  fila.appendChild(celdaEliminar);

  tbody.appendChild(fila);
}
