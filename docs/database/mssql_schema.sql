-- ============================================================
-- TECHSTORE - MICROSOFT SQL SERVER (T-SQL)
-- ESQUEMA FÍSICO, INTEGRIDAD 3FN, AUDITORÍA ASFI Y LEY 164
-- Compatible con: SQL Server 2016, 2019, 2022, Azure SQL & SSMS
-- ============================================================

-- 1. CREACIÓN Y USO DE LA BASE DE DATOS
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'techstore')
BEGIN
    CREATE DATABASE techstore;
END
GO

USE techstore;
GO

-- 2. ELIMINACIÓN DE TABLAS SI YA EXISTEN (ORDEN INVERSO DE DEPENDENCIAS)
IF OBJECT_ID('dbo.trg_prevent_audit_tampering', 'TR') IS NOT NULL DROP TRIGGER dbo.trg_prevent_audit_tampering;
IF OBJECT_ID('dbo.logs_auditoria', 'U') IS NOT NULL DROP TABLE dbo.logs_auditoria;
IF OBJECT_ID('dbo.detalle_pedido', 'U') IS NOT NULL DROP TABLE dbo.detalle_pedido;
IF OBJECT_ID('dbo.pedido', 'U') IS NOT NULL DROP TABLE dbo.pedido;
IF OBJECT_ID('dbo.direccion_entrega', 'U') IS NOT NULL DROP TABLE dbo.direccion_entrega;
IF OBJECT_ID('dbo.item_carrito', 'U') IS NOT NULL DROP TABLE dbo.item_carrito;
IF OBJECT_ID('dbo.carrito', 'U') IS NOT NULL DROP TABLE dbo.carrito;
IF OBJECT_ID('dbo.producto', 'U') IS NOT NULL DROP TABLE dbo.producto;
IF OBJECT_ID('dbo.categoria', 'U') IS NOT NULL DROP TABLE dbo.categoria;
IF OBJECT_ID('dbo.usuario', 'U') IS NOT NULL DROP TABLE dbo.usuario;
GO

-- ============================================================
-- 3. CREACIÓN DE TABLAS EN TERCERA FORMA NORMAL (3FN)
-- ============================================================

-- TABLA 1: USUARIO
CREATE TABLE dbo.usuario (
    id_usuario INT IDENTITY(1,1) PRIMARY KEY,
    nombre NVARCHAR(100) NOT NULL,
    email NVARCHAR(150) NOT NULL UNIQUE,
    telefono NVARCHAR(255) NULL,
    password_hash NVARCHAR(255) NOT NULL DEFAULT '$2a$12$e8Yk1.K1K7w7oH1x3YFGe.a9GgN5W2WkSjC7zZ7a0P1Q9b8U5j9s6',
    rol NVARCHAR(20) NOT NULL DEFAULT 'CLIENTE',
    estado NVARCHAR(15) NOT NULL DEFAULT 'Activo',
    fecha_registro DATE NOT NULL DEFAULT CAST(GETDATE() AS DATE),
    CONSTRAINT chk_usuario_rol CHECK (rol IN ('CLIENTE', 'ADMINISTRADOR')),
    CONSTRAINT chk_usuario_estado CHECK (estado IN ('Activo', 'Inactivo'))
);
GO

-- TABLA 2: CATEGORIA
CREATE TABLE dbo.categoria (
    id_categoria INT IDENTITY(1,1) PRIMARY KEY,
    nombre NVARCHAR(50) NOT NULL UNIQUE,
    descripcion NVARCHAR(255) NULL,
    estado NVARCHAR(15) NOT NULL DEFAULT 'Activa',
    CONSTRAINT chk_categoria_estado CHECK (estado IN ('Activa', 'Inactiva'))
);
GO

