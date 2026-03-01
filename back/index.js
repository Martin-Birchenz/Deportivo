import fs from "fs";
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import nodeCron from "node-cron";
import { methods as authentication } from "./src/authentication.js";
import { methods as authorization } from "./src/authorization.js";
import { fileURLToPath } from "url";
import path from "path";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { getConnection } from "./db/database.js";

dotenv.config({ debug: true });

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("DIRECTORIO ACTUAL: ", __dirname);
console.log("CONTENIDO DE LA CARPETA ACTUAL: ", fs.readdirSync(__dirname));
console.log(
  "CONTENIDO DE LA CARPETA SUPERIOR: ",
  fs.readdirSync(path.join(__dirname, "..")),
);

// Middlewares
app.use(morgan("dev"));
app.use(express.json());
app.use(
  cors({
    origin: process.env.PUBLIC_URL || true,
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "../front")));
app.use("/style", express.static(path.join(__dirname, "../front/style")));
app.use("/js", express.static(path.join(__dirname, "../front/js")));
app.use("/public", express.static(path.join(__dirname, "../front/public")));
app.use(
  "/pages/sesion",
  express.static(path.join(__dirname, "../front/pages/sesion")),
);
app.use((req, res, next) => {
  console.log(`Petición recibida: ${req.method} ${req.url}`);
  next();
});

nodeCron.schedule("* * * * *", async () => {
  console.log("Iniciando Cron. Comienza el proceso de cuotas.");
  const meses = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];
  const fechaActual = new Date();
  const mes = meses[fechaActual.getMonth()];
  const año = fechaActual.getFullYear();

  try {
    console.log(`Buscando socios para el mes de ${mes}`);
    const connection = await getConnection();
    const [socios] = await connection.query("SELECT id_usuarios FROM socios");
    console.log(`${socios.length} socios detectados.`);

    console.log("------------------------------------------");
    console.log("INSPECCIÓN TÉCNICA DE SOCIOS:");
    console.log("Tipo de dato:", typeof socios[0]);
    console.log("Contenido crudo del primer socio:", JSON.stringify(socios[0]));
    console.log("Nombres de las propiedades:", Object.keys(socios[0]));
    console.log("------------------------------------------");

    for (const socio of socios) {
      const idSocio = socio.id_usuarios || Object.values(socio)[0];
      console.log(`Procesando socio ID: ${idSocio}`);
      if (idSocio === null || idSocio === undefined) {
        console.log("No se puede leer el ID del socio");
        continue;
      }
      const [existe] = await connection.query(
        "SELECT * FROM cuotas WHERE id_usuarios = ? AND mes = ? AND anio = ?",
        [idSocio, mes, año],
      );
      if (existe.length === 0) {
        console.log(`Insertando cuota para el ID ${idSocio}`);
        await connection.query(
          "INSERT INTO cuotas (id_usuarios, mes, anio, monto, estado) VALUES (?, ?, ?, ?, 'pendiente')",
          [idSocio, mes, año, 2500.0],
        );
      } else {
        console.log(
          `El socio con ID ${socio.id_usuarios} ya tiene deudas para este mes.`,
        );
      }
    }

    console.log(`Cuotas de ${mes} generadas para ${socios.length} socios.`);
  } catch (error) {
    console.log(error);
  }
});

// Puerto
const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Listening in port ${port}! http://localhost:${port}:/login`);
});

// Rutas
app.get("/", authorization.admin, (req, res) => {
  res.sendFile(path.join(__dirname, "../front/home.html"));
});

app.get("/productos", async (req, res) => {
  const connection = await getConnection();
  const [result] = await connection.query("SELECT * FROM productos");
  console.log("DATOS ENVIADOS DESDE EL BACKEND: ", result);
  res.json(result);
});

app.get("/indumentaria", authorization.admin, (req, res) => {
  res.sendFile(
    path.join(__dirname, "../front/pages/productos/indumentaria.html"),
  );
});

app.post("/register", authentication.register);

app.get("/register", authorization.publico, (req, res) => {
  res.sendFile(path.join(__dirname, "../front/pages/sesion/register.html"));
});

app.post("/login", authentication.login);

app.get("/login", authorization.publico, (req, res) => {
  const ruta = path.join(__dirname, "../front/pages/sesion/login.html");
  console.log("INTENTANDO CARGAR: ", ruta);
  res.sendFile(ruta);
});

app.get("/deportes", authorization.admin, (req, res) => {
  res.sendFile(path.join(__dirname, "../front/pages/deportes/deportes.html"));
});

app.get("/historia", authorization.admin, (req, res) => {
  res.sendFile(path.join(__dirname, "../front/pages/historia/historia.html"));
});

app.get("/carrito", authorization.admin, (req, res) => {
  res.sendFile(path.join(__dirname, "../front/pages/productos/carrito.html"));
});

app.get("/productosInicio", async (req, res) => {
  try {
    const connection = await getConnection();
    const result = await connection.query("SELECT * FROM productos LIMIT 2");
    res.json(result);
  } catch (error) {
    console.log("ERROR AL PEDIR LOS DATOS DE LAS INDUMENTARIAS: ", error);
  }
});

app.post("/socios", authentication.socios);

app.get("/socios", authorization.admin, (req, res) => {
  res.sendFile(path.join(__dirname, "../front/pages/socios/socios.html"));
});

app.post("/logout", authentication.logout);

app.get("/perfil", authorization.admin, (req, res) => {
  res.sendFile(path.join(__dirname, "../front/pages/socios/perfil.html"));
});

app.get("/perfil/:id", authentication.perfil);
