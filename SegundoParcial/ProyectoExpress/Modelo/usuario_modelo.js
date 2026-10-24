const pool = require("..bd-local");

const COLUMNAS_PUBLICAS = "id, nombre, correo, boleta, rol";

/**
Consular los datos 
*/

async function listar() {
    const [filas] = await pool.query(`SELECT ${COLUMNAS_PUBLICAS} FROM usuarios ORDER BY id`);
    return filas;
}

/**
Consular por id
*/

async function obtenerPorId() {
    const [filas] = await pool.query(`SELECT ${COLUMNAS_PUBLICAS} FROM usuarios WHERE id = ?`);
    return filas[0];
}

//REGISTRAR

async function crear({nombre, correo,contrasenaHash, boleta, rol}) {
    const [info] = await pool.query(`INSERT INTO usuarios (nombre, correo, contrasena_hash, boleta, rol) VALUES (?,?,?,?,?)`, [nombre, correo, contrasenaHash, boleta, rol || 'alumno']);
    return obtenerPorId(info.insertId);
}

async function actualizar( id, {nombre, correo, rol}) {
    const cambios = Object.entries({nombre, correo, rol }).filter
    (([, valor]) => valor !== undefined);
    if(cambios.length === 0) 
    return obtenerPorId(id);

    const columnas = cambios.map(([columna]) => `${columna} = ?` ).join
    (', ');

    const [info] = await pool.query(`UPDATE usuarios SET ${columnas} WHERE id = ?`, [...cambios.map(([ , valor]) => valor), id]);
    if(info.affectedRows === 0) return undefined;
    return obtenerPorId(id);
}

async function eliminar(id) {
    const [filas] = await pool.query(`DELETE usuarios WHERE id = ?`, [id]);
    return info.affectedRows > 0;
}

//Buscar por correo hash

async function BuscarPorCorreoConHash(correo) {
    const [filas] = await pool.query('SELECT * FROM usuarios WHERE correo = ?', [correo]);
    return filas[0];
}
module.exports = {listar, obtenerPorId, crear, actualizar, eliminar, BuscarPorCorreoConHash}
//deberan crear los modelos de las tablas talleres y asistencia
//taller tiene registrar (registrar alumno al taller), consultar todos los talleres
//asistencia tiene (cuales funciones se programaran) registrarasistencia consultar asistencia de taller (talleres)