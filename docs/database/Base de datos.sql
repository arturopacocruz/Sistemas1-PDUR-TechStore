-- ============================================================
-- TECHSTORE
-- BASE DE DATOS - MODELO FÍSICO
-- PostgreSQL
-- ============================================================

-- ============================================================
-- ELIMINAR TABLAS SI YA EXISTEN
-- ============================================================

DROP TABLE IF EXISTS detalle_pedido CASCADE;
DROP TABLE IF EXISTS pedido CASCADE;
DROP TABLE IF EXISTS direccion_entrega CASCADE;
DROP TABLE IF EXISTS item_carrito CASCADE;
DROP TABLE IF EXISTS carrito CASCADE;
DROP TABLE IF EXISTS producto CASCADE;
DROP TABLE IF EXISTS categoria CASCADE;
DROP TABLE IF EXISTS usuario CASCADE;


-- ============================================================
-- 1. TABLA USUARIO
-- ============================================================

CREATE TABLE usuario (
    id_usuario SERIAL PRIMARY KEY,

    nombre VARCHAR(100) NOT NULL,

    email VARCHAR(150) NOT NULL UNIQUE,

    telefono VARCHAR(20),

    rol VARCHAR(20) NOT NULL DEFAULT 'CLIENTE',

    fecha_registro DATE NOT NULL DEFAULT CURRENT_DATE,

    CONSTRAINT chk_usuario_rol
        CHECK (rol IN ('CLIENTE', 'ADMINISTRADOR'))
);


-- ============================================================
-- 2. TABLA CATEGORIA
-- ============================================================

CREATE TABLE categoria (
    id_categoria SERIAL PRIMARY KEY,

    nombre VARCHAR(50) NOT NULL UNIQUE,

    descripcion VARCHAR(255),

    estado VARCHAR(15) NOT NULL DEFAULT 'Activa',

    CONSTRAINT chk_categoria_estado
        CHECK (estado IN ('Activa', 'Inactiva'))
);


-- ============================================================
-- 3. TABLA PRODUCTO
-- ============================================================

CREATE TABLE producto (
    id_producto SERIAL PRIMARY KEY,

    nombre VARCHAR(100) NOT NULL,

    descripcion TEXT,

    precio DECIMAL(10,2) NOT NULL,

    stock INT NOT NULL DEFAULT 0,

    imagen VARCHAR(255),

    estado VARCHAR(15) NOT NULL DEFAULT 'Activo',

    fecha_creacion DATE NOT NULL DEFAULT CURRENT_DATE,

    fecha_actualizacion DATE,

    id_categoria INT NOT NULL,

    CONSTRAINT fk_producto_categoria
        FOREIGN KEY (id_categoria)
        REFERENCES categoria(id_categoria)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT chk_producto_precio
        CHECK (precio > 0),

    CONSTRAINT chk_producto_stock
        CHECK (stock >= 0),

    CONSTRAINT chk_producto_estado
        CHECK (
            estado IN (
                'Activo',
                'Agotado',
                'Inactivo'
            )
        )
);


-- ============================================================
-- 4. TABLA CARRITO
-- ============================================================

CREATE TABLE carrito (
    id_carrito SERIAL PRIMARY KEY,

    id_usuario INT NOT NULL UNIQUE,

    fecha_creacion DATE NOT NULL DEFAULT CURRENT_DATE,

    estado VARCHAR(20) NOT NULL DEFAULT 'Vacio',

    CONSTRAINT fk_carrito_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuario(id_usuario)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT chk_carrito_estado
        CHECK (
            estado IN (
                'Vacio',
                'Con Productos',
                'Confirmado'
            )
        )
);


-- ============================================================
-- 5. TABLA ITEM_CARRITO
-- ============================================================

CREATE TABLE item_carrito (
    id_item SERIAL PRIMARY KEY,

    id_carrito INT NOT NULL,

    id_producto INT NOT NULL,

    cantidad INT NOT NULL,

    precio_unitario DECIMAL(10,2) NOT NULL,

    subtotal DECIMAL(10,2) NOT NULL,

    CONSTRAINT fk_item_carrito
        FOREIGN KEY (id_carrito)
        REFERENCES carrito(id_carrito)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_item_producto
        FOREIGN KEY (id_producto)
        REFERENCES producto(id_producto)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT chk_item_cantidad
        CHECK (cantidad > 0),

    CONSTRAINT chk_item_precio
        CHECK (precio_unitario > 0),

    CONSTRAINT chk_item_subtotal
        CHECK (subtotal >= 0),

    CONSTRAINT uq_carrito_producto
        UNIQUE (id_carrito, id_producto)
);


-- ============================================================
-- 6. TABLA DIRECCION_ENTREGA
-- ============================================================

