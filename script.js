// =========================================================================
// !!! MUY IMPORTANTE: REEMPLAZA ESTA URL CON LA TUYA DE APPS SCRIPT !!!
// =========================================================================
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyi_RuBmBqLR8CToqmH3ODWe0gAEpAMmF-CvRgNBhHs3-RFFMpkcp5nhyRJWVjBFQpLYw/exec"; 
// =========================================================================

// Declaramos las variables/constantes PERO NO las asignamos aún.
let form, ticketSelect, submitBtn, messageDiv;

// =========================================================================
// 1. FUNCIÓN DE CARGA (JSONP - GET)
// =========================================================================

/**
 * Función global que recibe la respuesta JSONP del Apps Script.
 * Esta función es llamada por el script cargado desde Google.
 */
function handleRaffleData(data) {
    processRaffleData(data);
}

/**
 * Procesa los datos de disponibilidad recibidos y actualiza la interfaz.
 */
function processRaffleData(data) {
    ticketSelect.innerHTML = ''; // Limpia el select antes de rellenar
    
    if (data.success && data.result && data.result.available.length > 0) {
        // Éxito: Limpiar y rellenar el menú desplegable
        ticketSelect.innerHTML = '<option value="" disabled selected>-- Elige un número --</option>';
        data.result.available.forEach(ticketNum => {
            const option = document.createElement('option');
            option.value = ticketNum;
            option.textContent = `Boleto N° ${ticketNum}`;
            ticketSelect.appendChild(option);
        });
        
        submitBtn.disabled = false;
        submitBtn.textContent = 'Reservar y Pagar';
        showMessage(messageDiv, 'success', `¡${data.result.available.length} boletos disponibles!`);
    
    } else if (data.success && data.result.available.length === 0) {
        // No hay boletos disponibles
        ticketSelect.innerHTML = '<option value="" disabled selected>¡Todos los boletos vendidos! 🎉</option>';
        showMessage(messageDiv, 'error', '¡Lo sentimos! Todos los boletos han sido vendidos.');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Agotado';

    } else {
        // Error reportado por el Apps Script
        ticketSelect.innerHTML = '<option value="" disabled selected>Error de carga</option>';
        showMessage(messageDiv, 'error', `Error al cargar: ${data.message}`);
        submitBtn.textContent = 'Error de Carga';
    }
}

/**
 * Carga los boletos disponibles inyectando un tag <script> (JSONP).
 */
function loadAvailableTickets() {
    ticketSelect.innerHTML = '<option value="" disabled selected>Cargando disponibilidad...</option>';
    submitBtn.disabled = true;
    submitBtn.textContent = 'Cargando...';

    const url = APPS_SCRIPT_URL + '?callback=handleRaffleData';
    
    // **Carga la URL como un script para evadir el bloqueo CORS**
    const script = document.createElement('script');
    script.src = url;
    document.head.appendChild(script);

    // Limpieza: Remueve el script después de un tiempo (Opcional, para evitar duplicados)
    script.onload = () => script.remove();
    script.onerror = () => {
        // Manejo de error de red si el script no se puede cargar
        showMessage(messageDiv, 'error', 'Error de red. No se pudo conectar con la base de datos.');
        submitBtn.textContent = 'Error de Carga';
        script.remove();
    };
}


// =========================================================================
// 2. FUNCIÓN DE REGISTRO (POST) - USANDO FETCH
// =========================================================================

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
        event.preventDefault(); 

        submitBtn.disabled = true;
        submitBtn.textContent = 'Procesando registro...';
        messageDiv.classList.add('hidden'); 

        const formData = new FormData(form);
        const params = new URLSearchParams(formData);

        // **USAMOS FETCH para el POST, ya que no suele fallar con CORS aquí**
        fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            body: params
        })
        .then(response => response.json()) 
        .then(data => {
            if (data.success) {
                showMessage(messageDiv, 'success', `¡Éxito! ${data.message}`);
                form.reset(); 
                loadAvailableTickets(); // Vuelve a cargar la lista
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
 * Función auxiliar para mostrar mensajes
 */
function showMessage(element, type, text) {
    element.textContent = text;
    element.className = ``; 
    element.classList.add('message', type);
    element.classList.remove('hidden');
}


