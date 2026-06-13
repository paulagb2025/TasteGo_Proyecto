import { getDatabase } from "./sqliteService";

export async function obtenerFavoritos(
  idUsuario: number
) {
  const db = await getDatabase();

  return await db.getAllAsync(
    `
    SELECT *
    FROM favoritos
    WHERE id_usuario = ?
    `,
    [idUsuario]
  );
}