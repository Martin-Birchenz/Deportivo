document.addEventListener("DOMContentLoaded", async () => {
  const id = localStorage.getItem("id");

  if (!id) {
    window.location.href = "/login";
    return;
  }

  try {
    const res = await fetch(`/perfil/${id}`);

    if (!res.ok) throw new Error("Error en la petición");

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

    if (datos.cuotas && datos.cuotas.length > 0) {
      datos.cuotas.forEach((cuota) => {
        const fila = `
        <tr>
            <td>Cuota Social Mensual</td>
            <td class="fw-bold">$${Number(cuota.monto).toLocaleString("es-ar")}</td>
            <td> ${cuota.mes} ${cuota.anio} </td>
            <td class="text-end">
                <span class="badge ${cuota.estado === "pago" ? "bg-success" : "bg-danger"}"> ${cuota.monto === "pago" ? "Pago" : } </span>
            </td>
        </tr>
    `;
        tablaBody.innerHTML += fila;
      });
    } else {
      tablaBody.innerHTML = `<tr><td colspan="4" class="text-center text-muted fw-bold">No tenés pagos pendientes este mes</td></tr>`;
    }

     document.getElementById("btn-comprobante").addEventListener("click", () => {
      const mensaje = `¡Hola! Soy ${datos.nombre} ${datos.apellido}. Adjunto el comprobante de pago para el mes de ${datos.mes}.`;
      window.open(
        `https://wa.me/+5493435611122?text=${encodeURIComponent(mensaje)}`,
        "_blank",
      );
    });

    document.getElementById("btn-baja").addEventListener("click", () => {
      const confirmar = confirm(
        "¿Estás seguro de que deseas solicitar la baja de socio?",
      );
      if (confirmar) {
        const mensaje = `Hola, soy ${datos.nombre} ${datos.apellido} (DNI: ${datos.dni}) y quiero solicitar mi baja de socio.`;
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
    const deudas = datos.cuotas.some((c) => c.estado === "pendiente");

    if (!deudas) {
      estado.className = "bi bi-check-circle-fill text-success fs-2 fw-bold";
      estado.innerText = " Estás al día";
    } else if (deudas) {
      estado.className =
        "bi bi-exclamation-octagon-fill text-danger fs-2 fw-bold";
      estado.innerText = "  Cuotas pendientes";
    }
  } catch (error) {
    console.log(error);
  }
});
