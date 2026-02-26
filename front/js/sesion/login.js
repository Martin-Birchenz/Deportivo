const mensajeError = document.querySelector(".error-msg");
const loginForm = document.getElementById("login-form");

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  mensajeError.classList.add("d-none");

  try {
    const res = await fetch("/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      credentials: "include",
    });

    if (!res.ok) {
      mensajeError.classList.remove("d-none");
      return;
    }

    const resJson = await res.json();

    if (resJson.redirect) {
      console.log("LOGIN EXITOSO, GUARDANDO SOCIO: ", resJson.socio);
      localStorage.setItem("socioPago", resJson.socioPago);
      localStorage.setItem("socioNoPago", resJson.socioNoPago);
      localStorage.setItem("noSocio", resJson.noSocio);
      localStorage.setItem("id", resJson.id);

      window.location.href = resJson.redirect;
    }
  } catch (error) {
    console.log(error);
  }
});
