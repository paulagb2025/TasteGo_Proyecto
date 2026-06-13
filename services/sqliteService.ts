import * as SQLite from "expo-sqlite";

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase() {
  if (!db) {
    db = await SQLite.openDatabaseAsync("tastego.db");
  }

  return db;
}

export async function initializeDatabase() {
  const database = await getDatabase();

  await database.execAsync(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS usuarios (
      id_usuario INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      telefono TEXT,
      fecha_nacimiento TEXT,
      fecha_registro TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS preferencias (
      id_preferencia INTEGER PRIMARY KEY AUTOINCREMENT,
      id_usuario INTEGER NOT NULL,
      tipo_comida TEXT NOT NULL,
      fecha_actualizacion TEXT DEFAULT CURRENT_TIMESTAMP,

      FOREIGN KEY (id_usuario)
      REFERENCES usuarios(id_usuario)
      ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS categorias (
      id_categoria INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      descripcion TEXT
    );

    CREATE TABLE IF NOT EXISTS restaurantes (
      id_restaurante INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      descripcion TEXT,
      tipo_comida TEXT,
      direccion TEXT,
      ciudad TEXT,
      latitud REAL,
      longitud REAL,
      imagen_url TEXT,
      telefono TEXT,
      horario TEXT,
      calificacion REAL,
      fuente TEXT DEFAULT 'local',
      fecha_creacion TEXT DEFAULT CURRENT_TIMESTAMP
    );

  CREATE TABLE IF NOT EXISTS pedidos (
  id_pedido INTEGER PRIMARY KEY AUTOINCREMENT,
  id_usuario INTEGER NOT NULL,
  id_restaurante INTEGER NOT NULL,
  estado TEXT DEFAULT 'Pendiente',
  fecha_pedido TEXT DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (id_usuario)
  REFERENCES usuarios(id_usuario)
  ON DELETE CASCADE,

  FOREIGN KEY (id_restaurante)
  REFERENCES restaurantes(id_restaurante)
  ON DELETE CASCADE
  ); 

  CREATE TABLE IF NOT EXISTS detalle_pedido (
  id_detalle INTEGER PRIMARY KEY AUTOINCREMENT,
  id_pedido INTEGER NOT NULL,
  id_plato INTEGER NOT NULL,
  cantidad INTEGER NOT NULL,
  precio_unitario REAL NOT NULL,

  FOREIGN KEY (id_pedido)
  REFERENCES pedidos(id_pedido)
  ON DELETE CASCADE,

  FOREIGN KEY (id_plato)
  REFERENCES platos(id_plato)
  ON DELETE CASCADE
);

  CREATE TABLE IF NOT EXISTS platos (
  id_plato INTEGER PRIMARY KEY AUTOINCREMENT,
  id_restaurante INTEGER NOT NULL,
  id_categoria INTEGER NOT NULL,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  precio REAL,
  imagen_url TEXT,
  modelo_3d_url TEXT,
  disponible INTEGER DEFAULT 1,

  FOREIGN KEY (id_restaurante)
  REFERENCES restaurantes(id_restaurante)
  ON DELETE CASCADE,

  FOREIGN KEY (id_categoria)
  REFERENCES categorias(id_categoria)
  ON DELETE CASCADE );

  CREATE TABLE IF NOT EXISTS favoritos (
  id_favorito INTEGER PRIMARY KEY AUTOINCREMENT,
  id_usuario INTEGER NOT NULL,
  id_restaurante INTEGER NOT NULL,
  fecha_guardado TEXT DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (id_usuario)
  REFERENCES usuarios(id_usuario)
  ON DELETE CASCADE,

  FOREIGN KEY (id_restaurante)
  REFERENCES restaurantes(id_restaurante)
  ON DELETE CASCADE,

  UNIQUE(id_usuario, id_restaurante)
);

CREATE TABLE IF NOT EXISTS historial_busquedas (
  id_busqueda INTEGER PRIMARY KEY AUTOINCREMENT,
  id_usuario INTEGER,
  id_categoria INTEGER,
  tipo_comida TEXT,
  ciudad TEXT,
  latitud REAL,
  longitud REAL,
  fecha_busqueda TEXT DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (id_usuario)
  REFERENCES usuarios(id_usuario)
  ON DELETE SET NULL,

  FOREIGN KEY (id_categoria)
  REFERENCES categorias(id_categoria)
  ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS rutas (
  id_ruta INTEGER PRIMARY KEY AUTOINCREMENT,
  id_usuario INTEGER,
  id_restaurante INTEGER NOT NULL,

  origen_latitud REAL,
  origen_longitud REAL,

  destino_latitud REAL,
  destino_longitud REAL,

  distancia_texto TEXT,
  duracion_texto TEXT,
  medio_desplazamiento TEXT,

  fecha_consulta TEXT DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (id_usuario)
  REFERENCES usuarios(id_usuario)
  ON DELETE SET NULL,

   FOREIGN KEY (id_restaurante)
  REFERENCES restaurantes(id_restaurante)
  ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS reviews (
  id_review INTEGER PRIMARY KEY AUTOINCREMENT,

  id_plato INTEGER NOT NULL,
  id_restaurante INTEGER NOT NULL,
  id_usuario INTEGER NOT NULL,

  descripcion TEXT,
  puntuacion INTEGER CHECK(puntuacion >= 1 AND puntuacion <= 5),
  fecha_review TEXT DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (id_plato)
  REFERENCES platos(id_plato)
  ON DELETE CASCADE,

  FOREIGN KEY (id_restaurante)
  REFERENCES restaurantes(id_restaurante)
  ON DELETE CASCADE,

  FOREIGN KEY (id_usuario)
  REFERENCES usuarios(id_usuario)
  ON DELETE CASCADE );
  `);

  console.log("Base de datos inicializada");
}

export async function cargarRestaurantesIniciales() {
  const db = await getDatabase();

  await db.execAsync(`

    /* ==========================
       CATEGORÍAS
    ========================== */

    INSERT OR IGNORE INTO categorias
    (id_categoria,nombre,descripcion)
    VALUES
    (1,'Parrilla','Carnes y asados'),
    (2,'Gourmet','Alta cocina'),
    (3,'Cafe','Cafeteria y panaderia'),
    (4,'Pizza','Pizzas artesanales'),
    (5,'Comida Rapida','Hamburguesas y similares');


    /* ==========================
       RESTAURANTES
    ========================== */

    INSERT OR IGNORE INTO restaurantes (
      id_restaurante,
      nombre,
      descripcion,
      tipo_comida,
      direccion,
      ciudad,
      latitud,
      longitud,
      imagen_url,
      telefono,
      horario,
      calificacion
    )
    VALUES (
      1,
      'Pepitos Xpress',
      'Comida rápida al estilo Sincelejo, famosa por sus hamburguesas y sabores únicos.',
      'Comida rápida y Pizza',
      'Calle 25 # 27-151',
      'Sincelejo',
      9.3047,
      -75.3978,
      'assets/images_restaurantesyplatos/r1.png',
      '3001234567',
      'Domingo a Sábado de 4:00 PM a 12:00 AM',
      4.5
    );

    INSERT OR IGNORE INTO restaurantes (
      id_restaurante,
      nombre,
      descripcion,
      tipo_comida,
      direccion,
      ciudad,
      latitud,
      longitud,
      telefono,
      horario,
      calificacion
    )
    VALUES (
      2,
      'Arcanos Cocina Gourmet',
      'Destacado establecimiento de alta cocina gourmet con una propuesta culinaria innovadora y platos internacionales.',
      'Gourmet internacional y fusion caribena',
      'Calle 25 # 28-331',
      'Sincelejo',
      9.3021,
      -75.3908,
      '+57 3216406729',
      'Lunes a Domingo de 12:00 PM a 10:00 PM',
      4.5
    );

    INSERT OR IGNORE INTO restaurantes (
      id_restaurante,
      nombre,
      descripcion,
      tipo_comida,
      direccion,
      ciudad,
      latitud,
      longitud,
      telefono,
      horario,
      calificacion
    )
    VALUES (
      3,
      'Diverso Restaurante',
      'Propuesta gastronómica fresca y de vanguardia en un entorno contemporáneo y acogedor.',
      'Parrilla, mariscos y fusión contemporánea',
      'Transversal 28B # 25-65',
      'Sincelejo',
      9.3015,
      -75.3912,
      '+57 3244366422',
      'Martes a Domingo de 12:00 PM a 11:00 PM',
      4.5
    );

    INSERT OR IGNORE INTO restaurantes (
      id_restaurante,
      nombre,
      descripcion,
      tipo_comida,
      direccion,
      ciudad,
      latitud,
      longitud,
      telefono,
      horario,
      calificacion
    )
    VALUES (
      4,
      'Restaurante La Vaca Asá',
      'Especializado en cortes de carne, ambiente relajado y porciones generosas.',
      'Parrilla, asados y comida típica colombiana',
      'Calle 28 # 16-19',
      'Sincelejo',
      9.2942,
      -75.3985,
      '+57 3003277889',
      'Lunes a Sábado de 4:00 PM a 12:00 AM',
      4.3
    );

    INSERT OR IGNORE INTO restaurantes (
      id_restaurante,
      nombre,
      descripcion,
      tipo_comida,
      direccion,
      ciudad,
      latitud,
      longitud,
      telefono,
      horario,
      calificacion
    )
    VALUES (
      5,
      'Antaño Horno y Café',
      'Espacio bohemio con panadería artesanal, café y pizzas al horno de piedra.',
      'Café y panadería artesanal',
      'Transversal 28A # 25-49',
      'Sincelejo',
      9.3018,
      -75.3915,
      '+57 3002436249',
      'Lunes a Sábado de 7:30 AM a 9:30 PM',
      4.5
    );


    /* ==========================
       PLATOS
    ========================== */

    INSERT OR IGNORE INTO platos
    (
      id_plato,
      id_restaurante,
      id_categoria,
      nombre,
      descripcion,
      precio,
      imagen_url,
      modelo_3d_url
    )
    VALUES

    (
      1,
      1,
      4,
      'Pizza Pepperoni',
      'Pizza artesanal con pepperoni',
      28000,
      'assets/images_restaurantesyplatos/r1_Plato1.png',
      'https://paulagb2025.github.io/tastego-assets/pepperoni_pizza.glb'
    ),

    (
      2,
      1,
      4,
      'Hamburguesa Mixta',
      'Hamburguesa con carne, pollo y tocineta',
      30000,
      'assets/images_restaurantesyplatos/r1_Plato2.png',
      'https://paulagb2025.github.io/tastego-assets/hamburguesa.glb'
    ),

    (
  3,
  2,
  2,
  'Risotto Gourmet',
  'Risotto de hongos',
  36000,
  NULL,
  'https://paulagb2025.github.io/tastego-assets/risotto_rapa_rossa.glb'
),

(
  4,
  2,
  2,
  'Lomo en Salsa',
  'Lomo fino con salsa especial',
  42000,
  NULL,
  'https://paulagb2025.github.io/tastego-assets/kebab_cc0.glb'
),

(
  5,
  3,
  2,
  'Salmon Mediterraneo',
  'Salmon al horno',
  45000,
  NULL,
  'https://paulagb2025.github.io/tastego-assets/salmon_with_whisky_sauce.glb'
),

(
  6,
  3,
  2,
  'Pasta de Autor',
  'Pasta artesanal',
  34000,
  NULL,
  'https://paulagb2025.github.io/tastego-assets/pasta_with_meatballs_and_sausage.glb'
),

(
  7,
  4,
  1,
  'Parrillada Mixta',
  'Carnes para compartir',
  52000,
  NULL,
  'https://paulagb2025.github.io/tastego-assets/parrillada_mixta.glb'
),

(
  8,
  4,
  1,
  'Costillas BBQ',
  'Costillas ahumadas',
  38000,
  NULL,
  'https://paulagb2025.github.io/tastego-assets/costillas_BBQ.glb'
),

(
  9,
  5,
  3,
  'Cappuccino',
  'Cafe especial',
  9000,
  NULL,
  'https://paulagb2025.github.io/tastego-assets/Cappuccino.glb'
),

(
  10,
  5,
  4,
  'Carne Imperio Romano',
  'Lomo con puré de papa y salsa Demi-glace',
  28000,
  NULL,
  'https://paulagb2025.github.io/tastego-assets/carne_imperioromano.glb'
);

  `);

  console.log("Restaurantes y platos cargados");
}