CREATE TABLE direccion_entrega (
    id_direccion SERIAL PRIMARY KEY,

    id_usuario INT NOT NULL,

    nombre_receptor VARCHAR(100) NOT NULL,

    direccion VARCHAR(255) NOT NULL,

    ciudad VARCHAR(100) NOT NULL,

    telefono VARCHAR(20) NOT NULL,

    CONSTRAINT fk_direccion_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuario(id_usuario)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);


-- ============================================================
-- 7. TABLA PEDIDO
-- ============================================================

CREATE TABLE pedido (
    id_pedido SERIAL PRIMARY KEY,

    numero_pedido VARCHAR(20) NOT NULL UNIQUE,

    id_usuario INT NOT NULL,

    id_direccion INT NOT NULL,

    fecha DATE NOT NULL DEFAULT CURRENT_DATE,

    estado VARCHAR(20) NOT NULL DEFAULT 'Pendiente',

    total DECIMAL(10,2) NOT NULL DEFAULT 0,

    CONSTRAINT fk_pedido_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuario(id_usuario)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_pedido_direccion
        FOREIGN KEY (id_direccion)
        REFERENCES direccion_entrega(id_direccion)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT chk_pedido_estado
        CHECK (
            estado IN (
                'Pendiente',
                'Confirmado',
                'Preparando',
                'Entregado',
                'Rechazado'
            )
        ),

    CONSTRAINT chk_pedido_total
        CHECK (total >= 0)
);


-- ============================================================
-- 8. TABLA DETALLE_PEDIDO
-- ============================================================

CREATE TABLE detalle_pedido (
    id_detalle SERIAL PRIMARY KEY,

    id_pedido INT NOT NULL,

    id_producto INT NOT NULL,

    cantidad INT NOT NULL,

    precio_unitario DECIMAL(10,2) NOT NULL,

    subtotal DECIMAL(10,2) NOT NULL,

    CONSTRAINT fk_detalle_pedido
        FOREIGN KEY (id_pedido)
        REFERENCES pedido(id_pedido)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_detalle_producto
        FOREIGN KEY (id_producto)
        REFERENCES producto(id_producto)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT chk_detalle_cantidad
        CHECK (cantidad > 0),

    CONSTRAINT chk_detalle_precio
        CHECK (precio_unitario > 0),

    CONSTRAINT chk_detalle_subtotal
        CHECK (subtotal >= 0)
);


-- ============================================================
-- ÍNDICES
-- ============================================================

CREATE INDEX idx_producto_categoria
    ON producto(id_categoria);

CREATE INDEX idx_producto_nombre
    ON producto(nombre);

CREATE INDEX idx_carrito_usuario
    ON carrito(id_usuario);

CREATE INDEX idx_item_carrito
    ON item_carrito(id_carrito);

CREATE INDEX idx_item_producto
    ON item_carrito(id_producto);

CREATE INDEX idx_direccion_usuario
    ON direccion_entrega(id_usuario);

CREATE INDEX idx_pedido_usuario
    ON pedido(id_usuario);

CREATE INDEX idx_pedido_direccion
    ON pedido(id_direccion);

CREATE INDEX idx_pedido_estado
    ON pedido(estado);

CREATE INDEX idx_detalle_pedido
    ON detalle_pedido(id_pedido);

CREATE INDEX idx_detalle_producto
    ON detalle_pedido(id_producto);


-- ============================================================
-- DATOS DE PRUEBA
-- ============================================================


-- ============================================================
-- USUARIOS
-- ============================================================

INSERT INTO usuario
(nombre, email, telefono, rol)
VALUES
(
    'Arturo Cruz',
    'arturo@techstore.com',
    '70000001',
    'CLIENTE'
),
(
    'Ronald Pérez',
    'ronald@techstore.com',
    '70000002',
    'CLIENTE'
),
(
    'Administrador TechStore',
    'admin@techstore.com',
    '70000003',
    'ADMINISTRADOR'
);


-- ============================================================
-- CATEGORIAS
-- ============================================================

INSERT INTO categoria
(nombre, descripcion, estado)
VALUES
(
    'Laptops',
    'Computadoras portátiles',
    'Activa'
),
(
    'Celulares',
    'Teléfonos inteligentes',
    'Activa'
),
(
    'Componentes',
    'Componentes para computadoras',
    'Activa'
),
(
    'Periféricos',
    'Teclados, mouse y otros periféricos',
    'Activa'
),
(
    'Monitores',
    'Monitores y pantallas',
    'Activa'
);


-- ============================================================
-- PRODUCTOS
-- ============================================================

