import jsonWebToken from "jsonwebtoken";
import dotenv from "dotenv";
import { getConnection } from "../db/database.js";

dotenv.config();

async function admin(req, res, next) {
  const logueado = await cookie(req);
  if (logueado) return next();
  return res.redirect("/login");
}

async function publico(req, res, next) {
  const logueado = await cookie(req);
  if (!logueado) return next();
  return res.redirect("/");
}

async function cookie(req) {
  try {
    console.log("------------");
    console.log("INTENTANDO VALIDAR ACCESO...");

    const cookieJWT = req.cookies.jwt;

    console.log(
      "Cookie recibida: ",
      cookieJWT ? "SI (token presente)" : "NO (vacía)",
    );

    if (!cookieJWT) return false;

    console.log("Cookie", cookieJWT);

    const decodificacion = jsonWebToken.verify(
      cookieJWT,
      process.env.JWT_SECRET,
    );

    console.log("Token verificado: ", decodificacion);

    const connection = await getConnection();

    const [usuarios] = await connection.query(
      "SELECT * FROM usuarios WHERE id_usuarios = ?",
      [decodificacion.id],
    );

    const usuario = usuarios[0];

    return !!usuario;
  } catch (error) {
    return false;
  }
}

export const methods = {
  admin,
  publico,
};
