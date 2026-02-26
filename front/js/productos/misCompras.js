function crearTarjetasProductos() {
  const contenedorTarjetas = document.getElementById("productos-container");

  // Leemos el Local Storage
  const productos = JSON.parse(localStorage.getItem("Indumentaria"));

  if (productos && productos.length > 0) {
    contenedorTarjetas.innerHTML = `
            <table class="table align-middle">
                <thead class="table-dark">
                    <tr>
                        <th scope="col" class="py-3">
                          Descripción del Producto
                        </th>
                        <th scope="col" class="py-3 text-center">Cantidad</th>
                        <th scope="col" class="py-3 text-end">Subtotal</th>
                    </tr>
                </thead>
                    <tbody id="body-table"></tbody>
            </table>
            <div class="d-flex justify-content-between mt-4">
                <button class="btn btn-outline-danger btn-sm rounded-0 text-uppercase fw-bold" onclick="reiniciarCarrito()" id="reiniciar-carrito">
                    <i class="fas fa-trash-alt me-2"></i> Reiniciar Carrito
                  </button>
                  <a href="/indumentaria" class="btn btn-outline-secondary btn-sm rounded-0 text-uppercase fw-bold">
                    <i class="fas fa-arrow-left me-2"></i> Seguir Comprando
                  </a>
            </div>
        `;

    const body = document.getElementById("body-table");

    productos.forEach((producto) => {
      const socio = localStorage.getItem("socioPago") === "true";
      const precioProducto = Number(producto.precio) * producto.cantidad;
      const precio = socio ? precioProducto * 0.8 : precioProducto;

      const filaProducto = document.createElement("tr");
      const tiposTalles = ["S", "M", "L", "XL", "XXL"];
      const talles = tiposTalles
        .map(
          (talle) =>
            `<option value="${talle}" ${producto.talle === talle ? "selected" : ""} > ${talle} </option>`,
        )
        .join("");
      filaProducto.innerHTML = `
                <td class="py-4">
                    <div class="fw-bold nombre"> ${producto.nombre} </div>
                    <div class="small text-muted"><p class="fw-bold">Talle:</p>
                        <select class="form-select form-select-sm ms-2 select-talle" style="width: 150px">
                            <option value="" disabled ${!producto.talle ? "selected" : ""} > Seleccionar talle  </option>
                            ${talles}
                        </select>
                    </div>
                </td>
                <td class="text-center">
                    <div class="d-flex justify-content-center" align-items-center">
                        <button class="btn btn-sm btn-outline-dark px-2 py-0 restar"> - </button>
                            <span class="mx-3 fw-bold cantidad"> ${producto.cantidad} </span>
                        <button class="btn btn-sm btn-outline-dark px-2 py-0 sumar"> + </button>
                    </div>
                </td>
                <td class="text-end fw-bold total" id="precioTotal"> $${precio.toLocaleString("es-ar")} </td>
            `;

      body.appendChild(filaProducto);

      filaProducto
        .querySelector(".select-talle")
        .addEventListener("change", (e) => {
          const memoria =
            JSON.parse(localStorage.getItem("Indumentaria")) || [];
          const indice = memoria.findIndex(
            (item) => item.id_productos === producto.id_productos,
          );
          if (indice !== -1) {
            memoria[indice].talle = e.target.value;
            localStorage.setItem("Indumentaria", JSON.stringify(memoria));
          }
        });

      filaProducto.querySelector(".sumar").addEventListener("click", () => {
        agregarCarrito(producto);
        crearTarjetasProductos();
        actualizador();
      });

      filaProducto.querySelector(".restar").addEventListener("click", () => {
        restarCarrito(producto);
        crearTarjetasProductos();
        actualizador();
      });
    });

    actualizador();
  } else {
    contenedorTarjetas.innerHTML = `
    <div class="text-center">
        <p id="carrito-vacio" class="text-center fw-bold fs-3"> ¡El carrito esta vacío! Agrega productos </p>
        <a href="/indumentaria" class="btn btn-outline-secondary btn-sm rounded-0 text-uppercase fw-bold">
         <i class="fas fa-arrow-left me-2"></i> Ver la indumentaria 
        </a>
    </div>
    
    `;
  }
}

function actualizador() {
  const productos = JSON.parse(localStorage.getItem("Indumentaria")) || [];
  const socio = localStorage.getItem("socioPago") === "true";
  const precioTotal = productos.reduce(
    (acc, producto) => acc + producto.precio * producto.cantidad,
    0,
  );
  const precio = socio
    ? Number(precioTotal * 0.8).toLocaleString("es-ar")
    : precioTotal;
  const total = document.getElementById("total-pedido");
  if (total) total.innerText = `$${precio.toLocaleString("es-ar")}`;
}

function reiniciarCarrito() {
  if (confirm("¿Estás seguro que quieres vaciar el carrito?")) {
    localStorage.removeItem("Indumentaria");
    crearTarjetasProductos();
    actualizador();
  }
  if (typeof actualizarContadorCarrito === "function") {
    actualizarContadorCarrito();
  }
}

function enviarPedidoWhatsApp() {
  const filas = document.querySelectorAll("#body-table tr");
  let mensaje = "Hola, este es mi pedido:\n\n";

  filas.forEach((fila) => {
    const nombre = fila.querySelector(".nombre").innerText;
    const talle = fila.querySelector(".select-talle").value;
    const cantidad = fila.querySelector(".cantidad").value;
    const total = fila.querySelector(".total").value;

    mensaje += `• *${nombre}*\n Talle: ${talle} | Cantidad: ${cantidad} | ${total}\n\n `;
  });

  const total = document.getElementById("total-pedido").innerText;
  mensaje += ` *TOTAL A TRANSFERIR: ${total} * `;

  const url = `http://wa.me/+5493435611122?text=${encodeURIComponent(mensaje)}`;
  window.open(url, "_blank");
}

document.addEventListener("DOMContentLoaded", () => {
  crearTarjetasProductos();
});
