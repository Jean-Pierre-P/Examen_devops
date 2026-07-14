const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 8080;

// Configuración de conexión a la base de datos vía variables de entorno.
// Nunca se hardcodean credenciales: vienen de .env en local o de
// GitHub Secrets / AWS Secrets Manager en el pipeline y en producción.
const pool = new Pool({
  host: process.env.DB_HOST || "db",
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || "appdb",
});

// Endpoint de salud: útil para verificar que el contenedor y la BD están operativos
// (esto es justo lo que se pide demostrar como "evidencia de despliegue activo").
app.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", db: "connected" });
  } catch (err) {
    res.status(500).json({ status: "error", db: "disconnected", error: err.message });
  }
});

app.get("/api/items", async (req, res) => {
  try {
    const result = await pool.query(
      "CREATE TABLE IF NOT EXISTS items (id SERIAL PRIMARY KEY, name TEXT NOT NULL)"
    );
    const items = await pool.query("SELECT * FROM items ORDER BY id");
    res.json(items.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/items", async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: "name es requerido" });
  try {
    const result = await pool.query(
      "INSERT INTO items (name) VALUES ($1) RETURNING *",
      [name]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Backend escuchando en el puerto ${port}`);
});

module.exports = app;
