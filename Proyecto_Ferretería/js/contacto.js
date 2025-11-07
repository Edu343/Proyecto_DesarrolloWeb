document.addEventListener('DOMContentLoaded', () => {
    const formContacto = document.getElementById('form-contacto');

    if (formContacto) {
        formContacto.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const data = new FormData(formContacto);
            const nombre = data.get('nombre');

            window.mostrarToast(`Mensaje enviado por ${nombre}. Gracias.`, 'exito');
            formContacto.reset();
        });
    }
});