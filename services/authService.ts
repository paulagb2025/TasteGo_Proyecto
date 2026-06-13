import { getDatabase } from "./sqliteService";

export async function iniciarSesion(
  email: string,
  password: string
) {
  const db = await getDatabase();

  const usuario = await db.getFirstAsync(
    `
    SELECT *
    FROM usuarios
    WHERE email = ?
    AND password = ?
    `,
    [email, password]
  );

  return usuario;
}

export async function obtenerUsuarioPorId(
  idUsuario: number
) {
  const db = await getDatabase();

  return await db.getFirstAsync(
    `
    SELECT *
    FROM usuarios
    WHERE id_usuario = ?
    `,
    [idUsuario]
  );
}

export async function registrarUsuario(
  nombre: string,
  email: string,
  password: string,
  telefono: string,
  fechaNacimiento: string
) {
  const db = await getDatabase();

  await db.runAsync(
    `
    INSERT INTO usuarios
    (
      nombre,
      email,
      password,
      telefono,
      fecha_nacimiento
    )
    VALUES (?, ?, ?, ?, ?)
    `,
    [
      nombre,
      email,
      password,
      telefono,
      fechaNacimiento
    ]
  );
}

export async function obtenerUsuarioPorEmail(
  email: string
) {
  const db = await getDatabase();

  return await db.getFirstAsync(
    `
    SELECT *
    FROM usuarios
    WHERE email = ?
    `,
    [email]
  );
}