/**
 * Productos.js - Versión Definitiva Unificada
 * Catálogo de productos con búsqueda, filtros y carrito
 * Cumple todos los requisitos académicos
 */

document.addEventListener('DOMContentLoaded', async () => {

    // VARIABLES GLOBALES
    let productosData = [];
    let productosFiltrados = [];
    let paginaActual = 1;
    const productosPorPagina = 9;

    // URL base de la API
    const API_URL = window.location.origin + '/Proyecto_DesarrolloWeb/php/api/productos.php';


    // REFERENCIAS DOM
    const productosGrid = document.getElementById('productos-grid');
    const totalProductosSpan = document.getElementById('total-productos');
    const paginaAnteriorBtn = document.getElementById('pagina-anterior');
    const paginaSiguienteBtn = document.getElementById('pagina-siguiente');
    const numerosPaginaDiv = document.getElementById('numeros-pagina');
    const ordenarSelect = document.getElementById('ordenar-productos');
    const btnAplicarFiltros = document.getElementById('btn-aplicar-filtros');
    const btnLimpiarFiltros = document.getElementById('btn-limpiar-filtros');
    const buscarInput = document.getElementById('buscar-producto');
    const filtroCategoriaSelect = document.getElementById('filtro-categoria');
    const precioMaxInput = document.getElementById('precio-max');


    // FUNCIONES DE CARGA DE DATOS
    async function cargarProductos() {
        try {
            mostrarCargando(true);

            const termino = buscarInput.value.trim();
            const categoriaId = filtroCategoriaSelect.value;
            const precioMax = precioMaxInput.value;
            const ordenar = ordenarSelect.value;

            // Construir URL con parámetros
            let url = `${API_URL}?action=buscar`;
            if (termino) url += `&termino=${encodeURIComponent(termino)}`;
            if (categoriaId) url += `&categoria_id=${categoriaId}`;
            if (precioMax && parseFloat(precioMax) > 0) url += `&precio_max=${precioMax}`;
            if (ordenar) url += `&ordenar=${ordenar}`;

            console.log('Cargando productos desde:', url);

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            if (data.success) {
                productosData = data.data || [];
                productosFiltrados = [...productosData];
                paginaActual = 1;
                renderProductos();
            } else {
                mostrarError(data.message || 'Error al cargar productos');
            }

        } catch (error) {
            console.error('Error al cargar productos:', error);
            mostrarError('No se pudieron cargar los productos. Verifique su conexión.');
        } finally {
            mostrarCargando(false);
        }
    }


    async function cargarCategorias() {
        try {
            const response = await fetch(`${API_URL}?action=categorias`);

            if (!response.ok) {
                throw new Error('Error al cargar categorías');
            }

            const data = await response.json();

            if (data.success && data.data) {
                // Limpiar opciones actuales (excepto "Todas")
                while (filtroCategoriaSelect.options.length > 1) {
                    filtroCategoriaSelect.remove(1);
                }

                // Agregar categorías dinámicamente
                data.data.forEach(categoria => {
                    const option = document.createElement('option');
                    option.value = categoria.id;
                    option.textContent = categoria.nombre;
                    filtroCategoriaSelect.appendChild(option);
                });
            }

        } catch (error) {
            console.error('Error al cargar categorías:', error);
        }
    }


    // FUNCIONES DE RENDERIZADO
    function renderProductos() {
        productosGrid.innerHTML = '';

        if (productosFiltrados.length === 0) {
            productosGrid.innerHTML = `
                <div class="sin-resultados">
                    <i class="fas fa-search"></i>
                    <p>No se encontraron productos con los filtros aplicados</p>
                    <button class="btn btn-primario" onclick="location.reload()">Ver todos</button>
                </div>
            `;
            totalProductosSpan.textContent = 'Mostrando 0 productos';
            return;
        }

        // Actualizar contador
        totalProductosSpan.textContent = `Mostrando ${productosFiltrados.length} producto${productosFiltrados.length !== 1 ? 's' : ''}`;

        // Calcular paginación
        const inicio = (paginaActual - 1) * productosPorPagina;
        const fin = inicio + productosPorPagina;
        const productosPagina = productosFiltrados.slice(inicio, fin);

        // Renderizar cada producto
        productosPagina.forEach(producto => {
            const card = crearTarjetaProducto(producto);
            productosGrid.appendChild(card);
        });

        // Adjuntar eventos a botones
        attachEventosCarrito();

        // Renderizar paginación
        renderPaginacion();
    }

    function crearTarjetaProducto(producto) {
        const card = document.createElement('div');
        card.classList.add('producto-card');

        const disponible = producto.stock > 0;
        const stockClass = disponible ? 'stock-disponible' : 'stock-agotado';
        const stockText = disponible
            ? `Stock: ${producto.stock} unidades`
            : 'Agotado';

        card.innerHTML = `
            <div class="producto-imagen">
                ${producto.imagen ?
                    `<img src="/Proyecto_DesarrolloWeb/uploads/productos/${producto.imagen}" alt="${producto.nombre}" onerror="this.style.display='none'; this.parentElement.innerHTML='<i class=\\'fas fa-box-open\\'></i>';">` :
                    '<i class="fas fa-box-open"></i>'}
                ${producto.destacado ? '<span class="badge-destacado"><i class="fas fa-star"></i> Destacado</span>' : ''}
            </div>
            <div class="producto-info">
                <span class="producto-categoria">
                    <i class="${producto.categoria_icono || 'fas fa-tag'}"></i>
                    ${producto.categoria_nombre}
                </span>
                <h3 class="producto-nombre">${producto.nombre}</h3>
                <p class="producto-descripcion">${producto.descripcion ? truncarTexto(producto.descripcion, 80) : 'Sin descripción'}</p>
                <div class="producto-precio">$${parseFloat(producto.precio).toFixed(2)}</div>
                <div class="producto-stock ${stockClass}">${stockText}</div>
                <div class="producto-acciones">
                    <button
                        class="btn btn-primario btn-agregar-carrito"
                        data-id="${producto.id}"
                        data-nombre="${producto.nombre}"
                        data-precio="${producto.precio}"
                        data-stock="${producto.stock}"
                        ${!disponible ? 'disabled' : ''}>
                        <i class="fas fa-cart-plus"></i>
                        ${disponible ? 'Agregar al Carrito' : 'No disponible'}
                    </button>
                </div>
            </div>
        `;

        return card;
    }


    function renderPaginacion() {
        numerosPaginaDiv.innerHTML = '';
        const totalPaginas = Math.ceil(productosFiltrados.length / productosPorPagina);

        // Actualizar botones anterior/siguiente
        paginaAnteriorBtn.disabled = paginaActual === 1;
        paginaSiguienteBtn.disabled = paginaActual === totalPaginas || totalPaginas === 0;

        // Crear botones de página
        const maxBotones = 5;
        let inicio = Math.max(1, paginaActual - Math.floor(maxBotones / 2));
        let fin = Math.min(totalPaginas, inicio + maxBotones - 1);

        if (fin - inicio < maxBotones - 1) {
            inicio = Math.max(1, fin - maxBotones + 1);
        }

        for (let i = inicio; i <= fin; i++) {
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

    // FUNCIONES DEL CARRITO
    function attachEventosCarrito() {
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

    function agregarAlCarrito(producto) {
        try {
            let carrito = obtenerCarrito();

            // Buscar si el producto ya existe
            const existente = carrito.find(item => item.id === producto.id);

            if (existente) {
                // Verificar stock disponible
                if (existente.cantidad >= producto.stock) {
                    mostrarToast('No hay más stock disponible de este producto', 'error');
                    return;
                }
                existente.cantidad++;
            } else {
                // Agregar nuevo producto
                carrito.push({
                    id: producto.id,
                    nombre: producto.nombre,
                    precio: producto.precio,
                    stock: producto.stock,
                    cantidad: producto.cantidad
                });
            }

            // Guardar en localStorage
            guardarCarrito(carrito);

            // Actualizar contador del carrito
            actualizarContadorCarrito();

            // Mostrar confirmación
            mostrarToast(`"${producto.nombre}" agregado al carrito`, 'exito');

            // Efecto visual en el botón
            const btn = event.target.closest('.btn-agregar-carrito');
            if (btn) {
                btn.classList.add('agregado');
                setTimeout(() => btn.classList.remove('agregado'), 1000);
            }

        } catch (error) {
            console.error('Error al agregar al carrito:', error);
            mostrarToast('Error al agregar el producto', 'error');
        }
    }

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
        } catch (error) {
            console.error('Error al guardar carrito:', error);
            mostrarToast('Error al guardar en el carrito', 'error');
        }
    }


    function actualizarContadorCarrito() {
        const carrito = obtenerCarrito();
        const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);
        const contador = document.querySelector('.contador-carrito');
        if (contador) {
            contador.textContent = totalItems;
            if (totalItems > 0) {
                contador.classList.add('tiene-items');
            } else {
                contador.classList.remove('tiene-items');
            }
        }
    }

    // FUNCIONES DE UI
    function mostrarCargando(mostrar) {
        if (mostrar) {
            productosGrid.innerHTML = `
                <div class="cargando">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>Cargando productos...</p>
                </div>
            `;
        }
    }

    function mostrarError(mensaje) {
        productosGrid.innerHTML = `
            <div class="mensaje-error">
                <i class="fas fa-exclamation-triangle"></i>
                <p>${mensaje}</p>
                <button class="btn btn-primario" onclick="location.reload()">Reintentar</button>
            </div>
        `;
    }

    function mostrarToast(mensaje, tipo = 'exito') {
        // Remover toast anterior si existe
        const toastExistente = document.querySelector('.toast');
        if (toastExistente) {
            toastExistente.remove();
        }

        // Crear nuevo toast
        const toast = document.createElement('div');
        toast.className = `toast toast-${tipo}`;
        toast.innerHTML = `
            <i class="fas fa-${tipo === 'exito' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${mensaje}</span>
        `;
        document.body.appendChild(toast);

        // Animación de entrada
        setTimeout(() => toast.classList.add('show'), 10);

        // Remover después de 3 segundos
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }


    function truncarTexto(texto, maxLength) {
        if (!texto) return '';
        return texto.length > maxLength
            ? texto.substring(0, maxLength) + '...'
            : texto;
    }


    // EVENT LISTENERS

    if (btnAplicarFiltros) {
        btnAplicarFiltros.addEventListener('click', cargarProductos);
    }

    if (btnLimpiarFiltros) {
        btnLimpiarFiltros.addEventListener('click', () => {
            buscarInput.value = '';
            filtroCategoriaSelect.value = '';
            precioMaxInput.value = '';
            ordenarSelect.value = 'reciente';
            cargarProductos();
        });
    }

    if (ordenarSelect) {
        ordenarSelect.addEventListener('change', cargarProductos);
    }

    if (buscarInput) {
        let searchTimeout;
        buscarInput.addEventListener('input', () => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(cargarProductos, 500);
        });
    }

    if (paginaAnteriorBtn) {
        paginaAnteriorBtn.addEventListener('click', () => {
            if (paginaActual > 1) {
                paginaActual--;
                renderProductos();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    }

    if (paginaSiguienteBtn) {
        paginaSiguienteBtn.addEventListener('click', () => {
            const totalPaginas = Math.ceil(productosFiltrados.length / productosPorPagina);
            if (paginaActual < totalPaginas) {
                paginaActual++;
                renderProductos();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    }


    // INICIALIZACIÓN
    console.log('Inicializando catálogo de productos...');

    await cargarCategorias();
    await cargarProductos();
    actualizarContadorCarrito();
    console.log('Catálogo inicializado correctamente');
});
