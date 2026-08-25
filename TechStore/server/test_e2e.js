async function test() {
  const BASE = 'http://localhost:3001/api';

  console.log('============================================================');
  console.log('     VERIFICACIÓN INTEGRAL E2E: HU-01, HU-02, HU-03, HU-04  ');
  console.log('============================================================\n');

  console.log('--- TEST 1: HU-01 (Consultar Catálogo y Búsqueda) ---');
  const prodsRes = await fetch(`${BASE}/productos`);
  const prods = await prodsRes.json();
  console.log(`✓ Catálogo cargado: ${prods.length} productos activos/agotados disponibles.`);

  const searchRes = await fetch(`${BASE}/productos?q=Galaxy`);
  const searchProds = await searchRes.json();
  console.log(`✓ Búsqueda por "Galaxy": Encontró "${searchProds[0]?.nombre}" (Stock: ${searchProds[0]?.stock}).`);

  console.log('\n--- TEST 2: HU-02 (Carrito de Compras) ---');
  await fetch(`${BASE}/carrito/vaciar?idUsuario=2`, { method: 'DELETE' });
  const addRes = await fetch(`${BASE}/carrito/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id_producto: 3, cantidad: 2, id_usuario: 2 })
  });
  const cartData = await addRes.json();
  console.log(`✓ Producto agregado al carrito de Ronald Pérez: Total Items: ${cartData.carrito.items.length}, Total: Bs. ${cartData.carrito.total}`);

  console.log('\n--- TEST 3: HU-03 (Realizar Pedido / Checkout) ---');
  const checkoutRes = await fetch(`${BASE}/pedidos/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id_usuario: 2,
      nombre_receptor: 'Ronald Pérez',
      direccion: 'Calle Sucre #250',
      ciudad: 'Tarija',
      telefono: '70000002'
    })
  });
  const checkoutData = await checkoutRes.json();
  console.log(`✓ Pedido generado exitosamente: ${checkoutData.pedido.numero_pedido} por un importe de Bs. ${checkoutData.pedido.total}. Estado: ${checkoutData.pedido.estado}.`);

  console.log('\n--- TEST 4: HU-04 (Gestión de Productos por Administrador) ---');
  const uniqueName = `Micrófono HyperX QuadCast S-${Date.now()}`;
  const createRes = await fetch(`${BASE}/productos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nombre: uniqueName,
      descripcion: 'Micrófono USB condensador RGB para streaming',
      precio: 1350.00,
      stock: 5,
      id_categoria: 4
    })
  });
  const newProduct = await createRes.json();
  console.log(`✓ Producto creado por Admin: ID ${newProduct.id_producto} "${newProduct.nombre}" (Stock: ${newProduct.stock}).`);

  // Ajuste rápido de stock
  const stockRes = await fetch(`${BASE}/productos/${newProduct.id_producto}/stock`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ stock: 8 })
  });
  const stockData = await stockRes.json();
  console.log(`✓ Stock actualizado: nuevo stock = ${stockData.nuevoStock}`);

  // Soft-Delete (Desactivar)
  const deactivateRes = await fetch(`${BASE}/productos/${newProduct.id_producto}/desactivar`, {
    method: 'PATCH'
  });
  const deactivateData = await deactivateRes.json();
  console.log(`✓ Soft-Delete ejecutado: ${deactivateData.message}`);

  // Verificar que NO aparece en catálogo público pero SÍ en admin
  const publicRes = await fetch(`${BASE}/productos`);
  const publicProds = await publicRes.json();
  const existsInPublic = publicProds.some(p => p.id_producto === newProduct.id_producto);
  console.log(`✓ Verificación Soft-Delete: ¿Aparece en catálogo de clientes? ${existsInPublic ? 'SÍ (Error)' : 'NO (Correcto)'}`);

  const adminRes = await fetch(`${BASE}/productos/admin`);
  const adminProds = await adminRes.json();
  const existsInAdmin = adminProds.some(p => p.id_producto === newProduct.id_producto);
  console.log(`✓ Verificación Historial Admin: ¿Aparece en panel de administración? ${existsInAdmin ? 'SÍ (Correcto)' : 'NO (Error)'}`);

  const metricsRes = await fetch(`${BASE}/productos/metricas`);
  const metrics = await metricsRes.json();
  console.log(`\n✓ Métricas del Dashboard: Total: ${metrics.totalProductos} productos (${metrics.activos} activos, ${metrics.inactivos} inactivos, ${metrics.agotados} agotados).`);

  console.log('\n============================================================');
  console.log('            TODAS LAS PRUEBAS E2E COMPLETADAS               ');
  console.log('============================================================');
}

test().catch(console.error);
