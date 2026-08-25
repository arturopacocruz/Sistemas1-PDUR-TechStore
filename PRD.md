# Product Requirements Document (PRD) 
**Proyecto:** TechStore MVP  
**Rol:** Senior Product Manager  
**Fecha:** Agosto 2026  
**Ubicación:** Tarija, Bolivia  

---

## 1. Visión y Objetivos

**Contexto del Problema:**
Actualmente, la búsqueda de productos y la gestión de pedidos de artículos tecnológicos (teclados, mouse, audífonos, etc.) se realizan de manera manual. Esto genera dificultades para que los clientes encuentren productos, conozcan su disponibilidad en tiempo real y organicen sus compras de forma autónoma.

**Visión del Producto:**
Desarrollar "TechStore", una plataforma web sencilla e intuitiva que centralice el catálogo de productos, permita agregarlos a un carrito y facilite la realización de pedidos online.

**Objetivo Central (SMART):**
Desarrollar e implementar en un periodo de **2 semanas** una tienda virtual MVP (Mínimo Producto Viable) que permita a los clientes consultar productos, gestionar un carrito y realizar pedidos; y al administrador gestionar el catálogo, cumpliendo con 4 Historias de Usuario principales.

**Beneficiarios:**
*   **Beneficiario Real (Principal):** Cliente de la tienda.
*   **Beneficiario Secundario:** Administrador o encargado de la tienda.

---

## 2. Alcance (Scope)

**Incluido en el MVP:**
*   Consulta de productos y búsqueda básica por nombre/categoría.
*   Visualización de precio, imagen y disponibilidad de stock.
*   Carrito de compras (agregar, modificar cantidades, calcular totales).
*   Registro de pedidos con datos básicos de entrega.
*   Gestión de productos (CRUD y cambio de estados) por parte del administrador.
*   Validaciones básicas de datos, stock y cálculos.

**Fuera del Alcance (Out of Scope):**
*   Integración con bancos o pasarelas de pago reales.
*   Sistema de envíos y seguimiento mediante empresas de transporte.
*   Aplicación móvil nativa.
*   Sistema avanzado de recomendaciones o chat en tiempo real.
*   Gestión contable o financiera de la tienda.

---

## 3. Stack Tecnológico (Propuesto para el MVP)

Basado en los diagramas UML, diagramas de clases y la naturaleza relacional de la arquitectura descrita, se define el siguiente stack para soportar el patrón **MVC (Modelo-Vista-Controlador)**:

*   **Frontend (Vista):** React.js o Vue.js (Ideal para SPAs interactivas y gestión de estados de carritos en tiempo real).
*   **Backend (Controlador / Servicio / Repositorio):** Node.js con Express o Java Spring Boot. Ambos soportan eficientemente la arquitectura en capas especificada.
*   **Base de Datos (Modelo):** PostgreSQL o MySQL. Requerido debido a la naturaleza estricta del modelo físico (Claves Foráneas, campos SERIAL/INT, integridad referencial).
*   **Documentación de Arquitectura:** PlantUML (Implementado para diagramas de Casos de Uso, Secuencia, Estados y Clases).

---

## 4. Modelo de Datos Exacto (Diccionario de Datos)

El modelo físico relacional se implementará con **8 tablas principales**. 

### 4.1. USUARIO
| Atributo | Tipo de Dato | Nulo | PK/FK | Restricciones / Descripción |
| :--- | :--- | :--- | :--- | :--- |
| `id_usuario` | SERIAL / INT | NO | PK | Identificador único y autogenerado del usuario. |
| `nombre` | VARCHAR(100) | NO | - | Nombre completo del usuario. |
| `email` | VARCHAR(150) | NO | - | Correo electrónico del usuario. Debe ser único. |
| `telefono` | VARCHAR(20) | SI | - | Número telefónico del usuario. |
| `rol` | VARCHAR(20) | NO | - | Define el tipo de usuario: CLIENTE o ADMINISTRADOR. |
| `fecha_registro`| DATE | NO | - | Fecha de registro. Por defecto utiliza la fecha actual. |

### 4.2. CATEGORIA
| Atributo | Tipo de Dato | Nulo | PK/FK | Restricciones / Descripción |
| :--- | :--- | :--- | :--- | :--- |
| `id_categoria` | SERIAL / INT | NO | PK | Identificador único y autogenerado. |
| `nombre` | VARCHAR(50) | NO | - | Nombre de la categoría. Debe ser único. |
| `descripcion` | VARCHAR(255) | SI | - | Descripción de la categoría de productos. |
| `estado` | VARCHAR(15) | NO | - | Activa o Inactiva. |

