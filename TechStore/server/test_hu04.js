async function runHU04Tests() {
  const BASE = 'http://localhost:3001/api';
  console.log('============================================================');
  console.log('       VALIDACIÓN RIGUROSA HU-04: GESTIONAR PRODUCTOS       ');
  console.log('============================================================\n');

  // ── TEST 1: Criterio 2 - Registrar nuevo producto con campos obligatorios ──
  console.log('[TEST 1] Criterio 2: Registrar nuevo producto válido');
  const nuevoProd = {
    nombre: 'Monitor Gamer ASUS TUF 27 IPS 165Hz',
    descripcion: 'Monitor gamer Full HD 1ms FreeSync Premium con display port',
    precio: 1850.50,
    stock: 8,
    imagen: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500',
    id_categoria: 1
  };

  const createRes = await fetch(`${BASE}/productos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(nuevoProd)
  });
  const created = await createRes.json();
  console.assert(createRes.status === 201, 'Debe retornar 201 Created');
  console.assert(created.id_producto > 0, 'Debe tener ID asignado');
  console.assert(created.estado === 'Activo', 'Estado debe ser Activo');
  console.assert(created.precio === 1850.50, 'Precio debe ser 1850.50');
  console.log(`✓ Producto registrado con éxito: ID #${created.id_producto} "${created.nombre}" | Bs. ${created.precio.toFixed(2)} | Stock: ${created.stock} (${created.estado})`);

  const idCreado = created.id_producto;

  // ── TEST 2: Diagrama de Secuencia - Detección de Producto Duplicado ──
  console.log('\n[TEST 2] Diagrama de Secuencia: Detección de producto duplicado');
  const dupRes = await fetch(`${BASE}/productos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(nuevoProd)
  });
  const dupData = await dupRes.json();
  console.assert(dupRes.status === 400, 'Debe retornar error 400');
  console.assert(dupData.error === 'El producto ya existe', `Debe indicar 'El producto ya existe', recibido: ${dupData.error}`);
  console.log(`✓ Producto duplicado rechazado correctamente: "${dupData.error}"`);

  // ── TEST 3: Criterio 3 - Validaciones de precio y stock ──
  console.log('\n[TEST 3] Criterio 3 + DD §4.3: Validar precio <= 0 y stock < 0');
  
  // Precio inválido
  const invalidPrecioRes = await fetch(`${BASE}/productos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...nuevoProd, nombre: 'Producto Precio Cero', precio: 0 })
  });
  const invalidPrecioData = await invalidPrecioRes.json();
  console.assert(invalidPrecioRes.status === 400, 'Debe rechazar precio 0');
  console.log(`✓ Precio 0 rechazado: "${invalidPrecioData.error}"`);

  // Stock negativo
  const invalidStockRes = await fetch(`${BASE}/productos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...nuevoProd, nombre: 'Producto Stock Negativo', stock: -3 })
  });
  const invalidStockData = await invalidStockRes.json();
  console.assert(invalidStockRes.status === 400, 'Debe rechazar stock negativo');
  console.log(`✓ Stock negativo rechazado: "${invalidStockData.error}"`);

  // ── TEST 4: Criterio 5 - Modificar propiedades del producto ──
  console.log('\n[TEST 4] Criterio 5: Modificar información de producto existente');
  const updateRes = await fetch(`${BASE}/productos/${idCreado}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nombre: 'Monitor Gamer ASUS TUF 27 IPS 165Hz Pro Edition',
      precio: 1999.00
    })
  });
  const updated = await updateRes.json();
  console.assert(updateRes.status === 200, 'Debe retornar 200');
  console.assert(updated.nombre.includes('Pro Edition'), 'Nombre debe actualizarse');
  console.assert(updated.precio === 1999.00, 'Precio debe actualizarse');
  console.log(`✓ Producto actualizado: "${updated.nombre}" | Nuevo Precio: Bs. ${updated.precio.toFixed(2)}`);

  // ── TEST 5: Criterio 5 - Ajuste rápido de stock y transición de estado ──
  console.log('\n[TEST 5] Criterio 5 & Diagrama de Estados: Actualizar stock a 0 (auto-transición a "Agotado")');
  const stockZeroRes = await fetch(`${BASE}/productos/${idCreado}/stock`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ stock: 0 })
  });
  const stockZeroData = await stockZeroRes.json();
  console.assert(stockZeroRes.status === 200, 'Debe retornar 200');
  
  const checkAgotado = await (await fetch(`${BASE}/productos/${idCreado}`)).json();
  console.assert(checkAgotado.stock === 0, 'Stock debe ser 0');
  console.assert(checkAgotado.estado === 'Agotado', `Estado debe ser Agotado, recibido: ${checkAgotado.estado}`);
  console.log(`✓ Transición de estado verificada: Stock 0 → Estado: "${checkAgotado.estado}"`);

  // Restablecer stock a 15
  await fetch(`${BASE}/productos/${idCreado}/stock`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ stock: 15 })
  });
  const checkActivo = await (await fetch(`${BASE}/productos/${idCreado}`)).json();
  console.assert(checkActivo.stock === 15 && checkActivo.estado === 'Activo', 'Debe regresar a Activo');
  console.log(`✓ Transición de estado verificada: Stock 15 → Estado: "${checkActivo.estado}"`);

  // ── TEST 6: Criterio 4 - Soft-Delete (Desactivar) y Reactivar ──
  console.log('\n[TEST 6] Criterio 4: Soft-Delete (Desactivar producto sin eliminar registro)');
  const deactRes = await fetch(`${BASE}/productos/${idCreado}/desactivar`, { method: 'PATCH' });
  const deactData = await deactRes.json();
  console.assert(deactRes.status === 200, 'Debe retornar 200');
  console.log(`✓ Desactivación: "${deactData.message}"`);

  // Verificar que NO está en el catálogo público
  const publicoProds = await (await fetch(`${BASE}/productos`)).json();
  console.assert(!publicoProds.some(p => p.id_producto === idCreado), 'No debe aparecer en catálogo público');
  console.log(`✓ Producto oculto del catálogo público de clientes.`);

  // Verificar que SÍ está en el panel de administración
  const adminProds = await (await fetch(`${BASE}/productos/admin`)).json();
  const prodInAdmin = adminProds.find(p => p.id_producto === idCreado);
  console.assert(prodInAdmin !== undefined && prodInAdmin.estado === 'Inactivo', 'Debe existir en admin como Inactivo');
  console.log(`✓ Registro preservado en panel de administración con estado: "${prodInAdmin.estado}".`);

  // Reactivar
  const reactRes = await fetch(`${BASE}/productos/${idCreado}/reactivar`, { method: 'PATCH' });
  const reactData = await reactRes.json();
  console.assert(reactRes.status === 200, 'Debe retornar 200');
  console.log(`✓ Reactivación: "${reactData.message}"`);

  // ── TEST 7: Métricas del Panel de Administración (Reporte Visual) ──
  console.log('\n[TEST 7] Reporte Visual: KPIs del panel de administración');
  const metricasRes = await fetch(`${BASE}/productos/metricas`);
  const metricas = await metricasRes.json();
  console.assert(metricas.totalProductos > 0, 'Debe tener productos');
  console.assert(typeof metricas.totalStock === 'number', 'totalStock debe ser número');
  console.log(`✓ Métricas obtenidas: Total: ${metricas.totalProductos} productos | Activos: ${metricas.activos} | Agotados: ${metricas.agotados} | Inactivos: ${metricas.inactivos} | Stock Total: ${metricas.totalStock} unidades`);

  console.log('\n============================================================');
  console.log('  TODAS LAS PRUEBAS DE HU-04 COMPLETADAS SATISFACTORIAMENTE  ');
  console.log('============================================================');
}

runHU04Tests().catch(console.error);
