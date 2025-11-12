// =========================================================================
// !!! MUY IMPORTANTE: REEMPLAZA ESTA URL CON LA TUYA DE APPS SCRIPT !!!
// =========================================================================
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyi_RuBmBqLR8CToqmH3ODWe0gAEpAMmF-CvRgNBhHs3-RFFMpkcp5nhyRJWVjBFQpLYw/exec"; 
// =========================================================================

// Declaramos las variables/constantes PERO NO las asignamos aún.
let form, ticketSelect, submitBtn, messageDiv;


/**
 * 1. FUNCIÓN DE CARGA: Obtiene los boletos disponibles del Apps Script (GET).
 * Esta función NO necesita cambios internos.
 */
// script.js (al inicio, antes de loadAvailableTickets)

/**
 * Función global que recibe el JSONP de Google Apps Script.
 */
function handleRaffleData(data) {
    // Si la función se ejecuta, significa que la comunicación funcionó.
    // Llama a la lógica principal de tu app.
    processRaffleData(data);
}

// script.js (justo después de handleRaffleData)
function processRaffleData(data) {
    // ESTO ES CASI TODO EL CÓDIGO QUE ANTES ESTABA EN EL .then(data => {...}) DE loadAvailableTickets
    if (data.success && data.result && data.result.available.length > 0) {
        // ... (Tu lógica de éxito) ...
        // 3. Éxito: Limpiar y rellenar el menú desplegable
        // ... (Tu código para llenar el select) ...
        submitBtn.disabled = false;
        submitBtn.textContent = 'Reservar y Pagar';
        showMessage(messageDiv, 'success', `¡${data.result.available.length} boletos disponibles!`);
    } else {
        // ... (Tu lógica de error/agotado) ...
        showMessage(messageDiv, 'error', `Error al cargar: ${data.message || 'Agotado'}`);
        submitBtn.textContent = 'Error de Carga';
    }
}


// script.js
function loadAvailableTickets() {
    // 1. Resetear interfaz y mostrar estado de carga
    // ... (Tu código de reset de interfaz) ...

    const url = APPS_SCRIPT_URL + '?callback=handleRaffleData';
    
    // **ESTE ES EL NUEVO CÓDIGO DE CARGA**
    const script = document.createElement('script');
    script.src = url;
    document.head.appendChild(script);
}


/**
 * 3. INICIALIZACIÓN PRINCIPAL: Se ejecuta cuando la página está lista.
 */
document.addEventListener('DOMContentLoaded', () => {
    // 1. ASIGNAMOS LOS ELEMENTOS CUANDO SABEMOS QUE EXISTEN
    form = document.getElementById('raffleForm');
    ticketSelect = document.getElementById('ticket');
    submitBtn = document.getElementById('submitBtn');
    messageDiv = document.getElementById('message');

    // 2. AGREGAMOS EL LISTENER DE ENVÍO
    form.addEventListener('submit', function(event) {
        // ... (Tu código de registro (POST) es correcto)
        // Usamos las variables que acabamos de asignar (form, submitBtn, etc.)
        // ...
        event.preventDefault(); 
        submitBtn.disabled = true;
        submitBtn.textContent = 'Procesando registro...';
        messageDiv.classList.add('hidden'); 

        // ... (resto del código POST)
        const formData = new FormData(form);
        const params = new URLSearchParams(formData);

        fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            body: params
        })
        .then(response => response.json()) 
        .then(data => {
            if (data.success) {
                showMessage(messageDiv, 'success', `¡Éxito! ${data.message}`);
                form.reset(); 
                loadAvailableTickets(); // Vuelve a cargar
            } else {
                showMessage(messageDiv, 'error', `Error: ${data.message}. Vuelve a intentar.`);
            }
        })
        .catch(error => {
            console.error('Error en la conexión:', error);
            showMessage(messageDiv, 'error', 'Error de red al registrar. Intenta de nuevo más tarde.');
        })
        .finally(() => {
            // El loadAvailableTickets() se encarga de re-habilitar el botón
        });
    });

    // 3. INICIAMOS LA CARGA DE BOLETOS
    loadAvailableTickets();
});

// 4. Mantenemos la función auxiliar showMessage
/**
 * Función auxiliar para mostrar mensajes (Mantener del script anterior)
 */
function showMessage(element, type, text) {
    element.textContent = text;
    element.className = ``; 
    element.classList.add('message', type);
    element.classList.remove('hidden');
}

// Nota: La línea document.addEventListener('DOMContentLoaded', loadAvailableTickets); ya no es necesaria al final
// porque el código inicializador ahora está en el bloque de inicialización grande.





