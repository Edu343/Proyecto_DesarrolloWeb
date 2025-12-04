/**
 * Productos - Sistema con AJAX + JSON
 * Búsqueda dinámica conectada a API REST
 */

document.addEventListener('DOMContentLoaded', async () => {
    let productosData = [];
    let productosFiltrados = [];
    let paginaActual = 1;
    const productosPorPagina = 9;

    // Referencias DOM
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

    /**
     * Cargar productos desde API usando AJAX
     */
    async function cargarProductos() {
        try {
            mostrarCargando(true);

            const termino = document.getElementById('buscar-producto').value;
            const categoriaId = document.getElementById('filtro-categoria').value;
            const precioMax = document.getElementById('precio-max').value;
            const ordenar = ordenarSelect.value;

            const params = {
                action: 'buscar'
            };

            if (termino) params.termino = termino;
            if (categoriaId) params.categoria_id = categoriaId;
            if (precioMax) params.precio_max = precioMax;
            if (ordenar) params.ordenar = ordenar;

            const response = await Ajax.get('/Proyecto_DesarrolloWeb/php/api/productos.php', params);

            if (response.success) {
                productosData = response.data;
                productosFiltrados = [...productosData];
                paginaActual = 1;
                renderProductos(productosFiltrados);
            } else {
                window.mostrarToast('Error al cargar productos', 'error');
            }

        } catch (error) {
            console.error('Error al cargar productos:', error);
            window.mostrarToast('Error al conectar con el servidor', 'error');
            // Usar datos de respaldo si falla la API
            usarDatosRespaldo();
        } finally {
            mostrarCargando(false);
        }
    }

    /**
     * Mostrar indicador de carga
     */
    function mostrarCargando(mostrar) {
        if (mostrar) {
            productosGrid.innerHTML = '<div class="cargando"><i class="fas fa-spinner fa-spin"></i> Cargando productos...</div>';
        }
    }

    /**
     * Renderizar productos en la página
     */
    const renderProductos = (productos) => {
        productosGrid.innerHTML = '';

        if (productos.length === 0) {
            productosGrid.innerHTML = '<div class="sin-resultados"><p>No se encontraron productos</p></div>';
            totalProductosSpan.textContent = 'Mostrando 0 productos';
            return;
        }

        totalProductosSpan.textContent = `Mostrando ${productos.length} productos`;

        const inicio = (paginaActual - 1) * productosPorPagina;
        const fin = inicio + productosPorPagina;
        const productosPagina = productos.slice(inicio, fin);

        productosPagina.forEach(producto => {
            const card = document.createElement('div');
            card.classList.add('producto-card');

            const disponible = producto.stock > 0;
            const disponibilidadText = disponible ? 'Agregar' : 'Agotado';

            card.innerHTML = `
                <div class="producto-imagen">
                    ${producto.imagen ?
                        `<img src="/Proyecto_DesarrolloWeb/uploads/productos/${producto.imagen}" alt="${producto.nombre}" onerror="this.parentElement.innerHTML='<i class=\\'fas fa-box-open\\'></i>'">` :
                        '<i class="fas fa-box-open"></i>'}
                </div>
                <div class="producto-info">
                    <span class="producto-categoria"><i class="${producto.categoria_icono}"></i> ${producto.categoria_nombre}</span>
                    <h3 class="producto-nombre">${producto.nombre}</h3>
                    <p class="producto-descripcion">${producto.descripcion ? producto.descripcion.substring(0, 80) + '...' : ''}</p>
                    <div class="producto-precio">$${parseFloat(producto.precio).toFixed(2)}</div>
                    <div class="producto-stock">Stock: ${producto.stock} unidades</div>
                    <div class="producto-acciones">
                        <button class="btn btn-primario btn-agregar-carrito" data-id="${producto.id}" ${!disponible ? 'disabled' : ''}>
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

    /**
     * Renderizar modal con detalles del producto
     */
    const renderModalProducto = (producto) => {
        const disponible = producto.stock > 0;

        modalProductoBody.innerHTML = `
            <div class="modal-producto-contenido">
                <div class="modal-imagen">
                    ${producto.imagen ?
                        `<img src="/Proyecto_DesarrolloWeb/uploads/productos/${producto.imagen}" alt="${producto.nombre}" onerror="this.innerHTML='<i class=\\'fas fa-box-open\\'></i>'">` :
                        '<i class="fas fa-box-open"></i>'}
                </div>
                <div class="modal-info">
                    <span class="producto-categoria"><i class="${producto.categoria_icono}"></i> ${producto.categoria_nombre}</span>
                    <h2 class="producto-nombre">${producto.nombre}</h2>
                    <p class="descripcion">${producto.descripcion || 'Sin descripción disponible'}</p>
                    <div class="precio-modal">$${parseFloat(producto.precio).toFixed(2)}</div>
                    <div class="stock-info ${disponible ? 'disponible' : 'agotado'}">
                        ${disponible ? `✓ Disponible (${producto.stock} unidades)` : '✗ Agotado'}
                    </div>
                    <div class="modal-info-acciones">
                        <div class="cantidad-selector">
                            <label for="cantidad-modal">Cantidad:</label>
                            <input type="number" id="cantidad-modal" value="1" min="1" max="${producto.stock}" ${!disponible ? 'disabled' : ''}>
                        </div>
                        <button class="btn btn-primario" id="btn-agregar-modal" data-id="${producto.id}" ${!disponible ? 'disabled' : ''}>
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

    /**
     * Renderizar paginación
     */
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
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
            numerosPaginaDiv.appendChild(btn);
        }
    };

    /**
     * Agregar producto al carrito
     */
    const agregarAlCarrito = (id, cantidad = 1) => {
        const producto = productosData.find(p => p.id === id);

        if (!producto) {
            window.mostrarToast('Producto no encontrado', 'error');
            return;
        }

        if (producto.stock < cantidad) {
            window.mostrarToast('Stock insuficiente', 'error');
            return;
        }

        // Usar el sistema de carrito global
        window.Carrito.agregar({
            id: producto.id,
            nombre: producto.nombre,
            precio: parseFloat(producto.precio),
            imagen: producto.imagen,
            stock: producto.stock
        });
    };

    /**
     * Adjuntar eventos a las tarjetas de productos
     */
    const attachProductCardEvents = () => {
        document.querySelectorAll('.btn-agregar-carrito').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = parseInt(e.currentTarget.dataset.id);
                agregarAlCarrito(id);
            });
        });

        document.querySelectorAll('.btn-ver-detalles').forEach(button => {
            button.addEventListener('click', async (e) => {
                const id = parseInt(e.currentTarget.dataset.id);

                // Cargar detalles completos del producto via AJAX
                try {
                    const response = await Ajax.get('/Proyecto_DesarrolloWeb/php/api/productos.php', {
                        action: 'obtener',
                        id: id
                    });

                    if (response.success) {
                        renderModalProducto(response.data);
                    }
                } catch (error) {
                    // Usar datos locales si falla
                    const producto = productosData.find(p => p.id === id);
                    if (producto) {
                        renderModalProducto(producto);
                    }
                }
            });
        });
    };

    /**
     * Búsqueda en tiempo real (debounced)
     */
    let searchTimeout;
    document.getElementById('buscar-producto').addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            cargarProductos();
        }, 500); // Esperar 500ms después de que el usuario deje de escribir
    });

    /**
     * Event Listeners
     */
    btnAplicarFiltros.addEventListener('click', () => cargarProductos());
    ordenarSelect.addEventListener('change', () => cargarProductos());

    btnLimpiarFiltros.addEventListener('click', () => {
        document.getElementById('buscar-producto').value = '';
        document.getElementById('filtro-categoria').value = '';
        document.getElementById('precio-max').value = '';
        cargarProductos();
    });

    paginaAnteriorBtn.addEventListener('click', () => {
        if (paginaActual > 1) {
            paginaActual--;
            renderProductos(productosFiltrados);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });

    paginaSiguienteBtn.addEventListener('click', () => {
        const totalPaginas = Math.ceil(productosFiltrados.length / productosPorPagina);
        if (paginaActual < totalPaginas) {
            paginaActual++;
            renderProductos(productosFiltrados);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });

    cerrarModalProducto.addEventListener('click', () => modalProducto.classList.remove('activo'));
    modalProducto.addEventListener('click', (e) => {
        if (e.target === modalProducto) modalProducto.classList.remove('activo');
    });

    /**
     * Cargar categorías dinámicamente
     */
    async function cargarCategorias() {
        try {
            const response = await Ajax.get('/Proyecto_DesarrolloWeb/php/api/productos.php', { action: 'categorias' });
            if (response.success) {
                const select = document.getElementById('filtro-categoria');
                response.data.forEach(cat => {
                    const option = document.createElement('option');
                    option.value = cat.id;
                    option.textContent = cat.nombre;
                    select.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Error al cargar categorías:', error);
        }
    }

    /**
     * Datos de respaldo (fallback si falla API)
     */
    function usarDatosRespaldo() {
        productosData = [
            { id: 1, nombre: "Martillo Uña Curva", categoria_nombre: "Herramientas", categoria_icono: "fa-hammer", precio: 220.00, stock: 50, descripcion: "Martillo profesional" },
            { id: 2, nombre: "Taladro Percutor", categoria_nombre: "Herramientas", categoria_icono: "fa-hammer", precio: 1850.00, stock: 25, descripcion: "Taladro 18V" },
            { id: 3, nombre: "Pintura Acrílica", categoria_nombre: "Pinturas", categoria_icono: "fa-paint-roller", precio: 450.00, stock: 80, descripcion: "Pintura de alta calidad" }
        ];
        productosFiltrados = [...productosData];
        renderProductos(productosFiltrados);
    }

    /**
     * Verificar parámetros URL (ej: ?categoria=2)
     */
    const urlParams = new URLSearchParams(window.location.search);
    const categoriaUrl = urlParams.get('categoria');
    if (categoriaUrl) {
        document.getElementById('filtro-categoria').value = categoriaUrl;
    }

    // Inicializar
    await cargarCategorias();
    await cargarProductos();
});
