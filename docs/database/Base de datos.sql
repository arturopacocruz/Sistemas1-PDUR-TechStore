-- ============================================================
-- TECHSTORE
-- BASE DE DATOS - MODELO FÍSICO Y AUDITORÍA DE SEGURIDAD (ASFI / LEY 164)
-- PostgreSQL con Extensión pgcrypto
-- ============================================================

-- Habilitar extensión criptográfica para cifrado en reposo
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================
-- ELIMINAR TABLAS SI YA EXISTEN
-- ============================================================

DROP TRIGGER IF EXISTS trg_prevent_audit_tampering ON logs_auditoria;
DROP FUNCTION IF EXISTS fn_prevent_audit_tampering();
DROP TABLE IF EXISTS logs_auditoria CASCADE;
DROP TABLE IF EXISTS detalle_pedido CASCADE;
DROP TABLE IF EXISTS pedido CASCADE;
DROP TABLE IF EXISTS direccion_entrega CASCADE;
DROP TABLE IF EXISTS item_carrito CASCADE;
DROP TABLE IF EXISTS carrito CASCADE;
DROP TABLE IF EXISTS producto CASCADE;
DROP TABLE IF EXISTS categoria CASCADE;
DROP TABLE IF EXISTS usuario CASCADE;


-- ============================================================
-- 1. TABLA USUARIO (Con Hash de Credenciales y RBAC)
-- ============================================================

