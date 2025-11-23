// Determinar la URL de la API según el entorno
let API_URL;
// En producción (Azure), el backend sirve el frontend
// En desarrollo local, apuntar al backend en puerto 3000
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    API_URL = 'http://localhost:3000/api';
} else {
    // En Azure App Service, el backend y frontend están en el mismo origen
    API_URL = window.location.origin + '/api';
}

// Cargar palabras al inicio
document.addEventListener('DOMContentLoaded', function() {
    // Verificar si hay sesión
    const usuario = window.localStorage.getItem('usuario');
    if (!usuario) {
        window.location.href = 'login.html';
        return;
    }
    
    // Mostrar usuario actual
    document.getElementById('usuarioActual').textContent = `👤 ${usuario}`;
    
    cargarPalabras();
    
    // Permitir agregar palabra con Enter
    document.getElementById('palabraInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            agregarPalabra();
        }
    });
});

// Función para cerrar sesión
function cerrarSesion() {
    window.localStorage.removeItem('usuario');
    window.location.href = 'login.html';
}

// Función para cargar y mostrar todas las palabras
async function cargarPalabras() {
    try {
        const response = await fetch(`${API_URL}/palabras`);
        const palabras = await response.json();
        
        palabrasOriginales = palabras;
        const listaPalabras = document.getElementById('listaPalabras');
        
        if (palabras.length === 0) {
            listaPalabras.innerHTML = '<p style="text-align: center; color: #666;">No hay palabras guardadas</p>';
            return;
        }
        
        ordenarPalabras(ordenActual);
        
    } catch (error) {
        console.error('Error al cargar palabras:', error);
        mostrarMensaje('Error al cargar las palabras', 'error');
    }
}

// Función para agregar una nueva palabra
async function agregarPalabra() {
    const palabraInput = document.getElementById('palabraInput');
    const palabra = palabraInput.value.trim();
    
    if (!palabra) {
        mostrarMensaje('Por favor ingresa una palabra', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/palabras`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ palabra: palabra })
        });
        
        const resultado = await response.json();
        
        if (response.ok) {
            mostrarMensaje('Palabra agregada exitosamente', 'exito');
            palabraInput.value = ''; // Limpiar input
            cargarPalabras(); // Recargar lista
        } else {
            mostrarMensaje(resultado.error || 'Error al agregar palabra', 'error');
        }
        
    } catch (error) {
        console.error('Error al agregar palabra:', error);
        mostrarMensaje('Error al agregar la palabra', 'error');
    }
}

// Función para eliminar una palabra
async function eliminarPalabra(id) {
    if (!confirm('¿Estás seguro de que quieres eliminar esta palabra?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/palabras/${id}`, {
            method: 'DELETE'
        });
        
        const resultado = await response.json();
        
        if (response.ok) {
            mostrarMensaje('Palabra eliminada exitosamente', 'exito');
            cargarPalabras(); // Recargar lista
        } else {
            mostrarMensaje(resultado.error || 'Error al eliminar palabra', 'error');
        }
        
    } catch (error) {
        console.error('Error al eliminar palabra:', error);
        mostrarMensaje('Error al eliminar la palabra', 'error');
    }
}

// Función para editar una palabra
async function editarPalabra(id, palabraActual) {
    const nuevaPalabra = prompt('Editar palabra:', palabraActual);
    
    if (nuevaPalabra === null) {
        return; // Usuario canceló
    }
    
    if (!nuevaPalabra.trim()) {
        mostrarMensaje('La palabra no puede estar vacía', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/palabras/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ palabra: nuevaPalabra.trim() })
        });
        
        const resultado = await response.json();
        
        if (response.ok) {
            mostrarMensaje('Palabra actualizada exitosamente', 'exito');
            cargarPalabras();
        } else {
            mostrarMensaje(resultado.error || 'Error al actualizar palabra', 'error');
        }
        
    } catch (error) {
        console.error('Error al actualizar palabra:', error);
        mostrarMensaje('Error al actualizar la palabra', 'error');
    }
}

