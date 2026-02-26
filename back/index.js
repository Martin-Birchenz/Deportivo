import dotenv from "dotenv";
import express from "express";
import cors from "cors";
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

// Middlewares
app.use(morgan("dev"));
app.use(express.json());
app.use(
  cors({
    origin: [
      "http://localhost:5500",
      "http://127.0.0.1:5500",
      "http://127.0.0.1:5501",
      "http://localhost:5501",
      "http://127.0.0.1:3000",
      "http://localhost:3000",
    ],
    credentials: true,
  }),
);
app.use(cookieParser());
// app.use(express.static(path.join(__dirname, "../front")));
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

// Puerto
const port = process.env.PORT;
app.listen(port, () => {
  console.log(`Listening in port ${port}! http://localhost:${port}:/login`);
});

// Rutas
app.get("/", authorization.admin, (req, res) => {
  res.sendFile(path.join(__dirname, "../front/index.html"));
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
  res.sendFile(path.join(__dirname, "../front/pages/sesion/login.html"));
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
