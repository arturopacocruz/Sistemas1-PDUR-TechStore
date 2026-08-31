import Database from 'better-sqlite3';
import path from 'path';
import { CryptoUtil } from '../utils/crypto.js';

const dbPath = path.resolve(process.cwd(), 'techstore.db');
export const db = new Database(dbPath);

// Habilitar claves foráneas
db.pragma('foreign_keys = ON');

export function initDatabase() {
  // Crear tablas con soporte de auditoría ASFI y campos criptográficos
  db.exec(`
    CREATE TABLE IF NOT EXISTS usuario (
      id_usuario INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      telefono TEXT,
      password_hash TEXT NOT NULL DEFAULT '$2a$12$e8Yk1.K1K7w7oH1x3YFGe.a9GgN5W2WkSjC7zZ7a0P1Q9b8U5j9s6',
      rol TEXT NOT NULL DEFAULT 'CLIENTE' CHECK (rol IN ('CLIENTE', 'ADMINISTRADOR')),
      estado TEXT NOT NULL DEFAULT 'Activo' CHECK (estado IN ('Activo', 'Inactivo')),
      fecha_registro TEXT NOT NULL DEFAULT (DATE('now'))
    );

    CREATE TABLE IF NOT EXISTS categoria (
      id_categoria INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL UNIQUE,
      descripcion TEXT,
      estado TEXT NOT NULL DEFAULT 'Activa' CHECK (estado IN ('Activa', 'Inactiva'))
    );

    CREATE TABLE IF NOT EXISTS producto (
      id_producto INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      descripcion TEXT,
      precio REAL NOT NULL CHECK (precio > 0),
      stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
      imagen TEXT,
      estado TEXT NOT NULL DEFAULT 'Activo' CHECK (estado IN ('Activo', 'Agotado', 'Inactivo')),
      fecha_creacion TEXT NOT NULL DEFAULT (DATE('now')),
      fecha_actualizacion TEXT,
      id_categoria INTEGER NOT NULL,
      FOREIGN KEY (id_categoria) REFERENCES categoria(id_categoria) ON UPDATE CASCADE ON DELETE RESTRICT
    );

    CREATE TABLE IF NOT EXISTS carrito (
      id_carrito INTEGER PRIMARY KEY AUTOINCREMENT,
      id_usuario INTEGER NOT NULL UNIQUE,
      fecha_creacion TEXT NOT NULL DEFAULT (DATE('now')),
      estado TEXT NOT NULL DEFAULT 'Vacio' CHECK (estado IN ('Vacio', 'Con Productos', 'Confirmado')),
      FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON UPDATE CASCADE ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS item_carrito (
      id_item INTEGER PRIMARY KEY AUTOINCREMENT,
      id_carrito INTEGER NOT NULL,
      id_producto INTEGER NOT NULL,
      cantidad INTEGER NOT NULL CHECK (cantidad > 0),
      precio_unitario REAL NOT NULL CHECK (precio_unitario > 0),
      subtotal REAL NOT NULL CHECK (subtotal >= 0),
      UNIQUE (id_carrito, id_producto),
      FOREIGN KEY (id_carrito) REFERENCES carrito(id_carrito) ON UPDATE CASCADE ON DELETE CASCADE,
      FOREIGN KEY (id_producto) REFERENCES producto(id_producto) ON UPDATE CASCADE ON DELETE RESTRICT
    );

    CREATE TABLE IF NOT EXISTS direccion_entrega (
      id_direccion INTEGER PRIMARY KEY AUTOINCREMENT,
      id_usuario INTEGER NOT NULL,
      nombre_receptor TEXT NOT NULL,
      direccion TEXT NOT NULL,
      ciudad TEXT NOT NULL,
      telefono TEXT NOT NULL,
      nit_ci TEXT,
      razon_social TEXT,
      FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON UPDATE CASCADE ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS pedido (
      id_pedido INTEGER PRIMARY KEY AUTOINCREMENT,
      numero_pedido TEXT NOT NULL UNIQUE,
      id_usuario INTEGER NOT NULL,
      id_direccion INTEGER NOT NULL,
      fecha TEXT NOT NULL DEFAULT (DATE('now')),
      estado TEXT NOT NULL DEFAULT 'Pendiente' CHECK (estado IN ('Pendiente', 'Confirmado', 'Preparando', 'Entregado', 'Rechazado')),
      total REAL NOT NULL DEFAULT 0 CHECK (total >= 0),
      hash_integridad TEXT NOT NULL DEFAULT '0000000000000000000000000000000000000000000000000000000000000000',
      nit_ci TEXT,
      razon_social TEXT,
      FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON UPDATE CASCADE ON DELETE RESTRICT,
      FOREIGN KEY (id_direccion) REFERENCES direccion_entrega(id_direccion) ON UPDATE CASCADE ON DELETE RESTRICT
    );

    CREATE TABLE IF NOT EXISTS detalle_pedido (
      id_detalle INTEGER PRIMARY KEY AUTOINCREMENT,
      id_pedido INTEGER NOT NULL,
      id_producto INTEGER NOT NULL,
      cantidad INTEGER NOT NULL CHECK (cantidad > 0),
      precio_unitario REAL NOT NULL CHECK (precio_unitario > 0),
      subtotal REAL NOT NULL CHECK (subtotal >= 0),
      FOREIGN KEY (id_pedido) REFERENCES pedido(id_pedido) ON UPDATE CASCADE ON DELETE CASCADE,
      FOREIGN KEY (id_producto) REFERENCES producto(id_producto) ON UPDATE CASCADE ON DELETE RESTRICT
    );

    -- 9. TABLA LOGS_AUDITORIA (Inalterable - Cumplimiento ASFI / ISO 27001)
    CREATE TABLE IF NOT EXISTS logs_auditoria (
      id_log INTEGER PRIMARY KEY AUTOINCREMENT,
      id_usuario INTEGER,
      ip_origen TEXT NOT NULL,
      user_agent TEXT,
      accion TEXT NOT NULL,
      entidad_afectada TEXT NOT NULL,
      id_entidad TEXT,
      detalles TEXT,
      hash_integridad TEXT NOT NULL,
      fecha_utc TEXT NOT NULL DEFAULT (DATETIME('now')),
      FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE SET NULL
    );

    -- Trigger de Inalterabilidad SQLite (ASFI: Tabla inmutable)
    CREATE TRIGGER IF NOT EXISTS trg_prevent_audit_update
    BEFORE UPDATE ON logs_auditoria
    BEGIN
      SELECT RAISE(ABORT, 'VIOLACIÓN ASFI: Los logs de auditoría son inalterables');
    END;

    CREATE TRIGGER IF NOT EXISTS trg_prevent_audit_delete
    BEFORE DELETE ON logs_auditoria
    BEGIN
      SELECT RAISE(ABORT, 'VIOLACIÓN ASFI: Los logs de auditoría no pueden ser eliminados');
    END;

    -- Indices
    CREATE INDEX IF NOT EXISTS idx_producto_categoria ON producto(id_categoria);
    CREATE INDEX IF NOT EXISTS idx_producto_nombre ON producto(nombre);
    CREATE INDEX IF NOT EXISTS idx_carrito_usuario ON carrito(id_usuario);
    CREATE INDEX IF NOT EXISTS idx_item_carrito ON item_carrito(id_carrito);
    CREATE INDEX IF NOT EXISTS idx_item_producto ON item_carrito(id_producto);
    CREATE INDEX IF NOT EXISTS idx_direccion_usuario ON direccion_entrega(id_usuario);
    CREATE INDEX IF NOT EXISTS idx_pedido_usuario ON pedido(id_usuario);
    CREATE INDEX IF NOT EXISTS idx_pedido_estado ON pedido(estado);
    CREATE INDEX IF NOT EXISTS idx_detalle_pedido ON detalle_pedido(id_pedido);
    CREATE INDEX IF NOT EXISTS idx_audit_fecha ON logs_auditoria(fecha_utc);
    CREATE INDEX IF NOT EXISTS idx_audit_accion ON logs_auditoria(accion);
  `);

  // Migración automática de columnas para bases de datos SQLite preexistentes
  try {
    const colsDireccion = db.prepare("PRAGMA table_info(direccion_entrega)").all() as { name: string }[];
    const namesDir = colsDireccion.map(c => c.name);
    if (!namesDir.includes('nit_ci')) {
      db.exec("ALTER TABLE direccion_entrega ADD COLUMN nit_ci TEXT;");
    }
    if (!namesDir.includes('razon_social')) {
      db.exec("ALTER TABLE direccion_entrega ADD COLUMN razon_social TEXT;");
    }

    const colsPedido = db.prepare("PRAGMA table_info(pedido)").all() as { name: string }[];
    const namesPed = colsPedido.map(c => c.name);
    if (!namesPed.includes('nit_ci')) {
      db.exec("ALTER TABLE pedido ADD COLUMN nit_ci TEXT;");
    }
    if (!namesPed.includes('razon_social')) {
      db.exec("ALTER TABLE pedido ADD COLUMN razon_social TEXT;");
    }

    const colsUsuario = db.prepare("PRAGMA table_info(usuario)").all() as { name: string }[];
    const namesUser = colsUsuario.map(c => c.name);
    if (!namesUser.includes('estado')) {
      db.exec("ALTER TABLE usuario ADD COLUMN estado TEXT NOT NULL DEFAULT 'Activo';");
    }
  } catch (migErr) {
    console.error('[Database Migration]', migErr);
  }

  // Semillas si la base de datos está vacía
  const userCount = db.prepare('SELECT count(*) as count FROM usuario').get() as { count: number };
  if (userCount.count === 0) {
    const seedUsers = db.transaction(() => {
      // 1. Usuarios
      const insertUser = db.prepare(`
        INSERT INTO usuario (id_usuario, nombre, email, telefono, password_hash, rol, estado) VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      insertUser.run(1, 'Arturo Cruz', 'arturo@techstore.com', '70000001', '$2a$12$e8Yk1.K1K7w7oH1x3YFGe.a9GgN5W2WkSjC7zZ7a0P1Q9b8U5j9s6', 'CLIENTE', 'Activo');
      insertUser.run(2, 'Ronald Pérez', 'ronald@techstore.com', '70000002', '$2a$12$e8Yk1.K1K7w7oH1x3YFGe.a9GgN5W2WkSjC7zZ7a0P1Q9b8U5j9s6', 'CLIENTE', 'Activo');
      insertUser.run(3, 'Administrador TechStore', 'admin@techstore.com', '70000003', '$2a$12$e8Yk1.K1K7w7oH1x3YFGe.a9GgN5W2WkSjC7zZ7a0P1Q9b8U5j9s6', 'ADMINISTRADOR', 'Activo');

      // 2. Categorias
      const insertCat = db.prepare(`
        INSERT INTO categoria (id_categoria, nombre, descripcion, estado) VALUES (?, ?, ?, ?)
      `);
      insertCat.run(1, 'Laptops', 'Computadoras portátiles de alto rendimiento', 'Activa');
      insertCat.run(2, 'Celulares', 'Teléfonos inteligentes y accesorios', 'Activa');
      insertCat.run(3, 'Componentes', 'Memorias, procesadores y placas base', 'Activa');
      insertCat.run(4, 'Periféricos', 'Teclados mecánicos, mouse y audio', 'Activa');
      insertCat.run(5, 'Monitores', 'Monitores IPS, curvas y gaming de alta tasa', 'Activa');

      // 3. Productos
      const insertProd = db.prepare(`
        INSERT INTO producto (id_producto, nombre, descripcion, precio, stock, imagen, estado, id_categoria)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      insertProd.run(1, 'Laptop Lenovo IdeaPad 15', 'Laptop 15.6" FHD, Ryzen 7, 16GB RAM, 512GB SSD NVMe', 4500.00, 10, 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&auto=format&fit=crop&q=80', 'Activo', 1);
      insertProd.run(2, 'Samsung Galaxy A55 5G', 'Smartphone AMOLED 120Hz, 256GB Almacenamiento, 8GB RAM', 2800.00, 15, 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80', 'Activo', 2);
      insertProd.run(3, 'Memoria RAM Kingston DDR4 16GB', 'Módulo 3200MHz CL16 con disipador de aluminio anodizado', 450.00, 20, 'https://images.unsplash.com/photo-1541140532154-b024d705b909?w=600&auto=format&fit=crop&q=80', 'Activo', 3);
      insertProd.run(4, 'Mouse Gamer Logitech G203 Lightsync', 'Sensor HERO 8000 DPI, RGB personalizable, 6 botones programables', 250.00, 25, 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&auto=format&fit=crop&q=80', 'Activo', 4);
      insertProd.run(5, 'Monitor Gamer LG UltraGear 24" FHD', 'Panel IPS 144Hz 1ms, FreeSync Premium, HDR10', 1200.00, 8, 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&auto=format&fit=crop&q=80', 'Activo', 5);
      insertProd.run(6, 'Teclado Mecánico Redragon Kumara K552', 'Switches Outemu Red, iluminación RGB, estructura de acero', 380.00, 12, 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80', 'Activo', 4);
      insertProd.run(7, 'Audífonos HyperX Cloud Stinger Core', 'Drivers de 40mm, micrófono con cancelación de ruido pasiva', 320.00, 0, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80', 'Agotado', 4);

      // 4. Carritos iniciales
      const insertCart = db.prepare(`
        INSERT INTO carrito (id_carrito, id_usuario, estado) VALUES (?, ?, ?)
      `);
      insertCart.run(1, 1, 'Con Productos');
      insertCart.run(2, 2, 'Vacio');
      insertCart.run(3, 3, 'Vacio');

      // 5. Direcciones de entrega
      const insertDir = db.prepare(`
        INSERT INTO direccion_entrega (id_direccion, id_usuario, nombre_receptor, direccion, ciudad, telefono)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      insertDir.run(1, 1, 'Arturo Cruz', 'Av. Principal #123, Barrio El Tejar', 'Tarija', '70000001');
      insertDir.run(2, 2, 'Ronald Pérez', 'Calle Central #456, Casco Viejo', 'Tarija', '70000002');

      // 6. Items carrito inicial
      const insertItem = db.prepare(`
        INSERT INTO item_carrito (id_carrito, id_producto, cantidad, precio_unitario, subtotal)
        VALUES (?, ?, ?, ?, ?)
      `);
      insertItem.run(1, 1, 1, 4500.00, 4500.00);
      insertItem.run(1, 4, 2, 250.00, 500.00);

      // 7. Pedido inicial de prueba con Hash de Integridad (Ley N° 164)
      const hashInicial = CryptoUtil.generateIntegrityHash({
        numero_pedido: 'PED-000001',
        id_usuario: 1,
        total: 5000.00,
        fecha: '2026-08-25'
      });

      const insertPedido = db.prepare(`
        INSERT INTO pedido (id_pedido, numero_pedido, id_usuario, id_direccion, estado, total, hash_integridad)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      insertPedido.run(1, 'PED-000001', 1, 1, 'Confirmado', 5000.00, hashInicial);

      // 8. Detalle del pedido inicial
      const insertDetalle = db.prepare(`
        INSERT INTO detalle_pedido (id_pedido, id_producto, cantidad, precio_unitario, subtotal)
        VALUES (?, ?, ?, ?, ?)
      `);
      insertDetalle.run(1, 1, 1, 4500.00, 4500.00);
      insertDetalle.run(1, 4, 2, 250.00, 500.00);

      // 9. Registro inicial de auditoría ASFI
      const insertAudit = db.prepare(`
        INSERT INTO logs_auditoria (id_usuario, ip_origen, user_agent, accion, entidad_afectada, id_entidad, detalles, hash_integridad)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      const seedAuditHash = CryptoUtil.generateIntegrityHash({
        accion: 'SYSTEM_INITIALIZATION',
        ip: '127.0.0.1',
        time: new Date().toISOString()
      });
      insertAudit.run(
        3,
        '127.0.0.1',
        'TechStore-Server/2.0 (ASFI-Audited)',
        'SYSTEM_INITIALIZATION',
        'DATABASE',
        'SCHEMA',
        JSON.stringify({ evento: 'Esquema relacional y llaves criptográficas inicializadas' }),
        seedAuditHash
      );
    });

    seedUsers();
    console.log('[Database] Database initialized and seeded with ASFI audit logging and encryption.');
  }
}
