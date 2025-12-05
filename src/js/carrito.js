/**
 * Carrito.js - Versión Definitiva con Drag & Drop
 * Cumple requisitos: localStorage + Drag & Drop (funcionalidad extra)
 */

document.addEventListener('DOMContentLoaded', () => {

    // REFERENCIAS DOM
    const itemsCarritoBody = document.getElementById('items-carrito');
    const carritoVacioDiv = document.getElementById('carrito-vacio');
    const carritoContenidoDiv = document.getElementById('carrito-contenido');
    const subtotalSpan = document.getElementById('subtotal');
    const ivaSpan = document.getElementById('iva');
    const totalSpan = document.getElementById('total');
    const tipoEnvioSelect = document.getElementById('tipo-envio');
    const vaciarCarritoBtn = document.getElementById('vaciar-carrito');

    const IVA_RATE = 0.16;
    let draggedElement = null;


    // FUNCIONES DE CARRITO
    function obtenerCarrito() {
        try {
            const carrito = localStorage.getItem('carrito');
            return carrito ? JSON.parse(carrito) : [];
        } catch (error) {
            console.error('Error al leer carrito:', error);
            return [];
        }
    }

    function guardarCarrito(carrito) {
        try {
            localStorage.setItem('carrito', JSON.stringify(carrito));
            actualizarContador();
        } catch (error) {
            console.error('Error al guardar carrito:', error);
        }
    }


    function renderCarrito() {
        const carrito = obtenerCarrito();
        itemsCarritoBody.innerHTML = '';

        if (carrito.length === 0) {
            carritoVacioDiv.style.display = 'block';
            carritoContenidoDiv.style.display = 'none';
            return;
        }

        carritoVacioDiv.style.display = 'none';
        carritoContenidoDiv.style.display = 'block';

        carrito.forEach((item, index) => {
            const tr = document.createElement('tr');
            tr.dataset.id = item.id;
            tr.dataset.index = index;
            tr.draggable = true;
            tr.classList.add('carrito-item');

            tr.innerHTML = `
                <td data-label="Producto">
                    <div class="item-carrito">
                        <span class="drag-handle" title="Arrastra para reordenar">
                            <i class="fas fa-grip-vertical"></i>
                        </span>
                        <div class="item-imagen">
                            ${item.imagen ?
                                `<img src="/Proyecto_DesarrolloWeb/uploads/productos/${item.imagen}" alt="${item.nombre}" onerror="this.style.display='none'; this.parentElement.innerHTML='<i class=\\'fas fa-box-open\\'></i>';">` :
                                '<i class="fas fa-box-open"></i>'}
                        </div>
                        <div class="item-detalles">
                            <span class="item-nombre">${item.nombre}</span>
                        </div>
                    </div>
                </td>
                <td data-label="Precio" class="item-precio">$${item.precio.toFixed(2)}</td>
                <td data-label="Cantidad">
                    <div class="control-cantidad">
                        <button class="btn-cantidad" data-accion="disminuir" data-id="${item.id}">-</button>
                        <input type="number" value="${item.cantidad}" min="1" max="${item.stock}"
                               class="input-cantidad" data-id="${item.id}">
                        <button class="btn-cantidad" data-accion="aumentar" data-id="${item.id}">+</button>
                    </div>
                </td>
                <td data-label="Subtotal" class="item-subtotal">$${(item.precio * item.cantidad).toFixed(2)}</td>
                <td>
                    <button class="btn-eliminar" data-id="${item.id}" title="Eliminar">
                        <i class="fas fa-times"></i>
                    </button>
                </td>
            `;

            itemsCarritoBody.appendChild(tr);
        });

        attachDragAndDrop();
        actualizarTotales();
        attachEventos();
    }


    // DRAG & DROP 
    function attachDragAndDrop() {
        const items = itemsCarritoBody.querySelectorAll('tr[draggable="true"]');

        items.forEach(item => {
            // Inicio del arrastre
            item.addEventListener('dragstart', (e) => {
                draggedElement = item;
                item.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
            });

            // Fin del arrastre
            item.addEventListener('dragend', () => {
                item.classList.remove('dragging');
                draggedElement = null;
                items.forEach(i => i.classList.remove('drag-over'));
            });

            // Sobre un elemento
            item.addEventListener('dragover', (e) => {
                e.preventDefault();
                if (draggedElement !== item) {
                    item.classList.add('drag-over');
                }
            });

            // Salir del elemento
            item.addEventListener('dragleave', () => {
                item.classList.remove('drag-over');
            });

            // Soltar elemento
            item.addEventListener('drop', (e) => {
                e.preventDefault();
                if (draggedElement && draggedElement !== item) {
                    const allItems = Array.from(itemsCarritoBody.querySelectorAll('tr'));
                    const draggedIndex = allItems.indexOf(draggedElement);
                    const targetIndex = allItems.indexOf(item);

                    if (draggedIndex < targetIndex) {
                        item.parentNode.insertBefore(draggedElement, item.nextSibling);
                    } else {
                        item.parentNode.insertBefore(draggedElement, item);
                    }

                    actualizarOrden();
                }
                item.classList.remove('drag-over');
            });
        });
    }


    function actualizarOrden() {
        const items = itemsCarritoBody.querySelectorAll('tr');
        const carrito = obtenerCarrito();
        const nuevoOrden = [];

        items.forEach(tr => {
            const id = parseInt(tr.dataset.id);
            const item = carrito.find(i => i.id === id);
            if (item) nuevoOrden.push(item);
        });

        guardarCarrito(nuevoOrden);
        mostrarToast('Orden actualizado', 'exito');
    }

    // MANEJO DE EVENTOS
    function attachEventos() {
        // Botones eliminar
        document.querySelectorAll('.btn-eliminar').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.currentTarget.dataset.id);
                eliminarItem(id);
            });
        });

        // Botones de cantidad
        document.querySelectorAll('.btn-cantidad').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.currentTarget.dataset.id);
                const accion = e.currentTarget.dataset.accion;
                cambiarCantidad(id, accion);
            });
        });

        // Input directo de cantidad
        document.querySelectorAll('.input-cantidad').forEach(input => {
            input.addEventListener('change', (e) => {
                const id = parseInt(e.currentTarget.dataset.id);
                const cantidad = parseInt(e.currentTarget.value) || 1;
                actualizarCantidad(id, cantidad);
            });
        });
    }

    function cambiarCantidad(id, accion) {
        let carrito = obtenerCarrito();
        const item = carrito.find(i => i.id === id);

        if (item) {
            if (accion === 'aumentar') {
                if (item.cantidad < item.stock) {
                    item.cantidad++;
                } else {
                    mostrarToast('Stock máximo alcanzado', 'error');
                    return;
                }
            } else if (accion === 'disminuir') {
                if (item.cantidad > 1) {
                    item.cantidad--;
                }
            }

            guardarCarrito(carrito);
            renderCarrito();
        }
    }


    function actualizarCantidad(id, cantidad) {
        let carrito = obtenerCarrito();
        const item = carrito.find(i => i.id === id);

        if (item) {
            if (cantidad > item.stock) {
                mostrarToast('Stock insuficiente', 'error');
                renderCarrito();
                return;
            }

            item.cantidad = Math.max(1, cantidad);
            guardarCarrito(carrito);
            renderCarrito();
        }
    }

 
    function eliminarItem(id) {
        let carrito = obtenerCarrito();
        const item = carrito.find(i => i.id === id);

        if (item && confirm(`¿Eliminar "${item.nombre}" del carrito?`)) {
            carrito = carrito.filter(i => i.id !== id);
            guardarCarrito(carrito);
            renderCarrito();
            mostrarToast('Producto eliminado', 'exito');
        }
    }


    function vaciarCarrito() {
        if (confirm('¿Estás seguro de vaciar el carrito?')) {
            localStorage.removeItem('carrito');
            renderCarrito();
            mostrarToast('Carrito vaciado', 'exito');
        }
    }

    function actualizarTotales() {
        const carrito = obtenerCarrito();
        const subtotal = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
        const costoEnvio = parseFloat(tipoEnvioSelect.value);
        const iva = subtotal * IVA_RATE;
        const total = subtotal + iva + costoEnvio;

        subtotalSpan.textContent = `$${subtotal.toFixed(2)}`;
        ivaSpan.textContent = `$${iva.toFixed(2)}`;
        totalSpan.textContent = `$${total.toFixed(2)}`;
    }

    function actualizarContador() {
        const carrito = obtenerCarrito();
        const total = carrito.reduce((sum, item) => sum + item.cantidad, 0);
        const contador = document.querySelector('.contador-carrito');
        if (contador) {
            contador.textContent = total;
            if (total > 0) {
                contador.classList.add('tiene-items');
            } else {
                contador.classList.remove('tiene-items');
            }
        }
    }

    // UI/UX
    function mostrarToast(mensaje, tipo = 'exito') {
        const toastExistente = document.querySelector('.toast');
        if (toastExistente) toastExistente.remove();

        const toast = document.createElement('div');
        toast.className = `toast toast-${tipo}`;
        toast.innerHTML = `
            <i class="fas fa-${tipo === 'exito' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${mensaje}</span>
        `;
        document.body.appendChild(toast);

        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }


    // EVENT LISTENERS PRINCIPALES
    if (vaciarCarritoBtn) {
        vaciarCarritoBtn.addEventListener('click', vaciarCarrito);
    }

    // Cambio en tipo de envío
    if (tipoEnvioSelect) {
        tipoEnvioSelect.addEventListener('change', actualizarTotales);
    }


    // AUTENTICACIÓN Y FINALIZAR PEDIDO
    const btnFinalizarPedido = document.getElementById('btn-finalizar-pedido');
    const modalLogin = document.getElementById('modal-login');
    const cerrarModalBtn = document.getElementById('cerrar-modal-login');
    const continuarSinLoginBtn = document.getElementById('continuar-sin-login');
    const infoUsuarioDiv = document.getElementById('info-usuario');
    const nombreUsuarioSpan = document.getElementById('nombre-usuario');

    function verificarUsuario() {
        const user = localStorage.getItem('user');
        if (user) {
            try {
                const userData = JSON.parse(user);
                if (userData && userData.id) {
                    // Usuario logueado - mostrar info
                    nombreUsuarioSpan.textContent = userData.nombre;
                    infoUsuarioDiv.style.display = 'block';

                    // Adjuntar evento de logout al nombre
                    nombreUsuarioSpan.addEventListener('click', handleLogout);

                    return userData;
                }
            } catch (error) {
                console.error('Error al leer usuario:', error);
            }
        }
        return null;
    }

    function handleLogout() {
        if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
            // Limpiar datos del usuario
            localStorage.removeItem('user');

            // Ocultar info de usuario
            infoUsuarioDiv.style.display = 'none';
            nombreUsuarioSpan.textContent = '';

            // Mostrar notificación
            mostrarToast('Sesión cerrada correctamente', 'exito');

            // Redirigir a inicio después de 1 segundo
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        }
    }


    if (btnFinalizarPedido) {
        btnFinalizarPedido.addEventListener('click', () => {
            const carrito = obtenerCarrito();

            if (carrito.length === 0) {
                mostrarToast('Tu carrito está vacío', 'error');
                return;
            }

            const user = verificarUsuario();

            if (user) {
                // Usuario logueado - proceder con el pedido
                finalizarPedido(user);
            } else {
                // No está logueado - mostrar modal
                modalLogin.style.display = 'flex';
            }
        });
    }

    async function finalizarPedido(user) {
        const carrito = obtenerCarrito();
        const subtotal = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
        const costoEnvio = parseFloat(tipoEnvioSelect.value);
        const iva = subtotal * IVA_RATE;
        const total = subtotal + iva + costoEnvio;

        const pedidoData = {
            usuario_id: user.id,
            items: carrito,
            subtotal: subtotal,
            iva: iva,
            envio: costoEnvio,
            total: total,
            tipo_envio: tipoEnvioSelect.options[tipoEnvioSelect.selectedIndex].text
        };

        try {
            btnFinalizarPedido.disabled = true;
            btnFinalizarPedido.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';

            // const response = await Ajax.post('/Proyecto_DesarrolloWeb/php/api/pedidos.php', pedidoData);

            // Por ahora simulamos éxito
            await new Promise(resolve => setTimeout(resolve, 1000));

            mostrarToast('¡Pedido realizado con éxito!', 'exito');

            // Limpiar carrito
            localStorage.removeItem('carrito');

            // Redirigir después de 2 segundos
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);

        } catch (error) {
            console.error('Error al finalizar pedido:', error);
            mostrarToast('Error al procesar el pedido', 'error');
            btnFinalizarPedido.disabled = false;
            btnFinalizarPedido.innerHTML = '<i class="fas fa-check-circle"></i> Finalizar Pedido';
        }
    }


    if (cerrarModalBtn) {
        cerrarModalBtn.addEventListener('click', () => {
            modalLogin.style.display = 'none';
        });
    }


    if (continuarSinLoginBtn) {
        continuarSinLoginBtn.addEventListener('click', () => {
            window.location.href = 'contacto.html';
        });
    }

    // Cerrar modal al hacer click fuera
    if (modalLogin) {
        modalLogin.addEventListener('click', (e) => {
            if (e.target === modalLogin) {
                modalLogin.style.display = 'none';
            }
        });
    }


    // INICIALIZACIÓN
    console.log('Inicializando carrito de compras...');
    renderCarrito();
    verificarUsuario();
    console.log('Carrito inicializado correctamente');
});
