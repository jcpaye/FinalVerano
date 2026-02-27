const API_URL = 'http://localhost:3000/api/tareas';

let tareas = [];
let filtroActual = 'todas';

const inputTarea = document.querySelector('.cuadro-de-texto');
const btnAñadir = document.querySelector('.boton-añadir');
const listaActividades = document.querySelector('.lista-actividades');
const contadorElement = document.querySelector('.lista-contador');


async function cargarTareas() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Error al cargar tareas');
        tareas = await response.json();
        renderizarTareas();
    } catch (error) {
        console.error('Error:', error);
        mostrarError('No se pudieron cargar las tareas');
    }
}

async function crearTarea(titulo) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ titulo })
        });
        
        if (!response.ok) throw new Error('Error al crear tarea');
        
        const nuevaTarea = await response.json();
        tareas.push(nuevaTarea);
        renderizarTareas();
        inputTarea.value = '';
    } catch (error) {
        console.error('Error:', error);
        mostrarError('No se pudo crear la tarea');
    }
}

async function actualizarTarea(id, datos) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(datos)
        });
        
        if (!response.ok) throw new Error('Error al actualizar tarea');
        
        const tareaActualizada = await response.json();
        
        const index = tareas.findIndex(t => t.id === id);
        if (index !== -1) {
            tareas[index] = tareaActualizada;
        }
        
        renderizarTareas();
    } catch (error) {
        console.error('Error:', error);
        mostrarError('No se pudo actualizar la tarea');
    }
}

async function eliminarTarea(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Error al eliminar tarea');
        
        tareas = tareas.filter(t => t.id !== id);
        renderizarTareas();
    } catch (error) {
        console.error('Error:', error);
        mostrarError('No se pudo eliminar la tarea');
    }
}

function filtrarTareas() {
    switch (filtroActual) {
        case 'completadas':
            return tareas.filter(t => t.completada === true);
        case 'pendientes':
            return tareas.filter(t => t.completada === false);
        default:
            return tareas;
    }
}

function renderizarTareas() {
    const tareasFiltradas = filtrarTareas();
    
    if (tareasFiltradas.length === 0) {
        listaActividades.innerHTML = `
            <p class="presentacion">
                ${tareas.length === 0 
                    ? '¡Añade tu primera tarea! 📝' 
                    : `No hay tareas ${filtroActual === 'completadas' ? 'completadas' : 'pendientes'}`
                }<br>
                Consejos de uso 💡: <br>
            </p>
            <ul class="lista-items">
                <li>✔️ Presiona Enter para enviar acciones.</li>
                <li>✔️ Haz clic en los botones para gestionar tareas.</li>
                <li>🔒 Tus datos se guardan en el servidor.</li>
            </ul>
        `;
        actualizarContador();
        return;
    }
    
    let html = '<ul class="lista-items">';
    
    tareasFiltradas.forEach(tarea => {
        const fecha = new Date(tarea.fecha_creacion).toLocaleDateString();
        html += `
            <li class="tarea-item" data-id="${tarea.id}">
                <div class="tarea-contenido ${tarea.completada ? 'tarea-completada' : ''}">
                    <span class="tarea-titulo" ondblclick="editarTarea(this, ${tarea.id})">${tarea.titulo}</span>
                    <span class="tarea-fecha">${fecha}</span>
                </div>
                <div class="tarea-acciones">
                    <button class="btn-completar" onclick="toggleCompletada(${tarea.id}, ${!tarea.completada})">
                        ${tarea.completada ? '↩️' : '✅'}
                    </button>
                    <button class="btn-editar" onclick="editarTareaClick(${tarea.id})">✏️</button>
                    <button class="btn-eliminar" onclick="eliminarTarea(${tarea.id})">🗑️</button>
                </div>
            </li>
        `;
    });
    
    html += '</ul>';
    listaActividades.innerHTML = html;
    
    actualizarContador();
}

function actualizarContador() {
    const pendientes = tareas.filter(t => !t.completada).length;
    const total = tareas.length;
    
    contadorElement.innerHTML = `
        <div class="contador-info">
            <span>📊 Pendientes: ${pendientes} | Total: ${total}</span>
            ${pendientes === 0 && total > 0 ? ' 🎉 ¡Todo completado!' : ''}
        </div>
    `;
}

