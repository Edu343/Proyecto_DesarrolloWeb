/**
 * Carrito de Compras con Drag & Drop (Funcionalidad Extra #2)
 * Permite reordenar productos arrastrándolos
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

    const obtenerCarrito = () => window.Carrito.items || [];
    const guardarCarrito = (carrito) => {
        window.Carrito.items = carrito;
        window.Carrito.guardar();
    };

    /**
     * Renderizar carrito con soporte de Drag & Drop
     */
    const renderCarrito = () => {
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
                                ${item.imagen ?
                                    `<img src="/Proyecto_DesarrolloWeb/uploads/productos/${item.imagen}" alt="${item.nombre}" onerror="this.parentElement.innerHTML='<i class=\\'fas fa-box-open\\'></i>'">` :
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
                            <button data-action="decrease" data-id="${item.id}">-</button>
                            <input type="number" value="${item.cantidad}" min="1" max="${item.stock || 999}" data-id="${item.id}">
                            <button data-action="increase" data-id="${item.id}">+</button>
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

            attachDragAndDropEvents();
        }

        actualizarTotales();
        window.actualizarContadorCarrito();
        attachItemEvents();
    };

    /**
     * Drag & Drop - Event Listeners
     */
    function attachDragAndDropEvents() {
        const items = itemsCarritoBody.querySelectorAll('tr[draggable="true"]');

        items.forEach(item => {
            // Drag Start
            item.addEventListener('dragstart', (e) => {
                draggedElement = item;
                item.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/html', item.innerHTML);
            });

            // Drag End
            item.addEventListener('dragend', (e) => {
                item.classList.remove('dragging');
                draggedElement = null;

                // Remover todas las clases drag-over
                items.forEach(i => i.classList.remove('drag-over'));
            });

            // Drag Over
            item.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';

                if (draggedElement !== item) {
                    item.classList.add('drag-over');
                }
            });

            // Drag Leave
            item.addEventListener('dragleave', () => {
                item.classList.remove('drag-over');
            });

            // Drop
            item.addEventListener('drop', (e) => {
                e.preventDefault();
                e.stopPropagation();

                if (draggedElement && draggedElement !== item) {
                    // Reordenar en el DOM
                    const allItems = Array.from(itemsCarritoBody.querySelectorAll('tr'));
                    const draggedIndex = allItems.indexOf(draggedElement);
                    const targetIndex = allItems.indexOf(item);

                    if (draggedIndex < targetIndex) {
                        item.parentNode.insertBefore(draggedElement, item.nextSibling);
                    } else {
                        item.parentNode.insertBefore(draggedElement, item);
                    }

                    // Actualizar orden en el carrito
                    actualizarOrdenCarrito();
                }

                item.classList.remove('drag-over');
            });
        });
    }

    /**
     * Actualizar orden del carrito después de drag & drop
     */
    function actualizarOrdenCarrito() {
        const items = itemsCarritoBody.querySelectorAll('tr');
        const carrito = obtenerCarrito();
        const nuevoOrden = [];

        items.forEach(tr => {
            const id = parseInt(tr.dataset.id);
            const item = carrito.find(i => i.id === id);
            if (item) {
                nuevoOrden.push(item);
            }
        });

        guardarCarrito(nuevoOrden);
        window.mostrarToast('Orden actualizado', 'exito');
    }

    /**
     * Actualizar totales
     */
    const actualizarTotales = () => {
        const carrito = obtenerCarrito();
        const subtotal = carrito.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
        const costoEnvio = parseFloat(tipoEnvioSelect.value);

        const iva = subtotal * IVA_RATE;
        const total = subtotal + iva + costoEnvio;

        subtotalSpan.textContent = `$${subtotal.toFixed(2)}`;
        ivaSpan.textContent = `$${iva.toFixed(2)}`;
        totalSpan.textContent = `$${total.toFixed(2)}`;
    };

    /**
     * Cambiar cantidad de un producto
     */
    const cambiarCantidad = (id, nuevaCantidad) => {
        const item = obtenerCarrito().find(i => i.id === id);

        if (item) {
            const cantidad = Math.max(1, Math.min(nuevaCantidad, item.stock || 999));

            if (nuevaCantidad > (item.stock || 999)) {
                window.mostrarToast('Stock insuficiente', 'error');
            }

            window.Carrito.actualizar(id, cantidad);
            renderCarrito();
        }
    };

    /**
     * Eliminar producto del carrito
     */
    const eliminarItem = (id) => {
        const row = document.querySelector(`tr[data-id="${id}"]`);

        if (row) {
            row.classList.add('eliminando');
            setTimeout(() => {
                window.Carrito.eliminar(id);
                renderCarrito();
                window.mostrarToast('Producto eliminado', 'exito');
            }, 300);
        }
    };

    /**
     * Vaciar carrito completo
     */
    const vaciarCarrito = () => {
        if (confirm('¿Estás seguro de vaciar el carrito?')) {
            window.Carrito.vaciar();
            renderCarrito();
            window.mostrarToast('Carrito vaciado', 'exito');
        }
    };

    /**
     * Adjuntar eventos a los controles
     */
    const attachItemEvents = () => {
        // Botones de eliminar
        document.querySelectorAll('.btn-eliminar').forEach(button => {
            button.addEventListener('click', (e) => {
                eliminarItem(parseInt(e.currentTarget.dataset.id));
            });
        });

        // Controles de cantidad
        document.querySelectorAll('.control-cantidad button').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = parseInt(e.currentTarget.dataset.id);
                const input = document.querySelector(`.control-cantidad input[data-id="${id}"]`);
                let cantidad = parseInt(input.value);
                const action = e.currentTarget.dataset.action;

                if (action === 'increase') {
                    cantidad++;
                } else if (action === 'decrease' && cantidad > 1) {
                    cantidad--;
                }

                cambiarCantidad(id, cantidad);
            });
        });

        // Input directo de cantidad
        document.querySelectorAll('.control-cantidad input').forEach(input => {
            input.addEventListener('change', (e) => {
                const id = parseInt(e.currentTarget.dataset.id);
                const cantidad = parseInt(e.currentTarget.value) || 1;
                cambiarCantidad(id, cantidad);
            });
        });
    };

    // Event Listeners principales
    vaciarCarritoBtn.addEventListener('click', vaciarCarrito);
    tipoEnvioSelect.addEventListener('change', actualizarTotales);

    // Inicializar
    renderCarrito();
});
