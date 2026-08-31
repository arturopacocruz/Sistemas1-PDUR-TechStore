
# Actividad 9: Laboratorio de Aseguramiento de Calidad y Test de Usabilidad
**Proyecto:** TechStore MVP  
**Materia:** Sistemas de Información I  
**Evaluador:** Equipo de Desarrollo TechStore  

---

## 1. Plan de Verificación (Pruebas Funcionales)
Se identificaron las 3 funcionalidades más críticas del MVP de TechStore. Los casos de prueba aplican las técnicas de Partición de Equivalencia y Valores Frontera.

| ID | Funcionalidad | Entrada de Prueba | Resultado Esperado | Resultado Obtenido | Estado |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-01** | Gestión de Carrito (Límite Mínimo) | Modificar cantidad a `1` unidad de un producto. | El subtotal se actualiza; el artículo permanece en el carrito. | Funciona correctamente. | **Pasó** |
| **TC-02** | Gestión de Carrito (Frontera Negativa) | Intentar cambiar la cantidad a un valor negativo (`-1`). | El sistema bloquea el valor o elimina el ítem de forma controlada. | El sistema eliminó el ítem sin romper la interfaz. | **Pasó** |
| **TC-03** | Gestión de Carrito (Exceso de Stock) | Intentar pedir `100` unidades (Stock real disponible: `5`). | Alerta controlada: "Cantidad solicitada supera el stock disponible". | Permite incrementar el contador infinitamente en la interfaz. | **Falló** |
| **TC-04** | Aplicación de Cupones | Ingresar cupón vigente (`TECHBOLIVIA`). | Aplica el porcentaje de descuento y reduce el total general. | Descuento aplicado y calculado correctamente. | **Pasó** |
| **TC-05** | Aplicación de Cupones | Ingresar cupón inválido o expirado (`CUPON_FALSO`). | Mensaje de error: "El cupón ingresado no es válido o ya caducó". | Muestra la alerta de error esperada de manera amigable. | **Pasó** |
| **TC-06** | Registro de Usuario (Validación) | Enviar formulario con formato de correo inválido (`usuario.com`). | El sistema resalta el campo en rojo y bloquea el envío de datos. | Resalta el campo usando las propiedades nativas del navegador. | **Pasó** |

---

## 2. Informe de Errores (Bug Log)
Registro formal de los defectos técnicos encontrados durante la inicialización, construcción y ejecución de pruebas del sistema.

| ID | Descripción del Error | Pasos para Reproducir | Severidad | Estado |
| :--- | :--- | :--- | :--- | :--- |
| **BUG-01** | Conflicto de compilación nativa en `better-sqlite3` con entornos Node.js superiores a v22 en sistemas Windows. | 1. Clonar repositorio remoto.<br>2. Ejecutar `npm install` en la raíz de la carpeta `server`. | **Mayor** | **Solucionado** (Se forzó el uso de la versión precompilada `@latest`). |
| **BUG-02** | El botón de incremento en el carrito permite superar el stock real del producto registrado en la base de datos SQLite. | 1. Añadir artículo con stock bajo.<br>2. Hacer clic repetidamente en `+` dentro del carrito de compras. | **Mayor** | **Pendiente** (Asignado para el Sprint 2). |
| **BUG-03** | Falta de contraste visual en los mensajes de alerta de error cuando el IDE o la app se encuentra en modo oscuro. | 1. Provocar un error de validación.<br>2. Observar la legibilidad de la alerta de error. | **Menor** | **Pendiente** (Ajuste estético). |

---

## 3. Resultados del Test de Usabilidad (Método Steve Krug)

### Perfil del Evaluador Real
* **Nombre del Sujeto:** Nahuel Urruelo
* **Perfil:** Cliente potencial externo al equipo técnico, con experiencia habitual en compras por internet pero ajeno al código del proyecto.
* **Escenario de Tarea Clave:** *"Usted es un cliente que necesita ingresar a TechStore, navegar por el catálogo técnico, añadir una laptop al carrito controlando el stock, y simular el flujo hasta llegar al checkout"*.
* **Dinámica ("Think Aloud"):** El usuario interactuó con fluidez. Sin embargo, verbalizó incertidumbre al agregar ítems de manera repetida, ya que la interfaz no bloqueaba el botón al agotarse las existencias reales (enlazado directamente al **BUG-02**).

### Lista de Verificación de Usabilidad (Checklist Cuantitativo)
*Calificaciones basadas en la escala estándar de 1 (Crítico/Confuso) a 5 (Excelente/Predictible)*.

#### Dimensión 1: Control del Usuario y Flexibilidad
* **1.1. Autonomía Controlada:** 5/5 – Movimiento libre e intuitivo entre catálogo y carrito.
* **1.2. Acciones Reversibles (Undo):** 4/5 – El usuario vació el carrito sin problemas ni pérdida de sesión.
* **1.3. Ocultamiento de Complejidad:** 5/5 – La infraestructura interna de SQLite permanece 100% invisible.
* **1.4. Interacciones Flexibles:** 3/5 – Faltan atajos de teclado rápidos para navegación paramétrica.

