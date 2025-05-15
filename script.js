let datos = [];
let transacciones = [];
let contadorID = 1000;
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
  document.getElementById("busqueda-container").style.display = "flex";
  document.getElementById("tablaCasos").style.display = "block";
  actualizarTabla();
}
function mostrarFormulario() {
  ocultarTodo();
  document.getElementById("formulario-section").style.display = "block";
  document.getElementById("formulario").reset();
  document.querySelector("#tablaTransacciones tbody").innerHTML = "";
}
function mostrarDashboard() {
  ocultarTodo();
  document.getElementById("dashboard").style.display = "block";
  renderizarGraficosDashboard();
}
function ejecutarBusqueda() {
  const input = document.getElementById("busqueda").value.toLowerCase();
  const filas = document.querySelectorAll("#tabla tbody tr");
  filas.forEach((fila) => {
    const cuilCliente = fila.cells[2]?.textContent?.toLowerCase() || "";
    fila.style.display = cuilCliente.includes(input) || input === "" ? "" : "none";
  });
}
