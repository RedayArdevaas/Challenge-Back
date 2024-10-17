const { Pool } = require("pg");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = new Pool({
  host: "localhost",
  user: "alejandroidb",
  password: "240309",
  database: "challenge",
  port: 5432,
  allowExitOnIdle: true,
});

const registrarUsuarios = async (nombre, email, password) => {
  try {
    if (!nombre || !email || !password) {
      throw new Error("Todos los campos son obligatorios");
    }
    const passwordEncriptado = bcrypt.hashSync(password, 10);
    const consulta =
      "INSERT INTO usuarios (nombre, correo, password) VALUES ($1, $2, $3) RETURNING *";
    const values = [nombre, email, passwordEncriptado];
    const result = await pool.query(consulta, values);

    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, email: user.correo }, "az_AZ", {
      expiresIn: "2h",
    });

    return { user, token };
  } catch (error) {
    console.error("Se ha producido un error:", error);
  }
};

const login = async (email, password) => {
  try {
    const values = [email];
    const consulta = "SELECT * FROM usuarios WHERE correo = $1"; // Corregido

    const {
      rows: [usuario],
      rowCount,
    } = await pool.query(consulta, values);

    // Verifica si el usuario fue encontrado
    if (!usuario) {
      throw {
        code: 401,
        message: "No se encuentra el usuario con esas credenciales",
      };
    }

    const { password: passwordEncriptado } = usuario;
    const passwordEsCorrecto = await bcrypt.compare(
      password,
      passwordEncriptado
    );

    if (!passwordEsCorrecto) {
      throw {
        code: 401,
        message: "No se encuentra el usuario con esas credenciales",
      };
    }

    // Si la contraseña es correcta, retorna el usuario y el token
    const token = jwt.sign({ id: usuario.id, email: usuario.correo }, "az_AZ", {
      expiresIn: "2h",
    });
    return { user: usuario, token };
  } catch (error) {
    console.error("Error al verificar el usuario:", error);
    throw error;
  }
};

const getProductsCount = async () => {
  try {
    const consulta = "SELECT COUNT(*) FROM productos";
    const result = await pool.query(consulta);

    return parseInt(result.rows[0].count);
  } catch (error) {
    console.error("Error al contar productos:", error);
    throw error;
  }
};

const getProducts = async (limit = 20, offset = 0) => {
  try {
    const consulta =
      "SELECT * FROM productos ORDER BY nombre ASC LIMIT $1 OFFSET $2";
    const values = [limit, offset];
    const result = await pool.query(consulta, values);

    return result.rows;
  } catch (error) {
    console.error("Se ha producido un error:", error);
    throw error;
  }
};

const getCategories = async () => {
  try {
    const consulta = "SELECT DISTINCT categoria FROM productos ORDER BY categoria ASC";
    const result = await pool.query(consulta);
    return result.rows;
  } catch (error) {
    console.error("Error al obtener categorías:", error);
    throw error;
  }
};

const getProductsByCategory = async (categoria, limit, offset) => {
  try {
    const consulta =
      "SELECT * FROM productos WHERE categoria = $1 ORDER BY nombre ASC LIMIT $2 OFFSET $3";
    const values = [categoria, limit, offset];
    const result = await pool.query(consulta, values);

    return result.rows;
  } catch (error) {
    console.error("Error al obtener productos por categoria:", error);
    throw error;
  }
};

module.exports = {
  registrarUsuarios,
  getProducts,
  getProductsCount,
  login,
  getProductsByCategory,
  getCategories
};
