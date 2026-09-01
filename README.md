# Sistemas1-PDUR-TechStore

# TechStore — Diseño y Arquitectura

## Descripción

En esta sección se presentan los principales diseños y elementos de arquitectura de información del proyecto **TechStore**, una tienda virtual de productos tecnológicos.

Los diseños corresponden al MVP desarrollado y permiten visualizar la estructura de navegación, las principales interfaces del sistema, el diseño detallado de la arquitectura de software y el modelo de base de datos.

---

# Diseño de la Interfaz y Arquitectura de Información

## 1. Arquitectura de Navegación

La arquitectura de navegación representa el flujo que seguirá el usuario dentro del sistema desde el inicio de sesión hasta las funcionalidades principales.

Se distinguen los recorridos correspondientes al **cliente** y al **administrador**, incluyendo las validaciones y acciones principales del MVP.

![Arquitectura de navegación](<docs/design/Arquitectura de navegación.png>)

---

## 2. Listado de Productos

El listado de productos corresponde a la pantalla principal del catálogo de TechStore.

Permite al cliente consultar los productos disponibles, buscar artículos, filtrarlos por categoría y visualizar información básica como el nombre, precio y disponibilidad. También permite agregar productos disponibles al carrito.

![Listado de productos](<docs/design/Listado de productos.PNG>)

---

## 3. Formulario de Registro de Producto

El formulario de registro permite al administrador agregar nuevos productos al catálogo.

Incluye los campos necesarios para registrar información como nombre, descripción, precio, stock, categoría e imagen del producto. También proporciona las opciones para cancelar o guardar la información ingresada.

![Formulario de registro de producto](<docs/design/Formulario de registro de producto.PNG>)

---

## 4. Reporte Visual

El reporte visual corresponde al panel administrativo de TechStore.

Presenta información resumida sobre la cantidad de productos, disponibilidad de stock y pedidos, además de gráficos y una lista de productos con stock bajo. Su objetivo es facilitar al administrador la interpretación rápida del estado del catálogo.

![Reporte visual](<docs/design/Reporte visual.PNG>)

---

# Diseño Detallado

La documentación técnica del proyecto se encuentra organizada dentro de la carpeta `/docs/uml/`.

Para cada Historia de Usuario del Sprint 1 se elaboraron cuatro diagramas UML utilizando **PlantUML**:

- Diagrama de Casos de Uso
- Diagrama de Secuencia
- Diagrama de Estados
- Diagrama de Clases

Cada diagrama cuenta con su correspondiente archivo fuente `.puml` y su imagen exportada `.png`.

---

# HU-01 — Consultar productos

> Como cliente, quiero consultar y buscar productos por nombre o categoría, visualizando su información, precio y disponibilidad, para encontrar fácilmente los artículos que deseo comprar.

### Diagrama de Casos de Uso

Representa las interacciones entre el cliente y las funcionalidades relacionadas con la consulta, búsqueda, filtrado y visualización de productos.

![HU-01 - Diagrama de Casos de Uso](<docs/uml/HU-1 Diagrama de casos de uso.png>)

### Diagrama de Secuencia

Representa el flujo de mensajes entre el cliente, la interfaz, el controlador, los servicios y la base de datos durante la búsqueda y consulta de productos.

![HU-01 - Diagrama de Secuencia](<docs/uml/HU-1 Diagrama de secuencia.png>)

### Diagrama de Estados

Representa los diferentes estados de disponibilidad de un producto, como disponible, agotado e inactivo.

![HU-01 - Diagrama de Estados](<docs/uml/HU-1 Diagrama de estados.png>)

### Diagrama de Clases

Representa las principales clases utilizadas para consultar productos, incluyendo Producto, Categoría, Controller, Service, Repository y la interfaz del catálogo.

![HU-01 - Diagrama de Clases](<docs/uml/HU-1 Diagrama de clases.png>)


---

# HU-02 — Agregar productos al carrito

> Como cliente, quiero agregar productos disponibles al carrito, indicando y modificando las cantidades, para preparar mi compra y conocer el total antes de realizar el pedido.

### Diagrama de  Casos de Uso

Representa las acciones que puede realizar el cliente sobre el carrito, incluyendo agregar productos, modificar cantidades, eliminar productos y consultar el total.

![HU-02 - Diagrama de Casos de Uso](<docs/uml/HU-2 Diagrama de casos de uso.png>)

### Diagrama de Secuencia

Representa la interacción entre el cliente, la interfaz, el controlador, el servicio, el carrito, los productos y la base de datos al agregar o modificar productos.

![HU-02 - Diagrama de Secuencia](<docs/uml/HU-2 Diagrama de secuencia.png>)

### Diagrama de Estados

Representa los estados del carrito durante el proceso de compra, desde un carrito vacío hasta un carrito con productos y su posterior confirmación al cliente.

![HU-02 - Diagrama de Estados](<docs/uml/HU-2 Diagrama de estados.png>)

### Diagrama de Clases

Representa las clases relacionadas con el carrito, incluyendo Cliente, Carrito, ItemCarrito, Producto y las clases de la arquitectura de aplicación.

![HU-02 - Diagrama de Clases](<docs/uml/HU-2 Diagrama de clases.png>)


---

# HU-03 — Realizar pedido

> Como cliente, quiero confirmar los productos de mi carrito e ingresar mis datos de entrega para generar un pedido y recibir una confirmación con su número de identificación.