### 4.3. PRODUCTO
| Atributo | Tipo de Dato | Nulo | PK/FK | Restricciones / Descripción |
| :--- | :--- | :--- | :--- | :--- |
| `id_producto` | SERIAL / INT | NO | PK | Identificador único y autogenerado. |
| `nombre` | VARCHAR(100) | NO | - | Nombre comercial del producto tecnológico. |
| `descripcion` | TEXT | SI | - | Descripción detallada del producto. |
| `precio` | DECIMAL(10,2)| NO | - | Precio del producto. Debe ser mayor a 0. |
| `stock` | INT | NO | - | Cantidad disponible. Debe ser mayor o igual a 0. |
| `imagen` | VARCHAR(255) | SI | - | Ruta o URL de la imagen del producto. |
| `estado` | VARCHAR(15) | NO | - | Activo, Agotado o Inactivo. |
| `fecha_creacion`| DATE | NO | - | Fecha de creación del registro. |
| `fecha_actualizacion`| DATE | SI | - | Fecha de la última modificación. |
| `id_categoria` | INT | NO | FK | Referencia a `CATEGORIA.id_categoria`. |

### 4.4. CARRITO
| Atributo | Tipo de Dato | Nulo | PK/FK | Restricciones / Descripción |
| :--- | :--- | :--- | :--- | :--- |
| `id_carrito` | SERIAL / INT | NO | PK | Identificador único y autogenerado. |
| `id_usuario` | INT | NO | FK | Propietario del carrito. Ref a `USUARIO.id_usuario`. |
| `fecha_creacion`| DATE | NO | - | Fecha de creación del carrito. |
| `estado` | VARCHAR(20) | NO | - | Vacio, Con Productos o Confirmado. |

### 4.5. ITEM_CARRITO
| Atributo | Tipo de Dato | Nulo | PK/FK | Restricciones / Descripción |
| :--- | :--- | :--- | :--- | :--- |
| `id_item` | SERIAL / INT | NO | PK | Identificador único del elemento. |
| `id_carrito` | INT | NO | FK | Referencia a `CARRITO.id_carrito`. |
| `id_producto` | INT | NO | FK | Referencia a `PRODUCTO.id_producto`. |
| `cantidad` | INT | NO | - | Unidades seleccionadas. Mayor a 0. |
| `precio_unitario`| DECIMAL(10,2)| NO | - | Precio al momento de agregarlo. |
| `subtotal` | DECIMAL(10,2)| NO | - | `cantidad` * `precio_unitario`. |

### 4.6. DIRECCION_ENTREGA
| Atributo | Tipo de Dato | Nulo | PK/FK | Restricciones / Descripción |
| :--- | :--- | :--- | :--- | :--- |
| `id_direccion` | SERIAL / INT | NO | PK | Identificador único y autogenerado. |
| `id_usuario` | INT | NO | FK | Propietario de la dir. Ref a `USUARIO.id_usuario`. |
| `nombre_receptor`| VARCHAR(100) | NO | - | Persona que recibirá el pedido. |
| `direccion` | VARCHAR(255) | NO | - | Dirección física de entrega. |
| `ciudad` | VARCHAR(100) | NO | - | Ciudad donde se realizará la entrega. |
| `telefono` | VARCHAR(20) | NO | - | Número de contacto para la entrega. |

### 4.7. PEDIDO
| Atributo | Tipo de Dato | Nulo | PK/FK | Restricciones / Descripción |
| :--- | :--- | :--- | :--- | :--- |
| `id_pedido` | SERIAL / INT | NO | PK | Identificador único y autogenerado. |
| `numero_pedido` | VARCHAR(20) | NO | - | ID único (público) para identificar el pedido. |
| `id_usuario` | INT | NO | FK | Referencia a `USUARIO.id_usuario`. |
| `id_direccion` | INT | NO | FK | Dirección utilizada (Ref `DIRECCION_ENTREGA`). |
| `fecha` | DATE | NO | - | Fecha de creación del pedido. |
| `estado` | VARCHAR(20) | NO | - | Pendiente, Confirmado, Preparando, Entregado, Rechazado. |
| `total` | DECIMAL(10,2)| NO | - | Importe total. Mayor o igual a 0. |

### 4.8. DETALLE_PEDIDO
| Atributo | Tipo de Dato | Nulo | PK/FK | Restricciones / Descripción |
| :--- | :--- | :--- | :--- | :--- |
| `id_detalle` | SERIAL / INT | NO | PK | Identificador único y autogenerado. |
| `id_pedido` | INT | NO | FK | Referencia a `PEDIDO.id_pedido`. |
| `id_producto` | INT | NO | FK | Producto incluido en el pedido. |
| `cantidad` | INT | NO | - | Unidades solicitadas. Mayor a 0. |
| `precio_unitario`| DECIMAL(10,2)| NO | - | Precio del producto al realizar el pedido. |
| `subtotal` | DECIMAL(10,2)| NO | - | `cantidad` * `precio_unitario`. |

---

## 5. Reglas de Negocio y Cumplimiento Legal

Para operar adecuadamente dentro de Tarija y el territorio boliviano, el sistema incorporará reglas de negocio intrínsecas a su diagrama de estados, en conjunción con el marco legal aplicable al comercio electrónico en el país:

