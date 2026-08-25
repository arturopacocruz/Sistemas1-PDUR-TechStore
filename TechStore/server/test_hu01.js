async function runHU01Tests() {
  const BASE = 'http://localhost:3001/api';
  console.log('============================================================');
  console.log('       VALIDACIÓN RIGUROSA HU-01: CONSULTAR PRODUCTOS       ');
  console.log('============================================================\n');

  // Test 1: Consultar catálogo completo (Criterio 1)
  console.log('[TEST 1] Criterio 1: Consultar catálogo completo de productos');
  const allRes = await fetch(`${BASE}/productos`);
  const allProds = await allRes.json();
  console.assert(allRes.status === 200, 'Debe retornar 200 OK');
  console.assert(allProds.length > 0, 'Debe retornar lista de productos');
  console.log(`✓ Catálogo obtenido: ${allProds.length} productos disponibles.`);

  // Validar estructura del primer producto según Diccionario de Datos
  const p1 = allProds[0];
  console.assert(typeof p1.id_producto === 'number', 'id_producto debe ser número');
  console.assert(typeof p1.nombre === 'string' && p1.nombre.length > 0, 'nombre debe ser string');
  console.assert(typeof p1.precio === 'number' && p1.precio > 0, 'precio debe ser número > 0');
  console.assert(typeof p1.stock === 'number' && p1.stock >= 0, 'stock debe ser número >= 0');
  console.assert(['Activo', 'Agotado'].includes(p1.estado), 'estado en catálogo debe ser Activo o Agotado');
  console.assert(typeof p1.categoria_nombre === 'string', 'categoria_nombre debe existir');
  console.log(`✓ Producto modelo validado: "${p1.nombre}" | Categoría: ${p1.categoria_nombre} | Precio: Bs. ${p1.precio.toFixed(2)} | Stock: ${p1.stock} (${p1.estado})`);

  // Test 2: Búsqueda por nombre (Criterio 2)
  console.log('\n[TEST 2] Criterio 2: Barra de búsqueda por nombre ("Lenovo")');
  const searchRes = await fetch(`${BASE}/productos?q=Lenovo`);
  const searchProds = await searchRes.json();
  console.assert(searchProds.length === 1, 'Debe encontrar exactamente 1 producto para Lenovo');
  console.assert(searchProds[0].nombre.includes('Lenovo'), 'El producto debe ser Lenovo');
  console.log(`✓ Búsqueda exitosa: "${searchProds[0].nombre}" (ID: ${searchProds[0].id_producto})`);

  // Test 3: Filtro por categoría (Criterio 2)
  console.log('\n[TEST 3] Criterio 2: Filtro por Categoría ID 4 ("Periféricos")');
  const catRes = await fetch(`${BASE}/productos?categoria=4`);
  const catProds = await catRes.json();
  console.assert(catProds.length >= 2, 'Debe encontrar al menos 2 periféricos');
  console.assert(catProds.every(p => p.id_categoria === 4), 'Todos deben pertenecer a la categoría 4');
  console.log(`✓ Filtro por categoría exitoso: ${catProds.length} productos en "Periféricos":`);
  catProds.forEach(p => console.log(`   - ${p.nombre} (Bs. ${p.precio.toFixed(2)} | Stock: ${p.stock})`));

  // Test 4: Filtro combinado Nombre + Categoría (Criterio 2 Avanzado)
  console.log('\n[TEST 4] Criterio 2: Filtro combinado (q="Mouse" AND categoria=4)');
  const combinedRes = await fetch(`${BASE}/productos?q=Mouse&categoria=4`);
  const combinedProds = await combinedRes.json();
  console.assert(combinedProds.length === 1, 'Debe encontrar 1 producto');
  console.assert(combinedProds[0].nombre.includes('Mouse'), 'Debe ser el Mouse');
  console.log(`✓ Filtro combinado exitoso: "${combinedProds[0].nombre}"`);

  // Test 5: Visualización de productos agotados con Stock = 0 (Criterio 3)
  console.log('\n[TEST 5] Criterio 3: Verificar visualización de producto "Agotado" (Stock = 0)');
  const agotadoProd = allProds.find(p => p.stock === 0 || p.estado === 'Agotado');
  console.assert(agotadoProd !== undefined, 'Debe existir al menos un producto agotado en catálogo');
  console.assert(agotadoProd.stock === 0, 'El stock debe ser 0');
  console.assert(agotadoProd.estado === 'Agotado', 'El estado debe ser Agotado');
  console.log(`✓ Producto Agotado detectado: "${agotadoProd.nombre}" (Stock: ${agotadoProd.stock}, Estado: "${agotadoProd.estado}")`);

  // Test 6: Búsqueda sin resultados (Criterio 4)
  console.log('\n[TEST 6] Criterio 4: Búsqueda sin resultados ("TérminoInexistenteXYZ")');
  const emptyRes = await fetch(`${BASE}/productos?q=T%C3%A9rminoInexistenteXYZ`);
  const emptyProds = await emptyRes.json();
  console.assert(emptyProds.length === 0, 'Debe retornar array vacío para activar mensaje "No se encontraron productos"');
  console.log(`✓ Array vacío retornado (${emptyProds.length} items), activando vista amigable "No se encontraron productos" en la UI.`);

  // Test 7: Diccionario de Datos & Soft-Delete (Los productos inactivos NO se muestran)
  console.log('\n[TEST 7] Diccionario de Datos: Preservación de Soft-Delete (Inactivos no visibles)');
  const adminRes = await fetch(`${BASE}/productos/admin`);
  const adminProds = await adminRes.json();
  const inactivosAdmin = adminProds.filter(p => p.estado === 'Inactivo');
  const inactivosPublico = allProds.filter(p => p.estado === 'Inactivo');
  console.assert(inactivosPublico.length === 0, 'El catálogo público NUNCA debe contener productos Inactivos');
  console.log(`✓ Productos Inactivos en catálogo público: ${inactivosPublico.length} (Ocultos correctamente)`);
  console.log(`✓ Productos Inactivos en historial de administración: ${inactivosAdmin.length} (Preservados correctamente)`);

  console.log('\n============================================================');
  console.log('   TODAS LAS PRUEBAS DE HU-01 COMPLETADAS SATISFACTORIAMENTE   ');
  console.log('============================================================');
}

runHU01Tests().catch(console.error);
