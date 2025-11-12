// Función para decodificar una sola credencial
function decodeConfigValue(encodedValue) {
    if (typeof atob === 'function') {
        try {
            return atob(encodedValue);
        } catch (e) {
            console.error("Error al decodificar credencial: ", e);
            return null;
        }
    }
    return null; // Fallback si atob no existe
}


// =========================================================================
// !!! 1. CONFIGURACIÓN DE FIREBASE (¡REEMPLAZA ESTO CON TUS CLAVES!) !!!
// =========================================================================

// 1. Decodificación de las credenciales
const firebaseConfig = {
    // Usamos el archivo de configuración externa y decodificamos
    apiKey: decodeConfigValue(encodedConfig.apiKey), 
    authDomain: decodeConfigValue(encodedConfig.projectId) + ".firebaseapp.com",
    projectId: decodeConfigValue(encodedConfig.projectId),
    storageBucket: decodeConfigValue(encodedConfig.projectId) + ".firebasestorage.app", // Puedes dejarlo
    messagingSenderId: decodeConfigValue(encodedConfig.messagingSenderId), // Puedes dejarlo
    appId: decodeConfigValue(encodedConfig.appId)
};

// =========================================================================
// 2. INICIALIZACIÓN Y VARIABLES
// =========================================================================
let form, ticketSelect, submitBtn, messageDiv;

// Inicializar Firebase
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const BOLETOS_COLLECTION = 'boletos_vendidos';

// =========================================================================
// 3. LÓGICA DE CARGA (GET)
// =========================================================================

/**
 * Carga los boletos vendidos y actualiza la lista de disponibilidad.
 */
async function loadAvailableTickets() {
    ticketSelect.innerHTML = '<option value="" disabled selected>Cargando disponibilidad...</option>';
    submitBtn.disabled = true;
    submitBtn.textContent = 'Cargando...';
    
    try {
        // 1. Obtener todos los documentos de la colección
        const snapshot = await db.collection(BOLETOS_COLLECTION).get();
        
        // 2. Extraer solo los números de boletos vendidos (como strings)
        const soldTickets = [];
        snapshot.forEach(doc => {
            // Firestore usa el ID del documento, pero si guardamos el 'boleto' como campo, es más fácil.
            // Si el ID del documento es el número de boleto:
            soldTickets.push(doc.id); 
            // Si el número de boleto es un campo:
            // soldTickets.push(String(doc.data().boleto));
        });

        // 3. Generar la lista de disponibles (Misma lógica que antes)
        const totalTickets = 100;
        const availableTickets = [];
        const soldSet = new Set(soldTickets); 
        
        for (let i = 1; i <= totalTickets; i++) {
            if (!soldSet.has(String(i))) {
                availableTickets.push(i);
            }
        }

        // 4. Actualizar la interfaz
        processRaffleData(availableTickets);

    } catch (error) {
        console.error("Error al cargar datos de Firebase:", error);
        showMessage(messageDiv, 'error', `Error de conexión con la base de datos.`);
        submitBtn.textContent = 'Error de Carga';
    }
}

/**
 * Procesa los datos de disponibilidad y actualiza el menú.
 */
function processRaffleData(availableTickets) {
    ticketSelect.innerHTML = '';
    
    if (availableTickets.length > 0) {
        ticketSelect.innerHTML = '<option value="" disabled selected>-- Elige un número --</option>';
        availableTickets.forEach(ticketNum => {
            const option = document.createElement('option');
            option.value = ticketNum;
            option.textContent = `Boleto N° ${ticketNum}`;
            ticketSelect.appendChild(option);
        });
        
        submitBtn.disabled = false;
        submitBtn.textContent = 'Reservar y Pagar';
        showMessage(messageDiv, 'success', `¡${availableTickets.length} boletos disponibles!`);
    
    } else {
        ticketSelect.innerHTML = '<option value="" disabled selected>¡Todos los boletos vendidos! 🎉</option>';
        showMessage(messageDiv, 'error', '¡Lo sentimos! Todos los boletos han sido vendidos.');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Agotado';
    }
}

// =========================================================================
// 4. LÓGICA DE REGISTRO (POST)
// =========================================================================

/**
 * Maneja el envío del formulario para registrar un boleto.
 */
async function handleFormSubmit(event) {
    event.preventDefault(); 

    submitBtn.disabled = true;
    submitBtn.textContent = 'Procesando registro...';
    messageDiv.classList.add('hidden'); 

    const nombre = document.getElementById('name').value.trim();
    const numeroBoleto = document.getElementById('ticket').value.trim();
    const timestamp = Date.now(); // Usar el timestamp actual
    
    // Validar selección
    if (!numeroBoleto || !nombre) {
        showMessage(messageDiv, 'error', 'Por favor, rellena tu nombre y selecciona un boleto.');
        loadAvailableTickets(); // Vuelve a habilitar el botón
        return;
    }
    
    const newRecord = {
        boleto: numeroBoleto,
        nombre: nombre,
        timestamp: timestamp,
        // Puedes añadir 'vendedor' aquí si es necesario:
        // vendedor: document.getElementById('vendedor').value || ''
    };

    try {
        // Añadir el documento a Firestore, usando el número de boleto como ID del documento
        await db.collection(BOLETOS_COLLECTION).doc(numeroBoleto).set(newRecord);

        // Éxito
        showMessage(messageDiv, 'success', `¡Boleto ${numeroBoleto} registrado exitosamente!`);
        form.reset(); 
        loadAvailableTickets(); // Vuelve a cargar la lista para actualizar disponibilidad

    } catch (error) {
        console.error('Error al registrar en Firebase:', error);
        let msg = 'Error de registro. El boleto podría haber sido tomado o hay un error de conexión.';
        
        if (error.code === 'permission-denied') {
            msg = 'Error de registro. El boleto ya ha sido reservado (duplicidad).';
        }

        showMessage(messageDiv, 'error', msg);
        loadAvailableTickets(); // Vuelve a cargar y habilitar si es posible
    }
}


// =========================================================================
// 5. INICIALIZACIÓN
// =========================================================================

document.addEventListener('DOMContentLoaded', () => {
    // Asignar elementos del DOM
    form = document.getElementById('raffleForm');
    ticketSelect = document.getElementById('ticket');
    submitBtn = document.getElementById('submitBtn');
    messageDiv = document.getElementById('message');

    // Añadir el listener de envío
    form.addEventListener('submit', handleFormSubmit);

    // Iniciar la carga de boletos
    loadAvailableTickets();
});

// Función auxiliar para mostrar mensajes
function showMessage(element, type, text) {
    element.textContent = text;
    element.className = ``; 
    element.classList.add('message', type);
    element.classList.remove('hidden');
}
