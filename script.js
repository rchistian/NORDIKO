/* ==========================================================================
   NÓRDICO - LÓGICA DE INTERACTIVIDAD, FORMULARIOS Y CHATBOT
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    initMobileMenu();
    initChatbot();
});

/* ==========================================================================
   MENÚ MÓVIL
   ========================================================================== */
function initMobileMenu() {
    const menuToggle = document.getElementById('menu-toggle');
    const mainNav = document.getElementById('main-nav');
    
    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', () => {
            mainNav.classList.toggle('open');
            menuToggle.classList.toggle('active');
        });
        
        // Cerrar menú al hacer clic en enlaces
        mainNav.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                mainNav.classList.remove('open');
                menuToggle.classList.remove('active');
            });
        });
    }
}

/* ==========================================================================
   NAVEGACIÓN POR PESTAÑAS (SERVICIOS)
   ========================================================================== */
function switchTab(event, tabId) {
    // Obtener todas las pestañas de contenido y botones
    const tabContents = document.querySelectorAll('.tab-content');
    const tabBtns = document.querySelectorAll('.tab-btn');
    
    // Desactivar todos
    tabContents.forEach(content => content.classList.remove('active'));
    tabBtns.forEach(btn => btn.classList.remove('active'));
    
    // Activar seleccionado
    document.getElementById(tabId).classList.add('active');
    event.currentTarget.classList.add('active');
}

/* ==========================================================================
   FORMULARIO DE PRESUPUESTO / SOLICITUD
   ========================================================================== */
function handleFormSubmit(event) {
    event.preventDefault();
    
    const name = document.getElementById('form-name').value;
    const phone = document.getElementById('form-phone').value;
    const service = document.getElementById('form-service').value;
    const details = document.getElementById('form-details').value;
    
    const submitButton = event.target.querySelector('.btn-submit');
    const originalText = submitButton.innerText;
    
    submitButton.innerText = "Enviando...";
    submitButton.disabled = true;

    // Estructura de datos para enviar a FormSubmit.co
    const formData = {
        Nombre: name,
        Telefono: phone,
        Servicio: service,
        Detalles: details,
        _subject: "Nueva Solicitud de Presupuesto - NÓRDICO"
    };

    fetch("https://formsubmit.co/ajax/nordikorussian@gmail.com", {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
        submitButton.innerText = "¡Enviado con Éxito!";
        submitButton.style.backgroundColor = "#25d366"; // Tono verde éxito
        submitButton.style.color = "#ffffff";
        event.target.reset();
        alert("¡Solicitud enviada con éxito! La información ha sido remitida a nordikorussian@gmail.com. Nos comunicaremos contigo pronto.");
        
        // Restaurar botón después de 4 segundos
        setTimeout(() => {
            submitButton.innerText = originalText;
            submitButton.style.backgroundColor = "";
            submitButton.style.color = "";
            submitButton.disabled = false;
        }, 4000);
    })
    .catch(error => {
        console.error("Error al enviar el formulario:", error);
        submitButton.innerText = "Error al enviar";
        submitButton.disabled = false;
        alert("Lo sentimos, ocurrió un error al procesar tu solicitud. Por favor intenta de nuevo o comunícate vía WhatsApp.");
    });
}

/* ==========================================================================
   CHATBOT INTELIGENTE FLOTANTE (ESTADO Y DIÁLOGO)
   ========================================================================== */

// Base de datos local de conocimiento real de NÓRDICO
const NORDICO_INFO = {
    empresa: "NÓRDICO",
    gerente: "Alejandro Enmanuel Russian Sole",
    telefono: "+58 412-0279485",
    ubicacion: "San Félix, Estado Bolívar, Venezuela",
    servicios: [
        "Mantenimiento preventivo de aires acondicionados (lavado, chequeo, presiones)",
        "Mantenimiento correctivo (corrección de fugas, cambio de compresores, reparación eléctrica, tarjetas)",
        "Instalación de aires split, de ventana y piso-techo",
        "Reparación de neveras (compresores, bimetálicos, resistencias, capilares)",
        "Suministro de gases refrigerantes R-134a, R-410a, R-22, R-32 y R-600"
    ]
};

