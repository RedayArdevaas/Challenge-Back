const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const { errorHandler, notFound } = require("./middlewares/errorHandler");


const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.listen(PORT, () => console.log(`Server ON en el puerto ${PORT}`));


const db = new Pool({
  host: "localhost",
  user: "postgres",
  password: "",
  database: "challenge",
  port: 5432,
  allowExitOnIdle: true,
});

module.exports = { app, db };

require("./controllers");

app.use(notFound);
app.use(errorHandler);