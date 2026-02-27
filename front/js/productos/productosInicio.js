const contenedorTarjetas = document.getElementById("productos-inicio");

function crearTarjetasProductosInicio(productos) {
  productos.forEach((producto) => {
    const precio = Number(producto.precio).toLocaleString("es-ar");
    console.log("PROCESANDO PRODUCTO: ", producto);
    const nuevoProducto = document.createElement("div");
    nuevoProducto.classList = "col-md-4";
    nuevoProducto.innerHTML = `
            <div class="card border-0 text-center">
                <img src="../public/${producto.url}" class="card-img-top shadow-sm" alt="${producto.nombre}"/>
                <div class="card-body">
                  <h5 class="fw-bold">${producto.nombre}</h5>
                  <p class="text-muted">$${precio}</p>
                </div>
              </div>
        `;

    contenedorTarjetas.appendChild(nuevoProducto);
  });
}

async function cargarProductosInicio() {
  try {
    const res = await fetch("/productosInicio");
    const [productos] = await res.json();
    crearTarjetasProductosInicio(productos);
    console.log("DATOS RECIBIDOS EN EL FRONTEND: ", productos);
  } catch (error) {
    console.log("Error al cargar productos: ", error);
  }
}

cargarProductosInicio();
