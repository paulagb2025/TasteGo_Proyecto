import { getDatabase } from "./sqliteService";

export async function obtenerPlatosPorRestaurante(
  idRestaurante: number
) {
  const db = await getDatabase();

  const result =
    await db.getAllAsync(
      `
      SELECT *
      FROM platos
      WHERE id_restaurante = ?
      `,
      [idRestaurante]
    );

  console.log("PLATOS:", result);
  console.log("ID RESTAURANTE:", idRestaurante);
  console.log("PLATOS ENCONTRADOS:", result);

  return result;
}

export async function obtenerTodosLosPlatos() {
  const db = await getDatabase();

  const result = await db.getAllAsync(`
    SELECT *
    FROM platos
  `);

  console.log("TODOS LOS PLATOS:", result);

  return result;
}