function mostrarError(mensaje) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'mensaje-error';
    errorDiv.textContent = mensaje;
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ff4444;
        color: white;
        padding: 10px 20px;
        border-radius: 5px;
        z-index: 1000;
    `;
    document.body.appendChild(errorDiv);
    setTimeout(() => errorDiv.remove(), 3000);
}

window.toggleCompletada = async (id, nuevoEstado) => {
    await actualizarTarea(id, { completada: nuevoEstado });
};

window.editarTarea = (element, id) => {
    const tituloActual = element.textContent;
    const input = document.createElement('input');
    input.type = 'text';
    input.value = tituloActual;
    input.className = 'editar-input';
    
    input.onblur = async () => {
        const nuevoTitulo = input.value.trim();
        if (nuevoTitulo && nuevoTitulo !== tituloActual) {
            await actualizarTarea(id, { titulo: nuevoTitulo });
        }
        element.textContent = nuevoTitulo || tituloActual;
    };
    
    input.onkeypress = (e) => {
        if (e.key === 'Enter') input.blur();
    };
    
    element.textContent = '';
    element.appendChild(input);
    input.focus();
};

window.editarTareaClick = (id) => {
    const elemento = document.querySelector(`[data-id="${id}"] .tarea-titulo`);
    if (elemento) editarTarea(elemento, id);
};

async function eliminarTodas() {
    if (!confirm('¿Estás seguro de eliminar TODAS las tareas?')) return;
    
    const tareasAEliminar = [...tareas];
    for (const tarea of tareasAEliminar) {
        await eliminarTarea(tarea.id);
    }
}

async function marcarTodasCompletadas() {
    const pendientes = tareas.filter(t => !t.completada);
    
    for (const tarea of pendientes) {
        await actualizarTarea(tarea.id, { completada: true });
    }
}

function cambiarFiltro(filtro) {
    filtroActual = filtro;
    renderizarTareas();
    
    document.querySelectorAll('.filtro-btn').forEach(btn => {
        btn.classList.remove('activo');
    });
    document.querySelector(`.filtro-${filtro}`)?.classList.add('activo');
}

btnAñadir.addEventListener('click', () => {
    const titulo = inputTarea.value.trim();
    if (titulo) {
        crearTarea(titulo);
    }
});

inputTarea.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const titulo = inputTarea.value.trim();
        if (titulo) {
            crearTarea(titulo);
        }
    }
});


function actualizarCuadroOpciones() {
    const cuadroOpciones = document.querySelector('.cuadro-opciones');
    cuadroOpciones.innerHTML = `
        <button class="boton-opcion boton-abrir" onclick="toggleMenu()">ABRIR ✨</button>
        <button class="boton-opcion filtro-btn filtro-todas activo" onclick="cambiarFiltro('todas')">Todas</button>
        <button class="boton-opcion filtro-btn filtro-pendientes" onclick="cambiarFiltro('pendientes')">Pendientes</button>
        <button class="boton-opcion filtro-btn filtro-completadas" onclick="cambiarFiltro('completadas')">Completadas</button>
        <button class="boton-opcion boton-marcar-todas" onclick="marcarTodasCompletadas()">✅ Marcar todas</button>
        <button class="boton-opcion boton-eliminar-todas" onclick="eliminarTodas()">🗑️ Eliminar todas</button>
        <input type="file" accept=".txt, .json" class="boton-importar" id="archivo-externo">
        <label for="archivo-externo" class="importar-label">Importar (txt/json)</label>
    `;

    const style = document.createElement('style');
    style.textContent = `
        .cuadro-opciones {
            width: 180px;
            height: auto;
            padding: 10px 0;
        }
        .boton-opcion {
            width: 100%;
            height: 40px;
            border: none;
            border-bottom: 2px solid #33322E;
            background-color: white;
            cursor: pointer;
            font-family: "Quicksand", sans-serif;
            font-size: 14px;
            transition: all 0.3s;
        }
        .boton-opcion:last-of-type {
            border-bottom: none;
        }
        .boton-opcion:hover {
            background-color: #f0f0f0;
        }
        .filtro-btn.activo {
            background-color: #8CD4CB;
            font-weight: bold;
        }
        .boton-marcar-todas:hover {
            background-color: #90EE90;
        }
        .boton-eliminar-todas:hover {
            background-color: #FFB6C1;
        }
        .tarea-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px;
            margin: 5px 0;
            border-bottom: 1px solid #eee;
        }
        .tarea-contenido {
            display: flex;
            flex-direction: column;
            flex-grow: 1;
        }
        .tarea-titulo {
            font-size: 16px;
            cursor: text;
        }
        .tarea-completada .tarea-titulo {
            text-decoration: line-through;
            color: #888;
        }
        .tarea-fecha {
            font-size: 12px;
            color: #999;
        }
        .tarea-acciones {
            display: flex;
            gap: 5px;
        }
        .tarea-acciones button {
            border: none;
            background: none;
            cursor: pointer;
            font-size: 18px;
            padding: 5px;
            border-radius: 5px;
        }
        .tarea-acciones button:hover {
            background-color: #f0f0f0;
        }
        .editar-input {
            font-family: "Quicksand", sans-serif;
            font-size: 16px;
            padding: 5px;
            border: 2px solid #33322E;
            border-radius: 5px;
            width: 100%;
        }
        .lista-contador {
            padding: 10px;
            text-align: center;
            font-weight: bold;
        }
    `;
    document.head.appendChild(style);
}

document.addEventListener('DOMContentLoaded', () => {
    actualizarCuadroOpciones();
    cargarTareas();
});