// =========================================================================
// !!! MUY IMPORTANTE: REEMPLAZA ESTA URL CON LA TUYA DE APPS SCRIPT !!!
// =========================================================================
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyFFsVJFIAvalWGaA0FVysL0KXUR4l6tBqNT0h1Ycitq1kQuESW4iuu509ldci1R2bUUg/exec"; 
// =========================================================================

const form = document.getElementById('raffleForm');
const ticketSelect = document.getElementById('ticket');
const submitBtn = document.getElementById('submitBtn');
const messageDiv = document.getElementById('message');

/**
 * 1. FUNCIÓN DE CARGA: Obtiene los boletos disponibles del Apps Script (GET).
 */
function loadAvailableTickets() {
    // 1. Resetear interfaz y mostrar estado de carga
    ticketSelect.innerHTML = '<option value="" disabled selected>Cargando disponibilidad...</option>';
    submitBtn.disabled = true;
    submitBtn.textContent = 'Cargando...';

    // 2. Hacer la solicitud GET al Apps Script
    fetch(APPS_SCRIPT_URL, { method: 'GET' })
        .then(response => response.json())
        .then(data => {
            if (data.success && data.result && data.result.available.length > 0) {
                // 3. Éxito: Limpiar y rellenar el menú desplegable
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
                showMessage(messageDiv, 'error', `Error al cargar: ${data.message}`);
                submitBtn.textContent = 'Error de Carga';
            }
        })
        .catch(error => {
            // Error de red/conexión
            console.error('Error de conexión:', error);
            showMessage(messageDiv, 'error', 'Error de red. No se pudo conectar con la base de datos.');
            submitBtn.textContent = 'Error de Carga';
        });
}

/**
 * 2. FUNCIÓN DE REGISTRO: Envía los datos del formulario (POST). (Mismo código anterior)
 */
form.addEventListener('submit', function(event) {
    event.preventDefault(); 

    submitBtn.disabled = true;
    submitBtn.textContent = 'Procesando registro...';
    messageDiv.classList.add('hidden'); 

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
            // *** Importante: Vuelve a cargar la lista después de un registro exitoso ***
            loadAvailableTickets(); 
            // *************************************************************************
        } else {
            showMessage(messageDiv, 'error', `Error: ${data.message}. Vuelve a intentar.`);
        }
    })
    .catch(error => {
        console.error('Error en la conexión:', error);
        showMessage(messageDiv, 'error', 'Error de red al registrar. Intenta de nuevo más tarde.');
    })
    .finally(() => {
        // El botón se habilita o cambia de texto al terminar la recarga de lista en loadAvailableTickets()
    });
});

/**
 * Función auxiliar para mostrar mensajes (Mantener del script anterior)
 */
function showMessage(element, type, text) {
    element.textContent = text;
    element.className = ``; 
    element.classList.add('message', type);
    element.classList.remove('hidden');
}

// 3. INICIALIZACIÓN: Cargar la lista al cargar la página.
document.addEventListener('DOMContentLoaded', loadAvailableTickets);