// Variables globales para ordenamiento y filtrado
let palabrasOriginales = [];
let ordenActual = 'fecha-desc'; // fecha-desc, fecha-asc, nombre-asc, nombre-desc

// Función para ordenar palabras
function ordenarPalabras(tipo) {
    ordenActual = tipo;
    const listaPalabras = document.getElementById('listaPalabras');
    
    // Check if palabrasOriginales is empty BEFORE sorting
    if (palabrasOriginales.length === 0) {
        listaPalabras.innerHTML = '<p style="text-align: center; color: #666;">No hay palabras guardadas</p>';
        return;
    }
    
    let palabrasOrdenadas = [...palabrasOriginales];
    
    switch(tipo) {
        case 'nombre-asc':
            palabrasOrdenadas.sort((a, b) => a.palabra.localeCompare(b.palabra));
            break;
        case 'nombre-desc':
            palabrasOrdenadas.sort((a, b) => b.palabra.localeCompare(a.palabra));
            break;
        case 'fecha-asc':
            palabrasOrdenadas.sort((a, b) => a.id - b.id);
            break;
        case 'fecha-desc':
            palabrasOrdenadas.sort((a, b) => b.id - a.id);
            break;
    }
    
    listaPalabras.innerHTML = palabrasOrdenadas.map(palabra => `
        <div class="palabra-item">
            <span><strong>${palabra.palabra}</strong></span>
            <div>
                <button class="edit-btn" onclick="editarPalabra(${palabra.id}, '${palabra.palabra}')">
                    Editar
                </button>
                <button class="delete-btn" onclick="eliminarPalabra(${palabra.id})">
                    Eliminar
                </button>
            </div>
        </div>
    `).join('');
}

// Función para filtrar palabras
function filtrarPalabras(texto) {
    const filtro = texto.toLowerCase().trim();
    const listaPalabras = document.getElementById('listaPalabras');
    
    // If filter is empty, restore the full list by calling ordenarPalabras
    if (!filtro) {
        ordenarPalabras(ordenActual);
        return;
    }
    
    const palabrasFiltradas = palabrasOriginales.filter(p => 
        p.palabra.toLowerCase().includes(filtro)
    );
    
    if (palabrasFiltradas.length === 0) {
        listaPalabras.innerHTML = '<p style="text-align: center; color: #666;">No se encontraron palabras</p>';
        return;
    }
    
    listaPalabras.innerHTML = palabrasFiltradas.map(palabra => `
        <div class="palabra-item">
            <span><strong>${palabra.palabra}</strong></span>
            <div>
                <button class="edit-btn" onclick="editarPalabra(${palabra.id}, '${palabra.palabra}')">
                    Editar
                </button>
                <button class="delete-btn" onclick="eliminarPalabra(${palabra.id})">
                    Eliminar
                </button>
            </div>
        </div>
    `).join('');
}

// Función para mostrar mensajes al usuario
function mostrarMensaje(texto, tipo) {
    const mensajeDiv = document.getElementById('mensaje');
    mensajeDiv.innerHTML = `<div class="mensaje ${tipo}">${texto}</div>`;
    
    // Ocultar mensaje después de 3 segundos
    setTimeout(() => {
        mensajeDiv.innerHTML = '';
    }, 3000);
}

// Exportar funciones para pruebas unitarias
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    cargarPalabras,
    agregarPalabra,
    eliminarPalabra,
    editarPalabra,
    ordenarPalabras,
    filtrarPalabras,
    mostrarMensaje,
    cerrarSesion,
    // Export variables for testing
    get palabrasOriginales() { return palabrasOriginales; },
    set palabrasOriginales(value) { palabrasOriginales = value; },
    get ordenActual() { return ordenActual; },
    set ordenActual(value) { ordenActual = value; }
  };
}