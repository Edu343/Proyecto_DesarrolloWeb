/**
 * Productos - Versión Simplificada Funcional
 */

document.addEventListener('DOMContentLoaded', async () => {
    let productosData = [];
    let productosFiltrados = [];
    let paginaActual = 1;
    const productosPorPagina = 9;

    // API Base
    const API_URL = '/Proyecto_DesarrolloWeb/php/api/productos_simple.php';

    // Referencias DOM
    const productosGrid = document.getElementById('productos-grid');
    const totalProductosSpan = document.getElementById('total-productos');
    const paginaAnteriorBtn = document.getElementById('pagina-anterior');
    const paginaSiguienteBtn = document.getElementById('pagina-siguiente');
    const numerosPaginaDiv = document.getElementById('numeros-pagina');
    const ordenarSelect = document.getElementById('ordenar-productos');
    const btnAplicarFiltros = document.getElementById('btn-aplicar-filtros');
    const btnLimpiarFiltros = document.getElementById('btn-limpiar-filtros');

    /**
     * Cargar productos desde API
     */
    async function cargarProductos() {
        try {
            productosGrid.innerHTML = '<div class="cargando"><i class="fas fa-spinner fa-spin"></i> Cargando productos...</div>';

            const termino = document.getElementById('buscar-producto').value;
            const categoriaId = document.getElementById('filtro-categoria').value;
            const precioMax = document.getElementById('precio-max').value;
            const ordenar = ordenarSelect.value;

            let url = `${API_URL}?action=buscar`;
            if (termino) url += `&termino=${encodeURIComponent(termino)}`;
            if (categoriaId) url += `&categoria_id=${categoriaId}`;
            if (precioMax) url += `&precio_max=${precioMax}`;
            if (ordenar) url += `&ordenar=${ordenar}`;

            const response = await fetch(url);
            const data = await response.json();

            if (data.success) {
                productosData = data.data;
                productosFiltrados = [...productosData];
                paginaActual = 1;
                renderProductos();
            } else {
                productosGrid.innerHTML = '<div class="sin-resultados"><p>Error al cargar productos</p></div>';
            }

        } catch (error) {
            console.error('Error:', error);
            productosGrid.innerHTML = '<div class="sin-resultados"><p>Error de conexión</p></div>';
        }
    }

    /**
     * Renderizar productos
     */
    function renderProductos() {
        productosGrid.innerHTML = '';

        if (productosFiltrados.length === 0) {
            productosGrid.innerHTML = '<div class="sin-resultados"><p>No se encontraron productos</p></div>';
            totalProductosSpan.textContent = 'Mostrando 0 productos';
            return;
        }

        totalProductosSpan.textContent = `Mostrando ${productosFiltrados.length} productos`;

        const inicio = (paginaActual - 1) * productosPorPagina;
        const fin = inicio + productosPorPagina;
        const productosPagina = productosFiltrados.slice(inicio, fin);

        productosPagina.forEach(producto => {
            const card = document.createElement('div');
            card.classList.add('producto-card');

            const disponible = producto.stock > 0;
            const disponibilidadText = disponible ? 'Agregar al Carrito' : 'Agotado';

            card.innerHTML = `
                <div class="producto-imagen">
                    <i class="fas fa-box-open"></i>
                </div>
                <div class="producto-info">
                    <span class="producto-categoria">
                        <i class="${producto.categoria_icono}"></i> ${producto.categoria_nombre}
                    </span>
                    <h3 class="producto-nombre">${producto.nombre}</h3>
                    <p class="producto-descripcion">${producto.descripcion ? producto.descripcion.substring(0, 60) + '...' : ''}</p>
                    <div class="producto-precio">$${parseFloat(producto.precio).toFixed(2)}</div>
                    <div class="producto-stock">Stock: ${producto.stock} unidades</div>
                    <div class="producto-acciones">
                        <button class="btn btn-primario btn-agregar-carrito"
                                data-id="${producto.id}"
                                data-nombre="${producto.nombre}"
                                data-precio="${producto.precio}"
                                data-stock="${producto.stock}"
                                ${!disponible ? 'disabled' : ''}>
                            <i class="fas fa-cart-plus"></i> ${disponibilidadText}
                        </button>
                    </div>
                </div>
            `;
            productosGrid.appendChild(card);
        });

        attachEventos();
        renderPaginacion();
    }

    /**
     * Adjuntar eventos
     */
    function attachEventos() {
        document.querySelectorAll('.btn-agregar-carrito').forEach(button => {
            button.addEventListener('click', (e) => {
                const btn = e.currentTarget;
                const producto = {
                    id: parseInt(btn.dataset.id),
                    nombre: btn.dataset.nombre,
                    precio: parseFloat(btn.dataset.precio),
                    stock: parseInt(btn.dataset.stock),
                    cantidad: 1
                };
                agregarAlCarrito(producto);
            });
        });
    }

    /**
     * Agregar al carrito
     */
    function agregarAlCarrito(producto) {
        let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

        const existente = carrito.find(item => item.id === producto.id);

        if (existente) {
            if (existente.cantidad < producto.stock) {
                existente.cantidad++;
            } else {
                mostrarToast('No hay más stock disponible', 'error');
                return;
            }
        } else {
            carrito.push(producto);
        }

        localStorage.setItem('carrito', JSON.stringify(carrito));
        actualizarContadorCarrito();
        mostrarToast(`${producto.nombre} agregado al carrito`, 'exito');
    }

    /**
     * Actualizar contador carrito
     */
    function actualizarContadorCarrito() {
        const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
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

    /**
     * Paginación
     */
    function renderPaginacion() {
        numerosPaginaDiv.innerHTML = '';
        const totalPaginas = Math.ceil(productosFiltrados.length / productosPorPagina);

        paginaAnteriorBtn.disabled = paginaActual === 1;
        paginaSiguienteBtn.disabled = paginaActual === totalPaginas || totalPaginas === 0;

        for (let i = 1; i <= totalPaginas; i++) {
            const btn = document.createElement('span');
            btn.className = 'numero-pagina' + (i === paginaActual ? ' activo' : '');
            btn.textContent = i;
            btn.addEventListener('click', () => {
                paginaActual = i;
                renderProductos();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
            numerosPaginaDiv.appendChild(btn);
        }
    }

    /**
     * Cargar categorías
     */
    async function cargarCategorias() {
        try {
            const response = await fetch(`${API_URL}?action=categorias`);
            const data = await response.json();

            if (data.success) {
                const select = document.getElementById('filtro-categoria');
                data.data.forEach(cat => {
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

    // Event Listeners
    btnAplicarFiltros.addEventListener('click', cargarProductos);
    ordenarSelect.addEventListener('change', cargarProductos);

    btnLimpiarFiltros.addEventListener('click', () => {
        document.getElementById('buscar-producto').value = '';
        document.getElementById('filtro-categoria').value = '';
        document.getElementById('precio-max').value = '';
        cargarProductos();
    });

    paginaAnteriorBtn.addEventListener('click', () => {
        if (paginaActual > 1) {
            paginaActual--;
            renderProductos();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });

    paginaSiguienteBtn.addEventListener('click', () => {
        const totalPaginas = Math.ceil(productosFiltrados.length / productosPorPagina);
        if (paginaActual < totalPaginas) {
            paginaActual++;
            renderProductos();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });

    // Búsqueda en tiempo real
    let searchTimeout;
    document.getElementById('buscar-producto').addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(cargarProductos, 500);
    });

    // Inicializar
    await cargarCategorias();
    await cargarProductos();
    actualizarContadorCarrito();
});
