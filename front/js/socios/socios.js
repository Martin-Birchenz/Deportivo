const socio = document.getElementById("form-socio");

socio.addEventListener("submit", async (e) => {
  e.preventDefault();

  const datos = {
    id: localStorage.getItem("id"),
    dni: document.getElementById("dni").value,
    email: document.getElementById("email").value,
    categoria: document.getElementById("categoria").value,
  };

  const response = await fetch("/socios", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos),
  });

  if (response.ok) {
    localStorage.setItem("socioNoPago", "true");
    localStorage.setItem("noSocio", "false");

    window.location.href = "/perfil";
  }
});
