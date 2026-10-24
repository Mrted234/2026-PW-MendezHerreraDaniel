function validarCorreo(){
//tarea
}

function validarBoleta(){
//tarea
}

function validarContraseña(){
    if (typeof contrasena !== 'string') return false;
    return contrasena.length >= 8;
}

module.exports = {validarBoleta, validarContraseña, validarCorreo}