// Estado del Chatbot
let chatState = {
    step: 'idle', // idle, awaiting_name, awaiting_phone, awaiting_location, completed
    data: {
        service: '',
        name: '',
        phone: '',
        location: ''
    }
};

function initChatbot() {
    const toggleBtn = document.getElementById('chatbot-toggle-btn');
    const container = document.getElementById('chatbot-container');
    
    if (toggleBtn && container) {
        toggleBtn.addEventListener('click', () => {
            container.classList.toggle('open');
            scrollToBottom();
        });
    }
}

function scrollToBottom() {
    const body = document.getElementById('chatbot-body');
    if (body) {
        body.scrollTop = body.scrollHeight;
    }
}

// Agregar mensaje visual al chat
function appendChatMessage(sender, text) {
    const body = document.getElementById('chatbot-body');
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('chat-message', sender === 'bot' ? 'bot-msg' : 'user-msg');
    
    // Soporte para saltos de línea e HTML básico seguro
    msgDiv.innerHTML = text.replace(/\n/g, '<br>');
    
    body.appendChild(msgDiv);
    scrollToBottom();
}

// Mostrar opciones rápidas de respuesta
function appendQuickReplies(replies) {
    const body = document.getElementById('chatbot-body');
    
    // Eliminar respuestas rápidas anteriores si existen
    const oldReplies = document.getElementById('chatbot-replies-container');
    if (oldReplies) oldReplies.remove();
    
    const container = document.createElement('div');
    container.id = 'chatbot-replies-container';
    container.classList.add('chat-quick-replies');
    
    replies.forEach(reply => {
        if (reply.type === 'link') {
            const link = document.createElement('a');
            link.href = reply.href;
            link.target = reply.target || '_self';
            link.classList.add('quick-reply-btn', reply.class || '');
            link.innerText = reply.text;
            container.appendChild(link);
        } else {
            const btn = document.createElement('button');
            btn.classList.add('quick-reply-btn', reply.class || '');
            btn.innerText = reply.text;
            btn.onclick = () => {
                if (reply.action) reply.action();
                else botSelectOption(reply.text);
            };
            container.appendChild(btn);
        }
    });
    
    body.appendChild(container);
    scrollToBottom();
}

// Acción al seleccionar un botón rápido
function botSelectOption(optionText) {
    // Si contiene WhatsApp o Llamada directamente redirigir, no procesar flujo
    if (optionText.toLowerCase().includes('whatsapp') || optionText.toLowerCase().includes('llamar')) {
        return;
    }

    appendChatMessage('user', optionText);
    
    // Iniciar flujo de preguntas
    chatState.step = 'awaiting_name';
    chatState.data.service = optionText;
    
    setTimeout(() => {
        appendChatMessage('bot', `Entendido. Registraremos tu caso para *${optionText}*.%0A%0APara coordinar la visita técnica, por favor indícanos tu **Nombre y Apellido**:`);
        // Remover respuestas rápidas para dejar escribir al usuario
        const replies = document.getElementById('chatbot-replies-container');
        if (replies) replies.remove();
    }, 500);
}

// Procesar entrada escrita por el usuario
function handleChatSubmit(event) {
    event.preventDefault();
    const input = document.getElementById('chat-input');
    const text = input.value.trim();
    if (!text) return;
    
    appendChatMessage('user', text);
    input.value = '';
    
    // Eliminar botones rápidos previos
    const oldReplies = document.getElementById('chatbot-replies-container');
    if (oldReplies) oldReplies.remove();
    
    setTimeout(() => {
        processChatbotLogic(text);
    }, 600);
}

