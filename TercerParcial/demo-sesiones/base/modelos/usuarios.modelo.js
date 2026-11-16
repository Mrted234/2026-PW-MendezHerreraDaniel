// Consultas a la tabla usuarios. Siempre con ? (consulta parametrizada), nunca pegando texto en el SQL.
const bcrypt = require('bcryptjs');

function crearModeloUsuarios(pool) {
  // Regresa el usuario (sin el hash) si la contraseña es correcta, o null si no.
  async function verificar(usuario, contrasena) {
    // Si falta alguno de los dos datos, ni siquiera consultamos la base
    if (!usuario || !contrasena) return null;

    // Buscamos al usuario con ? para que nadie pueda meter SQL (inyección SQL)
    const [filas] = await pool.query(
      'SELECT id, usuario, nombre, rol, contrasena_hash FROM usuarios WHERE usuario = ?',
      [usuario]
    );

    // Si no existe, regresamos null: app.js responde el mismo 401 que con contraseña mala
    if (filas.length === 0) return null;

    const fila = filas[0];

    // bcrypt compara la contraseña escrita contra el hash guardado (nunca se guarda la contraseña en texto)
    const correcta = await bcrypt.compare(contrasena, fila.contrasena_hash);
    if (!correcta) return null;

    // Regresamos los datos SIN contrasena_hash, porque esto se guarda en la sesión y se manda al navegador
    return { id: fila.id, usuario: fila.usuario, nombre: fila.nombre, rol: fila.rol };
  }

  return { verificar };
}

module.exports = { crearModeloUsuarios };