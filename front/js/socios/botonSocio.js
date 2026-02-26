function botonSocio() {
  const socioPago = localStorage.getItem("socioPago") === "true";
  const socioNoPago = localStorage.getItem("socioNoPago") === "true";
  const botonSocio = document.getElementById("haceteSocio");
  const botonSocioHeader = document.getElementById("haceteSocioHeader");
  const socioSection = document.getElementById("socios-container");
  const perfil = document.getElementById("miPerfil");

  if (socioPago || socioNoPago) {
    if (botonSocio) {
      botonSocio.style.display = "none";
    }

    if (botonSocioHeader) {
      botonSocioHeader.style.display = "none";
    }

    if (socioSection) {
      socioSection.style.display = "none";
    }
  } else {
    if (!socioPago || !socioNoPago) {
      perfil.style.display = "none";
    }
  }
}

botonSocio();
