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
function mostrarModal() {
    document.getElementById('modalFormulario').style.display = 'block';
}

function cerrarModal() {
    document.getElementById('modalFormulario').style.display = 'none';
}


async function cargarCSVDesdeGitHub() {
    const timestamp = new Date().getTime();
    const url = `https://raw.githubusercontent.com/Juanchirobot/formulario-cargas/main/historico_carga.csv?nocache=${timestamp}`;
    try {
        const response = await fetch(url);
        const text = await response.text();
        const rows = text.trim().split('\n').slice(1);
        rows.forEach(row => {
            const valores = row.split(',').map(v => v.replace(/(^"|"$)/g, ''));
            if (valores.length === 10) {
                const nuevoRegistro = {
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
                };
                datos.push(nuevoRegistro);
                actualizarContadores(nuevoRegistro);
            }
        });
        actualizarTabla();
    } catch (error) {
        console.error('Error al cargar el CSV:', error);
    }
}

