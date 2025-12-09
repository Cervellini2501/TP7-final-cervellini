const express = require('express');
const cors = require('cors');
const path = require('path');

// Puerto dinámico de Azure
const PORT = process.env.PORT || 3000;

// Leer variables de entorno
const ENV_NAME = process.env.ENVIRONMENT_NAME || 'development';
const NODE_ENV = process.env.NODE_ENV || 'development';

// ✅ CREAR LA APP (sin ejecutar listen todavía)
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Servir archivos estáticos del frontend
// En producción (Azure), los archivos están en backend/frontend
// En desarrollo, están en ../frontend
const frontendPath = process.env.NODE_ENV === 'production' 
  ? path.join(__dirname, 'frontend')
  : path.join(__dirname, '..', 'frontend');
app.use(express.static(frontendPath));

// Importar la base de datos
const db = require('./db');

// API Routes - Autenticación
app.post('/api/register', (req, res) => {
  const { username, password } = req.body;
  console.log('📥 POST /api/register ->', username);
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Usuario y contraseña requeridos' });
  }
  
  db.run('INSERT INTO usuarios (username, password) VALUES (?, ?)', [username, password], function(err) {
    if (err) {
      console.error('❌ Error:', err.message);
      if (err.message.includes('UNIQUE')) {
        return res.status(400).json({ error: 'El usuario ya existe' });
      }
      res.status(500).json({ error: err.message });
    } else {
      console.log(`✅ Usuario registrado - ID: ${this.lastID}`);
      res.json({ 
        id: this.lastID, 
        username: username,
        mensaje: 'Usuario registrado exitosamente' 
      });
    }
  });
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  console.log('📥 POST /api/login ->', username);
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Usuario y contraseña requeridos' });
  }
  
  db.get('SELECT * FROM usuarios WHERE username = ? AND password = ?', [username, password], (err, row) => {
    if (err) {
      console.error('❌ Error:', err.message);
      res.status(500).json({ error: err.message });
    } else if (!row) {
      console.log('❌ Login fallido');
      res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    } else {
      console.log(`✅ Login exitoso - Usuario: ${username}`);
      res.json({ 
        id: row.id,
        username: row.username,
        mensaje: 'Login exitoso' 
      });
    }
  });
});

// API Routes
app.get('/api/palabras', (req, res) => {
  console.log('📥 GET /api/palabras');
  db.all('SELECT * FROM palabras ORDER BY fecha_creacion DESC', (err, rows) => {
    if (err) {
      console.error('❌ Error:', err.message);
      res.status(500).json({ error: err.message });
    } else {
      console.log(`✅ Devolviendo ${rows.length} palabras`);
      res.json(rows);
    }
  });
});

app.post('/api/palabras', (req, res) => {
  const { palabra } = req.body;
  console.log('📥 POST /api/palabras ->', palabra);
  
  if (!palabra) {
    return res.status(400).json({ error: 'La palabra es requerida' });
  }
  
  db.run('INSERT INTO palabras (palabra) VALUES (?)', [palabra], function(err) {
    if (err) {
      console.error('❌ Error:', err.message);
      res.status(500).json({ error: err.message });
    } else {
      console.log(`✅ Palabra agregada - ID: ${this.lastID}`);
      res.json({ 
        id: this.lastID, 
        palabra: palabra,
        mensaje: 'Palabra agregada exitosamente' 
      });
    }
  });
});

app.put('/api/palabras/:id', (req, res) => {
  const { id } = req.params;
  const { palabra } = req.body;
  console.log('📥 PUT /api/palabras/' + id, '->', palabra);
  
  if (!palabra) {
     return res.status(400).json({ error: 'La palabra es requerida' });
   }
  
  db.run('UPDATE palabras SET palabra = ? WHERE id = ?', [palabra, id], function(err) {
    if (err) {
      console.error('❌ Error:', err.message);
      res.status(500).json({ error: err.message });
    } else if (this.changes === 0) {
      res.status(404).json({ error: 'Palabra no encontrada' });
    } else {
      console.log(`✅ Palabra actualizada - ID: ${id}`);
      res.json({ 
        id: parseInt(id),
        palabra: palabra,
        mensaje: 'Palabra actualizada exitosamente' 
      });
    }
  });
});

app.delete('/api/palabras/:id', (req, res) => {
  const { id } = req.params;
  console.log('📥 DELETE /api/palabras/' + id);
  
  db.run('DELETE FROM palabras WHERE id = ?', id, function(err) {
    if (err) {
      console.error('❌ Error:', err.message);
      res.status(500).json({ error: err.message });
    } else if (this.changes === 0) {
    res.status(404).json({ error: 'Palabra no encontrada' });
    } else {
      console.log(`✅ Palabra eliminada - ID: ${id}`);
      res.json({ mensaje: 'Palabra eliminada exitosamente' });
    }
  });
});

// Health check
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

// Catch-all
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'login.html'));
});

// ✅ EXPORTAR LA APP (para tests)
module.exports = app;

// ✅ SOLO EJECUTAR LISTEN SI NO ESTAMOS EN TESTS
if (require.main === module) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log('════════════════════════════════════════');
    console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
    console.log(`📍 Environment: ${ENV_NAME} (NODE_ENV: ${NODE_ENV})`);
    console.log(`📁 Serving frontend from: ${frontendPath}`);
    console.log(`🌐 Listening on 0.0.0.0:${PORT}`);
    console.log('════════════════════════════════════════');
  });
}