-- TABLA 3: PRODUCTO
CREATE TABLE dbo.producto (
    id_producto INT IDENTITY(1,1) PRIMARY KEY,
    nombre NVARCHAR(100) NOT NULL,
    descripcion NVARCHAR(MAX) NULL,
    precio DECIMAL(10,2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    imagen NVARCHAR(500) NULL,
    estado NVARCHAR(15) NOT NULL DEFAULT 'Activo',
    fecha_creacion DATE NOT NULL DEFAULT CAST(GETDATE() AS DATE),
    fecha_actualizacion DATE NULL,
    id_categoria INT NOT NULL,
    CONSTRAINT fk_producto_categoria FOREIGN KEY (id_categoria) 
        REFERENCES dbo.categoria(id_categoria) ON UPDATE CASCADE,
    CONSTRAINT chk_producto_precio CHECK (precio > 0),
    CONSTRAINT chk_producto_stock CHECK (stock >= 0),
    CONSTRAINT chk_producto_estado CHECK (estado IN ('Activo', 'Agotado', 'Inactivo'))
);
GO

-- TABLA 4: CARRITO
CREATE TABLE dbo.carrito (
    id_carrito INT IDENTITY(1,1) PRIMARY KEY,
    id_usuario INT NOT NULL UNIQUE,
    fecha_creacion DATE NOT NULL DEFAULT CAST(GETDATE() AS DATE),
    estado NVARCHAR(20) NOT NULL DEFAULT 'Vacio',
    CONSTRAINT fk_carrito_usuario FOREIGN KEY (id_usuario) 
        REFERENCES dbo.usuario(id_usuario) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT chk_carrito_estado CHECK (estado IN ('Vacio', 'Con Productos', 'Confirmado'))
);
GO

-- TABLA 5: ITEM_CARRITO
CREATE TABLE dbo.item_carrito (
    id_item INT IDENTITY(1,1) PRIMARY KEY,
    id_carrito INT NOT NULL,
    id_producto INT NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    CONSTRAINT fk_item_carrito FOREIGN KEY (id_carrito) 
        REFERENCES dbo.carrito(id_carrito) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_item_producto FOREIGN KEY (id_producto) 
        REFERENCES dbo.producto(id_producto) ON UPDATE CASCADE,
    CONSTRAINT chk_item_cantidad CHECK (cantidad > 0),
    CONSTRAINT chk_item_precio CHECK (precio_unitario > 0),
    CONSTRAINT chk_item_subtotal CHECK (subtotal >= 0),
    CONSTRAINT uq_carrito_producto UNIQUE (id_carrito, id_producto)
);
GO

-- TABLA 6: DIRECCION_ENTREGA (Datos PII Protegidos)
CREATE TABLE dbo.direccion_entrega (
    id_direccion INT IDENTITY(1,1) PRIMARY KEY,
    id_usuario INT NOT NULL,
    nombre_receptor NVARCHAR(255) NOT NULL,
    direccion NVARCHAR(500) NOT NULL,
    ciudad NVARCHAR(100) NOT NULL,
    telefono NVARCHAR(255) NOT NULL,
    nit_ci NVARCHAR(50) NULL,
    razon_social NVARCHAR(200) NULL,
    CONSTRAINT fk_direccion_usuario FOREIGN KEY (id_usuario) 
        REFERENCES dbo.usuario(id_usuario) ON UPDATE CASCADE ON DELETE CASCADE
);
GO

-- TABLA 7: PEDIDO (Sellado Criptográfico Ley N° 164)
CREATE TABLE dbo.pedido (
    id_pedido INT IDENTITY(1,1) PRIMARY KEY,
    numero_pedido NVARCHAR(20) NOT NULL UNIQUE,
    id_usuario INT NOT NULL,
    id_direccion INT NOT NULL,
    fecha DATE NOT NULL DEFAULT CAST(GETDATE() AS DATE),
    estado NVARCHAR(20) NOT NULL DEFAULT 'Pendiente',
    total DECIMAL(10,2) NOT NULL DEFAULT 0,
    hash_integridad NVARCHAR(64) NOT NULL DEFAULT '0000000000000000000000000000000000000000000000000000000000000000',
    nit_ci NVARCHAR(50) NULL,
    razon_social NVARCHAR(200) NULL,
    CONSTRAINT fk_pedido_usuario FOREIGN KEY (id_usuario) 
        REFERENCES dbo.usuario(id_usuario) ON UPDATE NO ACTION,
    CONSTRAINT fk_pedido_direccion FOREIGN KEY (id_direccion) 
        REFERENCES dbo.direccion_entrega(id_direccion) ON UPDATE NO ACTION,
    CONSTRAINT chk_pedido_estado CHECK (estado IN ('Pendiente', 'Confirmado', 'Preparando', 'Entregado', 'Rechazado')),
    CONSTRAINT chk_pedido_total CHECK (total >= 0)
);
GO

-- TABLA 8: DETALLE_PEDIDO
CREATE TABLE dbo.detalle_pedido (
    id_detalle INT IDENTITY(1,1) PRIMARY KEY,
    id_pedido INT NOT NULL,
    id_producto INT NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    CONSTRAINT fk_detalle_pedido FOREIGN KEY (id_pedido) 
        REFERENCES dbo.pedido(id_pedido) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_detalle_producto FOREIGN KEY (id_producto) 
        REFERENCES dbo.producto(id_producto) ON UPDATE NO ACTION,
    CONSTRAINT chk_detalle_cantidad CHECK (cantidad > 0),
    CONSTRAINT chk_detalle_precio CHECK (precio_unitario > 0),
    CONSTRAINT chk_detalle_subtotal CHECK (subtotal >= 0)
);
GO

-- TABLA 9: LOGS_AUDITORIA (Inalterable - Normativa ASFI / ISO 27001)
CREATE TABLE dbo.logs_auditoria (
    id_log BIGINT IDENTITY(1,1) PRIMARY KEY,
    id_usuario INT NULL,
    ip_origen NVARCHAR(45) NOT NULL,
    user_agent NVARCHAR(MAX) NULL,
    accion NVARCHAR(60) NOT NULL,
    entidad_afectada NVARCHAR(50) NOT NULL,
    id_entidad NVARCHAR(50) NULL,
    detalles NVARCHAR(MAX) NULL,
    hash_integridad NVARCHAR(64) NOT NULL,
    fecha_utc DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT fk_audit_usuario FOREIGN KEY (id_usuario) 
        REFERENCES dbo.usuario(id_usuario) ON UPDATE NO ACTION ON DELETE NO ACTION
);
GO

-- ============================================================
-- 4. TRIGGER DE INALTERABILIDAD (TABLA INMUTABLE ASFI)
-- ============================================================
CREATE TRIGGER dbo.trg_prevent_audit_tampering
ON dbo.logs_auditoria
AFTER UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;
    RAISERROR(N'VIOLACIÓN DE SEGURIDAD ASFI: La tabla logs_auditoria es estrictamente inalterable (Append-Only). No se permiten operaciones UPDATE ni DELETE.', 16, 1);
    ROLLBACK TRANSACTION;
END;
GO

-- ============================================================
-- 5. ÍNDICES DE RENDIMIENTO
-- ============================================================
CREATE NONCLUSTERED INDEX idx_producto_categoria ON dbo.producto(id_categoria);
CREATE NONCLUSTERED INDEX idx_producto_nombre ON dbo.producto(nombre);
CREATE NONCLUSTERED INDEX idx_carrito_usuario ON dbo.carrito(id_usuario);
CREATE NONCLUSTERED INDEX idx_item_carrito ON dbo.item_carrito(id_carrito);
CREATE NONCLUSTERED INDEX idx_pedido_usuario ON dbo.pedido(id_usuario);
CREATE NONCLUSTERED INDEX idx_pedido_estado ON dbo.pedido(estado);
CREATE NONCLUSTERED INDEX idx_detalle_pedido ON dbo.detalle_pedido(id_pedido);
CREATE NONCLUSTERED INDEX idx_audit_fecha ON dbo.logs_auditoria(fecha_utc);
CREATE NONCLUSTERED INDEX idx_audit_accion ON dbo.logs_auditoria(accion);
GO

-- ============================================================
-- 6. DATOS SEMILLA (INSERTS INICIALES)
-- ============================================================
SET IDENTITY_INSERT dbo.usuario ON;
INSERT INTO dbo.usuario (id_usuario, nombre, email, telefono, password_hash, rol, estado) VALUES
(1, N'Arturo Cruz', N'arturo@techstore.com', N'70000001', N'$2a$12$e8Yk1.K1K7w7oH1x3YFGe.a9GgN5W2WkSjC7zZ7a0P1Q9b8U5j9s6', N'CLIENTE', N'Activo'),
(2, N'Ronald Pérez', N'ronald@techstore.com', N'70000002', N'$2a$12$e8Yk1.K1K7w7oH1x3YFGe.a9GgN5W2WkSjC7zZ7a0P1Q9b8U5j9s6', N'CLIENTE', N'Activo'),
(3, N'Administrador TechStore', N'admin@techstore.com', N'70000003', N'$2a$12$e8Yk1.K1K7w7oH1x3YFGe.a9GgN5W2WkSjC7zZ7a0P1Q9b8U5j9s6', N'ADMINISTRADOR', N'Activo');
SET IDENTITY_INSERT dbo.usuario OFF;
GO

SET IDENTITY_INSERT dbo.categoria ON;
INSERT INTO dbo.categoria (id_categoria, nombre, descripcion, estado) VALUES
(1, N'Laptops', N'Computadoras portátiles de alto rendimiento', N'Activa'),
(2, N'Celulares', N'Teléfonos inteligentes y accesorios', N'Activa'),
(3, N'Componentes', N'Memorias, procesadores y placas base', N'Activa'),
(4, N'Periféricos', N'Teclados mecánicos, mouse y audio', N'Activa'),
(5, N'Monitores', N'Monitores IPS, curvas y gaming', N'Activa');
SET IDENTITY_INSERT dbo.categoria OFF;
GO

SET IDENTITY_INSERT dbo.producto ON;
INSERT INTO dbo.producto (id_producto, nombre, descripcion, precio, stock, imagen, estado, id_categoria) VALUES
(1, N'Laptop Lenovo IdeaPad 15', N'Laptop 15.6" FHD, Ryzen 7, 16GB RAM, 512GB SSD NVMe', 4500.00, 10, N'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600', N'Activo', 1),
(2, N'Samsung Galaxy A55 5G', N'Smartphone AMOLED 120Hz, 256GB Almacenamiento, 8GB RAM', 2800.00, 15, N'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600', N'Activo', 2),
(3, N'Memoria RAM Kingston DDR4 16GB', N'Módulo 3200MHz CL16 con disipador de aluminio anodizado', 450.00, 20, N'https://images.unsplash.com/photo-1541140532154-b024d705b909?w=600', N'Activo', 3),
(4, N'Mouse Gamer Logitech G203 Lightsync', N'Sensor HERO 8000 DPI, RGB personalizable, 6 botones', 250.00, 25, N'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600', N'Activo', 4),
(5, N'Monitor Gamer LG UltraGear 24" FHD', N'Panel IPS 144Hz 1ms, FreeSync Premium, HDR10', 1200.00, 8, N'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600', N'Activo', 5),
(6, N'Teclado Mecánico Redragon Kumara K552', N'Switches Outemu Red, iluminación RGB, estructura de acero', 380.00, 12, N'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600', N'Activo', 4),
(7, N'Audífonos HyperX Cloud Stinger Core', N'Drivers de 40mm, micrófono con cancelación de ruido pasiva', 320.00, 0, N'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600', N'Agotado', 4);
SET IDENTITY_INSERT dbo.producto OFF;
GO

SET IDENTITY_INSERT dbo.carrito ON;
INSERT INTO dbo.carrito (id_carrito, id_usuario, estado) VALUES
(1, 1, N'Con Productos'),
(2, 2, N'Vacio'),
(3, 3, N'Vacio');
SET IDENTITY_INSERT dbo.carrito OFF;
GO

SET IDENTITY_INSERT dbo.direccion_entrega ON;
INSERT INTO dbo.direccion_entrega (id_direccion, id_usuario, nombre_receptor, direccion, ciudad, telefono, nit_ci, razon_social) VALUES
(1, 1, N'Arturo Cruz', N'Av. Principal #123, Barrio El Tejar', N'Tarija', N'70000001', N'1234567', N'Arturo Cruz'),
(2, 2, N'Ronald Pérez', N'Calle Central #456, Casco Viejo', N'Tarija', N'70000002', NULL, NULL);
SET IDENTITY_INSERT dbo.direccion_entrega OFF;
GO

SET IDENTITY_INSERT dbo.item_carrito ON;
INSERT INTO dbo.item_carrito (id_item, id_carrito, id_producto, cantidad, precio_unitario, subtotal) VALUES
(1, 1, 1, 1, 4500.00, 4500.00),
(2, 1, 4, 2, 250.00, 500.00);
SET IDENTITY_INSERT dbo.item_carrito OFF;
GO

SET IDENTITY_INSERT dbo.pedido ON;
INSERT INTO dbo.pedido (id_pedido, numero_pedido, id_usuario, id_direccion, estado, total, hash_integridad, nit_ci, razon_social) VALUES
(1, N'PED-000001', 1, 1, N'Confirmado', 5000.00, N'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', N'1234567', N'Arturo Cruz');
SET IDENTITY_INSERT dbo.pedido OFF;
GO

SET IDENTITY_INSERT dbo.detalle_pedido ON;
INSERT INTO dbo.detalle_pedido (id_detalle, id_pedido, id_producto, cantidad, precio_unitario, subtotal) VALUES
(1, 1, 1, 1, 4500.00, 4500.00),
(2, 1, 4, 2, 250.00, 500.00);
SET IDENTITY_INSERT dbo.detalle_pedido OFF;
GO

INSERT INTO dbo.logs_auditoria (id_usuario, ip_origen, user_agent, accion, entidad_afectada, id_entidad, detalles, hash_integridad) VALUES
(3, N'127.0.0.1', N'TechStore-MSSMS/1.0', N'SYSTEM_INITIALIZATION', N'DATABASE', N'SCHEMA', N'{"evento": "Inicialización de esquema relacional T-SQL"}', N'b5a2c9b1d7e8f3a0c5b4e2d1f8a9c7b6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0');
GO