### Reglas de Sistema
1. **Gestión de Stock:**
   * `Stock > 0`: Estado "Activo / Disponible".
   * `Stock = 0`: Estado "Agotado". Se muestra en catálogo pero se desactiva el botón de agregar al carrito.
   * `Inactivo`: No aparece en el catálogo. Mecanismo de *Soft-Delete* para preservar historiales.
2. **Validación Concurrente:** El carrito debe validar la disponibilidad del stock nuevamente en el momento exacto del *Checkout* (Validando información -> Confirmado).
3. **Restricción Comercial:** Los precios deben ser positivos (mayores a cero) y las cantidades ingresadas por el cliente no pueden exceder el stock disponible.

### Cumplimiento Legal (Leyes Bolivianas)
*   **Ley N° 164 (Ley General de Telecomunicaciones, Tecnologías de Información y Comunicación):** Esta normativa otorga validez probatoria y jurídica a los negocios (como el checkout de un carrito de compras) realizados mediante documentos y comunicaciones digitales,. Las confirmaciones de los pedidos generadas por el sistema fungirán como contratos de compraventa electrónicos lícitos.
*   **Ley N° 453 (Ley General de los Derechos de las Usuarias y los Usuarios y de las Consumidoras y los Consumidores):** En obediencia al derecho a la información veraz y la prevención de publicidad engañosa,, el catálogo debe especificar explícitamente los precios finales desglosados (incluyendo IVA si es que aplica legalmente en un MVP). Asimismo, las validaciones de "Producto Agotado" existen para garantizar que no se oferten condiciones o productos que la tienda no puede cumplir, evitando cláusulas o retenciones económicas indebidas.

---

## 6. Backlog de Historias de Usuario (MVP)

A continuación, las 4 Historias de Usuario fundamentales destiladas de las sesiones de refinamiento, listas para ser asignadas en el tablero Kanban del equipo:

### HU-01: Consultar productos
**Como** cliente de TechStore  
**Quiero** consultar y buscar productos por nombre o categoría, visualizando su información, precio y disponibilidad  
**Para** encontrar fácilmente los artículos que deseo comprar.  

* **Criterios de Aceptación:**
  * El catálogo debe mostrar nombre, imagen, precio y disponibilidad de forma organizada.
  * Debe existir un filtro por categorías y una barra de búsqueda por nombre.
  * Los productos con estado `Stock = 0` deben mostrar una etiqueta visible de "Agotado".
  * Si la búsqueda no arroja resultados, el sistema debe desplegar un mensaje amigable: *"No se encontraron productos"*.

### HU-02: Agregar productos al carrito
**Como** cliente de TechStore  
**Quiero** agregar productos disponibles al carrito, indicando y modificando las cantidades  
**Para** preparar mi compra y conocer el subtotal/total antes de realizar el pedido.  

* **Criterios de Aceptación:**
  * El usuario puede modificar la cantidad de unidades dentro del carrito.
  * El sistema debe validar que la cantidad ingresada no supere el `stock` en la base de datos (mostrar error *"Cantidad no disponible"*).
  * No se pueden agregar productos "Agotados".
  * El carrito actualiza automáticamente el `subtotal` por ítem y el `total` general.
  * Al agregar un producto con éxito, se muestra un mensaje de confirmación en la UI.

### HU-03: Realizar pedido
**Como** cliente de TechStore  
**Quiero** confirmar los productos de mi carrito e ingresar mis datos de entrega  
**Para** generar un pedido y recibir una confirmación con un número de identificación único.  

* **Criterios de Aceptación:**
  * El usuario no puede hacer checkout de un "Carrito vacío".
  * Debe existir un formulario obligatorio para los datos de entrega (Nombre, Teléfono, Dirección, Ciudad).
  * Justo antes de crear el registro, el sistema valida el stock final. Si algún producto se agotó en el interín, se rechaza y notifica al cliente *"Producto sin stock"*.
  * Si es exitoso, se genera un número de pedido autogenerado, se descuenta el stock correspondiente y el carrito pasa a estado "Confirmado" (listo para pedido).

### HU-04: Gestionar productos
**Como** administrador de la tienda  
**Quiero** crear, modificar y desactivar productos, gestionando su información, precio y stock  
**Para** mantener actualizado el catálogo sin perder el historial operativo.  

* **Criterios de Aceptación:**
  * Solo los usuarios con rol `ADMINISTRADOR` pueden acceder al panel.
  * Todos los campos de registro (nombre, descripción, precio, categoría, stock) son obligatorios.
  * El precio debe ser `> 0` y el stock `>= 0`. No se permiten valores negativos.
  * Si un administrador desea dar de baja un producto, se usa la opción "Desactivar" (cambio de estado a `Inactivo`), no se elimina (DELETE) de la base de datos para no romper dependencias históricas con facturas o pedidos.
  * Se pueden modificar las propiedades e incrementar el stock en cualquier momento.