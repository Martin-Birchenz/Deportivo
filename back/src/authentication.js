import bcryptjs from "bcryptjs";
import JsonWebToken from "jsonwebtoken";
import dotenv from "dotenv";
import { getConnection } from "../db/database.js";

dotenv.config();

async function register(req, res) {
  const { nombre, apellido, email, password, quiereSerSocio, dni, categoria } =
    req.body;

  console.log("Recibiendo datos del servidor: ", req.body);

  if (!nombre || !apellido || !email || !password) {
    return res
      .status(400)
      .send({ status: "Error", message: "Todos los campos son obligatorios" });
  }

  try {
    const connection = await getConnection();

    const [usuarioExiste] = await connection.query(
      "SELECT * FROM usuarios WHERE email = ?",
      [email],
    );

    if (usuarioExiste && usuarioExiste.length > 0) {
      return res
        .status(400)
        .send({ status: "Error", message: "Este email ya existe" });
    }

    const salt = await bcryptjs.genSalt(5);

    const hashPass = await bcryptjs.hash(password, salt);

    const [resultado] = await connection.query(
      "INSERT INTO usuarios (nombre, apellido, email, pass) VALUES (?, ?, ?, ?)",
      [nombre, apellido, email, hashPass],
    );

    const expira = parseInt(process.env.JWT_COOKIE_EXP || 1);

    const token = JsonWebToken.sign(
      { nombre: nombre },
      process.env.JWT_SECRET,
      {
        expiresIn: "24h",
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
    console.log("Nuevo ID generado: ", nuevoUsuarioId);

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
          redirect: "/",
          id: nuevoUsuarioId,
          socioPago: false,
          socioNoPago: true,
          noSocio: false,
        });
      }
    } else {
      return res.status(201).send({
        status: "ok",
        message: "Usuario agregado",
        redirect: "/",
        id: nuevoUsuarioId,
        socioPago: false,
        socioNoPago: false,
        noSocio: true,
      });
    }
  } catch (error) {
    console.log(error);
  }
}

async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .send({ status: "Error", message: "Los campos vacíos" });
  }

  try {
    const connection = await getConnection();

    const [usuarios] = await connection.query(
      "SELECT usuarios.id_usuarios, usuarios.nombre, usuarios.apellido, usuarios.email, usuarios.pass, socios.pago FROM usuarios LEFT JOIN socios ON usuarios.id_usuarios = socios.id_usuarios WHERE usuarios.email = ?",
      [email],
    );

    console.log(usuarios);

    if (usuarios.length === 0) {
      return res
        .status(400)
        .send({ status: "Error", message: "Usuario no encontrado" });
    }

    const usuario = usuarios[0];

    const socioNoPago = usuario.pago === 0;

    const socioPago = usuario.pago === 1;

    const noSocio = usuario.pago === null;

    const contraseñaValida = await bcryptjs.compare(password, usuario.pass);

    if (!contraseñaValida) {
      return res
        .status(400)
        .send({ status: "Error", message: "Contraseña incorrecta" });
    }

    const token = JsonWebToken.sign(
      {
        id: usuario.id_usuarios,
        nombre: usuario.nombre,
        socioPago: socioPago,
        socioNoPago: socioNoPago,
        noSocio: noSocio,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "24h",
      },
    );

    const cookieOption = {
      expires: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: false,
    };

    console.log("Seteando cookie con opciones: ", cookieOption);

    res.cookie("jwt", token, cookieOption);

    return res.status(201).send({
      status: "ok",
      message: "Logueado con éxito",
      redirect: "/",
      id: usuario.id_usuarios,
      socioPago: socioPago,
      socioNoPago: socioNoPago,
      noSocio: noSocio,
    });
  } catch (error) {
    console.log(error);
  }
}

async function logout(req, res) {
  res.clearCookie("jwt", {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: false,
  });

  return res.status(200).send({ status: "ok", message: "Sesión cerrada" });
}

async function socios(req, res) {
  const { id, dni, categoria } = req.body;

  try {
    const connection = await getConnection();
    await connection.query(
      "INSERT INTO socios (id_usuarios, dni, categoria, pago, fecha) VALUES (?, ?, ?, 0, NOW())",
      [id, dni, categoria],
    );
    return res.status(200).send("SOCIO REGISTRADO CON ÉXITO");
  } catch (error) {
    console.log(error);
  }
}

async function perfil(req, res) {
  const { id } = req.params;

  try {
    const connection = await getConnection();

    const [datos] = await connection.query(
      "SELECT u.nombre, u.apellido, s.dni, s.categoria, s.pago FROM usuarios u LEFT JOIN socios s ON u.id_usuarios = s.id_usuarios WHERE u.id_usuarios = ?",
      [id],
    );

    if (datos.length === 0) {
      return res.status(404).send({ message: "Usuario no encontrado" });
    }

    return res.json(datos[0]);
  } catch (error) {
    console.log(error);
  }
}

export const methods = {
  register,
  login,
  logout,
  socios,
  perfil,
};
