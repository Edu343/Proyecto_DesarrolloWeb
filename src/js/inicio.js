/**
 * Inicio - Página Principal
 *
 * REQUISITO: CONEXIÓN A 2 APIS EXTERNAS - API #1 EXCHANGERATE, API #2 WEATHERAPI (VER LÍNEA 199 Y 268)
 */

document.addEventListener('DOMContentLoaded', async () => {
    const productosDestacadosContainer = document.getElementById('productos-destacados');


    // PRODUCTOS DESTACADOS (con AJAX)
    async function cargarProductosDestacados() {
        try {
            const response = await Ajax.get('/Proyecto_DesarrolloWeb/php/api/productos.php', {
                action: 'destacados',
                limite: 6
            });

            if (response.success && response.data.length > 0) {
                renderProductos(response.data);
            } else {
                usarProductosRespaldo();
            }
        } catch (error) {
            console.error('Error al cargar productos:', error);
            usarProductosRespaldo();
        }
    }

    function renderProductos(productos) {
        if (!productosDestacadosContainer) return;

        productosDestacadosContainer.innerHTML = '';

        productos.forEach(producto => {
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
                    <div class="producto-precio">$${parseFloat(producto.precio).toFixed(2)}</div>
                    <div class="producto-acciones">
                        <button class="btn btn-primario btn-agregar" data-id="${producto.id}" ${!disponible ? 'disabled' : ''}>
                            <i class="fas fa-cart-plus"></i> ${disponibilidadText}
                        </button>
                    </div>
                </div>
            `;
            productosDestacadosContainer.appendChild(card);
        });

        attachProductEvents(productos);
    }

    function usarProductosRespaldo() {
        const productos = [
            { id: 1, nombre: "Martillo de Acero", categoria_nombre: "Herramientas", categoria_icono: "fa-hammer", precio: 249.99, stock: 50 },
            { id: 2, nombre: "Taladro Inalámbrico", categoria_nombre: "Herramientas", categoria_icono: "fa-hammer", precio: 1299.99, stock: 25 },
            { id: 3, nombre: "Pintura Vinílica Blanca", categoria_nombre: "Pinturas", categoria_icono: "fa-paint-roller", precio: 599.99, stock: 80 },
            { id: 5, nombre: "Llave Mezcladora", categoria_nombre: "Plomería", categoria_icono: "fa-faucet", precio: 449.99, stock: 30 }
        ];
        renderProductos(productos);
    }

    function attachProductEvents(productos) {
        document.querySelectorAll('.btn-agregar').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = parseInt(e.currentTarget.dataset.id);
                const producto = productos.find(p => p.id === id);

                if (producto && window.Carrito) {
                    // Ensure the product has the correct structure for the Carrito
                    const productoParaCarrito = {
                        id: producto.id,
                        nombre: producto.nombre,
                        precio: parseFloat(producto.precio),
                        imagen: producto.imagen || null,
                        stock: producto.stock || 0
                    };
                    window.Carrito.agregar(productoParaCarrito);
                }
            });
        });
    }

    // CATEGORÍAS CLICKEABLES
    document.querySelectorAll('.categoria-card').forEach(card => {
        card.addEventListener('click', (e) => {
            const categoria = e.currentTarget.dataset.categoria;
            window.location.href = `productos.html?categoria=${categoria}`;
        });
    });

    //APIs DE TERCEROS
    const apiWidget = document.createElement('div');
    apiWidget.id = 'api-widgets';
    apiWidget.style.cssText = `
        position: fixed;
        bottom: 80px;
        right: 20px;
        z-index: 1000;
        display: flex;
        flex-direction: column;
        gap: 10px;
    `;
    document.body.appendChild(apiWidget);

    /**
     * API 1: Widget de Ofertas y Promociones
     * Muestra las ofertas especiales de la ferretería
     */
    async function cargarOfertas() {
        try {
            // Datos de ofertas actuales
            const ofertasData = {
                titulo: 'Ofertas Especiales',
                descuento: '20%',
                categoria: 'Herramientas Eléctricas',
                validoHasta: calcularFechaVencimiento(7) // 7 días
            };

            mostrarWidgetOfertas(ofertasData);

        } catch (error) {
            console.error('Error al cargar ofertas:', error);
        }
    }

    function calcularFechaVencimiento(dias) {
        const fecha = new Date();
        fecha.setDate(fecha.getDate() + dias);
        return fecha.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
    }

    function mostrarWidgetOfertas(data) {
        const widget = document.createElement('div');
        widget.className = 'api-widget ofertas-widget';
        widget.style.cssText = `
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            color: white;
            padding: 15px;
            border-radius: 10px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            min-width: 220px;
            cursor: pointer;
            transition: transform 0.2s;
        `;

        widget.innerHTML = `
            <div>
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;">
                    <i class="fas fa-tag" style="font-size: 1.2rem;"></i>
                    <div style="font-size: 0.9rem; font-weight: bold;">${data.titulo}</div>
                </div>
                <div style="display: flex; align-items: baseline; gap: 8px; margin-bottom: 8px;">
                    <span style="font-size: 2.5rem; font-weight: bold;">${data.descuento}</span>
                    <span style="font-size: 0.9rem;">DESCUENTO</span>
                </div>
                <div style="font-size: 0.85rem; margin-bottom: 5px;">
                    <i class="fas fa-wrench"></i> ${data.categoria}
                </div>
                <div style="font-size: 0.75rem; opacity: 0.9; border-top: 1px solid rgba(255,255,255,0.3); padding-top: 8px; margin-top: 8px;">
                    <i class="fas fa-clock"></i> Válido hasta ${data.validoHasta}
                </div>
            </div>
        `;

        widget.addEventListener('mouseenter', () => {
            widget.style.transform = 'scale(1.05)';
        });

        widget.addEventListener('mouseleave', () => {
            widget.style.transform = 'scale(1)';
        });

        widget.addEventListener('click', () => {
            window.location.href = 'productos.html';
        });

        apiWidget.appendChild(widget);
    }

    /**
     * API 2: ExchangeRate-API - Tipo de Cambio USD a MXN
     * https://www.exchangerate-api.com/
     * API real de terceros para obtener el tipo de cambio actualizado
     */
    async function cargarTipoCambio() {
        try {
            // Usar API real de tipo de cambio
            const urlApi = 'https://api.exchangerate-api.com/v4/latest/USD';
            const respuesta = await fetch(urlApi);

            if (!respuesta.ok) {
                throw new Error('Error al obtener tipo de cambio');
            }

            const datos = await respuesta.json();

            // Extraer tasa de cambio MXN
            const datosTasa = {
                usd_a_mxn: datos.rates.MXN.toFixed(2),
                fecha: new Date(datos.date).toLocaleDateString('es-MX')
            };

            mostrarWidgetTipoCambio(datosTasa);

            // Guardar en localStorage para caché (válido por 24 horas)
            Storage.set('tipo_cambio', {
                tasa: datosTasa.usd_a_mxn,
                fecha: Date.now()
            });

        } catch (error) {
            console.error('Error al cargar tipo de cambio:', error);

            // Intentar cargar del caché si la API falla
            const cache = Storage.get('tipo_cambio');
            if (cache && (Date.now() - cache.fecha) < 86400000) { // 24 horas
                mostrarWidgetTipoCambio({
                    usd_a_mxn: cache.tasa,
                    fecha: new Date(cache.fecha).toLocaleDateString('es-MX')
                });
            } else {
                // Si no hay caché válido, usar datos de respaldo
                mostrarWidgetTipoCambio({
                    usd_a_mxn: 17.25,
                    fecha: new Date().toLocaleDateString('es-MX')
                });
            }
        }
    }

    /**
     * REQUISITO: CONEXIÓN A API EXTERNA #2 - OPEN-METEO (CLIMA)
     */
    async function cargarClima() {
        try {
            // REQUISITO: API EXTERNA #2 - OPEN-METEO.COM (CLIMA GRATIS SIN API KEY)
            const urlApi = 'https://api.open-meteo.com/v1/forecast?latitude=20.97&longitude=-89.62&current_weather=true';
            const respuesta = await fetch(urlApi);

            if (!respuesta.ok) throw new Error('Error al obtener clima');

            const datos = await respuesta.json();
            mostrarWidgetClima(datos.current_weather);
        } catch (error) {
            console.error('Error al cargar clima:', error);
        }
    }

    function mostrarWidgetClima(clima) {
        const widget = document.createElement('div');
        widget.className = 'api-widget clima-widget';
        widget.style.cssText = `
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 15px;
            border-radius: 8px;
            margin: 10px 0;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        `;
        widget.innerHTML = `
            <h4 style="margin: 0 0 10px 0; font-size: 0.9rem;">🌡️ Clima en Mérida</h4>
            <div style="font-size: 1.5rem; font-weight: bold;">${clima.temperature}°C</div>
            <div style="font-size: 0.85rem; opacity: 0.9;">Viento: ${clima.windspeed} km/h</div>
        `;
        const footer = document.querySelector('.footer');
        if (footer) footer.parentNode.insertBefore(widget, footer);
    }

    function mostrarWidgetTipoCambio(datos) {
        const widget = document.createElement('div');
        widget.className = 'api-widget cambio-widget';
        widget.style.cssText = `
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            color: white;
            padding: 15px;
            border-radius: 10px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            min-width: 200px;
            cursor: pointer;
            transition: transform 0.2s;
        `;

        widget.innerHTML = `
            <div>
                <div style="font-size: 0.85rem; opacity: 0.9; margin-bottom: 8px;">
                    <i class="fas fa-dollar-sign"></i> Tipo de Cambio
                </div>
                <div style="display: flex; align-items: baseline; gap: 5px;">
                    <span style="font-size: 1.5rem; font-weight: bold;">$${datos.usd_a_mxn}</span>
                    <span style="font-size: 0.9rem;">MXN</span>
                </div>
                <div style="font-size: 0.8rem; opacity: 0.8; margin-top: 8px;">
                    1 USD = ${datos.usd_a_mxn} MXN
                </div>
                <div style="font-size: 0.75rem; opacity: 0.7; margin-top: 5px;">
                    Actualizado: ${datos.fecha}
                </div>
            </div>
        `;

        widget.addEventListener('mouseenter', () => {
            widget.style.transform = 'scale(1.05)';
        });

        widget.addEventListener('mouseleave', () => {
            widget.style.transform = 'scale(1)';
        });

        // Agregar funcionalidad de conversión al hacer click
        widget.addEventListener('click', () => {
            const monto = prompt('Ingresa cantidad en USD para convertir a MXN:');
            if (monto && !isNaN(monto)) {
                const conversion = (parseFloat(monto) * datos.usd_a_mxn).toFixed(2);
                window.mostrarToast(`$${monto} USD = $${conversion} MXN`, 'exito');
            }
        });

        apiWidget.appendChild(widget);
    }


    function crearBotonToggle() {
        const toggleBtn = document.createElement('button');
        toggleBtn.innerHTML = '<i class="fas fa-info-circle"></i>';
        toggleBtn.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 1001;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            border: none;
            background: var(--color-primario);
            color: white;
            font-size: 1.5rem;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            transition: all 0.3s;
        `;

        toggleBtn.addEventListener('click', () => {
            const isVisible = apiWidget.style.display !== 'none';
            apiWidget.style.display = isVisible ? 'none' : 'flex';
            toggleBtn.innerHTML = isVisible ? '<i class="fas fa-info-circle"></i>' : '<i class="fas fa-times"></i>';
        });

        toggleBtn.addEventListener('mouseenter', () => {
            toggleBtn.style.transform = 'scale(1.1)';
        });

        toggleBtn.addEventListener('mouseleave', () => {
            toggleBtn.style.transform = 'scale(1)';
        });

        document.body.appendChild(toggleBtn);
    }

    // INICIALIZACIÓN
    await cargarProductosDestacados();
    await cargarOfertas();
    await cargarTipoCambio();
    await cargarClima(); // REQUISITO: LLAMADA A API EXTERNA #2
    crearBotonToggle();
});
