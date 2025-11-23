// Determinar la URL de la API según el entorno
let API_URL;
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    API_URL = 'http://localhost:3000/api';
} else {
    API_URL = window.location.origin + '/api';
}

// Verificar si ya hay sesión al cargar
function verificarSesion() {
    const usuario = window.localStorage.getItem('usuario');
    if (usuario) {
        window.location.href = 'index.html';
    }
}

document.addEventListener('DOMContentLoaded', verificarSesion);

// Función para mostrar mensajes
function mostrarMensaje(texto, tipo) {
    const mensajeDiv = document.getElementById('mensaje');
    mensajeDiv.textContent = texto;
    mensajeDiv.className = `mensaje ${tipo}`;
    mensajeDiv.style.display = 'block';
    
    setTimeout(() => {
        mensajeDiv.style.display = 'none';
    }, 5000);
}

// Función para registrar usuario
async function register(event) {
    event.preventDefault();
    
    const username = document.getElementById('registerUsername').value.trim();
    const password = document.getElementById('registerPassword').value;
    
    if (!username || !password) {
        mostrarMensaje('Complete todos los campos', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password })
        });
        
        const resultado = await response.json();
        
        if (response.ok) {
            mostrarMensaje('Usuario registrado exitosamente. Ahora puedes iniciar sesión', 'exito');
            document.getElementById('registerForm').reset();
        } else {
            mostrarMensaje(resultado.error || 'Error al registrar usuario', 'error');
        }
        
    } catch (error) {
        console.error('Error al registrar:', error);
        mostrarMensaje('Error al registrar usuario', 'error');
    }
}

// Función para iniciar sesión
async function login(event) {
    event.preventDefault();
    
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    if (!username || !password) {
        mostrarMensaje('Complete todos los campos', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password })
        });
        
        const resultado = await response.json();
        
        if (response.ok) {
            // Guardar el username directamente del input
            window.localStorage.setItem('usuario', username);
            mostrarMensaje('Login exitoso. Redirigiendo...', 'exito');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        } else {
            mostrarMensaje(resultado.error || 'Error al iniciar sesión', 'error');
        }
        
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        mostrarMensaje('Error al iniciar sesión', 'error');
    }
}

// Exportar funciones para pruebas unitarias
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        mostrarMensaje,
        register,
        login,
        verificarSesion
    };
}