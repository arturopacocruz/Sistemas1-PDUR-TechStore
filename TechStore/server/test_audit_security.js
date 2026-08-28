import Database from 'better-sqlite3';
import path from 'path';

async function runSecurityAndAuditTests() {
  const BASE = 'http://localhost:3001/api';
  console.log('================================================================');
  console.log('  VALIDACIÓN DE CIFRADO EN REPOSO Y LOGS DE AUDITORÍA ASFI/LEY164');
  console.log('================================================================\n');

  // ── TEST 1: Cifrado en Reposo de Datos Personales (PII) ──
  console.log('[TEST 1] Cifrado en Reposo (AES-256): Dirección y Teléfono');
  
  // Realizar un checkout
  await fetch(`${BASE}/carrito/vaciar?idUsuario=1`, { method: 'DELETE' });
  await fetch(`${BASE}/carrito/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id_usuario: 1, id_producto: 1, cantidad: 1 })
  });

  const checkoutRes = await fetch(`${BASE}/pedidos/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id_usuario: 1,
      nombre_receptor: 'Arturo Cruz',
      direccion: 'Av. Las Américas #450, Barrio Senac',
      ciudad: 'Tarija',
      telefono: '70000001'
    })
  });
  const checkoutData = await checkoutRes.json();
  console.assert(checkoutRes.status === 201, 'Debe crear pedido exitosamente');
  console.log(`✓ Pedido creado: ${checkoutData.pedido.numero_pedido} | Total: Bs. ${checkoutData.pedido.total}`);
  
  // Inspeccionar directamente el archivo SQLite físico para verificar que los datos están cifrados
  const db = new Database(path.resolve(process.cwd(), 'techstore.db'));
  const rawDir = db.prepare('SELECT * FROM direccion_entrega ORDER BY id_direccion DESC LIMIT 1').get();
  
  console.assert(rawDir.direccion.includes(':'), 'La dirección en la BD física debe estar cifrada con IV');
  console.assert(rawDir.telefono.includes(':'), 'El teléfono en la BD física debe estar cifrado con IV');
  console.assert(!rawDir.direccion.includes('Senac'), 'El texto claro no debe ser visible en el archivo de BD');
  console.log(`✓ Dato cifrado en BD (AES-256): "${rawDir.direccion.slice(0, 32)}..."`);
  console.log(`✓ Teléfono cifrado en BD: "${rawDir.telefono}"`);

  // Verificar que la capa de servicio lo entrega descifrado legítimamente al cliente
  const pedidoConsultado = await (await fetch(`${BASE}/pedidos/numero/${checkoutData.pedido.numero_pedido}`)).json();
  console.assert(pedidoConsultado.direccion.direccion.includes('Senac'), 'El cliente legítimo debe recibir el dato descifrado');
  console.log(`✓ Descifrado transparente en capa de aplicación: "${pedidoConsultado.direccion.direccion}"`);

  // ── TEST 2: Sello Criptográfico de Integridad en Pedido (Ley N° 164) ──
  console.log('\n[TEST 2] Sello de Integridad Criptográfico (Ley N° 164 - Art. 79 & 84)');
  const rawPedido = db.prepare('SELECT * FROM pedido WHERE numero_pedido = ?').get(checkoutData.pedido.numero_pedido);
  console.assert(rawPedido.hash_integridad && rawPedido.hash_integridad.length === 64, 'Debe contener un hash SHA-256');
  console.log(`✓ Hash SHA-256 de integridad del contrato: ${rawPedido.hash_integridad}`);

  // ── TEST 3: Registro Inmutable en logs_auditoria (Normativa ASFI) ──
  console.log('\n[TEST 3] Trazas Inmutables en logs_auditoria (Normativa ASFI Circular 508)');
  const logsRes = await fetch(`${BASE}/audit/logs`);
  const logs = await logsRes.json();
  console.assert(logs.length > 0, 'Debe haber logs de auditoría registrados');
  const orderLog = logs.find(l => l.accion === 'ORDER_CREATED');
  console.assert(orderLog !== undefined, 'Debe existir log ORDER_CREATED');
  console.log(`✓ Log ASFI registrado: ID #${orderLog.id_log} | Acción: ${orderLog.accion} | IP: ${orderLog.ip_origen} | Entidad: ${orderLog.entidad_afectada} (${orderLog.id_entidad})`);
  console.log(`✓ Sello de Integridad del Log: ${orderLog.hash_integridad}`);

  // ── TEST 4: Prueba de Inalterabilidad (Trigger Anti-Tampering ASFI) ──
  console.log('\n[TEST 4] Prueba de Inalterabilidad (Trigger de Seguridad Anti-Tampering)');
  let updateBloqueado = false;
  try {
    db.prepare("UPDATE logs_auditoria SET accion = 'HACKED' WHERE id_log = 1").run();
  } catch (err) {
    updateBloqueado = true;
    console.log(`✓ UPDATE bloqueado por el trigger inmutable: "${err.message}"`);
  }
  console.assert(updateBloqueado, 'El trigger debe abortar cualquier intento de UPDATE en logs_auditoria');

  let deleteBloqueado = false;
  try {
    db.prepare('DELETE FROM logs_auditoria WHERE id_log = 1').run();
  } catch (err) {
    deleteBloqueado = true;
    console.log(`✓ DELETE bloqueado por el trigger inmutable: "${err.message}"`);
  }
  console.assert(deleteBloqueado, 'El trigger debe abortar cualquier intento de DELETE en logs_auditoria');

  console.log('\n================================================================');
  console.log('  TODAS LAS PRUEBAS DE SEGURIDAD, CIFRADO Y ASFI COMPLETADAS   ');
  console.log('================================================================');
}

runSecurityAndAuditTests().catch(console.error);
