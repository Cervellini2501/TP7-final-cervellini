const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Ruta de la BD (en Azure, local, test, etc.)
const DB_PATH = process.env.DB_PATH || path.resolve(__dirname, "palabras.db");

// -------------------------------
// 🔥 Abrir conexión
// -------------------------------
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error("❌ Error al conectar con la base de datos:", err);
  } else {
    console.log(`✅ Conectado a la base de datos: ${DB_PATH}`);
  }
});

// -------------------------------
// 🔥 Inicializar tabla si no existe
// -------------------------------
db.serialize(() => {
  db.run(
    `CREATE TABLE IF NOT EXISTS palabras (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      palabra TEXT NOT NULL,
      fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    (err) => {
      if (err) console.error("❌ Error creando tabla:", err.message);
    }
  );
});

// -------------------------------
// 📌 Helper: Ejecutar SELECT (lista completa)
// -------------------------------
function obtenerTodas() {
  return new Promise((resolve, reject) => {
    db.all(
      "SELECT * FROM palabras ORDER BY fecha_creacion DESC",
      (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      }
    );
  });
}

// -------------------------------
// 📌 Helper: Búsqueda por texto
// -------------------------------
function buscar(texto) {
  return new Promise((resolve, reject) => {
    db.all(
      "SELECT * FROM palabras WHERE LOWER(palabra) LIKE ?",
      [`%${texto.toLowerCase()}%`],
      (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      }
    );
  });
}

// -------------------------------
// 📌 Crear palabra
// -------------------------------
function crearPalabra(palabra) {
  return new Promise((resolve, reject) => {
    db.run(
      "INSERT INTO palabras (palabra) VALUES (?)",
      [palabra],
      function (err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, palabra });
      }
    );
  });
}

// -------------------------------
// 📌 Eliminar palabra
// -------------------------------
function eliminarPalabra(id) {
  return new Promise((resolve, reject) => {
    db.run("DELETE FROM palabras WHERE id = ?", id, function (err) {
      if (err) reject(err);
      else resolve({ eliminadas: this.changes });
    });
  });
}

// -------------------------------
// 📌 Estadísticas
// -------------------------------
function obtenerStats() {
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT COUNT(*) AS total, AVG(LENGTH(palabra)) AS longitudPromedio FROM palabras`,
      (err, row) => {
        if (err) reject(err);
        else resolve(row);
      }
    );
  });
}

// -------------------------------
// 📌 Exportamos todo
// -------------------------------
module.exports = {
  db,
  obtenerTodas,
  buscar,
  crearPalabra,
  eliminarPalabra,
  obtenerStats,
};
