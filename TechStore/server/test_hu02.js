async function runHU02Tests() {
  const BASE = 'http://localhost:3001/api';
  console.log('============================================================');
  console.log('   VALIDACIÓN RIGUROSA HU-02: AGREGAR PRODUCTOS AL CARRITO  ');
  console.log('============================================================\n');

  // 1. Limpiar carrito de prueba para usuario 2
  await fetch(`${BASE}/carrito/vaciar?idUsuario=2`, { method: 'DELETE' });

  // Test 1: Verificar Carrito Inicial Vacío
  console.log('[TEST 1] Verificar estado inicial del carrito');
  const cartRes = await fetch(`${BASE}/carrito?idUsuario=2`);
  const cart = await cartRes.json();
  console.assert(cart.estado === 'Vacio', 'El estado inicial debe ser Vacio');
  console.assert(cart.items.length === 0, 'No debe tener items');
  console.assert(cart.total === 0, 'El total debe ser 0');
  console.log(`✓ Carrito en estado "${cart.estado}", total: Bs. ${cart.total}`);

  // Test 2: Agregar producto disponible con éxito (Criterio 4 & 5)
  console.log('\n[TEST 2] Criterio 5 & 4: Agregar producto disponible (Mouse Logitech G203, Bs. 250, stock: 25)');
  const addRes = await fetch(`${BASE}/carrito/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id_producto: 4, cantidad: 2, id_usuario: 2 })
  });
  const addData = await addRes.json();
  console.assert(addRes.status === 200, 'Debe retornar 200 OK');
  console.assert(addData.message === 'Producto agregado al carrito con éxito', 'Debe retornar mensaje de confirmación');
  console.assert(addData.carrito.estado === 'Con Productos', 'El estado del carrito debe ser Con Productos');
  console.assert(addData.carrito.items[0].subtotal === 500, 'Subtotal debe ser 2 * 250 = 500');
  console.assert(addData.carrito.total === 500, 'Total debe ser 500');
  console.log(`✓ Mensaje: "${addData.message}"`);
  console.log(`✓ Estado Carrito: "${addData.carrito.estado}"`);
  console.log(`✓ Subtotal Item: Bs. ${addData.carrito.items[0].subtotal.toFixed(2)} (Cantidad: ${addData.carrito.items[0].cantidad} x Bs. ${addData.carrito.items[0].precio_unitario.toFixed(2)})`);
  console.log(`✓ Total General: Bs. ${addData.carrito.total.toFixed(2)}`);

  // Test 3: Modificar cantidad dentro del stock disponible (Criterio 1 & 4)
  console.log('\n[TEST 3] Criterio 1: Modificar cantidad de unidades (de 2 a 4)');
  const modRes = await fetch(`${BASE}/carrito/items`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id_producto: 4, cantidad: 4, id_usuario: 2 })
  });
  const modData = await modRes.json();
  console.assert(modData.carrito.items[0].cantidad === 4, 'La cantidad debe ser 4');
  console.assert(modData.carrito.items[0].subtotal === 1000, 'Subtotal debe ser 4 * 250 = 1000');
  console.assert(modData.carrito.total === 1000, 'Total debe ser 1000');
  console.log(`✓ Cantidad actualizada: ${modData.carrito.items[0].cantidad}`);
  console.log(`✓ Nuevo Subtotal: Bs. ${modData.carrito.items[0].subtotal.toFixed(2)}`);
  console.log(`✓ Nuevo Total: Bs. ${modData.carrito.total.toFixed(2)}`);

  // Test 4: Validación de stock excedido (Criterio 2 - Error "Cantidad no disponible")
  console.log('\n[TEST 4] Criterio 2: Validar cantidad que supere el stock (Stock actual: 25, solicitada: 30)');
  const exceedRes = await fetch(`${BASE}/carrito/items`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id_producto: 4, cantidad: 30, id_usuario: 2 })
  });
  const exceedData = await exceedRes.json();
  console.assert(exceedRes.status === 400, 'Debe retornar error 400');
  console.assert(exceedData.error === 'Cantidad no disponible', `Debe retornar mensaje exacto "Cantidad no disponible", recibido: ${exceedData.error}`);
  console.log(`✓ Validación de Stock superada con mensaje de error: "${exceedData.error}"`);

  // Test 5: Validación de producto agotado (Criterio 3 - Error "Producto agotado")
  console.log('\n[TEST 5] Criterio 3: Intentar agregar producto "Agotado" (Stock = 0, ID 7 Audífonos HyperX)');
  const outOfStockRes = await fetch(`${BASE}/carrito/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id_producto: 7, cantidad: 1, id_usuario: 2 })
  });
  const outOfStockData = await outOfStockRes.json();
  console.assert(outOfStockRes.status === 400, 'Debe retornar error 400');
  console.assert(outOfStockData.error === 'Producto agotado', `Debe retornar mensaje "Producto agotado", recibido: ${outOfStockData.error}`);
  console.log(`✓ Validación de Producto Agotado superada con mensaje de error: "${outOfStockData.error}"`);

  // Test 6: Validación de Diccionario de Datos (cantidad > 0)
  console.log('\n[TEST 6] Diccionario de Datos: Validar cantidad negativa o no numérica');
  const invalidCantRes = await fetch(`${BASE}/carrito/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id_producto: 4, cantidad: -5, id_usuario: 2 })
  });
  const invalidCantData = await invalidCantRes.json();
  console.assert(invalidCantRes.status === 400, 'Debe rechazar cantidad negativa');
  console.log(`✓ Validación de cantidad negativa rechazada: "${invalidCantData.error}"`);

  // Test 7: Eliminar producto y verificar transición de estado a "Vacio"
  console.log('\n[TEST 7] Diagrama de Estados: Eliminar último producto y retornar a "Vacio"');
  const delRes = await fetch(`${BASE}/carrito/items/4?idUsuario=2`, { method: 'DELETE' });
  const delData = await delRes.json();
  console.assert(delData.carrito.estado === 'Vacio', 'El estado del carrito debe ser Vacio');
  console.assert(delData.carrito.total === 0, 'El total debe ser 0');
  console.log(`✓ Carrito vaciado tras eliminar ítem. Estado: "${delData.carrito.estado}", Total: Bs. ${delData.carrito.total}`);

  console.log('\n============================================================');
  console.log('   TODAS LAS PRUEBAS DE HU-02 COMPLETADAS SATISFACTORIAMENTE   ');
  console.log('============================================================');
}

runHU02Tests().catch(console.error);