INSERT INTO producto
(
    nombre,
    descripcion,
    precio,
    stock,
    imagen,
    estado,
    id_categoria
)
VALUES
(
    'Laptop Lenovo IdeaPad',
    'Laptop para uso académico y profesional',
    4500.00,
    10,
    'lenovo-ideapad.jpg',
    'Activo',
    1
),
(
    'Samsung Galaxy A55',
    'Smartphone Samsung Galaxy A55',
    2800.00,
    15,
    'samsung-a55.jpg',
    'Activo',
    2
),
(
    'Memoria RAM DDR4 16GB',
    'Memoria RAM DDR4 de 16GB',
    450.00,
    20,
    'ram-ddr4.jpg',
    'Activo',
    3
),
(
    'Mouse Logitech G203',
    'Mouse gaming Logitech G203',
    250.00,
    25,
    'logitech-g203.jpg',
    'Activo',
    4
),
(
    'Monitor LG 24 pulgadas',
    'Monitor Full HD de 24 pulgadas',
    1200.00,
    8,
    'monitor-lg.jpg',
    'Activo',
    5
);


-- ============================================================
-- CARRITOS
-- ============================================================

INSERT INTO carrito
(
    id_usuario,
    estado
)
VALUES
(
    1,
    'Vacio'
),
(
    2,
    'Vacio'
);


-- ============================================================
-- DIRECCIONES DE ENTREGA
-- ============================================================

INSERT INTO direccion_entrega
(
    id_usuario,
    nombre_receptor,
    direccion,
    ciudad,
    telefono
)
VALUES
(
    1,
    'Arturo Cruz',
    'Av. Principal #123',
    'Tarija',
    '70000001'
),
(
    2,
    'Ronald Pérez',
    'Calle Central #456',
    'Tarija',
    '70000002'
);


-- ============================================================
-- ITEMS DE CARRITO
-- ============================================================

INSERT INTO item_carrito
(
    id_carrito,
    id_producto,
    cantidad,
    precio_unitario,
    subtotal
)
VALUES
(
    1,
    1,
    1,
    4500.00,
    4500.00
),
(
    1,
    4,
    2,
    250.00,
    500.00
);


-- Actualizamos el estado del carrito
UPDATE carrito
SET estado = 'Con Productos'
WHERE id_carrito = 1;


-- ============================================================
-- PEDIDO
-- ============================================================

INSERT INTO pedido
(
    numero_pedido,
    id_usuario,
    id_direccion,
    estado,
    total
)
VALUES
(
    'PED-000001',
    1,
    1,
    'Confirmado',
    5000.00
);


-- ============================================================
-- DETALLE DEL PEDIDO
-- ============================================================

INSERT INTO detalle_pedido
(
    id_pedido,
    id_producto,
    cantidad,
    precio_unitario,
    subtotal
)
VALUES
(
    1,
    1,
    1,
    4500.00,
    4500.00
),
(
    1,
    4,
    2,
    250.00,
    500.00
);


-- ============================================================
-- CONSULTAS DE VERIFICACIÓN
-- ============================================================


-- Usuarios
SELECT *
FROM usuario;


-- Categorías
SELECT *
FROM categoria;


-- Productos con su categoría
SELECT
    p.id_producto,
    p.nombre AS producto,
    c.nombre AS categoria,
    p.precio,
    p.stock,
    p.estado
FROM producto p
INNER JOIN categoria c
    ON p.id_categoria = c.id_categoria
ORDER BY p.id_producto;


-- Carritos con sus usuarios
SELECT
    c.id_carrito,
    u.nombre AS usuario,
    u.email,
    c.estado,
    c.fecha_creacion
FROM carrito c
INNER JOIN usuario u
    ON c.id_usuario = u.id_usuario;


-- Productos dentro del carrito
SELECT
    c.id_carrito,
    u.nombre AS cliente,
    p.nombre AS producto,
    ic.cantidad,
    ic.precio_unitario,
    ic.subtotal
FROM item_carrito ic
INNER JOIN carrito c
    ON ic.id_carrito = c.id_carrito
INNER JOIN usuario u
    ON c.id_usuario = u.id_usuario
INNER JOIN producto p
    ON ic.id_producto = p.id_producto;


-- Pedidos con información del cliente
SELECT
    p.id_pedido,
    p.numero_pedido,
    u.nombre AS cliente,
    p.fecha,
    p.estado,
    p.total
FROM pedido p
INNER JOIN usuario u
    ON p.id_usuario = u.id_usuario;


-- Detalle de pedidos
SELECT
    p.numero_pedido,
    u.nombre AS cliente,
    pr.nombre AS producto,
    dp.cantidad,
    dp.precio_unitario,
    dp.subtotal
FROM detalle_pedido dp
INNER JOIN pedido p
    ON dp.id_pedido = p.id_pedido
INNER JOIN usuario u
    ON p.id_usuario = u.id_usuario
INNER JOIN producto pr
    ON dp.id_producto = pr.id_producto;


-- Direcciones de los usuarios
SELECT
    u.nombre AS usuario,
    u.rol,
    d.nombre_receptor,
    d.direccion,
    d.ciudad,
    d.telefono
FROM direccion_entrega d
INNER JOIN usuario u
    ON d.id_usuario = u.id_usuario;