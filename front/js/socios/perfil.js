document.addEventListener("DOMContentLoaded", async () => {
  const id = localStorage.getItem("id");

  if (!id) {
    console.log("NO SE ENCONTRÓ EL ID EN EL ALMACENAMIENTO LOCAL");
    window.location.href = "/login";
    return;
  }

  try {
    const res = await fetch(`/perfil/${id}`);

    const meses = [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre",
    ];
    const mesActual = meses[new Date().getMonth()];

    document.getElementById("btn-comprobante").addEventListener("click", () => {
      const nombre = document.getElementById("nombreApellido").innerText;
      const mensaje = `¡Hola! Soy ${nombre}. Adjunto el comprobante de pago para el mes de ${mesActual}.`;
      window.open(
        `https://wa.me/+5493435611122?text=${encodeURIComponent(mensaje)}`,
        "_blank",
      );
    });

    if (!res.ok) {
      console.log("ERROR EN LA PETICIÓN: ", res.status);
    }

    const datos = await res.json();

    const tablaBody = document.querySelector("tbody");
    tablaBody.innerHTML = "";
    const fila = `
        <tr>
            <td>Cuota Social Mensual</td>
            <td class="fw-bold">$2.500</td>
            <td> ${mesActual} </td>
            <td class="text-end">
                ${datos.pago === 1 ? `<span class="badge bg-success">Pago</span>` : `<span class="badge bg-danger">Pendiente</span>`}
            </td>
        </tr>
    `;

    tablaBody.innerHTML = fila;

    document.getElementById("btn-baja").addEventListener("click", () => {
      const confirmar = confirm(
        "¿Estás seguro de que deseas solicitar la baja de socio?",
      );
      if (confirmar) {
        const mensaje = `Hola, soy ${document.getElementById("nombreApellido").innerText} (DNI: ${datos.dni}) y quiero solicitar mi baja de socio.`;
        window.open(
          `https://wa.me/+5493435611122?text=${encodeURIComponent(mensaje)}`,
          "_blank",
        );
      }
    });

    document.getElementById("nombreFoto").innerText = datos.nombre
      .charAt(0)
      .toUpperCase();
    document.getElementById("nombreApellido").innerText =
      `${datos.nombre} ${datos.apellido}`;
    document.getElementById("socio").innerText = `Socio N°: ${id}`;
    document.getElementById("dni").innerText = `DNI: ${datos.dni}`;
    document.getElementById("categoria").innerText =
      `Categoría: ${datos.categoria}`;
    const estado = document.getElementById("estado");

    if (datos.pago === 1) {
      estado.className = "bi bi-check-circle-fill text-success fs-2 fw-bold";
      estado.innerText = " Estás al día";
    } else if (datos.pago === 0) {
      estado.className =
        "bi bi-exclamation-octagon-fill text-danger fs-2 fw-bold";
      estado.innerText = "  Cuotas pendientes";
    }
  } catch (error) {
    console.log(error);
  }
});
