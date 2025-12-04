/**
 * Carrito de Compras - Versión Simplificada con Drag & Drop
 */

document.addEventListener('DOMContentLoaded', () => {
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

    /**
     * Obtener carrito
     */
    function obtenerCarrito() {
        return JSON.parse(localStorage.getItem('carrito')) || [];
    }

    /**
     * Guardar carrito
     */
    function guardarCarrito(carrito) {
        localStorage.setItem('carrito', JSON.stringify(carrito));
        actualizarContador();
    }

    /**
     * Renderizar carrito
     */
    function renderCarrito() {
        const carrito = obtenerCarrito();
        itemsCarritoBody.innerHTML = '';

        if (carrito.length === 0) {
            carritoVacioDiv.style.display = 'block';
            carritoContenidoDiv.style.display = 'none';
        } else {
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
                                <i class="fas fa-box-open"></i>
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
        }

        actualizarTotales();
        attachEventos();
    }

    /**
     * Drag & Drop
     */
    function attachDragAndDrop() {
        const items = itemsCarritoBody.querySelectorAll('tr[draggable="true"]');

        items.forEach(item => {
            item.addEventListener('dragstart', (e) => {
                draggedElement = item;
                item.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
            });

            item.addEventListener('dragend', () => {
                item.classList.remove('dragging');
                draggedElement = null;
                items.forEach(i => i.classList.remove('drag-over'));
            });

            item.addEventListener('dragover', (e) => {
                e.preventDefault();
                if (draggedElement !== item) {
                    item.classList.add('drag-over');
                }
            });

            item.addEventListener('dragleave', () => {
                item.classList.remove('drag-over');
            });

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

    /**
     * Actualizar orden del carrito
     */
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

    /**
     * Adjuntar eventos
     */
    function attachEventos() {
        // Botones eliminar
        document.querySelectorAll('.btn-eliminar').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.currentTarget.dataset.id);
                eliminarItem(id);
            });
        });

        // Controles de cantidad
        document.querySelectorAll('.btn-cantidad').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.currentTarget.dataset.id);
                const accion = e.currentTarget.dataset.accion;
                cambiarCantidad(id, accion);
            });
        });

        // Input directo
        document.querySelectorAll('.input-cantidad').forEach(input => {
            input.addEventListener('change', (e) => {
                const id = parseInt(e.currentTarget.dataset.id);
                const cantidad = parseInt(e.currentTarget.value) || 1;
                actualizarCantidad(id, cantidad);
            });
        });
    }

    /**
     * Cambiar cantidad
     */
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

    /**
     * Actualizar cantidad directa
     */
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

    /**
     * Eliminar item
     */
    function eliminarItem(id) {
        let carrito = obtenerCarrito();
        carrito = carrito.filter(i => i.id !== id);
        guardarCarrito(carrito);
        renderCarrito();
        mostrarToast('Producto eliminado', 'exito');
    }

    /**
     * Vaciar carrito
     */
    function vaciarCarrito() {
        if (confirm('¿Estás seguro de vaciar el carrito?')) {
            localStorage.removeItem('carrito');
            renderCarrito();
            mostrarToast('Carrito vaciado', 'exito');
        }
    }

    /**
     * Actualizar totales
     */
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

    /**
     * Actualizar contador
     */
    function actualizarContador() {
        const carrito = obtenerCarrito();
        const total = carrito.reduce((sum, item) => sum + item.cantidad, 0);
        const contador = document.querySelector('.contador-carrito');
        if (contador) {
            contador.textContent = total;
        }
    }

    /**
     * Mostrar toast
     */
    function mostrarToast(mensaje, tipo = 'exito') {
        const toastExistente = document.querySelector('.toast');
        if (toastExistente) toastExistente.remove();

        const toast = document.createElement('div');
        toast.className = `toast ${tipo}`;
        toast.textContent = mensaje;
        document.body.appendChild(toast);

        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // Event Listeners principales
    vaciarCarritoBtn.addEventListener('click', vaciarCarrito);
    tipoEnvioSelect.addEventListener('change', actualizarTotales);

    // Inicializar
    renderCarrito();
});
