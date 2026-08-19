# Sistemas1-PDUR-TechStore
# TechStore — Diseño y Arquitectura

## Descripción

En esta sección se presentan los principales diseños y elementos de arquitectura de información del proyecto **TechStore**, una tienda virtual de productos tecnológicos.

Los diseños corresponden al MVP desarrollado y permiten visualizar la estructura de navegación y las principales interfaces del sistema.

---

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
