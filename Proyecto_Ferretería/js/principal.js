document.addEventListener('DOMContentLoaded', () => {
    // 1. Funcionalidad del Menú Hamburguesa
    const menuHamburguesa = document.getElementById('menu-hamburguesa');
    const menuNav = document.getElementById('menu-nav');

    if (menuHamburguesa && menuNav) {
        menuHamburguesa.addEventListener('click', () => {
            menuNav.classList.toggle('activo');
        });
    }

    // 2. Función genérica para mostrar notificaciones (Toasts)
    window.mostrarToast = (mensaje, tipo = 'exito') => {
        const toastExistente = document.querySelector('.toast');
        if (toastExistente) {
            toastExistente.remove();
        }

        const toast = document.createElement('div');
        toast.classList.add('toast', tipo, 'fade-in');
        toast.textContent = mensaje;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.classList.remove('fade-in');
            // Agregamos una clase para la animación de salida (si existe en CSS)
            // Aquí simplemente lo eliminamos después de un tiempo
            setTimeout(() => {
                toast.remove();
            }, 300); // 300ms para la transición de salida
        }, 3000); // Muestra por 3 segundos
    };

    // 3. Inicialización del Contador de Carrito
    const contadorCarrito = document.querySelector('.contador-carrito');
    if (contadorCarrito) {
        // Función para actualizar el contador (simulado)
        window.actualizarContadorCarrito = () => {
            // Lógica simulada: contar items del localStorage o simular un valor
            const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
            const totalItems = carrito.reduce((acc, item) => acc + item.cantidad, 0);
            contadorCarrito.textContent = totalItems;
        };

        // Actualizar al cargar la página
        actualizarContadorCarrito();
    }
});