#### Dimensión 2: Reducción de la Carga de Memoria
* **2.1. Metáforas del Mundo Real:** 5/5 – El ícono y la analogía del carrito son inmediatamente reconocibles.
* **2.2. Omitir Palabras Innecesarias:** 4/5 – Redacción limpia; especificaciones técnicas directas y concisas.
* **2.3. Carga de Memoria Mínima:** 5/5 – Totales, subtotales y desgloses visibles en todo momento.
* **2.4. Valores por Defecto Significativos:** 4/5 – El selector de cantidad inicializa de forma lógica en 1.

#### Dimensión 3: Consistencia y Estándares Estéticos
* **3.1. Consistencia Visual:** 5/5 – Componentes, botones y fuentes uniformes gracias a Tailwind CSS.
* **3.2. Organización Lógica de Información:** 5/5 – Flujo natural de lectura (Filtros a la izquierda, productos al centro).
* **3.3. Sin Sobrediseño:** 4/5 – Diseño minimalista libre de banners o widgets superfluos.
* **3.4. Visibilidad de Elementos Activos:** 3/5 – El botón de checkout final pierde contraste en modo oscuro.

#### Dimensión 4: Facilidad de Aprendizaje y Operabilidad
* **4.1. Tiempo de Aprendizaje Inicial:** 5/5 – El usuario operó las tareas principales en menos de 2 minutos.
* **4.2. Retención en el Tiempo (Recall):** 5/5 – Flujo de e-commerce estándar altamente recordable.
* **4.3. Eficiencia en la Tarea:** 4/5 – Flujo directo; requiere un mínimo de clics para agregar y comprar.
* **4.4. Indicación de Progreso y Feedback:** 3/5 – Falta una microanimación que confirme visualmente la inserción al carrito.

#### Dimensión 5: Protección y Gestión de Errores
* **5.1. Validación y Prevención Proactiva:** 2/5 – Permite agregar al carrito unidades por encima del stock del backend.
* **5.2. Mensajes de Error Claros:** 4/5 – Alertas legibles sin códigos informáticos crípticos.
* **5.3. Recuperación de Errores:** 3/5 – Si un campo falla, no se retienen de forma óptima los datos previos.
* **5.4. No Culpabilizar:** 5/5 – El tono de las advertencias es completamente cordial y constructivo.

#### Dimensión 6: Navegación y Prueba del Maletero
* **6.1. Identificador de la Aplicación:** 5/5 – El logotipo de TechStore resalta nítidamente en la cabecera.
* **6.2. Nombre de la Página/Sección:** 4/5 – Títulos claros al cambiar de ruta (`/carrito`, `/catalogo`).
* **6.3. Navegación Principal y Local:** 5/5 – Las categorías de tecnología son accesibles en un clic.
* **6.4. Indicador de "Usted está aquí":** 4/5 – El estado activo en el menú resalta la sección actual.
* **6.5. Búsqueda y Localización:** 4/5 – Caja de búsqueda visible y reactiva en la zona superior.

#### Dimensión 7: Accesibilidad (A11y)
* **7.1. Alternativas Multicanal:** 4/5 – Uso equilibrado de iconos acompañados por texto descriptivo.
* **7.2. Contraste de Color Suficiente:** 3/5 – Ciertos elementos del modo oscuro dificultan la lectura (BUG-03).
* **7.3. Compatibilidad con Ayudas Técnicas:** 3/5 – Requiere reforzar etiquetas semánticas ARIA en componentes interactivos.
* **7.4. Evitar Elementos Disruptivos:** 5/5 – Sin parpadeos, ventanas invasivas o recargas inesperadas.

### Puntuación Final Promedio del Sistema
* **Suma total de puntajes:** 122 puntos (sobre 29 ítems calificados)
* **Puntuación Promedio:** **4.21 / 5.00**
* **Calificación Cualitativa:** **Bueno / Generalmente Uniforme** (El sistema es predecible, pero cuenta con detalles visuales y lógicos menores por pulir).

---

## 4. Plan de Mejora Continua (Acciones para el Sprint 2)
Basado en los tropiezos observados con Nahuel Urruelo, se priorizan 3 correcciones de bajo esfuerzo y alto impacto (*low-hanging fruit*):

1. **Control de Stock en Interfaz (HU-02):** Implementar una condicional en el componente React del carrito para deshabilitar (`disabled`) el botón `+` en cuanto la cantidad iguale al stock disponible devuelto por el backend.
2. **Corrección de Contraste en Estilos (A11y):** Modificar la configuración de colores en el archivo de Tailwind CSS para garantizar que las alertas y botones de confirmación mantengan un ratio de contraste accesible en modo oscuro.
3. **Optimización del Feedback de Usuario:** Integrar alertas de tipo *Toast* temporales que notifiquen al instante al comprador: *"¡Producto añadido al carrito con éxito!"*, reduciendo la incertidumbre en la acción.
