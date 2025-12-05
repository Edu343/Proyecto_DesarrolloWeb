/**
 * Login y Registro con Validación Completa
 * Incluye validación en tiempo real y AJAX
 */

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const redirectTo = urlParams.get('redirect');

    const user = Storage.get('user');
    if (user && user.id) {
        if (redirectTo) {
            window.location.href = `${redirectTo}.html`;
        } else {
            window.location.href = 'index.html';
        }
        return;
    }

    const formLogin = document.getElementById('form-login');
    const formRegistro = document.getElementById('form-registro');
    const registroBox = document.getElementById('registro-box');
    const loginBox = document.querySelector('.login-box:first-child');

    const mostrarRegistro = document.getElementById('mostrar-registro');
    const mostrarLogin = document.getElementById('mostrar-login');

    mostrarRegistro.addEventListener('click', (e) => {
        e.preventDefault();
        loginBox.style.display = 'none';
        registroBox.style.display = 'block';
    });

    mostrarLogin.addEventListener('click', (e) => {
        e.preventDefault();
        registroBox.style.display = 'none';
        loginBox.style.display = 'block';
    });

    document.querySelectorAll('.toggle-password').forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.dataset.target;
            const input = document.getElementById(targetId);
            const icon = btn.querySelector('i');

            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    });


    // VALIDACIÓN EN TIEMPO REAL
    ['login-email', 'registro-email'].forEach(id => {
        const input = document.getElementById(id);
        input.addEventListener('blur', () => {
            const errorSpan = document.getElementById(`error-${id}`);
            if (!Validacion.requerido(input.value)) {
                mostrarError(errorSpan, 'El email es requerido');
            } else if (!Validacion.email(input.value)) {
                mostrarError(errorSpan, 'Email inválido');
            } else {
                limpiarError(errorSpan);
            }
        });
    });

    // Validar nombre
    const nombreInput = document.getElementById('registro-nombre');
    nombreInput.addEventListener('blur', () => {
        const errorSpan = document.getElementById('error-registro-nombre');
        if (!Validacion.requerido(nombreInput.value)) {
            mostrarError(errorSpan, 'El nombre es requerido');
        } else if (nombreInput.value.trim().length < 3) {
            mostrarError(errorSpan, 'El nombre debe tener al menos 3 caracteres');
        } else {
            limpiarError(errorSpan);
        }
    });

    // Validar teléfono
    const telefonoInput = document.getElementById('registro-telefono');
    telefonoInput.addEventListener('input', () => {
        // Solo permitir números
        telefonoInput.value = telefonoInput.value.replace(/\D/g, '');
    });

    telefonoInput.addEventListener('blur', () => {
        const errorSpan = document.getElementById('error-registro-telefono');
        if (telefonoInput.value && !Validacion.telefono(telefonoInput.value)) {
            mostrarError(errorSpan, 'Teléfono debe tener 10 dígitos');
        } else {
            limpiarError(errorSpan);
        }
    });

    // Validar contraseña
    const passwordInputs = ['login-password', 'registro-password'];
    passwordInputs.forEach(id => {
        const input = document.getElementById(id);
        input.addEventListener('blur', () => {
            const errorSpan = document.getElementById(`error-${id}`);
            if (!Validacion.requerido(input.value)) {
                mostrarError(errorSpan, 'La contraseña es requerida');
            } else if (id === 'registro-password' && !Validacion.password(input.value)) {
                mostrarError(errorSpan, 'La contraseña debe tener mínimo 8 caracteres, una mayúscula, una minúscula y un número');
            } else {
                limpiarError(errorSpan);
            }
        });
    });

    // Validar confirmación de contraseña
    const passwordConfirm = document.getElementById('registro-password-confirm');
    passwordConfirm.addEventListener('blur', () => {
        const password = document.getElementById('registro-password').value;
        const errorSpan = document.getElementById('error-registro-password-confirm');

        if (!Validacion.requerido(passwordConfirm.value)) {
            mostrarError(errorSpan, 'Debes confirmar la contraseña');
        } else if (password !== passwordConfirm.value) {
            mostrarError(errorSpan, 'Las contraseñas no coinciden');
        } else {
            limpiarError(errorSpan);
        }
    });


    // MANEJO DE FORMULARIOS

    // Login
    formLogin.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        // Validación básica
        if (!Validacion.email(email)) {
            window.mostrarToast('Email inválido', 'error');
            return;
        }

        if (!Validacion.requerido(password)) {
            window.mostrarToast('La contraseña es requerida', 'error');
            return;
        }

        try {
            // Deshabilitar botón
            const submitBtn = formLogin.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Iniciando sesión...';

            const response = await Ajax.post('/Proyecto_DesarrolloWeb/php/api/auth.php?action=login', {
                email: email,
                password: password,
                csrf_token: Auth.csrfToken
            });

            if (response.success) {
                // Guardar usuario en storage
                Storage.set('user', response.user);
                window.mostrarToast('¡Bienvenido!', 'exito');

                // Redireccionar después de 1 segundo
                setTimeout(() => {
                    if (redirectTo) {
                        window.location.href = `${redirectTo}.html`;
                    } else {
                        window.location.href = 'index.html';
                    }
                }, 1000);
            } else {
                window.mostrarToast(response.message || 'Error al iniciar sesión', 'error');
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Iniciar Sesión';
            }

        } catch (error) {
            console.error('Error en login:', error);
            window.mostrarToast('Error al conectar con el servidor', 'error');
            const submitBtn = formLogin.querySelector('button[type="submit"]');
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Iniciar Sesión';
        }
    });

    // Registro
    formRegistro.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nombre = document.getElementById('registro-nombre').value;
        const email = document.getElementById('registro-email').value;
        const telefono = document.getElementById('registro-telefono').value;
        const password = document.getElementById('registro-password').value;
        const passwordConfirm = document.getElementById('registro-password-confirm').value;

        // Validaciones
        if (!Validacion.requerido(nombre) || nombre.length < 3) {
            window.mostrarToast('El nombre debe tener al menos 3 caracteres', 'error');
            return;
        }

        if (!Validacion.email(email)) {
            window.mostrarToast('Email inválido', 'error');
            return;
        }

        if (telefono && !Validacion.telefono(telefono)) {
            window.mostrarToast('Teléfono inválido (debe tener 10 dígitos)', 'error');
            return;
        }

        if (!Validacion.password(password)) {
            window.mostrarToast('La contraseña no cumple con los requisitos', 'error');
            return;
        }

        if (password !== passwordConfirm) {
            window.mostrarToast('Las contraseñas no coinciden', 'error');
            return;
        }

        try {
            const submitBtn = formRegistro.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Registrando...';

            const response = await Ajax.post('/Proyecto_DesarrolloWeb/php/api/auth.php?action=register', {
                nombre: nombre,
                email: email,
                telefono: telefono || null,
                password: password,
                csrf_token: Auth.csrfToken
            });

            if (response.success) {
                window.mostrarToast('¡Cuenta creada! Ahora puedes iniciar sesión', 'exito');

                // Limpiar formulario
                formRegistro.reset();

                // Mostrar formulario de login
                setTimeout(() => {
                    registroBox.style.display = 'none';
                    loginBox.style.display = 'block';
                    // Pre-llenar email
                    document.getElementById('login-email').value = email;
                }, 1500);
            } else {
                window.mostrarToast(response.message || 'Error al registrar', 'error');
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-user-plus"></i> Registrarse';
            }

        } catch (error) {
            console.error('Error en registro:', error);
            window.mostrarToast('Error al conectar con el servidor', 'error');
            const submitBtn = formRegistro.querySelector('button[type="submit"]');
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-user-plus"></i> Registrarse';
        }
    });


    // FUNCIONES AUXILIARES
    function mostrarError(element, mensaje) {
        element.textContent = mensaje;
        element.style.display = 'block';
        element.parentElement.querySelector('input')?.classList.add('input-error');
    }

    function limpiarError(element) {
        element.textContent = '';
        element.style.display = 'none';
        element.parentElement.querySelector('input')?.classList.remove('input-error');
    }
});
