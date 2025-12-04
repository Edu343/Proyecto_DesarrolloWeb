/**
 * Inicio - Página Principal
 * Incluye: Productos destacados + APIs de Terceros (Funcionalidad Extra #1)
 * API 1: OpenWeatherMap (Clima)
 * API 2: ExchangeRate-API (Tipo de Cambio)
 */

document.addEventListener('DOMContentLoaded', async () => {
    const productosDestacadosContainer = document.getElementById('productos-destacados');

    // ========================================
    // PRODUCTOS DESTACADOS (con AJAX)
    // ========================================

    async function cargarProductosDestacados() {
        try {
            const response = await Ajax.get('/Proyecto_DesarrolloWeb/php/api/productos.php', {
                action: 'destacados',
                limite: 6
            });

            if (response.success && response.data.length > 0) {
                renderProductos(response.data);
            } else {
                // Usar productos de respaldo
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
                    window.Carrito.agregar(producto);
                }
            });
        });
    }

    // ========================================
    // CATEGORÍAS CLICKEABLES
    // ========================================

    document.querySelectorAll('.categoria-card').forEach(card => {
        card.addEventListener('click', (e) => {
            const categoria = e.currentTarget.dataset.categoria;
            window.location.href = `productos.html?categoria=${categoria}`;
        });
    });

    // ========================================
    // FUNCIONALIDAD EXTRA #1: APIs DE TERCEROS
    // ========================================

    // Widget para mostrar información de APIs
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
     * API 1: OpenWeatherMap - Clima actual
     * https://openweathermap.org/api
     */
    async function cargarClima() {
        try {
            // API Key de ejemplo (reemplazar con una real)
            const API_KEY = 'demo'; // Usar 'demo' para propósitos de ejemplo
            const ciudad = 'Merida,MX';

            // Para demo, usamos datos simulados
            const climaData = {
                temp: 28,
                description: 'Soleado',
                icon: '01d',
                humidity: 65
            };

            mostrarWidgetClima(climaData);

            /* Código real (descomentar con API key válida):
            const url = `https://api.openweathermap.org/data/2.5/weather?q=${ciudad}&appid=${API_KEY}&units=metric&lang=es`;
            const response = await fetch(url);
            const data = await response.json();

            const climaData = {
                temp: Math.round(data.main.temp),
                description: data.weather[0].description,
                icon: data.weather[0].icon,
                humidity: data.main.humidity
            };

            mostrarWidgetClima(climaData);
            */

        } catch (error) {
            console.error('Error al cargar clima:', error);
        }
    }

    function mostrarWidgetClima(data) {
        const widget = document.createElement('div');
        widget.className = 'api-widget clima-widget';
        widget.style.cssText = `
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 15px;
            border-radius: 10px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            min-width: 200px;
            cursor: pointer;
            transition: transform 0.2s;
        `;

        widget.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: space-between;">
                <div>
                    <div style="font-size: 0.85rem; opacity: 0.9;">Mérida, Yuc.</div>
                    <div style="font-size: 2rem; font-weight: bold;">${data.temp}°C</div>
                    <div style="font-size: 0.9rem; text-transform: capitalize;">${data.description}</div>
                    <div style="font-size: 0.8rem; opacity: 0.8; margin-top: 5px;">
                        <i class="fas fa-tint"></i> Humedad: ${data.humidity}%
                    </div>
                </div>
                <div style="font-size: 3rem;">
                    ${data.temp > 25 ? '☀️' : '⛅'}
                </div>
            </div>
        `;

        widget.addEventListener('mouseenter', () => {
            widget.style.transform = 'scale(1.05)';
        });

        widget.addEventListener('mouseleave', () => {
            widget.style.transform = 'scale(1)';
        });

        apiWidget.appendChild(widget);
    }

    /**
     * API 2: ExchangeRate-API - Tipo de Cambio
     * https://www.exchangerate-api.com/
     */
    async function cargarTipoCambio() {
        try {
            // Para demo, usamos datos simulados
            const tasaData = {
                usd_to_mxn: 17.25,
                fecha: new Date().toLocaleDateString('es-MX')
            };

            mostrarWidgetTipoCambio(tasaData);

            /* Código real (descomentar para usar API real):
            const url = 'https://api.exchangerate-api.com/v4/latest/USD';
            const response = await fetch(url);
            const data = await response.json();

            const tasaData = {
                usd_to_mxn: data.rates.MXN.toFixed(2),
                fecha: new Date(data.date).toLocaleDateString('es-MX')
            };

            mostrarWidgetTipoCambio(tasaData);

            // Guardar en localStorage para caché
            Storage.set('tipo_cambio', {
                tasa: tasaData.usd_to_mxn,
                fecha: Date.now()
            });
            */

        } catch (error) {
            console.error('Error al cargar tipo de cambio:', error);

            // Intentar cargar del caché
            const cache = Storage.get('tipo_cambio');
            if (cache && (Date.now() - cache.fecha) < 86400000) { // 24 horas
                mostrarWidgetTipoCambio({
                    usd_to_mxn: cache.tasa,
                    fecha: new Date(cache.fecha).toLocaleDateString('es-MX')
                });
            }
        }
    }

    function mostrarWidgetTipoCambio(data) {
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
                    <span style="font-size: 1.5rem; font-weight: bold;">$${data.usd_to_mxn}</span>
                    <span style="font-size: 0.9rem;">MXN</span>
                </div>
                <div style="font-size: 0.8rem; opacity: 0.8; margin-top: 8px;">
                    1 USD = ${data.usd_to_mxn} MXN
                </div>
                <div style="font-size: 0.75rem; opacity: 0.7; margin-top: 5px;">
                    Actualizado: ${data.fecha}
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
                const conversion = (parseFloat(monto) * data.usd_to_mxn).toFixed(2);
                window.mostrarToast(`$${monto} USD = $${conversion} MXN`, 'exito');
            }
        });

        apiWidget.appendChild(widget);
    }

    /**
     * Botón para ocultar/mostrar widgets
     */
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

    // ========================================
    // INICIALIZACIÓN
    // ========================================

    await cargarProductosDestacados();
    await cargarClima();
    await cargarTipoCambio();
    crearBotonToggle();
});
