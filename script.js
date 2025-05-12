function filtrarPorUsuario() {
    const filtro = document.getElementById('busquedaUsuario').value.toLowerCase();
    const filas = document.querySelectorAll('#tabla tbody tr');
    filas.forEach(fila => {
        const usuario = fila.cells[0].textContent.toLowerCase();
        fila.style.display = usuario.includes(filtro) ? '' : 'none';
    });
}
function descargarUpdate() {
    if (datos.length === 0) {
        alert("No hay datos para descargar.");
        return;
    }

    const encabezados = Object.keys(datos[0]).join(',');
    const filas = datos.map(d => Object.values(d).join(',')).join('\n');
    const contenidoCSV = `${encabezados}\n${filas}`;
    const blob = new Blob([contenidoCSV], { type: 'text/csv;charset=utf-8;' });
    const enlace = document.createElement('a');
    enlace.href = URL.createObjectURL(blob);
    enlace.download = 'update_casos.csv';
    enlace.click();
}
const opcionesGraficos = {
    responsive: true,
    maintainAspectRatio: false,
    devicePixelRatio: 2, // Aumenta la resolución
    scales: {
        y: {
            beginAtZero: true,
            precision: 0
        }
    }
};
