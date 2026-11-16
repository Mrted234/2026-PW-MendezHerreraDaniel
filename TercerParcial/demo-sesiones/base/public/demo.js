// La página solo hace fetch a la API. El navegador manda la cookie solo (misma página, mismo servidor).
const $ = (id) => document.getElementById(id);
//Etapa 1
// Todas las peticiones hacen lo mismo (fetch, leer el código, leer el JSON),
// por eso una sola función: así no repetimos ese código en cada botón.
async function llamar(metodo, url, cuerpo) {
  const opciones = { method: metodo, headers: {} };

  // Solo si hay cuerpo avisamos que es JSON; sin este encabezado express.json() no lo lee
  if (cuerpo !== undefined) {
    opciones.headers['Content-Type'] = 'application/json';
    opciones.body = JSON.stringify(cuerpo);
  }

  const respuesta = await fetch(url, opciones);

  // Si la respuesta no es JSON, datos queda en null en lugar de tronar
  let datos = null;
  try {
    datos = await respuesta.json();
  } catch {
    datos = null;
  }

  return { status: respuesta.status, datos };
}
//Etapa 2
// Cada respuesta del servidor se anota para ver el historial de códigos (200, 401, 403...).
// Se usa textContent y no innerHTML porque los datos vienen del servidor y podrían traer
// código escrito por alguien (ataque XSS).

function anotar (metodo, url, status, datos){
    const li = document.createElement('li');
    const codigo = document.createElement('span');
    codigo.textContent = status;
    if(status >= 200 && status < 300){
        codigo.className = 'codigo ok';
    }else if(status === 401){
        codigo.className = 'codigo e401';
    }else if(status === 403){
        codigo.className = 'codigo e403';
    }else{
        codigo.className = 'codigo error';
    }
    // El método y la URL
    const peticion = document.createElement('span');
    peticion.textContent = ` ${metodo} ${url}`;
    // El JSON de la respuesta, con sangría
    const pre = document.createElement('pre');
    pre.textContent = JSON.stringify(datos, null, 2);

    li.append(codigo, peticion, pre);
// prepend lo pone al principio: la respuesta más nueva queda arriba
    $('bitacora').prepend(li);
}

//Etapa 3

async function verEstado() {
    const {status, datos} = await llamar ('GET', '/api/sesion');
    const estado = $('estado');
    if(status === 200){
        const u = datos.usuario;
        estado.textContent = `Con sesion: ${u.nombre} (${u.rol}) · sesión ${datos.sesion} · vence en ${datos.expiraEnSegundos} s`;
        estado.className = 'estado con-sesion';
    }else{
        estado.textContent = `Sin sesion: (el servidor responde ${status})`;
        estado.className = 'estado sin-sesion';
    }
    $('cookie-js').textContent = document.cookie || '(vacio)';
}

//Etapa 4
// Muestra lo que el servidor tiene guardado (solo para la clase), para comparar
// con lo que se ve en Workbench y entender que la sesión vive en el servidor.
async function verSesiones() {
    const {status, datos} = await llamar('GET', '/api/diagnostico/sesiones');
    if (status !== 200 || !datos) return;
    
    $('donde').textContent = datos.almacen === 'mysql'
    ? 'En mysql, la tabla sessions (sobrevive si el servidor se reinicia)'
    : 'En la memoria del servidor (se pierde si el servidor se reinicia)';

    const tbody = $('tabla-sesiones');
    // Vaciamos la tabla antes de llenarla; si no, cada clic duplicaría las filas
    tbody.replaceChildren();

    if (datos.sesiones.length === 0){
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.colSpan = 4;
        td.textContent = '(sin sesiones)';
        tr.append(td);
        tbody.append(tr);
        return;
    }

    for(const s of datos.sesiones){
        const tr = document.createElement('tr');
        if (s.esLaTuya) tr.className = 'tuya';

        const celdas = [
            s.esLaTuya ? `${s.sesion} (la tuya)` : s.sesion, 
            s.usuario || '(sin iniciar sesion)',
            s.visitas,
// expira viene como texto ISO; new Date lo convierte y toLocaleTimeString da la hora local
            s.expira ? new Date(s.expira).toLocaleTimeString() : '—',
        ];
// textContent en cada celda: el usuario viene del servidor y no debe interpretarse como HTML

        for (const texto of celdas){
            const td = document.createElement('td');
            td.textContent = texto;
            tr.append(td);
        }
        tbody.append(tr);
    }   
}

//Etapa 5

// Después de cualquier acción el estado y la tabla pueden cambiar,
// por eso una sola función que refresca las dos cosas.
async function refrescarTodo() {
  await verEstado();
  await verSesiones();
}

// Login: preventDefault evita que el formulario recargue la página;
// mandamos los datos con fetch y nos quedamos en la misma página.
$('form-login').addEventListener('submit', async (evento) => {
  evento.preventDefault();
  const cuerpo = { usuario: $('usuario').value, contrasena: $('contrasena').value };
  const { status, datos } = await llamar('POST', '/api/login', cuerpo);
  anotar('POST', '/api/login', status, datos);
  await refrescarTodo();
});

// Al cambiar de usuario se pone su contraseña de ejemplo (ana12345, luis12345, admin12345)
$('usuario').addEventListener('change', () => {
  $('contrasena').value = `${$('usuario').value}12345`;
});

// Un solo código para todos los botones: cada botón trae su método y URL en data-metodo y data-url
document.querySelectorAll('button[data-url]').forEach((boton) => {
  boton.addEventListener('click', async () => {
    const { metodo, url } = boton.dataset;
    const { status, datos } = await llamar(metodo, url);
    anotar(metodo, url, status, datos);
    await refrescarTodo();
  });
});

// Botones de la tarjeta 1 y de la tarjeta 4
$('btn-refrescar').addEventListener('click', refrescarTodo);
$('btn-sesiones').addEventListener('click', verSesiones);

//Etapa 6
// Al abrir la página: mostrar la configuración del servidor y preguntar
// el estado y la tabla, para que la página no empiece vacía.
async function iniciar() {
    const {datos} = await llamar('GET', '/api/config');
    $('config').textContent = JSON.stringify(datos, null, 2);
    await refrescarTodo();
}
iniciar();