/**
 * ============================================================================
 * SISTEMA DE GESTIÓN DE CONTACTOS
 * ============================================================================
 * Aplicación web para crear, editar, filtrar y ordenar contactos de usuarios.
 * Incluye sistema de búsqueda en tiempo real, validación de formularios y
 * notificaciones toast.
 * 
 * 
 * @version 1.0.0
 */

document.addEventListener('DOMContentLoaded', () => {

    // ========================================================================
    // I. DATOS Y VARIABLES DE ESTADO
    // ========================================================================
    
    /**
     * Array simulado de usuarios/contactos.
     * En producción, estos datos vendrían de una API o base de datos.
     * @type {Array<{id: number, nombre: string, telefono: number|null, email: string, fecha_cumple: string}>}
     */
    let datosSimulados = [
        { id: 1, nombre: 'Ana García', telefono: 5512345678, email: 'ana.garcia@ejemplo.com', fecha_cumple: '1990-03-15' },
        { id: 2, nombre: 'Luis Pérez', telefono: 5587654321, email: 'luis.perez@ejemplo.com', fecha_cumple: '1985-11-20' },
        { id: 3, nombre: 'Carlos Ruiz', telefono: 5555555555, email: 'carlos.ruiz@ejemplo.com', fecha_cumple: '1992-07-01' },
        { id: 4, nombre: 'María López', telefono: 5599999999, email: 'maria.lopez@ejemplo.com', fecha_cumple: '1990-03-15' },
        { id: 5, nombre: 'Javier Domínguez', telefono: null, email: 'javier.d@ejemplo.com', fecha_cumple: '2000-01-25' },
    ];
    
    /**
     * ID autoincremental para nuevos usuarios.
     * @type {number}
     */
    let nextId = 6;
    
    /**
     * Estado del ordenamiento actual aplicado a la lista.
     * Valores posibles: '', 'nombre', 'fecha_cumple'
     * @type {string}
     */
    let ordenamientoActivo = '';
    
    /**
     * Lista de usuarios filtrados y buscados (pre-ordenamiento).
     * @type {Array}
     */
    let listaUsuariosActual = [];

    /**
     * Mapeo de abreviaturas de meses a números de mes (formato 01-12).
     * Utilizado para convertir filtros de mes del select a formato numérico.
     * @type {Object<string, string>}
     */
    const mesesMapping = {
        "Ene": "01", "Feb": "02", "Mar": "03", "Abr": "04", "May": "05", "Jun": "06",
        "Jul": "07", "Ago": "08", "Sep": "09", "Oct": "10", "Nov": "11", "Dic": "12"
    };


    // ========================================================================
    // II. REFERENCIAS DEL DOM (CONSTANTES)
    // ========================================================================

    /* Contenedor principal de la lista de usuarios (grid de tarjetas). */
    const listaUsuariosDiv = document.getElementById('lista-usuarios');

    /* Elemento <main> que contiene el contenido principal. Se desplaza cuando se abre un panel lateral. */
    const mainContent = document.querySelector('main');

    /* Contenedor donde se insertan las notificaciones toast. */
    const toastContainer = document.getElementById('toast-container');

    /* Referencias a los paneles laterales desplegables de la sidebar. */
    const sidebarPanels = {
        crear: document.getElementById('form-crear-usuario-panel'),
        filtrar: document.getElementById('filtrar-opciones'),
        ordenar: document.getElementById('ordenar-opciones')
    };

    /* Botón del menú principal: Crear Usuario. */
    const crearUsuarioMenuBtn = document.getElementById('crear-usuario-menu-btn');

    /* Botón del menú principal: Filtrar. */
    const filtroMenuBtn = document.getElementById('filtrar-menu-btn');

    /* Botón del menú principal: Ordenar. */
    const ordenarMenuBtn = document.getElementById('ordenar-menu-btn');

    /* Botón del menú principal: Exportar. */
    const exportarMenuBtn = document.getElementById('exportar-menu-btn');

    /* Formulario de creación de nuevos usuarios. */
    const formCrearUsuario = document.getElementById('form-crear-usuario');

    /* Contenedor wrapper del buscador animado. */
    const buscadorWrapper = document.querySelector('.search-wrapper');

    /* Input del buscador (campo de texto). */
    const buscadorInput = document.getElementById('buscador-menu');

    /* Botón/icono del buscador (para activar/desactivar). */
    const buscadorIcon = buscadorWrapper.querySelector('.search-icon');

    /* Input animado del buscador (el que se expande visualmente). */
    const buscadorInputAnimado = document.querySelector('.search-input');

    /* Input del filtro: día de cumpleaños. */
    const filtroDiaInput = document.getElementById('filtro-dia-menu');

    /* Select del filtro: mes de cumpleaños. */
    const filtroMesSelect = document.getElementById('filtro-mes-menu');

    /* Input del filtro: año de cumpleaños. */
    const filtroAnioInput = document.getElementById('filtro-anio-menu');

    /* Botón para limpiar/resetear todos los filtros de fecha. */
    const limpiarFiltroFechaBtn = document.getElementById('limpiar-filtro-fecha');

    /* Botón para ordenar usuarios por nombre. */
    const ordenarNombreBtn = document.getElementById('ordenar-nombre-btn');

    /* Botón para ordenar usuarios por fecha de cumpleaños. */
    const ordenarFechaBtn = document.getElementById('ordenar-fecha-btn');


    // ========================================================================
    // III. FUNCIONES DE LÓGICA DE NEGOCIO (CRUD SIMULADO)
    // ========================================================================

    /**
     * Carga y renderiza la lista de usuarios aplicando filtros activos.
     * Punto de entrada principal para actualizar la UI de la lista.
     * @function
     */
    const cargarUsuarios = () => {
        filtrarYRenderizarUsuarios();
    };
    
    /**
     * Guarda las modificaciones de un usuario editado.
     * Actualiza el array de datos simulados y recarga la lista.
     * 
     * @function
     * @param {string|number} id - ID del usuario a actualizar
     * @param {HTMLFormElement} formularioElement - Elemento del formulario con los datos editados
     * @returns {void}
     */
    const guardarEdicionUsuario = (id, formularioElement) => {
        // Construir objeto usuario con los datos del formulario
        const usuarioActualizado = {
            id: parseInt(id),
            nombre: formularioElement.querySelector('[name="nombre"]').value,
            // Asegurar que sea number o null
            telefono: formularioElement.querySelector('[name="telefono"]').value 
                ? parseInt(formularioElement.querySelector('[name="telefono"]').value) 
                : null,
            email: formularioElement.querySelector('[name="email"]').value,
            fecha_cumple: formularioElement.querySelector('[name="fecha_cumple"]').value,
        };

        // Buscar y actualizar en el array
        const index = datosSimulados.findIndex(u => u.id === parseInt(id));
        if (index !== -1) {
            datosSimulados[index] = usuarioActualizado;
            mostrarToast(`Contacto ${usuarioActualizado.nombre} actualizado.`, 'exito');
            
            // Recargar la lista para reflejar cambios
            cargarUsuarios(); 
        }
    };

    /**
     * Elimina un usuario del array de datos simulados.
     * Muestra notificación y recarga la lista.
     * 
     * @function
     * @param {string|number} id - ID del usuario a eliminar
     * @returns {void}
     */
    const eliminarUsuario = (id) => {
        const usuarioEliminado = datosSimulados.find(u => u.id === parseInt(id));
        datosSimulados = datosSimulados.filter(u => u.id !== parseInt(id));
        mostrarToast(`Contacto ${usuarioEliminado?.nombre || 'eliminado'} eliminado.`, 'peligro');
        cargarUsuarios(); 
    };
    
    /**
     * Simula la exportación de usuarios a formato CSV.
     * En producción, generaría y descargaría un archivo CSV real.
     * 
     * @function
     * @returns {void}
     */
    const exportarUsuariosCSV = () => {
        console.log("SIMULADO: Generando CSV de usuarios (Revisa la consola).");
        mostrarToast("Exportación a CSV terminada.", 'info');
    };


    // ========================================================================
    // IV. FUNCIONES DE UI Y RENDERIZADO
    // ========================================================================
    
    /**
     * Muestra una notificación tipo toast en la parte superior de la pantalla.
     * El toast aparece con animación, permanece 3 segundos y se elimina automáticamente.
     * 
     * @function
     * @param {string} mensaje - Texto a mostrar en la notificación
     * @param {('exito'|'peligro'|'info')} [tipo='info'] - Tipo de notificación que define el estilo visual
     * @returns {void}
     * 
     * @example
     * mostrarToast('Usuario guardado correctamente', 'exito');
     * mostrarToast('Error al eliminar', 'peligro');
     */
    function mostrarToast(mensaje, tipo = 'info') {
        if (!toastContainer) return;

        // Crear elemento toast
        const toast = document.createElement('div');
        toast.classList.add('toast', tipo);
        toast.textContent = mensaje;
        
        // Añadir al DOM
        toastContainer.appendChild(toast);
        
        // Mostrar con transición (pequeño delay para activar la animación)
        setTimeout(() => {
            toast.classList.add('mostrar');
        }, 10); 

        // Programar ocultamiento y eliminación del DOM
        setTimeout(() => {
            toast.classList.remove('mostrar');
            // Eliminar después de que termine la transición CSS
            toast.addEventListener('transitionend', () => {
                toast.remove();
            }, { once: true });
        }, 3000); // Visible durante 3 segundos
    }


    /**
     * Alterna la visibilidad de un panel lateral específico.
     * Cierra otros paneles abiertos y ajusta el desplazamiento del contenido principal.
     * 
     * @function
     * @param {string} panelId - ID del panel a alternar (debe coincidir con IDs en sidebarPanels)
     * @returns {void}
     * 
     * @example
     * togglePanel('form-crear-usuario-panel'); // Abre/cierra el panel de creación
     */
    function togglePanel(panelId) {
        const targetPanel = document.getElementById(panelId);
        if (!targetPanel) return;

        // Cerrar todos los demás paneles
        Object.values(sidebarPanels).forEach(panel => {
            if (panel && panel.id !== panelId && panel.classList.contains('mostrar')) {
                panel.classList.remove('mostrar');
            }
        });

        // Alternar el panel objetivo
        targetPanel.classList.toggle('mostrar');

        // Desplazar el contenido principal si hay algún panel abierto
        const isAnyPanelOpen = Object.values(sidebarPanels).some(panel => 
            panel && panel.classList.contains('mostrar')
        );

        if (isAnyPanelOpen) {
            mainContent.classList.add('desplazado');
        } else {
            mainContent.classList.remove('desplazado');
        }
    }

    /**
     * Crea el elemento HTML completo de una tarjeta de usuario.
     * Incluye la información visible, detalles ocultos y formulario de edición.
     * 
     * @function
     * @param {Object} usuario - Objeto con los datos del usuario
     * @param {number} usuario.id - ID único del usuario
     * @param {string} usuario.nombre - Nombre completo del usuario
     * @param {number|null} usuario.telefono - Número de teléfono (puede ser null)
     * @param {string} usuario.email - Dirección de correo electrónico
     * @param {string} usuario.fecha_cumple - Fecha de cumpleaños (formato YYYY-MM-DD)
     * @returns {HTMLElement} Elemento div con la tarjeta completa
     * 
     * @example
     * const tarjeta = crearTarjetaUsuario({
     *   id: 1,
     *   nombre: 'Juan Pérez',
     *   telefono: 5512345678,
     *   email: 'juan@ejemplo.com',
     *   fecha_cumple: '1990-05-15'
     * });
     */
    const crearTarjetaUsuario = (usuario) => {
        const usuarioDiv = document.createElement('div');
        usuarioDiv.classList.add('usuario-card');
        usuarioDiv.dataset.usuarioId = usuario.id;

        // Preparar valores para los inputs (convertir null a string vacío)
        const telefonoVal = usuario.telefono !== null ? String(usuario.telefono) : '';
        const emailVal = usuario.email || '';
        const fechaVal = usuario.fecha_cumple || '';

        // Formatear fecha para visualización legible
        const fechaDisplay = usuario.fecha_cumple ? 
			new Date(usuario.fecha_cumple + 'T12:00:00').toLocaleDateString('es-ES', { 
				year: 'numeric', 
				month: 'long', 
				day: 'numeric' 
			}) : 'N/A';

        // Construir HTML de la tarjeta
        usuarioDiv.innerHTML = `
            <!-- Encabezado: Nombre e icono del usuario -->
            <div class="contenedor-nombre-icono">
                <span class="icono-usuario-card">
                    <i data-feather="user"></i>
                </span>
                <h3 class="nombre-usuario-card">${usuario.nombre}</h3>
                
                <!-- Menú de opciones (Editar/Eliminar) -->
                <div class="opciones-card">
                    <button class="menu-opciones-btn">
                        <i data-feather="more-vertical"></i>
                    </button>
                    <div class="menu-desplegable">
                        <ul>
                            <li>
                                <button class="opcion-menu" data-action="editar">
                                    <i data-feather="edit"></i> Editar
                                </button>
                            </li>
                            <li>
                                <button class="opcion-menu opcion-eliminar" data-action="eliminar">
                                    <i data-feather="trash-2"></i> Eliminar
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
            
            <!-- Información detallada (oculta por defecto) -->
            <div class="info-oculta" style="display: none;">
                <p class="detalle-usuario">Teléfono: ${usuario.telefono || 'N/A'}</p>
                <p class="detalle-usuario">Email: ${usuario.email || 'N/A'}</p>
                <p class="detalle-usuario">Fecha de Cumpleaños: ${fechaDisplay}</p>
            </div>
            
            <!-- Formulario de edición (oculto por defecto) -->
            <form class="form-editar-usuario" data-usuario-id="${usuario.id}" style="display: none;">
                <div>
                    <label for="edit-nombre-${usuario.id}">Nombre:</label>
                    <input type="text" id="edit-nombre-${usuario.id}" name="nombre" value="${usuario.nombre}" required>
                </div>
                <div>
                    <label for="edit-telefono-${usuario.id}">Teléfono:</label>
                    <input type="number" id="edit-telefono-${usuario.id}" name="telefono" value="${telefonoVal}">
                </div>
                <div>
                    <label for="edit-email-${usuario.id}">Email:</label>
                    <input type="email" id="edit-email-${usuario.id}" name="email" value="${emailVal}">
                </div>
                <div>
                    <label for="edit-fecha_cumple-${usuario.id}">Fecha de Cumpleaños:</label>
                    <input type="date" id="edit-fecha_cumple-${usuario.id}" name="fecha_cumple" value="${fechaVal}">
                </div>
                <div class="botones-editar">
                    <button type="button" class="cancelar-edicion">Cancelar</button>
                    <button type="submit" class="guardar-edicion">Guardar</button>
                </div>
            </form>
        `;
        
        return usuarioDiv;
    };

    /**
     * Ordena (si hay ordenamiento activo) y renderiza la lista de usuarios en el DOM.
     * Limpia el contenedor y crea tarjetas para cada usuario.
     * * @function
     * @param {Array<Object>} usuarios - Array de usuarios a renderizar
     * @returns {void}
     */
    const renderizarUsuarios = (usuarios) => {
        // Crear copia para no mutar el array original
        let usuariosOrdenados = [...usuarios];

        // Aplicar ordenamiento según estado actual
        if (ordenamientoActivo === 'nombre') {
            usuariosOrdenados.sort((a, b) => a.nombre.localeCompare(b.nombre));
        } else if (ordenamientoActivo === 'fecha_cumple') {
            usuariosOrdenados.sort((a, b) => {
                const dateA = a.fecha_cumple ? new Date(a.fecha_cumple) : new Date(0);
                const dateB = b.fecha_cumple ? new Date(b.fecha_cumple) : new Date(0);
                return dateA - dateB;
            });
        }

        // Limpiar contenedor
        listaUsuariosDiv.innerHTML = '';

        // Mostrar mensaje si no hay usuarios
        if (usuariosOrdenados.length === 0) {
            listaUsuariosDiv.textContent = 'No se encontraron usuarios.';
        }

        // Determinar si hay filtros activos (buscador o filtros de fecha)
        // Si hay un término de búsqueda O si hay algún filtro de fecha aplicado
        const hayFiltrosActivos = buscadorInput.value.trim() !== '' ||
                                filtroDiaInput.value !== '' || 
                                filtroMesSelect.value !== '' || 
                                filtroAnioInput.value !== '';

        // Crear y añadir tarjetas de usuarios
        usuariosOrdenados.forEach(usuario => {
            const usuarioDiv = crearTarjetaUsuario(usuario);
            if (hayFiltrosActivos) {
                const infoOculta = usuarioDiv.querySelector('.info-oculta');
                if (infoOculta) {
                    // Forzar la visibilidad a 'block' para que la información se vea.
                    infoOculta.style.display = 'block'; 
                }
            }
            
            listaUsuariosDiv.appendChild(usuarioDiv);
        });

        // Activar iconos de Feather (si está disponible)
        if (typeof feather !== 'undefined' && feather.replace) { 
            feather.replace();
        }
    };
        
    /**
     * Muestra el formulario de edición para un usuario específico.
     * Oculta otros formularios de edición abiertos y la información detallada.
     * 
     * @function
     * @param {string|number} usuarioId - ID del usuario cuyo formulario se mostrará
     * @returns {void}
     */
    function mostrarFormularioEdicion(usuarioId) {
        // Ocultar todos los demás formularios de edición activos
        document.querySelectorAll('.usuario-card.editando').forEach(card => {
            const form = card.querySelector('.form-editar-usuario');
            if (form) {
                form.style.display = 'none';
                card.classList.remove('editando');
                card.querySelector('.info-oculta').style.display = 'none';
            }
        });
        
        // Obtener la tarjeta del usuario objetivo
        const card = document.querySelector(`.usuario-card[data-usuario-id="${usuarioId}"]`);
        if (!card) return;

        const form = card.querySelector('.form-editar-usuario');
        const infoOculta = card.querySelector('.info-oculta');

        // Verificar que el usuario existe en los datos
        const usuario = datosSimulados.find(u => u.id === parseInt(usuarioId));
        if (usuario) {
            // Los valores ya están en el formulario desde crearTarjetaUsuario
        }

        // Mostrar formulario y marcar tarjeta como en edición
        form.style.display = 'block';
        if (infoOculta) {
            infoOculta.style.display = 'none';
        }
        card.classList.add('editando');
    }

    /**
     * Valida los campos de un formulario (crear/editar) o los filtros de fecha.
     * Comprueba formato de email, teléfono y rangos válidos para día/año.
     * * @function
     * @param {HTMLFormElement} [formulario] - Formulario a validar (opcional para validar filtros)
     * @returns {boolean} true si la validación es exitosa, false en caso contrario
     * * @example
     * // Validar formulario de creación
     * if (validarFormulario(formCrearUsuario)) {
     *   // proceder con la creación
     * }
     * * // Validar filtros de fecha
     * if (validarFormulario()) {
     *   // aplicar filtros
     * }
     */
    function validarFormulario(formulario) {
        let esValido = true;
        const emailInput = formulario?.querySelector('[name="email"]');
        const telefonoInput = formulario?.querySelector('[name="telefono"]');
        let errores = [];

        // === Validación de Email ===
        if (emailInput && emailInput.value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(emailInput.value)) {
                errores.push('Por favor, introduce un correo electrónico válido.');
                esValido = false;
            }
        }

        // === Validación de Teléfono ===
        if (telefonoInput && telefonoInput.value) {
            const telefonoRegex = /^[0-9]{7,15}$/;
            if (!telefonoRegex.test(telefonoInput.value)) {
                errores.push('Por favor, introduce un número telefónico válido (7 a 15 dígitos).');
                esValido = false;
            }
        }

        // === Validación de Filtros de Fecha ===
        const diaFiltroInput = document.getElementById('filtro-dia-menu');
        const anioFiltroInput = document.getElementById('filtro-anio-menu');

        // Solo validar filtros si no estamos validando un formulario específico
        if (formulario === undefined || formulario.id === 'filtrar-opciones') {
            // Validar día (1-31)
			if (diaFiltroInput && diaFiltroInput.value) {
				const diaStr = diaFiltroInput.value.trim();
				
				// Expresión Regular estricta para: 1-9, 01-09, 10-31, PERO TOLERANTE CON SOLO '0' para permitir escribir '01'
				const diaRegex = /^(0?[1-9]|[12]\d|3[01])$/;

                // Permitimos que solo haya un '0' para que el usuario pueda escribir el segundo dígito.
                // Si es solo '0', no se considera un error. Si es '00', sí es un error.
                if (diaStr === '0') {
                    // Temporalmente válido, permitiendo al usuario continuar escribiendo 01-09.
                } else if (!diaRegex.test(diaStr)) {
					// Lanzamos error si no coincide con el formato DD o D y el rango 1-31
					errores.push('El día debe ser un número entre 1 y 31 (solo se permite 1 o 2 dígitos, ej. 5 o 05).');
					esValido = false;
				} else {
					// Comprobación redundante pero segura del rango numérico
					const dia = parseInt(diaStr, 10);
					if (isNaN(dia) || dia < 1 || dia > 31) {
						errores.push('El día de filtro debe ser un número entre 1 y 31.');
						esValido = false;
					}
				}
			}
            
            // Validar año (mínimo 1925)
			if (anioFiltroInput && anioFiltroInput.value) {
				const anioStr = anioFiltroInput.value.trim();

				// 1. Asegurar que solo contiene dígitos
				if (!/^\d+$/.test(anioStr)) {
					errores.push('El año de filtro debe contener solo números enteros.');
					esValido = false;
				} else if (anioStr.length === 4) { // Solo validamos el rango si ya tiene 4 dígitos
					const anio = parseInt(anioStr, 10);
					
					// 2. Validar rango
					if (isNaN(anio) || anio < 1925) {
						errores.push('El año de filtro es inválido (mínimo 1925).');
						esValido = false;
					}
				} else if (anioStr.length > 4) {
                    errores.push('El año de filtro no puede tener más de 4 dígitos.');
					esValido = false;
                }
				// Si tiene 1, 2 o 3 dígitos (ej. '1', '19', '192'), y son números, se asume temporalmente válido.
			}
        }

        // Mostrar errores si los hay
        if (!esValido && errores.length > 0) {
            mostrarToast("⚠️ Error:\n" + errores.join('\n'), 'peligro');
            return false; 
        }

        return esValido;
    }


    /**
     * Aplica filtros de búsqueda y fecha, luego renderiza la lista resultante.
     * Función principal que combina búsqueda por texto y filtrado por fecha de cumpleaños.
     * 
     * @function
     * @returns {void}
     * 
     * @description
     * Proceso de filtrado:
     * 1. Valida filtros de fecha si están activos
     * 2. Filtra por término de búsqueda (nombre, email, teléfono)
     * 3. Filtra por fecha de cumpleaños (día, mes, año)
     * 4. Renderiza la lista resultante
     */
    const filtrarYRenderizarUsuarios = () => {
        // Validar filtros de fecha antes de aplicar
        if ((filtroDiaInput.value || filtroMesSelect.value || filtroAnioInput.value)) {
            if (!validarFormulario()) {
                listaUsuariosDiv.textContent = 'Filtros de fecha inválidos. Por favor, corrígelos.';
                return;
            }
        }
        
        // Obtener valores de los filtros
        const terminoBusqueda = buscadorInput.value.toLowerCase();
        const filtroDia = filtroDiaInput.value;
        const filtroMesAbreviado = filtroMesSelect.value;
        const filtroAnio = filtroAnioInput.value;

        // Aplicar filtros
        let datosFiltrados = datosSimulados.filter(usuario => {
            
            // === Filtro de Búsqueda ===
            // Buscar en nombre, email y teléfono
            const coincideBusqueda = usuario.nombre.toLowerCase().includes(terminoBusqueda) ||
                                     (usuario.email && usuario.email.toLowerCase().includes(terminoBusqueda)) ||
                                     (usuario.telefono && String(usuario.telefono).includes(terminoBusqueda));
            
            if (!coincideBusqueda) return false;

            // === Filtro por Fecha de Cumpleaños ===
			if (usuario.fecha_cumple) {
				const [anio, mes, dia] = usuario.fecha_cumple.split('-');
				
				// Filtrar por día
				if (filtroDia) {
					const filtroDiaNormalizado = String(filtroDia).padStart(2, '0');
					if (dia !== filtroDiaNormalizado) return false;
				}

				// Filtrar por mes (convertir abreviatura a número)
				if (filtroMesAbreviado) { // Si el usuario eligió un mes (no el valor vacío/default)
					const mesNumero = mesesMapping[filtroMesAbreviado];
					if (mes !== mesNumero) return false;
				}

				// Filtrar por año
				if (filtroAnio && anio !== filtroAnio) return false;
			}
            
            return true;
        });

        // Actualizar lista actual y renderizar
        listaUsuariosActual = datosFiltrados;
        renderizarUsuarios(listaUsuariosActual);
    };

    /**
     * Abre el buscador animado y enfoca el input.
     * @function
     * @returns {void}
     */
    function openSearch() {
        buscadorWrapper.classList.add('active');
        buscadorInputAnimado.focus();
    }
    
    /**
     * Cierra el buscador animado, limpia el input y refresca la lista.
     * @function
     * @returns {void}
     */
    function closeSearch() {
        buscadorWrapper.classList.remove('active');
        buscadorInputAnimado.value = '';
        filtrarYRenderizarUsuarios();
    }
    
    /**
     * Alterna entre abrir y cerrar el buscador.
     * @function
     * @param {Event} e - Evento del click
     * @returns {void}
     */
    function toggleSearch(e) {
        e.stopPropagation();
        if (!buscadorWrapper.classList.contains('active')) {
            openSearch();
        } else {
            closeSearch();
        }
    }


    // ========================================================================
    // V. MANEJADORES DE EVENTOS
    // ========================================================================

    // ------------------------------------------------------------------------
    // Eventos de la Sidebar (Menú Principal)
    // ------------------------------------------------------------------------
    crearUsuarioMenuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        togglePanel('form-crear-usuario-panel');
    });

    filtroMenuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        togglePanel('filtrar-opciones');
    });

    ordenarMenuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        togglePanel('ordenar-opciones');
    });

    // ------------------------------------------------------------------------
    // Evento de Creación de Usuario
    // ------------------------------------------------------------------------
    formCrearUsuario.addEventListener('submit', (event) => {
        event.preventDefault();

        if (validarFormulario(formCrearUsuario)) {
            const nuevoUsuario = {
                id: nextId++,
                nombre: document.getElementById('nombre').value,
                telefono: document.getElementById('telefono').value 
                    ? parseInt(document.getElementById('telefono').value) 
                    : null,
                email: document.getElementById('email').value,
                fecha_cumple: document.getElementById('fecha_cumple').value
            };

            datosSimulados.push(nuevoUsuario);
            formCrearUsuario.reset();
            mostrarToast(`Contacto ${nuevoUsuario.nombre} creado exitosamente.`, 'exito');
            togglePanel('form-crear-usuario-panel');
            cargarUsuarios();
        }
    });

    // ------------------------------------------------------------------------
    // Delegación de eventos para interacciones en las tarjetas (clicks)
    // ------------------------------------------------------------------------
    listaUsuariosDiv.addEventListener('click', (event) => {
        const botonOpciones = event.target.closest('.menu-opciones-btn');
        const tarjeta = event.target.closest('.usuario-card');
        const opcionMenu = event.target.closest('.opcion-menu');
        const botonCancelar = event.target.closest('.cancelar-edicion');

        // Toggle del Menú Desplegable (3 puntos)
        if (botonOpciones) {
            event.stopPropagation();
            const card = botonOpciones.closest('.usuario-card');
            const menuDesplegable = card.querySelector('.menu-desplegable');
            if (menuDesplegable) menuDesplegable.classList.toggle('mostrar');

            // Cerrar otros menús abiertos
            listaUsuariosDiv.querySelectorAll('.menu-desplegable.mostrar').forEach(menu => {
                if (menu !== menuDesplegable) menu.classList.remove('mostrar');
            });
            return;
        }

        // Acciones del Menú (Editar / Eliminar)
        if (opcionMenu) {
            event.stopPropagation();
            const action = opcionMenu.dataset.action;
            const userId = opcionMenu.closest('.usuario-card')?.dataset.usuarioId;
            opcionMenu.closest('.menu-desplegable')?.classList.remove('mostrar');

            if (action === 'editar' && userId) {
                mostrarFormularioEdicion(userId);
            } else if (action === 'eliminar' && userId) {
                if (confirm('¿Estás seguro de que quieres eliminar este contacto?')) {
                    eliminarUsuario(userId);
                }
            }
            return;
        }

        // Cancelar Edición
        if (botonCancelar) {
            event.stopPropagation();
            const card = botonCancelar.closest('.usuario-card');
            const form = card.querySelector('.form-editar-usuario');
            const infoOculta = card.querySelector('.info-oculta');

            if (form) form.style.display = 'none';
            card.classList.remove('editando');
            if (infoOculta) infoOculta.style.display = 'block';
            return;
        }

        // Mostrar/Ocultar información al hacer click en la tarjeta (si no está en edición y no se clickeó control)
        if (tarjeta && 
            !tarjeta.classList.contains('editando') &&
            !event.target.closest('button') &&
            !event.target.closest('input') &&
            !event.target.closest('textarea') &&
            !event.target.closest('select') &&
            !event.target.closest('.menu-desplegable')) {

            const infoOculta = tarjeta.querySelector('.info-oculta');
            if (infoOculta) {
                const estaVisible = infoOculta.style.display === 'block';
                infoOculta.style.display = estaVisible ? 'none' : 'block';
            }
            return;
        }
    });

    // ------------------------------------------------------------------------
    // Evento de Submit del Formulario de Edición (ÚNICO listener)
    // ------------------------------------------------------------------------
    listaUsuariosDiv.addEventListener('submit', (event) => {
        const formEdicion = event.target.closest('.form-editar-usuario');
        if (!formEdicion) return;

        event.preventDefault();
        event.stopPropagation();

        const usuarioDiv = formEdicion.closest('.usuario-card');
        const usuarioId = formEdicion.dataset.usuarioId;

        if (validarFormulario(formEdicion)) {
            // guardarEdicionUsuario debe mostrar UN único toast
            guardarEdicionUsuario(usuarioId, formEdicion);

            // Ocultar formulario y restaurar estado visual
            formEdicion.style.display = 'none';
            if (usuarioDiv) {
                usuarioDiv.classList.remove('editando');
                const infoOculta = usuarioDiv.querySelector('.info-oculta');
                if (infoOculta) infoOculta.style.display = 'block';
            }
        }
    });

    // ------------------------------------------------------------------------
    // Eventos Globales para Cierre de UI (mantengo tu lógica original)
    // ------------------------------------------------------------------------
    document.addEventListener('click', (event) => {
        const estaEnTarjeta = event.target.closest('.usuario-card');
        const estaEnMenu = event.target.closest('.menu-opciones-btn');
        const estaEnSidebar = event.target.closest('.sidebar');
        const estaEnPanel = event.target.closest('#form-crear-usuario-panel') ||
                            event.target.closest('#filtrar-opciones') ||
                            event.target.closest('#ordenar-opciones');
        const estaEnBuscador = event.target.closest('.search-wrapper');
        const estaEnMain = event.target.closest('main');

        // Cerrar menús desplegables
        if (!estaEnTarjeta && !estaEnMenu) {
            listaUsuariosDiv.querySelectorAll('.menu-desplegable.mostrar')
                .forEach(menu => menu.classList.remove('mostrar'));
        }

        // Cerrar paneles laterales
        if (!estaEnSidebar && !estaEnPanel) {
            Object.values(sidebarPanels).forEach(panel => panel?.classList.remove('mostrar'));
            mainContent.classList.remove('desplazado');
        }

        // Cerrar info oculta si no está editando
        if (!estaEnTarjeta && !estaEnBuscador && !estaEnMain) {
            listaUsuariosDiv.querySelectorAll('.usuario-card:not(.editando) .info-oculta')
                .forEach(info => { info.style.display = 'none'; });
        }
    });

    // ------------------------------------------------------------------------
    // Eventos de Filtro y Búsqueda (mantener tus enlaces a funciones existentes)
    // ------------------------------------------------------------------------
    buscadorInput.addEventListener('input', filtrarYRenderizarUsuarios);
    filtroDiaInput.addEventListener('input', filtrarYRenderizarUsuarios);
    filtroMesSelect.addEventListener('change', filtrarYRenderizarUsuarios);
    filtroAnioInput.addEventListener('input', filtrarYRenderizarUsuarios);

    limpiarFiltroFechaBtn.addEventListener('click', () => {
        filtroDiaInput.value = '';
        filtroMesSelect.value = '';
        filtroAnioInput.value = '';
        filtrarYRenderizarUsuarios();
        togglePanel('filtrar-opciones');
    });

    ordenarNombreBtn.addEventListener('click', () => {
        ordenamientoActivo = 'nombre';
        filtrarYRenderizarUsuarios();
        togglePanel('ordenar-opciones');
    });

    ordenarFechaBtn.addEventListener('click', () => {
        ordenamientoActivo = 'fecha_cumple';
        filtrarYRenderizarUsuarios();
        togglePanel('ordenar-opciones');
    });

    // Evento de exportar (si existe)
    if (exportarMenuBtn) {
        exportarMenuBtn.addEventListener('click', exportarUsuariosCSV);
    }

    // Eventos del buscador animado (mantén los tuyos)
    buscadorIcon.addEventListener('click', toggleSearch);
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && buscadorWrapper.classList.contains('active')) {
            closeSearch();
        }
    });
    document.addEventListener('click', e => {
        if (buscadorWrapper.classList.contains('active') && !e.target.closest('.search-wrapper')) {
            closeSearch();
        }
    });


    // ========================================================================
    // VI. INICIALIZACIÓN
    // ========================================================================
    
    /**
     * Carga inicial de la lista de usuarios al cargar la página.
     */
    cargarUsuarios(); 
    
}); // Fin de DOMContentLoaded