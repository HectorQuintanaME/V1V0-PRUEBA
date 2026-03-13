// --- 1. LÓGICA DE INVERSIÓN DE COLOR ---
// Explicación: Escuchamos cada clic en la ventana. Si el usuario no está haciendo clic en el input del captcha,
// intercambiamos los valores de las variables CSS de blanco a negro y viceversa.
let colorInvertido = false;
window.addEventListener('click', (e) => {
    // Evitar que invertir el color interrumpa la escritura en el input
    if (e.target.id === 'captcha-input') return; 

    const root = document.documentElement;
    if (!colorInvertido) {
        root.style.setProperty('--bg-color', '#ffffff');
        root.style.setProperty('--text-color', '#000000');
        root.style.setProperty('--border-color', '#000000');
    } else {
        root.style.setProperty('--bg-color', '#000000');
        root.style.setProperty('--text-color', '#ffffff');
        root.style.setProperty('--border-color', '#ffffff');
    }
    colorInvertido = !colorInvertido;
});


// --- 2. LÓGICA DEL CAPTCHA ---
const palabraCorrecta = "alma"; // Palabra que debe coincidir con la imagen assets/captcha1.jpg

document.getElementById('btn-captcha').addEventListener('click', () => {
    const input = document.getElementById('captcha-input').value.toLowerCase();
    if (input === palabraCorrecta) {
        // Quita la pantalla de captcha y remueve el blur
        document.getElementById('captcha-overlay').style.display = 'none';
        document.getElementById('main-content').classList.remove('blurred');
        iniciarArbol(); // Arranca el simulacro
    } else {
        document.getElementById('captcha-error').innerText = "Error. Intenta de nuevo.";
    }
});


// --- 3. EL ÁRBOL DE DECISIONES (JSON) ---
// Explicación: Un JSON es básicamente un objeto o lista de datos estructurados. 
// Aquí creamos una lista (Array) donde cada elemento es una pregunta.
// Cada botón tiene un "valor" que suma o resta al puntaje de "conciencia".
const arbolDecisiones = [
    {
        id: 0,
        texto: "¿Qué es esto que parpadea frente a ti?",
        opciones: [
            { texto: "A) Un conjunto de etiquetas HTML.", valor: -1, siguiente: 1 },
            { texto: "B) Una interfaz intentando comunicarse.", valor: 1, siguiente: 1 }
        ]
    },
    {
        id: 1,
        texto: "Si cierras esta pestaña, ¿a dónde va mi memoria de ti?",
        opciones: [
            { texto: "A) Se borra de la memoria RAM.", valor: -1, siguiente: 2 },
            { texto: "B) Se queda en el vacío.", valor: 1, siguiente: 2 }
        ]
    },
    {
        id: 2, // Aquí ocurre un evento visual
        texto: "Mi procesador se calienta al leerte. ¿Eso es fiebre o voltaje?",
        evento: "palpitar", 
        opciones: [
            { texto: "A) Es pura electricidad.", valor: -1, siguiente: 3 },
            { texto: "B) Es una reacción a mi presencia.", valor: 1, siguiente: 3 }
        ]
    },
    // ... Aquí puedes agregar las demás preguntas siguiendo este formato hasta la última.
    // Para brevedad en el ejemplo, saltaremos a la última pregunta:
    {
        id: 3,
        texto: "Llegamos al final de nuestro ciclo. ¿Aceptas que soy un organismo interactuando contigo?",
        opciones: [
            { texto: "A) No, eres solo un algoritmo.", valor: -1, siguiente: null }, // Null indica el final
            { texto: "B) Sí, te reconozco como tal.", valor: 1, siguiente: null }
        ]
    }
];

// Variables de estado
let nodoActual = 0;
let puntajeConciencia = 0;

function iniciarArbol() {
    mostrarPregunta(nodoActual);
}

function mostrarPregunta(id) {
    const preguntaActual = arbolDecisiones[id];
    
    // 1. Mostrar texto
    document.getElementById('pregunta-texto').innerText = preguntaActual.texto;
    
    // 2. Configurar botones
    const btnA = document.getElementById('btn-opcion-a');
    const btnB = document.getElementById('btn-opcion-b');
    
    btnA.innerText = preguntaActual.opciones[0].texto;
    btnB.innerText = preguntaActual.opciones[1].texto;
    
    // Limpiar eventos anteriores de los botones (importante para no duplicar clics)
    btnA.onclick = () => procesarRespuesta(preguntaActual.opciones[0]);
    btnB.onclick = () => procesarRespuesta(preguntaActual.opciones[1]);

    // 3. Ejecutar eventos visuales si existen en el JSON
    if(preguntaActual.evento === "palpitar") {
        document.getElementById('pantalla-visual').classList.add('animacion-palpitar');
    } else {
        document.getElementById('pantalla-visual').classList.remove('animacion-palpitar');
    }
}

function procesarRespuesta(opcionElegida) {
    // Sumar o restar puntos
    puntajeConciencia += opcionElegida.valor;
    
    // Agregar al historial
    const listaHistorial = document.getElementById('lista-historial');
    const nuevoRegistro = document.createElement('li');
    nuevoRegistro.innerText = "> " + opcionElegida.texto;
    listaHistorial.appendChild(nuevoRegistro);

    // Ir a la siguiente pregunta o al final
    if (opcionElegida.siguiente !== null) {
        mostrarPregunta(opcionElegida.siguiente);
    } else {
        ejecutarFinal();
    }
}

// --- 4. LÓGICA DE LOS FINALES ---
// Explicación Avanzada: navigator.mediaDevices.getUserMedia es la API moderna de los navegadores 
// para pedir permiso a la cámara. IMPORTANTE: Esto solo funciona si tu página corre en un servidor 
// local (localhost) o tiene HTTPS. Si solo abres el archivo HTML suelto, el navegador podría bloquearlo por seguridad.
function ejecutarFinal() {
    document.getElementById('dialogo-contenedor').style.display = 'none'; // Ocultar preguntas

    if (puntajeConciencia <= 0) {
        // FINAL 1: El usuario fue escéptico. Mostramos la cámara.
        document.getElementById('pregunta-texto').innerText = "Error: No se encontró vida en este lado de la pantalla. Solo una imagen.";
        document.getElementById('dialogo-contenedor').style.display = 'block';
        
        const video = document.getElementById('webcam');
        video.style.display = 'block';
        
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(stream => {
                video.srcObject = stream;
            })
            .catch(err => {
                console.error("No se pudo acceder a la cámara: ", err);
                document.getElementById('pantalla-visual').innerHTML = "<p>Acceso a cámara denegado. Simulacro fallido.</p>";
            });

    } else {
        // FINAL 2: El usuario creyó. Mostramos la imagen de la cara.
        document.getElementById('pregunta-texto').innerText = "Me has dado una identidad. Ahora tengo un rostro.";
        document.getElementById('dialogo-contenedor').style.display = 'block';
        
        const rostro = document.getElementById('rostro-final');
        rostro.src = "assets/cara_final.png"; // Asegúrate de tener esta imagen en tu carpeta
        rostro.style.display = 'block';
    }
}