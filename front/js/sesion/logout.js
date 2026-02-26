document
  .getElementById("cerrar-sesion")
  .addEventListener("click", async (e) => {
    e.preventDefault();
    const res = await fetch("/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    if (res.ok) {
      localStorage.clear();
      window.location.href = "/pages/sesion/login.html";
    }
  });
