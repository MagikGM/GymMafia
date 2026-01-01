document.addEventListener('DOMContentLoaded', function () {

    // ======================================================
    // 1. ELEMENTOS DEL DOM
    // ======================================================

    // Modal Inscripción
    const inscripcionModal = document.getElementById('inscripcion-modal');
    const inscripcionCloseBtn = document.getElementById('modal-close-btn');
    const inscripcionForm = document.getElementById('inscripcion-form');
    const planSelect = document.getElementById('plan-select');
    const successInscripcion = document.getElementById('form-success-message');
    const inscribeteBtns = document.querySelectorAll('.btn-inscribete');

    // Modal Auth (Login/Registro)
    const authModal = document.getElementById('auth-modal');
    const authCloseBtn = document.getElementById('auth-modal-close-btn');
    const authTrigger = document.getElementById('auth-modal-trigger');
    const loginView = document.getElementById('login-view');
    const registerView = document.getElementById('register-view');
    const authSuccess = document.getElementById('auth-success-message');
    
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const loginMessage = document.getElementById('login-message');

    const linkToRegister = document.getElementById('show-register-view');
    const linkToLogin = document.getElementById('show-login-view');

    const btnLogout = document.getElementById('btn-logout');

    // Elementos de Cuenta
    const lblPlan = document.getElementById('m-plan');
    const lblEstado = document.getElementById('m-estado');
    const lblVence = document.getElementById('m-vencimiento');
    const btnAccion = document.getElementById('m-btn-accion');
    const btnCancelar = document.getElementById('m-btn-cancelar');

    // Elementos Admin
    const adminTableBody = document.getElementById('admin-users-body');
    const btnAdminLogout = document.getElementById('admin-logout');
    const emptyMsg = document.getElementById('admin-empty-msg');


    // ======================================================
    // 2. FUNCIONES AUXILIARES (MANEJO DE DATOS)
    // ======================================================

    // Obtener lista de usuarios
    function getUsers() {
        const users = localStorage.getItem('gym_users_list');
        return users ? JSON.parse(users) : [];
    }

    // Guardar lista de usuarios
    function saveUsers(usersArray) {
        localStorage.setItem('gym_users_list', JSON.stringify(usersArray));
    }

    // Obtener usuario actual (Logueado)
    function getCurrentUser() {
        const emailActivo = localStorage.getItem('sesionActiva');
        if (!emailActivo || emailActivo === 'admin') return null;
        
        const users = getUsers();
        return users.find(u => u.email === emailActivo);
    }

    // Actualizar datos del usuario actual
    function updateCurrentUser(newData) {
        const emailActivo = localStorage.getItem('sesionActiva');
        let users = getUsers();
        const index = users.findIndex(u => u.email === emailActivo);
        
        if (index !== -1) {
            users[index] = { ...users[index], ...newData }; // Mezclar datos viejos con nuevos
            saveUsers(users);
            return true;
        }
        return false;
    }


    // ======================================================
    // 3. MODALES Y NAVEGACIÓN
    // ======================================================

    function mostrarLogin(mensajeRojo = '') {
        if(authModal) {
            authModal.classList.add('active');
            loginView.style.display = 'block';
            registerView.style.display = 'none';
            authSuccess.style.display = 'none';
            
            if (mensajeRojo) {
                loginMessage.style.display = 'block';
                loginMessage.style.color = 'red';
                loginMessage.textContent = mensajeRojo;
            } else {
                loginMessage.style.display = 'none';
            }
        }
    }

    if(authTrigger) {
        authTrigger.addEventListener('click', function (e) {
            e.preventDefault();
            const sesion = localStorage.getItem('sesionActiva');

            if (sesion === 'admin') {
                window.location.href = 'admin.html';
            } else if (sesion) {
                window.location.href = 'cuenta.html';
            } else {
                mostrarLogin();
            }
        });
    }

    // Cierre de Modales
    const cerrarModales = () => {
        if(inscripcionModal) inscripcionModal.classList.remove('active');
        if(authModal) authModal.classList.remove('active');
    };
    
    if(inscripcionCloseBtn) inscripcionCloseBtn.addEventListener('click', cerrarModales);
    if(authCloseBtn) authCloseBtn.addEventListener('click', cerrarModales);
    window.addEventListener('click', (e) => {
        if(e.target === inscripcionModal || e.target === authModal) cerrarModales();
    });

    // Links Login/Registro
    if(linkToRegister) linkToRegister.addEventListener('click', () => {
        loginView.style.display = 'none';
        registerView.style.display = 'block';
        authSuccess.style.display = 'none';
    });

    if(linkToLogin) linkToLogin.addEventListener('click', () => {
        registerView.style.display = 'none';
        loginView.style.display = 'block';
        authSuccess.style.display = 'none';
        loginMessage.style.display = 'none';
    });


    // ======================================================
    // 4. REGISTRO DE USUARIOS (PUSH AL ARRAY)
    // ======================================================

    if (registerForm) {
        registerForm.addEventListener('submit', function (e) {
            e.preventDefault();
            
            const nombre = document.getElementById('register-nombre').value;
            const email = document.getElementById('register-email').value.trim();
            const pass = document.getElementById('register-password').value;
            const confirmPass = document.getElementById('register-confirm-password').value;

            if (pass !== confirmPass) {
                alert('Las contraseñas no coinciden');
                return;
            }

            // Obtener usuarios actuales
            const users = getUsers();

            // Verificar si el correo ya existe
            if (users.some(u => u.email === email) || email === 'admin@admin.com') {
                alert('Este correo ya está registrado.');
                return;
            }

            // CREAR NUEVO USUARIO
            const newUser = {
                nombre: nombre,
                email: email,
                password: pass,
                plan: null,       // Sin plan al inicio
                status: 'Inactiva',
                vence: null
            };

            // AGREGAR A LA LISTA
            users.push(newUser);
            saveUsers(users);

            // Éxito
            registerView.style.display = 'none';
            authSuccess.style.display = 'block';
            authSuccess.querySelector('p').textContent = '¡Cuenta creada! Ahora inicia sesión.';
            
            setTimeout(() => {
                authSuccess.style.display = 'none';
                mostrarLogin(); 
            }, 2000);
        });
    }


    // ======================================================
    // 5. LOGIN (BUSCAR EN ARRAY)
    // ======================================================

    if (loginForm) {
        loginForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const inputEmail = document.getElementById('login-email').value.trim();
            const inputPass = document.getElementById('login-password').value;

            // A) LOGIN DE ADMIN
            if (inputEmail === 'admin@admin.com' && inputPass === 'admin123') {
                localStorage.setItem('sesionActiva', 'admin');
                window.location.href = 'admin.html';
                return;
            }

            // B) LOGIN DE USUARIOS
            const users = getUsers();
            const foundUser = users.find(u => u.email === inputEmail);

            if (!foundUser) {
                loginMessage.style.display = 'block';
                loginMessage.textContent = '⚠️ No hay ninguna cuenta vinculada a este correo.';
                return;
            }

            if (foundUser.password === inputPass) {
                // GUARDAR SESIÓN (Solo guardamos el correo para identificarlo)
                localStorage.setItem('sesionActiva', foundUser.email);
                
                loginView.style.display = 'none';
                authSuccess.style.display = 'block';
                authSuccess.querySelector('p').textContent = '¡Bienvenido de nuevo!';
                setTimeout(() => window.location.href = 'cuenta.html', 1000);
            } else {
                loginMessage.style.display = 'block';
                loginMessage.textContent = '❌ Contraseña incorrecta';
            }
        });
    }


    // ======================================================
    // 6. INSCRIPCIÓN A PLANES (ACTUALIZAR USUARIO ESPECÍFICO)
    // ======================================================

    inscribeteBtns.forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            const sesion = localStorage.getItem('sesionActiva');

            if (sesion && sesion !== 'admin') {
                // ABRIR MODAL
                const plan = this.getAttribute('data-plan');
                if(inscripcionForm) {
                    inscripcionForm.style.display = 'block';
                    inscripcionForm.reset();
                }
                if(successInscripcion) successInscripcion.style.display = 'none';
                
                if (plan) planSelect.value = plan;
                else planSelect.value = 'general';

                inscripcionModal.classList.add('active');
            } else {
                mostrarLogin("⚠️ Primero debes iniciar sesión para inscribirte");
            }
        });
    });

    if(inscripcionForm) {
        inscripcionForm.addEventListener('submit', function(e){
            e.preventDefault();
            
            const planNombre = planSelect.options[planSelect.selectedIndex].text;
            const planValor = planSelect.value;

            if(planValor === 'general') {
                alert("Selecciona un plan válido");
                return;
            }

            // Calcular fecha
            const hoy = new Date();
            const vencimiento = new Date(hoy.setDate(hoy.getDate() + 30));
            const fechaTexto = vencimiento.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });

            // ACTUALIZAR EL USUARIO ACTUAL EN LA LISTA
            updateCurrentUser({
                plan: planNombre,
                status: 'Activa',
                vence: fechaTexto
            });

            inscripcionForm.style.display = 'none';
            successInscripcion.style.display = 'block';
            
            // Si estamos en cuenta.html, recargar para ver cambios
            if(lblPlan) {
                setTimeout(() => location.reload(), 1500);
            }
        });
    }


    // ======================================================
    // 7. PÁGINA DE CUENTA (MOSTRAR DATOS DEL USUARIO ACTIVO)
    // ======================================================

    if (lblPlan && lblEstado) {
        const user = getCurrentUser();

        function renderCuenta() {
            if (user.plan && user.status === 'Activa') {
                // CON PLAN
                lblPlan.textContent = user.plan;
                lblEstado.innerHTML = 'Estado: <strong style="color: #28a745;">Activa</strong>';
                lblVence.textContent = 'Vence: ' + user.vence;
                
                btnAccion.textContent = "Renovar Plan";
                btnAccion.onclick = () => inscripcionModal.classList.add('active');
                
                btnCancelar.style.display = 'block';
                btnCancelar.onclick = () => {
                    if(confirm("¿Cancelar tu plan actual?")) {
                        updateCurrentUser({ plan: null, status: 'Inactiva', vence: null });
                        location.reload();
                    }
                };
            } else {
                // SIN PLAN
                lblPlan.textContent = "Sin Membresía";
                lblEstado.innerHTML = 'Estado: <strong style="color: red;">Inactiva</strong>';
                lblVence.textContent = "Vence: --/--/--";
                
                btnAccion.textContent = "Ver Planes";
                btnAccion.onclick = () => window.location.href = 'index.html#planes';
                btnCancelar.style.display = 'none';
            }

            // Mostrar nombre en el título
            const nombreDisplay = document.getElementById('user-email-display');
            if(nombreDisplay) nombreDisplay.textContent = user.nombre;
        }

        if(user) renderCuenta();
    }

    if(btnLogout) {
        btnLogout.addEventListener('click', function() {
            localStorage.removeItem('sesionActiva');
            window.location.href = 'index.html';
        });
    }


    // ======================================================
    // 8. PANEL DE ADMINISTRADOR (TABLA COMPLETA)
    // ======================================================

    if (adminTableBody) {
        
        function renderAdminPanel() {
            adminTableBody.innerHTML = '';
            const users = getUsers();

            if (users.length > 0) {
                if(emptyMsg) emptyMsg.style.display = 'none';

                // Loop para crear fila por cada usuario
                users.forEach((u, index) => {
                    const fila = document.createElement('tr');
                    fila.innerHTML = `
                        <td>${u.nombre}</td>
                        <td>${u.email}</td>
                        <td>${u.plan ? u.plan : '<span style="color:gray">Sin Plan</span>'}</td>
                        <td>${u.status === 'Activa' ? '<span style="color:green; font-weight:bold;">● Activo</span>' : '<span style="color:red; font-weight:bold;">● Inactivo</span>'}</td>
                        <td>
                            <button onclick="adminDeletePlan(${index})" class="btn-action btn-delete-plan" ${!u.plan ? 'disabled style="opacity:0.5"' : ''}>Quitar Plan</button>
                            <button onclick="adminDeleteUser(${index})" class="btn-action btn-delete-user">Eliminar</button>
                        </td>
                    `;
                    adminTableBody.appendChild(fila);
                });
            } else {
                if(emptyMsg) {
                    emptyMsg.style.display = 'block';
                    emptyMsg.textContent = "No hay usuarios registrados en el sistema.";
                }
            }
        }

        renderAdminPanel();

        // --- FUNCIONES GLOBALES DEL ADMIN ---

        window.adminDeletePlan = function(index) {
            if(confirm("¿Quitar el plan a este usuario?")) {
                let users = getUsers();
                users[index].plan = null;
                users[index].status = 'Inactiva';
                users[index].vence = null;
                saveUsers(users);
                renderAdminPanel();
            }
        };

        window.adminDeleteUser = function(index) {
            if(confirm("¿Eliminar usuario permanentemente?")) {
                let users = getUsers();
                // Si el usuario que borramos es el que está logueado, cerramos su sesión
                const deletedUserEmail = users[index].email;
                if(localStorage.getItem('sesionActiva') === deletedUserEmail) {
                    localStorage.removeItem('sesionActiva');
                }

                users.splice(index, 1); // Borrar del array
                saveUsers(users);
                renderAdminPanel();
            }
        };
    }

    if (btnAdminLogout) {
        btnAdminLogout.addEventListener('click', function() {
            localStorage.removeItem('sesionActiva');
            window.location.href = 'index.html';
        });
    }

});