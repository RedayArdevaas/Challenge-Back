const express = require("express");
const cors = require("cors");
const {
  registrarUsuarios,
  getProducts,
  getProductsCount,
  login,
  getProductsByCategory,
  getCategories,
} = require("./requests");
const verifyToken = require("./middlewares/verifyToken");
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.listen(PORT, () => console.log(`Server ON en el puerto ${PORT}`));

app.post("/usuarios", async (req, res) => {
  const { nombre, email, password } = req.body;
  try {
    const nuevoUsuario = await registrarUsuarios(nombre, email, password);
    res
      .status(201)
      .json({ message: "Usuario creado con exito", user: nuevoUsuario });
  } catch (error) {
    res.status(500).json({ message: "Error al registrar el usuario" });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const { user, token } = await login(email, password);
    res.status(200).json({ message: "Inicio de sesión exitoso", user, token });
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    res
      .status(error.code || 500)
      .send(error.message || "Error al iniciar sesión");
  }
});

app.get("/productos", verifyToken, async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;
  try {
    const totalProductos = await getProductsCount();

    const productos = await getProducts(limit, offset);

    res.status(200).json({
      status: 200,
      data: productos,
      total: totalProductos,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(totalProductos / limit),
    });
  } catch (error) {
    console.error("Error al obtener productos:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener productos",
    });
  }
});

app.get("/categorias", async (req, res) => {
  try {
    const categorias = await getCategories();
    res.json(categorias);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener categorías" });
  }
});

app.get("/productos/categoria/:categoria", async (req, res) => {
  const { categoria } = req.params;
  const { page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;
  try {
    const productos = await getProductsByCategory(categoria, limit, offset);
    res.json({
      data: productos,
      totalPages: 1,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al obtener productos por categoria" });
  }
});

const stripe = require("stripe")("tu_clave_privada_de_stripe");

app.post("/api/create-payment-intent", verifyToken, async (req, res) => {
  const { amount } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
    });
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ruta para gestionar pedidos
app.post("/api/orders", verifyToken, (req, res) => {
  const { cart, userDetails } = req.body;
  // Lógica para guardar el pedido en la base de datos
  res.status(201).send("Pedido creado con éxito");
});

