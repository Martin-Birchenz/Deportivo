import bcryptjs from "bcryptjs";
import JsonWebToken from "jsonwebtoken";
import dotenv from "dotenv";
import { getConnection } from "../db/database.js";

dotenv.config();

async function register(req, res) {
  const { nombre, apellido, email, password, quiereSerSocio, dni, categoria } =
    req.body;

  if (!nombre || !apellido || !email || !password) {
    return res
      .status(400)
      .send({ status: "Error", message: "Todos los campos son obligatorios" });
  }

  try {
    const connection = await getConnection();

    const usuarioExiste = await connection.query(
      "SELECT * FROM usuarios WHERE email = ?",
      [email],
    );

    if (usuarioExiste.length > 0) {
      return res
        .status(400)
        .send({ status: "Error", message: "Este email ya existe" });
    }

    const salt = await bcryptjs.genSalt(5);

    const hashPass = await bcryptjs.hash(password, salt);

    const resultado = await connection.query(
      "INSERT INTO usuarios (nombre, apellido, email, pass) VALUES (?, ?, ?, ?)",
      [nombre, apellido, email, hashPass],
    );

    const expira = parseInt(process.env.JWT_COOKIE_EXP || 1);

    const token = JsonWebToken.sign(
      { nombre: nombre },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXP,
      },
    );

    const cookieOption = {
      expires: new Date(Date.now() + expira * 24 * 60 * 60 * 1000),
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: false,
    };

    console.log("Seteando cookie con opciones: ", cookieOption);

    res.cookie("jwt", token, cookieOption);

    const nuevoUsuarioId = resultado.insertId;

    if (quiereSerSocio) {
      if (!dni || !categoria) {
        return res
          .status(400)
          .send({ status: "Error", message: "Faltan datos" });
      } else {
        connection.query(
          "INSERT INTO socios (dni, categoria, pago, id_usuarios ) VALUES (?, ?, ?, ?)",
          [dni, categoria, 0, nuevoUsuarioId],
        );
        return res.status(201).send({
          status: "ok",
          message: "Usuario y solicitud de socio creados",
          redirect: "../../index.html",
        });
      }
    } else {
      return res.status(201).send({
        status: "ok",
        message: "Usuario agregado",
        redirect: "../../index.html",
      });
    }
  } catch (error) {
    console.log(error);
  }
}

async function login(req, res) {}

async function logout(req, res) {}

async function socios(req, res) {}

export const methods = {
  register,
  login,
  logout,
  socios,
};