// Lógica de estados y respuestas
function processChatbotLogic(userInput) {
    switch(chatState.step) {
        case 'awaiting_name':
            chatState.data.name = userInput;
            chatState.step = 'awaiting_phone';
            appendChatMessage('bot', `Gracias, *${userInput}*. ¿A qué **número telefónico** podemos contactarte?`);
            break;
            
        case 'awaiting_phone':
            chatState.data.phone = userInput;
            chatState.step = 'awaiting_location';
            appendChatMessage('bot', `Excelente. Por último, ¿cuál es tu **ubicación o sector** en San Félix?`);
            break;
            
        case 'awaiting_location':
            chatState.data.location = userInput;
            chatState.step = 'completed';
            
            const summary = `*Datos de la Solicitud:*%0A` +
                            `• Servicio: ${chatState.data.service}%0A` +
                            `• Cliente: ${chatState.data.name}%0A` +
                            `• Teléfono: ${chatState.data.phone}%0A` +
                            `• Ubicación: ${chatState.data.location}`;
            
            const waUrl = `https://wa.me/584120279485?text=Hola%20NÓRDICO,%20aquí%20tengo%20los%20datos%20de%20mi%20solicitud%20generados%20por%20el%20asistente:%0A%0A${summary}`;
            
            appendChatMessage('bot', `¡Perfecto! He recopilado todos tus datos para agendar el servicio.%0A%0A` +
                                     `• **Servicio:** ${chatState.data.service}%0A` +
                                     `• **Cliente:** ${chatState.data.name}%0A` +
                                     `• **Teléfono:** ${chatState.data.phone}%0A` +
                                     `• **Ubicación:** ${chatState.data.location}%0A%0A` +
                                     `Para formalizar la visita inmediatamente, haz clic en uno de los siguientes botones para enviarlo al WhatsApp de nuestro Gerente Alejandro Russian o llamarlo directamente:`);
            
            appendQuickReplies([
                { text: 'Confirmar por WhatsApp', type: 'link', href: waUrl, target: '_blank', class: 'wa-btn' },
                { text: 'Llamar a Alejandro Russian', type: 'link', href: 'tel:+584120279485', class: 'call-btn' },
                { text: 'Iniciar nueva consulta', type: 'btn', action: resetChatState }
            ]);
            break;
            
        default:
            // Responder basándose en palabras clave de la base de datos de NÓRDICO
            const inputLower = userInput.toLowerCase();
            
            if (inputLower.includes('mantenimiento') || inputLower.includes('lavar') || inputLower.includes('limpiar')) {
                appendChatMessage('bot', `En NÓRDICO ofrecemos mantenimiento preventivo de aires split, ventana y piso-techo, incluyendo lavado a presión, chequeo eléctrico y preventivo. ¿Deseas solicitar este servicio?`);
                appendQuickReplies([
                    { text: 'Solicitar Mantenimiento Preventivo', type: 'btn', action: () => botSelectOption('Mantenimiento preventivo') },
                    { text: 'Menú principal', type: 'btn', action: resetChatState }
                ]);
            } 
            else if (inputLower.includes('nevera') || inputLower.includes('refrigerador') || inputLower.includes('enfria')) {
                appendChatMessage('bot', `Realizamos revisión técnica de neveras domésticas y comerciales, incluyendo prueba de compresión, cambio de filtros, capilares, bimetálicos y carga de gas (R-134a, R-600). ¿Deseas solicitar reparación?`);
                appendQuickReplies([
                    { text: 'Solicitar Reparación de Nevera', type: 'btn', action: () => botSelectOption('Reparación de nevera') },
                    { text: 'Menú principal', type: 'btn', action: resetChatState }
                ]);
            }
            else if (inputLower.includes('gerente') || inputLower.includes('director') || inputLower.includes('alejandro') || inputLower.includes('russian')) {
                appendChatMessage('bot', `El Gerente General de NÓRDICO es Alejandro Enmanuel Russian Sole. Puedes coordinar directamente con él haciendo una llamada o escribiendo a WhatsApp.`);
                appendQuickReplies([
                    { text: 'WhatsApp Directo', type: 'link', href: 'https://wa.me/584120279485', target: '_blank', class: 'wa-btn' },
                    { text: 'Llamar ahora', type: 'link', href: 'tel:+584120279485', class: 'call-btn' }
                ]);
            }
            else if (inputLower.includes('ubicacion') || inputLower.includes('direccion') || inputLower.includes('donde') || inputLower.includes('san felix')) {
                appendChatMessage('bot', `Nuestra sede principal se encuentra en San Félix, Estado Bolívar, Venezuela. Atendemos servicios residenciales y comerciales en toda la zona.`);
                appendQuickReplies([
                    { text: 'WhatsApp Directo', type: 'link', href: 'https://wa.me/584120279485', target: '_blank', class: 'wa-btn' },
                    { text: 'Volver al Menú', type: 'btn', action: resetChatState }
                ]);
            }
            else if (inputLower.includes('refrigerante') || inputLower.includes('gas') || inputLower.includes('carga')) {
                appendChatMessage('bot', `Suministramos carga de gas refrigerante para equipos residenciales e industriales, incluyendo R-134a, R-410a, R-22, R-32 y R-600. ¿Quieres solicitar recarga de gas?`);
                appendQuickReplies([
                    { text: 'Solicitar Recarga de Refrigerante', type: 'btn', action: () => botSelectOption('Recarga de refrigerante') },
                    { text: 'Volver al Menú', type: 'btn', action: resetChatState }
                ]);
            }
            else {
                // Fallback seguro
                appendChatMessage('bot', `Disculpa, como asistente virtual solo puedo responder información sobre servicios autorizados de refrigeración y climatización de NÓRDICO en San Félix, Bolívar. %0A%0ATe sugiero pulsar uno de los siguientes botones para una atención inmediata personalizada con un asesor humano:`);
                appendQuickReplies([
                    { text: 'Hablar por WhatsApp', type: 'link', href: 'https://wa.me/584120279485', target: '_blank', class: 'wa-btn' },
                    { text: 'Llamar a Alejandro Russian', type: 'link', href: 'tel:+584120279485', class: 'call-btn' },
                    { text: 'Volver al Menú', type: 'btn', action: resetChatState }
                ]);
            }
    }
}