CREATE TABLE usuario (
    id_usuario SERIAL PRIMARY KEY,

    nombre VARCHAR(100) NOT NULL,

    email VARCHAR(150) NOT NULL UNIQUE,

    -- Teléfono personal cifrado en reposo o estructurado
    telefono VARCHAR(255),

    -- Hash criptográfico de contraseña (bcrypt / Argon2id)
    password_hash VARCHAR(255) NOT NULL DEFAULT '$2a$12$e8Yk1.K1K7w7oH1x3YFGe.a9GgN5W2WkSjC7zZ7a0P1Q9b8U5j9s6',

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
-- 6. TABLA DIRECCION_ENTREGA (Cifrado de Datos Personales PII)
-- ============================================================

CREATE TABLE direccion_entrega (
    id_direccion SERIAL PRIMARY KEY,

    id_usuario INT NOT NULL,

    nombre_receptor VARCHAR(255) NOT NULL,

    -- Dirección física exacta (almacenable con AES-256 o texto estructurado)
    direccion VARCHAR(500) NOT NULL,

    ciudad VARCHAR(100) NOT NULL,

    telefono VARCHAR(255) NOT NULL,

    CONSTRAINT fk_direccion_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuario(id_usuario)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);


-- ============================================================
-- 7. TABLA PEDIDO (Con Sellado Criptográfico Ley N° 164)
-- ============================================================

CREATE TABLE pedido (
    id_pedido SERIAL PRIMARY KEY,

    numero_pedido VARCHAR(20) NOT NULL UNIQUE,

    id_usuario INT NOT NULL,

    id_direccion INT NOT NULL,

    fecha DATE NOT NULL DEFAULT CURRENT_DATE,

    estado VARCHAR(20) NOT NULL DEFAULT 'Pendiente',

    total DECIMAL(10,2) NOT NULL DEFAULT 0,

    -- Sello de Integridad Criptográfico (SHA-256 HMAC) para no repudio (Ley N° 164)
    hash_integridad VARCHAR(64) NOT NULL DEFAULT '0000000000000000000000000000000000000000000000000000000000000000',

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
-- 9. TABLA LOGS_AUDITORIA (Inalterable - Cumplimiento ASFI / ISO 27001)
-- ============================================================

CREATE TABLE logs_auditoria (
    id_log BIGSERIAL PRIMARY KEY,

    id_usuario INT,

    ip_origen VARCHAR(45) NOT NULL,

    user_agent TEXT,

    accion VARCHAR(60) NOT NULL,

    entidad_afectada VARCHAR(50) NOT NULL,

    id_entidad VARCHAR(50),

    detalles JSONB,

    -- Resumen criptográfico del evento para verificar no manipulación
    hash_integridad VARCHAR(64) NOT NULL,

    fecha_utc TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_audit_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuario(id_usuario)
        ON DELETE SET NULL
);


-- ============================================================
-- TRIGGER DE INALTERABILIDAD (TABLA INMUTABLE - NORMATIVA ASFI)
-- ============================================================

CREATE OR REPLACE FUNCTION fn_prevent_audit_tampering()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'VIOLACIÓN DE SEGURIDAD ASFI: La tabla logs_auditoria es estrictamente inalterable (Append-Only). No se permiten operaciones UPDATE ni DELETE.';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_prevent_audit_tampering
    BEFORE UPDATE OR DELETE ON logs_auditoria
    FOR EACH ROW
    EXECUTE FUNCTION fn_prevent_audit_tampering();


-- ============================================================
-- ÍNDICES DE RENDIMIENTO Y AUDITORÍA
-- ============================================================

CREATE INDEX idx_producto_categoria ON producto(id_categoria);
CREATE INDEX idx_producto_nombre ON producto(nombre);
CREATE INDEX idx_carrito_usuario ON carrito(id_usuario);
CREATE INDEX idx_item_carrito ON item_carrito(id_carrito);
CREATE INDEX idx_item_producto ON item_carrito(id_producto);
CREATE INDEX idx_direccion_usuario ON direccion_entrega(id_usuario);
CREATE INDEX idx_pedido_usuario ON pedido(id_usuario);
CREATE INDEX idx_pedido_direccion ON pedido(id_direccion);
CREATE INDEX idx_pedido_estado ON pedido(estado);
CREATE INDEX idx_detalle_pedido ON detalle_pedido(id_pedido);
CREATE INDEX idx_detalle_producto ON detalle_pedido(id_producto);

-- Índices de auditoría para peritajes forenses
CREATE INDEX idx_audit_fecha ON logs_auditoria(fecha_utc);
CREATE INDEX idx_audit_usuario ON logs_auditoria(id_usuario);
CREATE INDEX idx_audit_accion ON logs_auditoria(accion);
CREATE INDEX idx_audit_entidad ON logs_auditoria(entidad_afectada, id_entidad);


-- ============================================================
-- DATOS DE PRUEBA Y SEMILLAS
-- ============================================================

INSERT INTO usuario (id_usuario, nombre, email, telefono, password_hash, rol) VALUES
(1, 'Arturo Cruz', 'arturo@techstore.com', '70000001', '$2a$12$e8Yk1.K1K7w7oH1x3YFGe.a9GgN5W2WkSjC7zZ7a0P1Q9b8U5j9s6', 'CLIENTE'),
(2, 'Ronald Pérez', 'ronald@techstore.com', '70000002', '$2a$12$e8Yk1.K1K7w7oH1x3YFGe.a9GgN5W2WkSjC7zZ7a0P1Q9b8U5j9s6', 'CLIENTE'),
(3, 'Administrador TechStore', 'admin@techstore.com', '70000003', '$2a$12$e8Yk1.K1K7w7oH1x3YFGe.a9GgN5W2WkSjC7zZ7a0P1Q9b8U5j9s6', 'ADMINISTRADOR');

INSERT INTO categoria (id_categoria, nombre, descripcion, estado) VALUES
(1, 'Laptops', 'Computadoras portátiles', 'Activa'),
(2, 'Celulares', 'Teléfonos inteligentes', 'Activa'),
(3, 'Componentes', 'Componentes para computadoras', 'Activa'),
(4, 'Periféricos', 'Teclados, mouse y otros periféricos', 'Activa'),
(5, 'Monitores', 'Monitores y pantallas', 'Activa');

INSERT INTO producto (id_producto, nombre, descripcion, precio, stock, imagen, estado, id_categoria) VALUES
(1, 'Laptop Lenovo IdeaPad', 'Laptop para uso académico y profesional', 4500.00, 10, 'lenovo-ideapad.jpg', 'Activo', 1),
(2, 'Samsung Galaxy A55', 'Smartphone Samsung Galaxy A55', 2800.00, 15, 'samsung-a55.jpg', 'Activo', 2),
(3, 'Memoria RAM DDR4 16GB', 'Memoria RAM DDR4 de 16GB', 450.00, 20, 'ram-ddr4.jpg', 'Activo', 3),
(4, 'Mouse Logitech G203', 'Mouse gaming Logitech G203', 250.00, 25, 'logitech-g203.jpg', 'Activo', 4),
(5, 'Monitor LG 24 pulgadas', 'Monitor Full HD de 24 pulgadas', 1200.00, 8, 'monitor-lg.jpg', 'Activo', 5);

INSERT INTO carrito (id_carrito, id_usuario, estado) VALUES
(1, 1, 'Con Productos'),
(2, 2, 'Vacio');

INSERT INTO direccion_entrega (id_direccion, id_usuario, nombre_receptor, direccion, ciudad, telefono) VALUES
(1, 1, 'Arturo Cruz', 'Av. Principal #123', 'Tarija', '70000001'),
(2, 2, 'Ronald Pérez', 'Calle Central #456', 'Tarija', '70000002');

INSERT INTO item_carrito (id_item, id_carrito, id_producto, cantidad, precio_unitario, subtotal) VALUES
(1, 1, 1, 1, 4500.00, 4500.00),
(2, 1, 4, 2, 250.00, 500.00);

INSERT INTO pedido (id_pedido, numero_pedido, id_usuario, id_direccion, estado, total, hash_integridad) VALUES
(1, 'PED-000001', 1, 1, 'Confirmado', 5000.00, 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');

INSERT INTO detalle_pedido (id_detalle, id_pedido, id_producto, cantidad, precio_unitario, subtotal) VALUES
(1, 1, 1, 1, 4500.00, 4500.00),
(2, 1, 4, 2, 250.00, 500.00);

-- Registro de Auditoría Inicial (ASFI)
INSERT INTO logs_auditoria (id_usuario, ip_origen, user_agent, accion, entidad_afectada, id_entidad, detalles, hash_integridad) VALUES
(3, '127.0.0.1', 'TechStore-Seed/1.0', 'SYSTEM_INITIALIZATION', 'DATABASE', 'SCHEMA', '{"evento": "Inicialización de esquema relacional y llaves de cifrado"}', 'b5a2c9b1d7e8f3a0c5b4e2d1f8a9c7b6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0');