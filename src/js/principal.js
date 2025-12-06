/**
 * Script Principal - Ferretería
 * Incluye: AJAX, localStorage, cookies, autenticación
 *
 * REQUISITO: MANEJO DE COOKIES Y LOCAL STORAGE (2 PTS) - IMPLEMENTADO AQUÍ
 * REQUISITO: USO DE AJAX + JSON CON SERVICIO WEB (2 PTS) - OBJETO AJAX
 * REQUISITO: JAVASCRIPT PARA VALIDACIÓN Y GENERACIÓN DINÁMICA (4 PTS) - VALIDACIONES Y DOM DINÁMICO
 */

// CONFIGURACIÓN Y UTILIDADES


const API_BASE = window.location.origin + '/Proyecto_DesarrolloWeb/php/api/';

// REQUISITO: MANEJO DE COOKIES (2 PTS) - OBJETO COOKIE PARA GESTIÓN
const Cookie = {
    set: (name, value, days = 7) => {
        const expires = new Date(Date.now() + days * 864e5).toUTCString();
        document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Strict`;
    },
    get: (name) => {
        return document.cookie.split('; ').reduce((r, v) => {
            const parts = v.split('=');
            return parts[0] === name ? decodeURIComponent(parts[1]) : r;
        }, '');
    },
    delete: (name) => {
        Cookie.set(name, '', -1);
    }
};

// REQUISITO: MANEJO DE LOCAL STORAGE (2 PTS) - OBJETO STORAGE PARA GESTIÓN
const Storage = {
    set: (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.error('Error al guardar en localStorage:', e);
        }
    },
    get: (key) => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (e) {
            console.error('Error al leer localStorage:', e);
            return null;
        }
    },
    remove: (key) => {
        localStorage.removeItem(key);
    }
};

// REQUISITO: USO DE AJAX + JSON (2 PTS) - OBJETO AJAX PARA LLAMADAS ASÍNCRONAS
const Ajax = {
    async request(url, options = {}) {
        try {
            const response = await fetch(url, {
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error en petición AJAX:', error);
            throw error;
        }
    },

    get(url, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const fullUrl = queryString ? `${url}?${queryString}` : url;
        return this.request(fullUrl, { method: 'GET' });
    },

    post(url, data = {}) {
        return this.request(url, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    put(url, data = {}) {
        return this.request(url, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },

    delete(url) {
        return this.request(url, { method: 'DELETE' });
    }
};

// GESTIÓN DE SESIÓN Y AUTENTICACIÓN

const Auth = {
    csrfToken: null,

    async init() {
        await this.loadCSRFToken();
        await this.checkSession();
        this.loadPreferences();
    },

    async loadCSRFToken() {
        try {
            const response = await Ajax.get(API_BASE + 'auth.php', { action: 'csrf' });
            if (response.success) {
                this.csrfToken = response.csrf_token;
            }
        } catch (error) {
            console.error('Error al cargar token CSRF:', error);
        }
    },

    async checkSession() {
        try {
            const response = await Ajax.get(API_BASE + 'auth.php', { action: 'check' });
            if (response.logged_in && response.user) {
                this.updateUI(response.user);
            }
        } catch (error) {
            console.error('Error al verificar sesión:', error);
        }
    },

    updateUI(user) {
        // Actualizar UI según usuario autenticado
        const userInfo = document.getElementById('user-info');
        if (userInfo) {
            userInfo.innerHTML = `Hola, ${user.nombre}`;
        }
    },

    loadPreferences() {
        // Cargar preferencias del usuario desde cookies
        const theme = Cookie.get('theme');
        if (theme) {
            document.body.setAttribute('data-theme', theme);
        }

        const viewMode = Cookie.get('viewMode');
        if (viewMode) {
            Storage.set('viewMode', viewMode);
        }
    },

    savePreference(key, value) {
        Cookie.set(key, value, 30); // 30 días
    }
};


// GESTIÓN DEL CARRITO

const Carrito = {
    items: [],

    init() {
        this.cargar();
        this.actualizarContador();
        this.sincronizar();
    },

    cargar() {
        this.items = Storage.get('carrito') || [];
        // También guardar en cookie para persistencia
        Cookie.set('carrito_count', this.items.length, 30);
    },

    guardar() {
        Storage.set('carrito', this.items);
        Cookie.set('carrito_count', this.items.length, 30);
        this.actualizarContador();
    },

    agregar(producto) {
        const existente = this.items.find(item => item.id === producto.id);

        if (existente) {
            existente.cantidad++;
        } else {
            this.items.push({
                id: producto.id,
                nombre: producto.nombre,
                precio: producto.precio,
                imagen: producto.imagen,
                cantidad: 1
            });
        }

        this.guardar();
        window.mostrarToast('Producto agregado al carrito', 'exito');
    },

    eliminar(productoId) {
        this.items = this.items.filter(item => item.id !== productoId);
        this.guardar();
    },

    actualizar(productoId, cantidad) {
        const item = this.items.find(item => item.id === productoId);
        if (item) {
            item.cantidad = Math.max(1, cantidad);
            this.guardar();
        }
    },

    vaciar() {
        this.items = [];
        this.guardar();
    },

    obtenerTotal() {
        return this.items.reduce((total, item) => total + (item.precio * item.cantidad), 0);
    },

    actualizarContador() {
        const contador = document.querySelector('.contador-carrito');
        if (contador) {
            const totalItems = this.items.reduce((acc, item) => acc + item.cantidad, 0);
            contador.textContent = totalItems;
        }
    },

    // Sincronizar con servidor (si el usuario está logueado)
    async sincronizar() {
        const user = Storage.get('user');
        if (user && user.id) {
            // Aquí podrías sincronizar con el backend
            // Por ahora solo mantenemos en localStorage
        }
    }
};


// NOTIFICACIONES (TOASTS)
window.mostrarToast = (mensaje, tipo = 'exito') => {
    const toastExistente = document.querySelector('.toast');
    if (toastExistente) {
        toastExistente.remove();
    }

    const toast = document.createElement('div');
    toast.classList.add('toast', tipo);
    toast.textContent = mensaje;
    document.body.appendChild(toast);

    // Animación de entrada
    setTimeout(() => toast.classList.add('show'), 10);

    // Remover después de 3 segundos
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
};


// VALIDACIÓN DE FORMULARIOS
const Validacion = {
    email(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    },

    telefono(telefono) {
        const regex = /^[0-9]{10}$/;
        return regex.test(telefono.replace(/[\s\-\(\)]/g, ''));
    },

    password(password) {
        // Mínimo 8 caracteres, una mayúscula, una minúscula, un número
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        return regex.test(password);
    },

    requerido(valor) {
        return valor && valor.trim().length > 0;
    },

    numero(valor) {
        return !isNaN(parseFloat(valor)) && isFinite(valor);
    },

    rango(valor, min, max) {
        const num = parseFloat(valor);
        return num >= min && num <= max;
    }
};


// INICIALIZACIÓN
document.addEventListener('DOMContentLoaded', async () => {
    // Inicializar sistemas
    await Auth.init();
    Carrito.init();
    initUserMenu();

    // Menú Hamburguesa
    const menuHamburguesa = document.getElementById('menu-hamburguesa');
    const menuNav = document.getElementById('menu-nav');

    if (menuHamburguesa && menuNav) {
        menuHamburguesa.addEventListener('click', () => {
            menuNav.classList.toggle('activo');
        });
    }

    // Exponer funciones globales
    window.Carrito = Carrito;
    window.Auth = Auth;
    window.Ajax = Ajax;
    window.Storage = Storage;
    window.Cookie = Cookie;
    window.Validacion = Validacion;
    window.actualizarContadorCarrito = () => Carrito.actualizarContador();
});


// GESTIÓN DEL MENÚ DE USUARIO
function initUserMenu() {
    const userMenu = document.getElementById('user-menu');
    const navUserNombre = document.getElementById('nav-user-nombre');
    const btnLogout = document.getElementById('btn-logout');

    if (!userMenu || !navUserNombre || !btnLogout) {
        return; 
    }

    // Verificar si hay usuario logueado
    const user = Storage.get('user');
    if (user && user.id) {
        // Mostrar menú de usuario
        navUserNombre.textContent = user.nombre;
        userMenu.style.display = 'flex';

        // Adjuntar evento de logout
        btnLogout.addEventListener('click', handleNavLogout);
    }
}

function handleNavLogout() {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
        Storage.remove('user');

        window.mostrarToast('Sesión cerrada correctamente', 'exito');

        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    }
}