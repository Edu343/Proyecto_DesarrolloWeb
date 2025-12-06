document.addEventListener('DOMContentLoaded', () => {
    const formContacto = document.getElementById('form-contacto');
    const asuntoSelect = document.getElementById('asunto-select');
    const camposDano = document.getElementById('campos-dano');
    const uploadArea = document.getElementById('upload-area');
    const fotosInput = document.getElementById('fotos-input');
    const previewFotos = document.getElementById('preview-fotos');

    let archivosSeleccionados = [];

    // Mostrar/ocultar campos de daño según el asunto
    if (asuntoSelect) {
        asuntoSelect.addEventListener('change', () => {
            if (asuntoSelect.value === 'dano_producto') {
                camposDano.style.display = 'block';
            } else {
                camposDano.style.display = 'none';
                archivosSeleccionados = [];
                previewFotos.innerHTML = '';
            }
        });
    }

    // Click en área de upload
    if (uploadArea) {
        uploadArea.addEventListener('click', () => {
            fotosInput.click();
        });

        // Drag & Drop
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('drag-over');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('drag-over');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('drag-over');

            const files = Array.from(e.dataTransfer.files);
            agregarArchivos(files);
        });
    }

    // Selección de archivos
    if (fotosInput) {
        fotosInput.addEventListener('change', (e) => {
            const files = Array.from(e.target.files);
            agregarArchivos(files);
        });
    }

    function agregarArchivos(files) {
        const maxFiles = 5;
        const maxSize = 5 * 1024 * 1024; // 5MB
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

        // Filtrar archivos válidos
        for (let file of files) {
            // Validar cantidad
            if (archivosSeleccionados.length >= maxFiles) {
                window.mostrarToast(`Máximo ${maxFiles} fotos permitidas`, 'error');
                break;
            }

            // Validar tipo
            if (!allowedTypes.includes(file.type)) {
                window.mostrarToast(`${file.name}: Tipo de archivo no permitido`, 'error');
                continue;
            }

            // Validar tamaño
            if (file.size > maxSize) {
                window.mostrarToast(`${file.name}: Tamaño máximo 5MB`, 'error');
                continue;
            }

            archivosSeleccionados.push(file);
        }

        actualizarPreview();
    }

    function actualizarPreview() {
        previewFotos.innerHTML = '';

        archivosSeleccionados.forEach((file, index) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                const previewItem = document.createElement('div');
                previewItem.className = 'preview-item';
                previewItem.innerHTML = `
                    <img src="${e.target.result}" alt="${file.name}">
                    <button type="button" class="btn-eliminar-foto" data-index="${index}">
                        <i class="fas fa-times"></i>
                    </button>
                    <div class="nombre-archivo">${file.name}</div>
                `;

                previewFotos.appendChild(previewItem);

                // Event listener para eliminar
                previewItem.querySelector('.btn-eliminar-foto').addEventListener('click', () => {
                    eliminarFoto(index);
                });
            };

            reader.readAsDataURL(file);
        });

        // Actualizar el input file
        const dataTransfer = new DataTransfer();
        archivosSeleccionados.forEach(file => dataTransfer.items.add(file));
        fotosInput.files = dataTransfer.files;
    }

    function eliminarFoto(index) {
        archivosSeleccionados.splice(index, 1);
        actualizarPreview();
        window.mostrarToast('Foto eliminada', 'info');
    }

    // Submit del formulario
    if (formContacto) {
        formContacto.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = new FormData(formContacto);
            const asunto = formData.get('asunto');

            // Si no es reporte de daño, limpiar archivos
            if (asunto !== 'dano_producto') {
                formData.delete('fotos[]');
                formData.delete('pedido_id');
            }

            try {
                const response = await fetch('../php/api/contacto.php?action=enviar', {
                    method: 'POST',
                    body: formData
                });

                const result = await response.json();

                if (result.success) {
                    window.mostrarToast(result.message, 'exito');
                    formContacto.reset();
                    archivosSeleccionados = [];
                    previewFotos.innerHTML = '';
                    camposDano.style.display = 'none';
                } else {
                    window.mostrarToast(result.message || 'Error al enviar mensaje', 'error');
                }
            } catch (error) {
                console.error('Error:', error);
                window.mostrarToast('Error al enviar mensaje. Intenta nuevamente.', 'error');
            }
        });
    }
});