### Diagrama de Casos de Uso

Representa las funcionalidades necesarias para realizar un pedido, incluyendo la consulta del carrito, ingreso de datos, validación, verificación de stock y la confirmación en este proceso.

![HU-03 - Diagrama de Casos de Uso](<docs/uml/HU-3 Diagrama de casos de uso.png>)

### Diagrama de Secuencia

Representa el flujo temporal para generar un pedido, incluyendo la validación de datos, comprobación de stock, creación del pedido y actualización del inventario.

![HU-03 - Diagrama de Secuencia](<docs/uml/HU-3 Diagrama de secuencia.png>)

### Diagrama de Estados

Representa el ciclo de vida de un pedido desde que es creado y validado hasta su confirmación, preparación y entrega.

![HU-03 - Diagrama de Estados](<docs/uml/HU-3 Diagrama de estados.png>)

### Diagrama de Clases

Representa las principales clases involucradas en la realización de pedidos, incluyendo Cliente, Pedido, DetallePedido, Carrito, Producto y DirecciónEntrega.

![HU-03 - Diagrama de Clases](<docs/uml/HU-3 Diagrama de clases.png>)


---

# HU-04 — Gestionar productos

> Como administrador, quiero crear, modificar y desactivar productos, gestionando su información, precio y stock, para mantener actualizado el catálogo de la tienda sin perder el historial de productos.

### Diagrama de Casos de Uso

Representa las operaciones disponibles para el administrador, incluyendo registrar, modificar, actualizar stock y desactivar productos.

![HU-04 - Diagrama de Casos de Uso](<docs/uml/HU-4 Diagrama de casos de uso.png>)

### Diagrama de Secuencia

Representa las interacciones necesarias para registrar, modificar, actualizar el stock y desactivar productos, incluyendo las validaciones correspondientes.

![HU-04 - Diagrama de Secuencia](<docs/uml/HU-4 Diagrama de secuencia.png>)

### Diagrama de Estados

Representa los estados de un producto dentro del catálogo, diferenciando entre activo, agotado e inactivo.

![HU-04 - Diagrama de Estados](<docs/uml/HU-4 Diagrama de estados.png>)

### Diagrama de Clases

Representa la estructura de las clases necesarias para administrar el catálogo, incluyendo Administrador, Producto, Categoría, Controller, Service, Repository e interfaz administrativa.

![HU-04 - Diagrama de Clases](<docs/uml/HU-4 Diagrama de clases.png>)


---

# Diseño de Base de Datos

La base de datos de **TechStore** permite almacenar y gestionar de manera estructurada la información necesaria para el funcionamiento del MVP. A manera de simplificar el proyecto se opto por utilizar una base de datos estatica.

El modelo físico está compuesto por las entidades **Usuario, Categoría, Producto, Carrito, Item Carrito, Dirección de Entrega, Pedido y Detalle de Pedido**. Las relaciones entre estas entidades se implementan mediante **Claves Primarias (PK)** y **Claves Foráneas (FK)**, garantizando la integridad referencial de la información.

La tabla `USUARIO` permite representar tanto a los clientes como a los administradores mediante el atributo `rol`, evitando la duplicación de información entre diferentes tipos de usuarios. 

El diseño también contempla las relaciones entre productos, categorías, carritos y pedidos, permitiendo gestionar el catálogo, las compras y la información de entrega de los clientes.

El modelo ha sido diseñado considerando los principios de **normalización hasta la Tercera Forma Normal (3FN)**, con el objetivo de reducir redundancias y mantener la consistencia de los datos.

### Diagrama de Base de Datos

A continuación se presenta el modelo físico de la base de datos de TechStore, incluyendo las principales entidades, atributos, claves primarias y claves foráneas.

![Diagrama de Base de Datos](<docs/database/Base de datos.png>)

---

# Estructura de la documentación

La documentación técnica del proyecto se organiza de la siguiente manera:

```text
/docs
│
├── /design
│   ├── Arquitectura de navegación.png
│   ├── Listado de productos.PNG
│   ├── Formulario de registro de producto.PNG
│   └── Reporte visual.PNG
│
├── /database
│   ├── Base de datos.png
│   └── Base de datos.sql
│
└── /uml
    │
    ├── HU01_casos_de_uso.puml
    ├── HU01_casos_de_uso.png
    ├── HU01_secuencia.puml
    ├── HU01_secuencia.png
    ├── HU01_estados.puml
    ├── HU01_estados.png
    ├── HU01_clases.puml
    ├── HU01_clases.png
    │
    ├── HU02_casos_de_uso.puml
    ├── HU02_casos_de_uso.png
    ├── HU02_secuencia.puml
    ├── HU02_secuencia.png
    ├── HU02_estados.puml
    ├── HU02_estados.png
    ├── HU02_clases.puml
    ├── HU02_clases.png
    │
    ├── HU03_casos_de_uso.puml
    ├── HU03_casos_de_uso.png
    ├── HU03_secuencia.puml
    ├── HU03_secuencia.png
    ├── HU03_estados.puml
    ├── HU03_estados.png
    ├── HU03_clases.puml
    ├── HU03_clases.png
    │
    ├── HU04_casos_de_uso.puml
    ├── HU04_casos_de_uso.png
    ├── HU04_secuencia.puml
    ├── HU04_secuencia.png
    ├── HU04_estados.puml
    ├── HU04_estados.png
    ├── HU04_clases.puml
    └── HU04_clases.png
