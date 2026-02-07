const mensajeError = document.querySelector(".error-msg");
const registerForm = document.getElementById("register-form");
const checkSocio = document.getElementById("check-Socio");
const seccionSocio = document.getElementById("campos-socio");

registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nombre = document.getElementById("nombre").value;
  const apellido = document.getElementById("apellido").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const quiereSerSocio = checkSocio.checked;

  const dni = quiereSerSocio ? document.getElementById("dni").value : null;
  const categoria = quiereSerSocio
    ? document.getElementById("categoria").value
    : null;

  mensajeError.classList.add("d-none");

  try {
    const res = await fetch("/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nombre,
        apellido,
        email,
        password,
        quiereSerSocio,
        dni,
        categoria,
      }),
      credentials: "include",
    });

    if (!res.ok) {
      mensajeError.classList.remove("d-none");
      return;
    }

    const resJson = await res.json();

    if (resJson.redirect) {
      window.location.href = resJson.redirect;
    }
  } catch (error) {
    console.log(error);
  }
});

checkSocio.addEventListener("change", () => {
  if (checkSocio.checked) {
    seccionSocio.style.display = "block";
  } else {
    seccionSocio.style.display = "none";
  }
});