// Resetear estado del chatbot
function resetChatState() {
    chatState = {
        step: 'idle',
        data: { service: '', name: '', phone: '', location: '' }
    };
    
    appendChatMessage('bot', `Hola, bienvenido a NÓRDICO. Soy el asistente virtual y puedo ayudarte con mantenimiento, reparación, instalación de aires acondicionados, refrigeración y reparación de neveras. ¿Qué servicio necesitas?`);
    
    appendQuickReplies([
        { text: 'Mantenimiento preventivo', type: 'btn', action: () => botSelectOption('Mantenimiento preventivo') },
        { text: 'Reparación de aire acondicionado', type: 'btn', action: () => botSelectOption('Reparación de aire acondicionado') },
        { text: 'Reparación de nevera', type: 'btn', action: () => botSelectOption('Reparación de nevera') },
        { text: 'Instalación de aire acondicionado', type: 'btn', action: () => botSelectOption('Instalación de aire acondicionado') },
        { text: 'Recarga de refrigerante', type: 'btn', action: () => botSelectOption('Recarga de refrigerante') },
        { text: 'Hablar por WhatsApp', type: 'link', href: 'https://wa.me/584120279485?text=Hola%20NÓRDICO,%20necesito%20asistencia%20técnica%20inmediata.', target: '_blank', class: 'wa-btn' },
        { text: 'Llamar ahora', type: 'link', href: 'tel:+584120279485', class: 'call-btn' }
    ]);
}

// Exponer funciones necesarias al ámbito global para manejadores inline de HTML (necesario en empaquetado de Vite/Vercel)
window.switchTab = switchTab;
window.handleFormSubmit = handleFormSubmit;
window.handleChatSubmit = handleChatSubmit;
window.botSelectOption = botSelectOption;
window.resetChatState = resetChatState;
