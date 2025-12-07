// ==========================================
// CONFIGURACIÓN DE LA API
// ==========================================
let API_URL;

if (typeof window !== "undefined") {
  // Entorno navegador
  if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
    API_URL = "http://localhost/api";
  } else {
    API_URL = window.location.origin + "/api";
  }
} else {
  // Tests en Jest (sin window)
  API_URL = "http://localhost/api";
}

// ==========================================
// FUNCIÓN BASE PARA LLAMADAS A LA API
// ==========================================
async function apiFetch(url, options = {}) {
  try {
    const response = await fetch(url, options);

    const data = await response.json().catch(() => ({}));

    return {
      ok: response.ok,
      status: response.status,
      data: data
    };
  } catch (error) {
    return {
      ok: false,
      status: 500,
      data: { error: error.message }
    };
  }
}

// ==========================================
// ENDPOINTS PUROS (Testeables)
// ==========================================
function obtenerPalabras() {
  // 🔧 FIX: no pasar {} para evitar fallo en Jest: Received: url, {}
  return apiFetch(`${API_URL}/palabras`);
}

function crearPalabra(palabra) {
  return apiFetch(`${API_URL}/palabras`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ palabra })
  });
}

function borrarPalabra(id) {
  return apiFetch(`${API_URL}/palabras/${id}`, {
    method: "DELETE"
  });
}

// ==========================================
// DOM FUNCTIONS (Testeables con JSDOM)
// ==========================================
function mostrarMensaje(texto, tipo) {
  const mensajeDiv = document.getElementById("mensaje");
  if (!mensajeDiv) return;

  mensajeDiv.innerHTML = `<div class="mensaje ${tipo}">${texto}</div>`;

  setTimeout(() => {
    mensajeDiv.innerHTML = "";
  }, 3000);
}

async function cargarPalabras() {
  const lista = document.getElementById("listaPalabras");
  lista.innerHTML = `<div class="loading">Cargando...</div>`;

  const resultado = await obtenerPalabras();

  if (!resultado.ok) {
    return mostrarMensaje("Error al cargar palabras", "error");
  }

  const palabras = resultado.data;

  if (!palabras || palabras.length === 0) {
    lista.innerHTML = `<p style="text-align:center;color:#666;">No hay palabras guardadas</p>`;
    return;
  }

  lista.innerHTML = palabras
    .map(
      (p) => `
      <div class="palabra-item">
        <span><strong>${p.palabra}</strong></span>
        <button class="delete-btn" onclick="eliminarPalabra(${p.id})">Eliminar</button>
      </div>`
    )
    .join("");
}

async function agregarPalabra() {
  const input = document.getElementById("palabraInput");
  const palabra = input.value.trim();

  if (!palabra) {
    return mostrarMensaje("Por favor ingresa una palabra", "error");
  }

  const resultado = await crearPalabra(palabra);

  // 🔧 FIX PARA QUE PASE EL TEST: Mensaje debe contener "Error"
  if (!resultado.ok) {
    return mostrarMensaje(
      resultado.data.error || "Error al agregar la palabra",
      "error"
    );
  }

  mostrarMensaje("Palabra agregada exitosamente", "exito");
  input.value = "";
  cargarPalabras();
}

async function eliminarPalabra(id) {
  if (!confirm("¿Seguro que deseas eliminar esta palabra?")) return;

  const resultado = await borrarPalabra(id);

  // 🔧 FIX PARA TEST: Mensaje debe contener "Error"
  if (!resultado.ok) {
    return mostrarMensaje(
      resultado.data.error || "Error al eliminar la palabra",
      "error"
    );
  }

  mostrarMensaje("Palabra eliminada exitosamente", "exito");
  cargarPalabras();
}

// ==========================================
// HOOK DE INICIO
// ==========================================
if (typeof window !== "undefined") {
  document.addEventListener("DOMContentLoaded", () => {
    cargarPalabras();

    const input = document.getElementById("palabraInput");
    input.addEventListener("keypress", (e) => {
      if (e.key === "Enter") agregarPalabra();
    });
  });
}

// ==========================================
// EXPORTS PARA TESTS
// ==========================================
if (typeof module !== "undefined") {
  module.exports = {
    apiFetch,
    obtenerPalabras,
    crearPalabra,
    borrarPalabra,
    mostrarMensaje,
    cargarPalabras,
    agregarPalabra,
    eliminarPalabra,
    API_URL
  };
}
