const contenedorTarjetas = document.getElementById("productos-container");

function crearTarjetasProductos(productos) {
  contenedorTarjetas.innerHTML = "";
  productos.forEach((producto) => {
    const precioProducto = producto.precio;
    console.log("PROCESANDO PRODUCTO: ", producto);
    const socio = localStorage.getItem("socioPago") === "true";
    const precio = socio
      ? Number(precioProducto * 0.8).toLocaleString("es-ar")
      : Number(producto.precio).toLocaleString("es-ar");
    const etiquetaSocio = socio
      ? `<span class="badge bg-success">Precio para socios</span>`
      : "";
    // Creamos el div para la tarjeta de la indumentaria a mostrar
    const nuevoProducto = document.createElement("div");
    nuevoProducto.classList = "col-md-5 col-lg-4";
    // Le agregamos el HTML correspondiente
    nuevoProducto.innerHTML = `
            <div class="product-card bg-white shadow-sm border-0 h-100">
                <div class="product-image-wrapper">
                  <img
                    src="../public/${producto.url}"
                    alt="${producto.nombre}"
                    class="img-fluid product-img"
                  />
                </div>
                <div class="card-body text-center p-4">
                  <h5 class="fw-bold font-title">${producto.nombre}</h5>
                  ${etiquetaSocio}
                  <p class="fs-4 fw-bold text-dark">$${precio}</p>
                  <a
                    class="btn btn-dark w-100 rounded-0 mt-2"
                    >Agregar al carrito</a
                  >
                </div>
              </div>
        `;

    // Agregamos la tarjeta al contenedor
    contenedorTarjetas.appendChild(nuevoProducto);

    // Buscamos la etiqueta y le damos la orden de escuchar el clic
    nuevoProducto
      .getElementsByTagName("a")[0]
      .addEventListener("click", () => agregarCarrito(producto));
  });
}

// Obtenemos los datos del servidor
async function cargarIndumentaria() {
  try {
    const res = await fetch("http://localhost:4000/productos"); // Reclamamos los datos
    const productos = await res.json(); // Convertimos la respuesta en formato JSON
    crearTarjetasProductos(productos);
    console.log("DATOS RECIBIDOS EN EL FRONTEND: ", productos);
  } catch (error) {
    console.log("Error al cargar los productos: ", error);
  }
}

cargarIndumentaria();
