const express = require('express');
const cors = require('cors');
const path = require('path');

// Puerto dinámico para Azure o 3000 local
const PORT = process.env.PORT || 3000;

// Variables de entorno
const ENV_NAME = process.env.ENVIRONMENT_NAME || 'development';
const NODE_ENV = process.env.NODE_ENV || 'development';

// 👉 Ruta REAL del frontend (está fuera de /backend)
const FRONTEND_DIR = path.join(__dirname, '..', 'frontend');

// Crear app
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Servir archivos estáticos del frontend
app.use(express.static(FRONTEND_DIR));

// Base de datos
const db = require('./db');

// ================================
//            RUTAS API
// ================================

// Obtener palabras
app.get('/api/palabras', (req, res) => {
  console.log('📥 GET /api/palabras');

  db.all('SELECT * FROM palabras ORDER BY fecha_creacion DESC', (err, rows) => {
    if (err) {
      console.error('❌ Error:', err.message);
      return res.status(500).json({ error: err.message });
    }

    console.log(`✅ Devolviendo ${rows.length} palabras`);
    res.json(rows);
  });
});

// Crear palabra
app.post('/api/palabras', (req, res) => {
  const { palabra } = req.body;
  console.log('📥 POST /api/palabras ->', palabra);
  
  if (!palabra) {
    return res.status(400).json({ error: 'La palabra es requerida' });
  }

  db.run('INSERT INTO palabras (palabra) VALUES (?)', [palabra], function(err) {
    if (err) {
      console.error('❌ Error:', err.message);
      return res.status(500).json({ error: err.message });
    }

    console.log(`✅ Palabra agregada - ID: ${this.lastID}`);
    res.json({
      id: this.lastID,
      palabra,
      mensaje: 'Palabra agregada exitosamente'
    });
  });
});

// Eliminar palabra
app.delete('/api/palabras/:id', (req, res) => {
  const { id } = req.params;
  console.log('📥 DELETE /api/palabras/' + id);

  db.run('DELETE FROM palabras WHERE id = ?', id, function(err) {
    if (err) {
      console.error('❌ Error:', err.message);
      return res.status(500).json({ error: err.message });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Palabra no encontrada' });
    }

    console.log(`✅ Palabra eliminada - ID: ${id}`);
    res.json({ mensaje: 'Palabra eliminada exitosamente' });
  });
});

// ================================
//            HEALTHCHECK
// ================================
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'API Palabras funcionando correctamente',
    environment: ENV_NAME,
    nodeEnv: NODE_ENV,
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

// ================================
//        CATCH-ALL (FRONTEND)
// ================================
app.get('*', (req, res) => {
  res.sendFile(path.join(FRONTEND_DIR, 'index.html'));
});

// Exportar app para tests
module.exports = app;

// Solo levantar el servidor si NO estamos en tests
if (require.main === module) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log('════════════════════════════════════════');
    console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
    console.log(`📍 Environment: ${ENV_NAME} (NODE_ENV: ${NODE_ENV})`);
    console.log(`📁 Serving frontend from: ${FRONTEND_DIR}`);
    console.log(`🌐 Listening on 0.0.0.0:${PORT}`);
    console.log('════════════════════════════════════════');
  });
}
