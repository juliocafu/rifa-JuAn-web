// =========================================================================
// !!! MUY IMPORTANTE: REEMPLAZA ESTA URL CON LA TUYA DE APPS SCRIPT !!!
// =========================================================================
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyFFsVJFIAvalWGaA0FVysL0KXUR4l6tBqNT0h1Ycitq1kQuESW4iuu509ldci1R2bUUg/exec"; 
// =========================================================================

// Declaramos las variables/constantes PERO NO las asignamos aún.
let form, ticketSelect, submitBtn, messageDiv;


/**
 * 1. FUNCIÓN DE CARGA: Obtiene los boletos disponibles del Apps Script (GET).
 * Esta función NO necesita cambios internos.
 */
function loadAvailableTickets() {
    // ESTE BLOQUE AHORA USA LAS VARIABLES GLOBALES (NO CONSTANTES)
    ticketSelect.innerHTML = '<option value="" disabled selected>Cargando disponibilidad...</option>';
    submitBtn.disabled = true;
    submitBtn.textContent = 'Cargando...';

    // ... (El resto de la función es correcto: fetch, then, etc.)
    // ... (El resto del código de loadAvailableTickets permanece igual)
    // ...

    // Dentro de loadAvailableTickets():
    // 2. Hacer la solicitud GET al Apps Script
    // *** MODIFICACIÓN CRÍTICA AQUÍ ***
    fetch(APPS_SCRIPT_URL + "?callback=1", { method: 'GET' })
        .then(response => response.json())
        .then(data => {
            // ... (toda tu lógica de llenado de select y habilitación de botón es correcta)
            if (data.success && data.result && data.result.available.length > 0) {
                // ... llenar el select ...
                submitBtn.disabled = false;
                submitBtn.textContent = 'Reservar y Pagar';
                showMessage(messageDiv, 'success', `¡${data.result.available.length} boletos disponibles!`);
            } else {
                // ... manejo de errores/agotado ...
            }
        })
        .catch(error => {
            // Este catch debería activarse si el Apps Script no responde.
            console.error('Error de conexión:', error); 
            showMessage(messageDiv, 'error', 'Error de red. No se pudo conectar con la base de datos.');
            submitBtn.textContent = 'Error de Carga';
        });
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

