document.addEventListener('DOMContentLoaded', () => {
    const productosData = [
        { id: 1, nombre: "Martillo Uña Curva", categoria: "herramientas", precio: 220.00, disponible: true },
        { id: 2, nombre: "Taladro Percutor 1/2\"", categoria: "herramientas", precio: 1850.00, disponible: true },
        { id: 3, nombre: "Pintura Acrílica Gris", categoria: "pinturas", precio: 450.00, disponible: true },
        { id: 4, nombre: "Set de Destornilladores", categoria: "herramientas", precio: 315.00, disponible: true },
        { id: 5, nombre: "Tubo PVC Sanitario 2\"", categoria: "plomeria", precio: 85.00, disponible: true },
        { id: 6, nombre: "Cable Eléctrico Cal. 12", categoria: "electricidad", precio: 12.50, disponible: true },
        { id: 7, nombre: "Saco de Cemento (50kg)", categoria: "construccion", precio: 250.00, disponible: false },
        { id: 8, nombre: "Tijeras de Podar", categoria: "jardineria", precio: 580.00, disponible: true },
        { id: 9, nombre: "Escalera de Tijera (3m)", categoria: "herramientas", precio: 1200.00, disponible: true },
        { id: 10, nombre: "Kit de Brocas para Metal", categoria: "herramientas", precio: 650.00, disponible: true },
        { id: 11, nombre: "Rodillo de Pintura", categoria: "pinturas", precio: 80.00, disponible: true },
        { id: 12, nombre: "Cinta Métrica 5m", categoria: "herramientas", precio: 150.00, disponible: true },
        { id: 13, nombre: "Adhesivo para Azulejo", categoria: "construccion", precio: 180.00, disponible: true },
        { id: 14, nombre: "Lámpara LED 10W", categoria: "electricidad", precio: 75.00, disponible: true },
        { id: 15, nombre: "Sierra Circular 7 1/4\"", categoria: "herramientas", precio: 2800.00, disponible: true },
    ];

    let productosFiltrados = [...productosData];
    let paginaActual = 1;
    const productosPorPagina = 9;

    const productosGrid = document.getElementById('productos-grid');
    const totalProductosSpan = document.getElementById('total-productos');
    const paginaAnteriorBtn = document.getElementById('pagina-anterior');
    const paginaSiguienteBtn = document.getElementById('pagina-siguiente');
    const numerosPaginaDiv = document.getElementById('numeros-pagina');
    const ordenarSelect = document.getElementById('ordenar-productos');
    const btnAplicarFiltros = document.getElementById('btn-aplicar-filtros');
    const btnLimpiarFiltros = document.getElementById('btn-limpiar-filtros');
    const modalProducto = document.getElementById('modal-producto');
    const cerrarModalProducto = document.getElementById('cerrar-modal-producto');
    const modalProductoBody = document.getElementById('modal-producto-body');

    const renderProductos = (productos) => {
        productosGrid.innerHTML = '';
        totalProductosSpan.textContent = `Mostrando ${productos.length} productos`;

        const inicio = (paginaActual - 1) * productosPorPagina;
        const fin = inicio + productosPorPagina;
        const productosPagina = productos.slice(inicio, fin);

        productosPagina.forEach(producto => {
            const card = document.createElement('div');
            card.classList.add('producto-card');
            
            const disponibilidadText = producto.disponible ? 'Agregar' : 'Agotado';

            card.innerHTML = `
                <div class="producto-imagen"><i class="fas fa-box-open"></i></div>
                <div class="producto-info">
                    <h3 class="producto-nombre">${producto.nombre}</h3>
                    <div class="producto-precio">$${producto.precio.toFixed(2)}</div>
                    <div class="producto-acciones">
                        <button class="btn btn-primario btn-agregar-carrito" data-id="${producto.id}" ${!producto.disponible ? 'disabled' : ''}>
                            <i class="fas fa-cart-plus"></i> ${disponibilidadText}
                        </button>
                        <button class="btn-ver-detalles" data-id="${producto.id}">
                            <i class="fas fa-search-plus"></i>
                        </button>
                    </div>
                </div>
            `;
            productosGrid.appendChild(card);
        });

        attachProductCardEvents();
        renderPaginacion(productos.length);
    };

    const renderModalProducto = (producto) => {
        modalProductoBody.innerHTML = `
            <div class="modal-producto-contenido">
                <div class="modal-imagen"><i class="fas fa-box-open"></i></div>
                <div class="modal-info">
                    <h2 class="producto-nombre">${producto.nombre}</h2>
                    <p class="descripcion">Categoría: ${producto.categoria}</p>
                    <div class="precio-modal">$${producto.precio.toFixed(2)}</div>
                    <div class="modal-info-acciones">
                        <div class="cantidad-selector">
                            <label for="cantidad-modal">Cantidad:</label>
                            <input type="number" id="cantidad-modal" value="1" min="1" ${!producto.disponible ? 'disabled' : ''}>
                        </div>
                        <button class="btn btn-primario" id="btn-agregar-modal" data-id="${producto.id}" ${!producto.disponible ? 'disabled' : ''}>
                            <i class="fas fa-cart-plus"></i> Agregar al Carrito
                        </button>
                    </div>
                </div>
            </div>
        `;
        modalProducto.classList.add('activo');
        
        document.getElementById('btn-agregar-modal').addEventListener('click', (e) => {
            const id = parseInt(e.currentTarget.dataset.id);
            const cantidad = parseInt(document.getElementById('cantidad-modal').value);
            agregarAlCarrito(id, cantidad);
            modalProducto.classList.remove('activo');
        });
    };

    const renderPaginacion = (totalProductos) => {
        numerosPaginaDiv.innerHTML = '';
        const totalPaginas = Math.ceil(totalProductos / productosPorPagina);

        paginaAnteriorBtn.disabled = paginaActual === 1;
        paginaSiguienteBtn.disabled = paginaActual === totalPaginas || totalPaginas === 0;

        for (let i = 1; i <= totalPaginas; i++) {
            const btn = document.createElement('span');
            btn.classList.add('numero-pagina');
            if (i === paginaActual) {
                btn.classList.add('activo');
            }
            btn.textContent = i;
            btn.addEventListener('click', () => {
                paginaActual = i;
                renderProductos(productosFiltrados);
            });
            numerosPaginaDiv.appendChild(btn);
        }
    };

    const aplicarFiltros = () => {
        const buscar = document.getElementById('buscar-producto').value.toLowerCase();
        const categoria = document.getElementById('filtro-categoria').value;
        const precioMax = parseFloat(document.getElementById('precio-max').value) || Infinity;
        
        productosFiltrados = productosData.filter(producto => {
            const coincideBusqueda = producto.nombre.toLowerCase().includes(buscar);
            const coincideCategoria = !categoria || producto.categoria === categoria;
            const coincidePrecio = producto.precio <= precioMax;
            
            return coincideBusqueda && coincideCategoria && coincidePrecio;
        });

        aplicarOrdenamiento();
    };
    
    const aplicarOrdenamiento = () => {
        const orden = ordenarSelect.value;

        productosFiltrados.sort((a, b) => {
            if (orden === 'nombre') {
                return a.nombre.localeCompare(b.nombre);
            } else if (orden === 'precio-menor') {
                return a.precio - b.precio;
            } else if (orden === 'precio-mayor') {
                return b.precio - a.precio;
            }
            return 0;
        });

        paginaActual = 1;
        renderProductos(productosFiltrados);
    };

    const agregarAlCarrito = (id, cantidad = 1) => {
        const producto = productosData.find(p => p.id === id);
        if (!producto || !producto.disponible) {
            window.mostrarToast('Producto no disponible', 'error');
            return;
        }

        let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
        const itemExistente = carrito.find(item => item.id === id);

        if (itemExistente) {
            itemExistente.cantidad += cantidad;
        } else {
            carrito.push({ ...producto, cantidad: cantidad });
        }

        localStorage.setItem('carrito', JSON.stringify(carrito));
        window.actualizarContadorCarrito();
        window.mostrarToast(`${producto.nombre} agregado`, 'exito');
    };

    const attachProductCardEvents = () => {
        document.querySelectorAll('.btn-agregar-carrito').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = parseInt(e.currentTarget.dataset.id);
                agregarAlCarrito(id);
            });
        });

        document.querySelectorAll('.btn-ver-detalles').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = parseInt(e.currentTarget.dataset.id);
                const producto = productosData.find(p => p.id === id);
                if (producto) {
                    renderModalProducto(producto);
                }
            });
        });
    };

    btnAplicarFiltros.addEventListener('click', aplicarFiltros);
    ordenarSelect.addEventListener('change', aplicarOrdenamiento);

    btnLimpiarFiltros.addEventListener('click', () => {
        document.getElementById('buscar-producto').value = '';
        document.getElementById('filtro-categoria').value = '';
        document.getElementById('precio-max').value = '';
        aplicarFiltros();
    });

    paginaAnteriorBtn.addEventListener('click', () => {
        if (paginaActual > 1) {
            paginaActual--;
            renderProductos(productosFiltrados);
        }
    });

    paginaSiguienteBtn.addEventListener('click', () => {
        const totalPaginas = Math.ceil(productosFiltrados.length / productosPorPagina);
        if (paginaActual < totalPaginas) {
            paginaActual++;
            renderProductos(productosFiltrados);
        }
    });

    cerrarModalProducto.addEventListener('click', () => modalProducto.classList.remove('activo'));
    modalProducto.addEventListener('click', (e) => {
        if (e.target === modalProducto) modalProducto.classList.remove('activo');
    });

    const urlParams = new URLSearchParams(window.location.search);
    const categoriaUrl = urlParams.get('categoria');
    if (categoriaUrl) {
        document.getElementById('filtro-categoria').value = categoriaUrl;
    }
    
    aplicarFiltros();
});