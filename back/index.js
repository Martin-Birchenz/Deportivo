import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { methods as authentication } from "./src/authentication.js";
import { fileURLToPath } from "url";
import path from "path";
import cookieParser from "cookie-parser";
import morgan from "morgan";

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
app.use(express.static(path.join(__dirname, "../front")));

// Puerto
const port = process.env.PORT;
app.listen(port, () => {
  console.log(`Listening in port ${port}! http://localhost:3000:/login`);
});

// Rutas
app.get("/", async (req, res) => {
  res.send("Página de inicio");
});

app.get("/productos");

app.post("/register", authentication.register);

app.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, "../front/pages/sesion/register.html"));
});

app.post("/login", authentication.login);

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "../front/pages/sesion/login.html"));
});

app.post("/logout", authentication.logout);

app.post("/socios", authentication.socios);
