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

    const obtenerCarrito = () => JSON.parse(localStorage.getItem('carrito')) || [];
    const guardarCarrito = (carrito) => localStorage.setItem('carrito', JSON.stringify(carrito));

    const renderCarrito = () => {
        const carrito = obtenerCarrito();
        itemsCarritoBody.innerHTML = '';
        
        if (carrito.length === 0) {
            carritoVacioDiv.style.display = 'block';
            carritoContenidoDiv.style.display = 'none';
        } else {
            carritoVacioDiv.style.display = 'none';
            carritoContenidoDiv.style.display = 'block';

            carrito.forEach(item => {
                const tr = document.createElement('tr');
                tr.dataset.id = item.id;
                tr.innerHTML = `
                    <td data-label="Producto">
                        <div class="item-carrito">
                            <div class="item-imagen"><i class="fas fa-box-open"></i></div>
                            <div class="item-detalles">
                                <span class="item-nombre">${item.nombre}</span>
                            </div>
                        </div>
                    </td>
                    <td data-label="Precio" class="item-precio">$${item.precio.toFixed(2)}</td>
                    <td data-label="Cantidad">
                        <div class="control-cantidad">
                            <button data-action="decrease" data-id="${item.id}">-</button>
                            <input type="number" value="${item.cantidad}" min="1" data-id="${item.id}">
                            <button data-action="increase" data-id="${item.id}">+</button>
                        </div>
                    </td>
                    <td data-label="Subtotal" class="item-subtotal">$${(item.precio * item.cantidad).toFixed(2)}</td>
                    <td>
                        <button class="btn-eliminar" data-id="${item.id}"><i class="fas fa-times"></i></button>
                    </td>
                `;
                itemsCarritoBody.appendChild(tr);
            });
        }
        
        actualizarTotales();
        window.actualizarContadorCarrito();
        attachItemEvents();
    };

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
    
    const cambiarCantidad = (id, nuevaCantidad) => {
        let carrito = obtenerCarrito();
        const item = carrito.find(i => i.id === id);
        
        if (item) {
            item.cantidad = Math.max(1, nuevaCantidad);
            guardarCarrito(carrito);
            renderCarrito();
        }
    };

    const eliminarItem = (id) => {
        let carrito = obtenerCarrito();
        const row = document.querySelector(`tr[data-id="${id}"]`);

        if (row) {
             row.classList.add('eliminando');
             setTimeout(() => {
                carrito = carrito.filter(i => i.id !== id);
                guardarCarrito(carrito);
                renderCarrito();
                window.mostrarToast('Producto eliminado', 'advertencia');
            }, 300);
        }
    };

    const vaciarCarrito = () => {
        localStorage.removeItem('carrito');
        renderCarrito();
        window.mostrarToast('Carrito vaciado', 'advertencia');
    };
    
    const attachItemEvents = () => {
        document.querySelectorAll('.btn-eliminar').forEach(button => {
            button.addEventListener('click', (e) => eliminarItem(parseInt(e.currentTarget.dataset.id)));
        });

        document.querySelectorAll('.control-cantidad button').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = parseInt(e.currentTarget.dataset.id);
                const input = document.querySelector(`.control-cantidad input[data-id="${id}"]`);
                let cantidad = parseInt(input.value);
                const action = e.currentTarget.dataset.action;

                if (action === 'increase') cantidad++;
                else if (action === 'decrease' && cantidad > 1) cantidad--;
                
                cambiarCantidad(id, cantidad);
            });
        });

        document.querySelectorAll('.control-cantidad input').forEach(input => {
            input.addEventListener('change', (e) => {
                cambiarCantidad(parseInt(e.currentTarget.dataset.id), parseInt(e.currentTarget.value));
            });
        });
    };

    vaciarCarritoBtn.addEventListener('click', vaciarCarrito);
    tipoEnvioSelect.addEventListener('change', actualizarTotales);

    renderCarrito();
});