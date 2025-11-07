document.addEventListener('DOMContentLoaded', () => {
    const productosDestacadosContainer = document.getElementById('productos-destacados');

    const productosSimulados = [
        { id: 101, nombre: "Taladro Percutor Bosch", categoria: "Herramientas", precio: 1599.00, disponible: true },
        { id: 102, nombre: "Set de Llaves Truper", categoria: "Herramientas", precio: 450.00, disponible: true },
        { id: 103, nombre: "Pintura Vinílica Blanca (19L)", categoria: "Pinturas", precio: 950.00, disponible: false },
        { id: 104, nombre: "Martillo de Uña Stanley", categoria: "Herramientas", precio: 220.00, disponible: true }
    ];

    if (productosDestacadosContainer) {
        productosSimulados.forEach(producto => {
            const card = document.createElement('div');
            card.classList.add('producto-card');
            
            const disponibilidadText = producto.disponible ? 'Agregar' : 'Agotado';

            card.innerHTML = `
                <div class="producto-imagen"><i class="fas fa-box-open"></i></div>
                <div class="producto-info">
                    <h3 class="producto-nombre">${producto.nombre}</h3>
                    <div class="producto-precio">$${producto.precio.toFixed(2)}</div>
                    <div class="producto-acciones">
                        <button class="btn btn-primario" data-id="${producto.id}" ${!producto.disponible ? 'disabled' : ''}>
                            <i class="fas fa-cart-plus"></i> ${disponibilidadText}
                        </button>
                    </div>
                </div>
            `;
            productosDestacadosContainer.appendChild(card);
        });
    }

    document.querySelectorAll('.producto-card button').forEach(button => {
        button.addEventListener('click', (e) => {
            const id = parseInt(e.currentTarget.dataset.id);
            const producto = productosSimulados.find(p => p.id === id);
            
            if (producto) {
                let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
                const itemExistente = carrito.find(item => item.id === id);

                if (itemExistente) {
                    itemExistente.cantidad += 1;
                } else {
                    carrito.push({ ...producto, cantidad: 1 });
                }

                localStorage.setItem('carrito', JSON.stringify(carrito));
                window.actualizarContadorCarrito();
                window.mostrarToast(`${producto.nombre} agregado al carrito`, 'exito');
            }
        });
    });
    
    document.querySelectorAll('.categoria-card').forEach(card => {
        card.addEventListener('click', (e) => {
            const categoria = e.currentTarget.dataset.categoria;
            window.location.href = `productos.html?categoria=${categoria}`;
        });
    });
});