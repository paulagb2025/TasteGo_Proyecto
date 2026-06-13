import { getDatabase } from "./sqliteService";

export async function obtenerRestaurantes() {
  const db = await getDatabase();

  const restaurantes = await db.getAllAsync(`
    SELECT *
    FROM restaurantes
  `);

  console.log(
    "RESTAURANTES ENCONTRADOS:",
    restaurantes
  );

  return restaurantes;
}

export async function obtenerRestaurantePorId(
  id: number
) {
  const db = await getDatabase();

  return await db.getFirstAsync(
    `
    SELECT *
    FROM restaurantes
    WHERE id_restaurante = ?
    `,
    [id]
  );
}

export async function agregarFavorito(
  idUsuario: number,
  idRestaurante: number
) {
  const db = await getDatabase();

  await db.runAsync(
    `
    INSERT INTO favoritos
    (
      id_usuario,
      id_restaurante
    )
    VALUES (?, ?)
    `,
    [idUsuario, idRestaurante]
  );
}

export async function obtenerFavoritos(
  idUsuario: number
) {
  const db = await getDatabase();

  return await db.getAllAsync(
    `
    SELECT r.*
    FROM favoritos f
    INNER JOIN restaurantes r
    ON r.id_restaurante = f.id_restaurante
    WHERE f.id_usuario = ?
    `,
    [idUsuario]
  );
}

export async function eliminarFavorito(
  idUsuario: number,
  idRestaurante: number
) {
  const db = await getDatabase();

  await db.runAsync(
    `
    DELETE FROM favoritos
    WHERE id_usuario = ?
    AND id_restaurante = ?
    `,
    [idUsuario, idRestaurante]
  );
}

export async function crearPedido(
  idUsuario: number,
  idRestaurante: number
) {
  const db = await getDatabase();

  return await db.runAsync(
    `
    INSERT INTO pedidos
    (
      id_usuario,
      id_restaurante,
      estado
    )
    VALUES (?, ?, ?)
    `,
    [idUsuario, idRestaurante, "Pendiente"]
  );
}

export async function obtenerPedidos(
  idUsuario: number
) {
  const db = await getDatabase();

  return await db.getAllAsync(
    `
    SELECT
      p.id_pedido,
      p.id_restaurante,
      p.estado,
      p.fecha_pedido,
      r.nombre,
      r.tipo_comida,
      r.calificacion
    FROM pedidos p
    INNER JOIN restaurantes r
      ON p.id_restaurante = r.id_restaurante
    WHERE p.id_usuario = ?
    ORDER BY p.id_pedido DESC
    `,
    [idUsuario]
  );
}

export async function agregarDetallePedido(
  idPedido: number,
  idPlato: number,
  cantidad: number,
  precio: number
) {
  const db = await getDatabase();

  await db.runAsync(
    `
    INSERT INTO detalle_pedido
    (
      id_pedido,
      id_plato,
      cantidad,
      precio_unitario
    )
    VALUES (?, ?, ?, ?)
    `,
    [
      idPedido,
      idPlato,
      cantidad,
      precio,
    ]
  );
}