function filtrarPorUsuario() {
    const filtro = document.getElementById('busquedaUsuario').value.toLowerCase();
    const filas = document.querySelectorAll('#tabla tbody tr');
    filas.forEach(fila => {
        const usuario = fila.cells[0].textContent.toLowerCase();
        fila.style.display = usuario.includes(filtro) ? '' : 'none';
    });
}
