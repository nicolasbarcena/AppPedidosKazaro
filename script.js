// Configuración EmailJS
const EMAILJS_PUBLIC_KEY = "g94YTgSjLp2km1bcS";
const SERVICE_ID = "service_40ttmon";
const TEMPLATE_ID = "template_462n4v4";

emailjs.init(EMAILJS_PUBLIC_KEY);

// Variables 
let carrito = [];
let remitoActual = null;
let productos = [];   

// Variables para paginación
let paginaActual = 1;
const productosPorPagina = 15;

// Cargar productos desde JSON
async function cargarProductos() {
  const res = await fetch("products.json");
  productos = await res.json();
}

// Mostrar productos filtrados por categoría con paginación
function mostrarProductos(categoria, pagina = 1) {
  const contenedor = document.getElementById("productos");
  contenedor.innerHTML = "";

  const filtrados = productos.filter(p => p.category === categoria);

  if (filtrados.length === 0) {
    contenedor.innerHTML = "<p>No hay productos en esta categoría.</p>";
    return;
  }

  // Paginación
  const inicio = (pagina - 1) * productosPorPagina;
  const fin = inicio + productosPorPagina;
  const paginaProductos = filtrados.slice(inicio, fin);

  // Mostrar productos de la página actual
  paginaProductos.forEach(prod => {
    const div = document.createElement("div");
    div.classList.add("producto");
    div.innerHTML = `
      <h3>${prod.description}</h3>
      <p>Código: ${prod.code}</p>
      <p>Precio: $${prod.price}</p>
      <p>Stock: ${prod.stock}</p>
      <button onclick="agregarAlCarrito('${prod.code}','${prod.description}',${prod.price})">
        Agregar
      </button>
    `;
    contenedor.appendChild(div);
  });

  // Controles de paginación
  const paginacion = document.createElement("div");
  paginacion.classList.add("paginacion");

  if (pagina > 1) {
    const btnPrev = document.createElement("button");
    btnPrev.textContent = "⬅ Anterior";
    btnPrev.onclick = () => mostrarProductos(categoria, pagina - 1);
    paginacion.appendChild(btnPrev);
  }

  if (fin < filtrados.length) {
    const btnNext = document.createElement("button");
    btnNext.textContent = "Siguiente ➡";
    btnNext.onclick = () => mostrarProductos(categoria, pagina + 1);
    paginacion.appendChild(btnNext);
  }

  contenedor.appendChild(paginacion);
}

// Carrito y Remito

function agregarAlCarrito(code, description, price) {
  const existente = carrito.find(p => p.code === code);

  if (existente) {
    existente.cantidad++;
    existente.subtotal = existente.cantidad * existente.price;
  } else {
    carrito.push({
      code,
      description,
      price,
      cantidad: 1,
      subtotal: price
    });
  }

  renderCarrito();
}

function renderCarrito() {
  const tbody = document.getElementById("carrito-body");
  tbody.innerHTML = "";

  carrito.forEach((item, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${item.code}</td>
      <td>${item.description}</td>
      <td>
        <input type="number" min="1" value="${item.cantidad}" 
               onchange="cambiarCantidad(${index}, this.value)">
      </td>
      <td>$${item.price}</td>
      <td>$${item.subtotal.toFixed(2)}</td>
      <td><button onclick="eliminarDelCarrito(${index})">❌</button></td>
    `;
    tbody.appendChild(tr);
  });

  const total = carrito.reduce((sum, i) => sum + i.subtotal, 0);
  document.getElementById("total").textContent = total.toFixed(2);
}

function cambiarCantidad(index, cantidad) {
  carrito[index].cantidad = parseInt(cantidad);
  carrito[index].subtotal = carrito[index].cantidad * carrito[index].price;
  renderCarrito();
}

function eliminarDelCarrito(index) {
  carrito.splice(index, 1);
  renderCarrito();
}

function generarNumeroRemito() {
  const fecha = new Date();
  const dd = String(fecha.getDate()).padStart(2, "0");
  const mm = String(fecha.getMonth() + 1).padStart(2, "0");
  const yy = fecha.getFullYear().toString().slice(-2);
  const hh = String(fecha.getHours()).padStart(2, "0");
  const mi = String(fecha.getMinutes()).padStart(2, "0");
  const ss = String(fecha.getSeconds()).padStart(2, "0");
  return `REM-${dd}${mm}${yy}-${hh}${mi}${ss}`;
}

function finalizarPedido() {
  const cliente = document.getElementById("cliente").value.trim();
  if (!cliente) {
    alert("Ingrese nombre y apellido.");
    return;
  }
  if (carrito.length === 0) {
    alert("El carrito está vacío.");
    return;
  }

  const numeroRemito = generarNumeroRemito();
  const total = carrito.reduce((sum, i) => sum + i.subtotal, 0);

  remitoActual = {
    numero: numeroRemito,
    cliente,
    fecha: new Date().toLocaleString(),
    items: [...carrito],
    total
  };

  mostrarRemito(remitoActual);
}

function mostrarRemito(remito) {
  const div = document.getElementById("remito");
  div.innerHTML = `
    <p><strong>Remito N°:</strong> ${remito.numero}</p>
    <p><strong>Cliente:</strong> ${remito.cliente}</p>
    <p><strong>Fecha:</strong> ${remito.fecha}</p>
    <table>
      <thead>
        <tr><th>Código</th><th>Artículo</th><th>Cantidad</th><th>Precio</th><th>Subtotal</th></tr>
      </thead>
      <tbody>
        ${remito.items.map(i =>
          `<tr><td>${i.code}</td><td>${i.description}</td><td>${i.cantidad}</td><td>$${i.price}</td><td>$${i.subtotal.toFixed(2)}</td></tr>`
        ).join("")}
      </tbody>
    </table>
    <h3>Total: $${remito.total.toFixed(2)}</h3>
  `;

  document.getElementById("remito-section").style.display = "block";
}

async function enviarEmail() {
  if (!remitoActual) return alert("No hay remito para enviar.");

  const detalleHTML = remitoActual.items.map(i => `
  <tr>
    <td style="border:1px solid #ddd; padding:6px;">${i.code}</td>
    <td style="border:1px solid #ddd; padding:6px;">${i.description}</td>
    <td style="border:1px solid #ddd; padding:6px; text-align:center;">${i.cantidad}</td>
    <td style="border:1px solid #ddd; padding:6px; text-align:right;">$${i.price.toFixed(2)}</td>
    <td style="border:1px solid #ddd; padding:6px; text-align:right;">$${i.subtotal.toFixed(2)}</td>
  </tr>
   `).join("");

  try {
    await emailjs.send(SERVICE_ID, TEMPLATE_ID, {
      numero: remitoActual.numero,
      cliente: remitoActual.cliente,
      fecha: remitoActual.fecha,
      total: remitoActual.total.toFixed(2),
      detalle: detalleHTML
    });
    alert("Remito enviado con éxito.");
  } catch (err) {
    console.error("Error enviando email:", err);
    alert("Error al enviar el remito.");
  }
}

// Eventos
document.getElementById("finalizar").addEventListener("click", finalizarPedido);
document.getElementById("enviar").addEventListener("click", enviarEmail);

// Inicialización
cargarProductos();
