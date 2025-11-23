# Corrección del Despliegue en Azure App Service

## Problema Original
```
Error: ENOENT: no such file or directory, stat '/home/site/frontend/login.html'
```

## Causas Identificadas

1. **Archivos del frontend incompletos**: El pipeline solo copiaba 3 archivos (`index.html`, `app.js`, `styles.css`) pero NO incluía `login.html` ni `login.js`.

2. **Ruta incorrecta en el servidor**: El código usaba una ruta relativa que funcionaba en desarrollo local pero no en Azure.

3. **Variable NODE_ENV no configurada**: No se establecía explícitamente `NODE_ENV=production` en Azure.

## Soluciones Implementadas

### 1. Pipeline (azure-pipelines.yml)
**Cambio en la tarea CopyFiles@2:**
```yaml
# ANTES - Solo copiaba 3 archivos específicos
Contents: |
  index.html
  app.js
  styles.css

# DESPUÉS - Copia todos los archivos HTML, JS y CSS
Contents: |
  *.html
  *.js
  *.css
```

**Startup Command actualizado:**
```yaml
# ANTES
startUpCommand: 'node index.js'

# DESPUÉS
startUpCommand: 'NODE_ENV=production node index.js'
```

### 2. Servidor Backend (backend/index.js)
**Ruta dinámica según el entorno:**
```javascript
// ANTES - Ruta fija que no funcionaba en Azure
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// DESPUÉS - Ruta adaptable según el entorno
const frontendPath = process.env.NODE_ENV === 'production' 
  ? path.join(__dirname, 'frontend')      // Azure: backend/frontend
  : path.join(__dirname, '..', 'frontend'); // Local: ../frontend
app.use(express.static(frontendPath));
```

**Catch-all route actualizada:**
```javascript
// Usa la variable frontendPath en lugar de ruta hardcodeada
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'login.html'));
});
```

### 3. Archivos de Configuración Creados

**backend/.deployment**
```
[config]
SCM_DO_BUILD_DURING_DEPLOYMENT=true
```

**backend/web.config**
- Configuración para IIS/iisnode (si fuera necesario)
- Reglas de rewrite para manejo de rutas

## Estructura de Despliegue

### En Desarrollo (local)
```
TP7/
├── backend/
│   └── index.js (sirve desde ../frontend)
└── frontend/
    ├── index.html
    ├── login.html
    ├── app.js
    ├── login.js
    └── styles.css
```

### En Producción (Azure)
```
backend/ (raíz del despliegue)
├── index.js
├── db.js
├── package.json
├── .deployment
├── web.config
└── frontend/ (copiado por el pipeline)
    ├── index.html
    ├── login.html
    ├── app.js
    ├── login.js
    └── styles.css (si existe)
```

## Verificación

Después del próximo despliegue, verificá que:

1. ✅ El health endpoint responda correctamente
2. ✅ La página de login cargue sin errores 404
3. ✅ Los archivos estáticos se sirvan correctamente
4. ✅ Las rutas API funcionen

## Comandos para Testing Local

```bash
# Simular entorno de producción localmente
cd backend
NODE_ENV=production node index.js

# Verificar que encuentre los archivos
curl http://localhost:3000/login.html
curl http://localhost:3000/health
```

## Próximos Pasos

1. Commitear los cambios
2. Push al repositorio
3. El pipeline ejecutará automáticamente
4. Verificar el despliegue en QA y PROD

## Variables de Entorno en Azure

Asegurarse que estén configuradas en Azure DevOps:
- `ENVIRONMENT_NAME`: QA o PROD
- `NODE_ENV`: production
- `DB_PATH`: /home/data/palabras.db (o similar)
