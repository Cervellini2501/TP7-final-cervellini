const express = require("express");
const cors = require("cors");
const path = require("path");

// Puerto dinámico de Azure
const PORT = process.env.PORT || 3000;

// Variables de entorno
const ENV_NAME = process.env.ENVIRONMENT_NAME || "development";
const NODE_ENV = process.env.NODE_ENV || "development";

// Crear app (sin listen para permitir tests)
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Servir frontend
app.use(express.static(path.join(__dirname, "frontend")));

// Importar DB
const { db } = require("./db");

// -------------------------------
// 🔥 MIDDLEWARE: Sanitizar inputs
// -------------------------------
function sanitize(text) {
  return text?.trim().toLowerCase();
}

// -------------------------------
// 🔥 MIDDLEWARE: Logger detallado
// -------------------------------
app.use((req, res, next) => {
  console.log(`➡️  ${req.method} ${req.url}`);
  next();
});

// -------------------------------
// 📌 GET /api/palabras — Listado
// -------------------------------
app.get("/api/palabras", (req, res) => {
  db.all(
    "SELECT * FROM palabras ORDER BY fecha_creacion DESC",
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });

      res.json({
        cantidad: rows.length,
        palabras: rows,
      });
    }
  );
});

// ----------------------------------------------
// 📌 GET /api/palabras/search?texto=x — BÚSQUEDA
// ----------------------------------------------
app.get("/api/palabras/search", (req, res) => {
  const texto = sanitize(req.query.texto);

  if (!texto)
    return res.status(400).json({ error: "Debe enviar ?texto para buscar" });

  db.all(
    "SELECT * FROM palabras WHERE LOWER(palabra) LIKE ?",
    [`%${texto}%`],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });

      res.json({
        query: texto,
        resultados: rows.length,
        palabras: rows,
      });
    }
  );
});

// ----------------------------------------------
// 📌 GET /api/palabras/stats — ESTADÍSTICAS
// ----------------------------------------------
app.get("/api/palabras/stats", (req, res) => {
  db.get(
    "SELECT COUNT(*) AS total, AVG(LENGTH(palabra)) AS longitud_promedio FROM palabras",
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });

      res.json({
        total: row.total,
        longitudPromedio: Number(row.longitud_promedio || 0).toFixed(2),
      });
    }
  );
});

// ---------------------------------------
// 📌 POST /api/palabras — Crear palabra
// ---------------------------------------
app.post("/api/palabras", (req, res) => {
  let { palabra } = req.body;

  palabra = sanitize(palabra);

  if (!palabra || palabra.length === 0)
    return res.status(400).json({ error: "La palabra es requerida" });

  if (palabra.length > 30)
    return res.status(400).json({ error: "La palabra es demasiado larga" });

  db.run(
    "INSERT INTO palabras (palabra) VALUES (?)",
    [palabra],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });

      res.json({
        id: this.lastID,
        palabra,
        mensaje: "Palabra agregada exitosamente",
      });
    }
  );
});

// ----------------------------------------
// 📌 DELETE /api/palabras/:id — Eliminar
// ----------------------------------------
app.delete("/api/palabras/:id", (req, res) => {
  const id = Number(req.params.id);

  if (isNaN(id)) return res.status(400).json({ error: "ID inválido" });

  db.run("DELETE FROM palabras WHERE id = ?", id, function (err) {
    if (err) return res.status(500).json({ error: err.message });

    if (this.changes === 0)
      return res.status(404).json({ error: "Palabra no encontrada" });

    res.json({ mensaje: "Palabra eliminada exitosamente" });
  });
});

// -------------------------------
// 📌 HEALTHCHECK
// -------------------------------
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "API Palabras funcionando correctamente",
    environment: ENV_NAME,
    nodeEnv: NODE_ENV,
    port: PORT,
    timestamp: new Date().toISOString(),
  });
});

// -------------------------------
// 📌 CATCH-ALL (Frontend)
// -------------------------------
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "index.html"));
});

// Exportar app para tests
module.exports = app;

// Escuchar solo si NO es test
if (require.main === module) {
  app.listen(PORT, "0.0.0.0", () => {
    console.log("════════════════════════════════════════");
    console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
    console.log(`📍 Environment: ${ENV_NAME} (NODE_ENV: ${NODE_ENV})`);
    console.log("════════════════════════════════════════");
  });
}
