import dotenv from "dotenv";
import express from "express";
import { getConnection } from "./db/database.js";

dotenv.config({ debug: true });

const app = express();

// Middlewares
app.use(express.json());

// Puerto
const port = process.env.PORT;
app.listen(port, () => {
  console.log(`Listening in port ${port}! http://localhost:3000/login`);
});

// Rutas
app.get("/", async (req, res) => {
  res.send("Página de inicio");
});

app.get("/productos", async (req, res) => {
  const connection = await getConnection();
  const result = await connection.query("SELECT * FROM productos");
  res.json(result);
});

app.post(
  ("/socios",
  async (req, res) => {
    const { nombre, dni, email } = req.body;
    const connection = await getConnection();
    connection.query(
      "SELECT * FROM socios WHERE dni = ?",
      dni,
      async (error, result) => {
        if (error) {
          return res.status(500).send("Error en el servidor");
        }

        if (result.length > 0) {
          return res
            .status(400)
            .json({ message: "Este dni ya pertenece a un socio." });
        } else {
          const result = await connection.query(
            "INSERT INTO socios (nombre, dni, email) VALUES (?, ?, ?)",
            [nombre, dni, email],
          );
          res.json(result);
        }
      },
    );

    connection.query(
      "SELECT * FROM socios WHERE email = ?",
      email,
      async (error, result) => {
        if (error) {
          return res.status(500).send("Error en el servidor");
        }

        if (result.length > 0) {
          return res
            .status(400)
            .json({
              message: "Este correo electrónico ya pertenece a un socio.",
            });
        } else {
          const result = await connection.query(
            "INSERT INTO socios (nombre, dni, email) VALUES (?, ?, ?)",
            [nombre, dni, email],
          );
          res.json(result);
        }
      },
    );
  }),
);
