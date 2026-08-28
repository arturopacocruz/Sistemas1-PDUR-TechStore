import { db } from '../database/db.js';
import { Pedido, DetallePedido, DireccionEntrega, EstadoPedido } from '../models/types.js';
import { IPedidoRepository } from '../interfaces/IPedidoRepository.js';
import { CryptoUtil } from '../utils/crypto.js';

export class PedidoRepository implements IPedidoRepository {
  generarNumeroPedido(): string {
    const stmt = db.prepare('SELECT count(*) as count FROM pedido');
    const result = stmt.get() as { count: number };
    const nextNumber = (result ? result.count : 0) + 1;
    return `PED-${String(nextNumber).padStart(6, '0')}`;
  }

  guardarDireccion(idUsuario: number, nombreReceptor: string, direccion: string, ciudad: string, telefono: string): DireccionEntrega {
    // Cifrado en reposo para datos personales sensibles PII (Ley N° 164 / ASFI)
    const encryptedDireccion = CryptoUtil.encrypt(direccion);
    const encryptedTelefono = CryptoUtil.encrypt(telefono);

    const stmt = db.prepare(`
      INSERT INTO direccion_entrega (id_usuario, nombre_receptor, direccion, ciudad, telefono)
      VALUES (?, ?, ?, ?, ?)
    `);
    const info = stmt.run(idUsuario, nombreReceptor, encryptedDireccion, ciudad, encryptedTelefono);

    return {
      id_direccion: Number(info.lastInsertRowid),
      id_usuario: idUsuario,
      nombre_receptor: nombreReceptor,
      direccion, // Retornar en memoria descifrado para el flujo activo
      ciudad,
      telefono
    };
  }

  obtenerDireccionPorId(idDireccion: number): DireccionEntrega | undefined {
    const stmt = db.prepare('SELECT * FROM direccion_entrega WHERE id_direccion = ?');
    const raw = stmt.get(idDireccion) as DireccionEntrega | undefined;
    if (!raw) return undefined;

    return {
      ...raw,
      direccion: CryptoUtil.decrypt(raw.direccion),
      telefono: CryptoUtil.decrypt(raw.telefono)
    };
  }

  obtenerDireccionesPorUsuario(idUsuario: number): DireccionEntrega[] {
    const stmt = db.prepare('SELECT * FROM direccion_entrega WHERE id_usuario = ? ORDER BY id_direccion DESC');
    const rows = stmt.all(idUsuario) as DireccionEntrega[];
    return rows.map(r => ({
      ...r,
      direccion: CryptoUtil.decrypt(r.direccion),
      telefono: CryptoUtil.decrypt(r.telefono)
    }));
  }

  guardar(idUsuario: number, idDireccion: number, numeroPedido: string, total: number, items: { id_producto: number; cantidad: number; precio_unitario: number; subtotal: number }[]): Pedido {
    const insertTransaction = db.transaction(() => {
      // 1. Sello de Integridad Criptográfico (SHA-256 HMAC) para el contrato digital (Ley N° 164)
      const timestamp = new Date().toISOString();
      const hashIntegridad = CryptoUtil.generateIntegrityHash({
        numero_pedido: numeroPedido,
        id_usuario: idUsuario,
        id_direccion: idDireccion,
        total,
        items,
        timestamp
      });

      // 2. Insert Pedido con hash_integridad
      const insertPedidoStmt = db.prepare(`
        INSERT INTO pedido (numero_pedido, id_usuario, id_direccion, estado, total, hash_integridad)
        VALUES (?, ?, ?, 'Confirmado', ?, ?)
      `);
      const info = insertPedidoStmt.run(numeroPedido, idUsuario, idDireccion, total, hashIntegridad);
      const idPedido = Number(info.lastInsertRowid);

      // 3. Insert DetallePedido and update stock
      const insertDetalleStmt = db.prepare(`
        INSERT INTO detalle_pedido (id_pedido, id_producto, cantidad, precio_unitario, subtotal)
        VALUES (?, ?, ?, ?, ?)
      `);

      const updateStockStmt = db.prepare(`
        UPDATE producto 
        SET stock = stock - ?, 
            estado = CASE WHEN stock - ? <= 0 THEN 'Agotado' ELSE 'Activo' END,
            fecha_actualizacion = DATE('now')
        WHERE id_producto = ?
      `);

      for (const item of items) {
        insertDetalleStmt.run(idPedido, item.id_producto, item.cantidad, item.precio_unitario, item.subtotal);
        updateStockStmt.run(item.cantidad, item.cantidad, item.id_producto);
      }

      return idPedido;
    });

    const idPedido = insertTransaction();
    return this.buscarPorId(idPedido)!;
  }

  buscarPorId(idPedido: number): Pedido | undefined {
    const stmt = db.prepare(`
      SELECT p.*, u.nombre as cliente_nombre, u.email as cliente_email
      FROM pedido p
      INNER JOIN usuario u ON p.id_usuario = u.id_usuario
      WHERE p.id_pedido = ?
    `);
    const pedido = stmt.get(idPedido) as Pedido | undefined;
    if (!pedido) return undefined;

    pedido.direccion = this.obtenerDireccionPorId(pedido.id_direccion);
    pedido.detalles = this.obtenerDetalles(idPedido);
    return pedido;
  }

  buscarPorNumero(numeroPedido: string): Pedido | undefined {
    const stmt = db.prepare(`
      SELECT p.*, u.nombre as cliente_nombre, u.email as cliente_email
      FROM pedido p
      INNER JOIN usuario u ON p.id_usuario = u.id_usuario
      WHERE p.numero_pedido = ?
    `);
    const pedido = stmt.get(numeroPedido) as Pedido | undefined;
    if (!pedido) return undefined;

    pedido.direccion = this.obtenerDireccionPorId(pedido.id_direccion);
    pedido.detalles = this.obtenerDetalles(pedido.id_pedido);
    return pedido;
  }

  obtenerDetalles(idPedido: number): DetallePedido[] {
    const stmt = db.prepare(`
      SELECT dp.*, p.nombre as producto_nombre
      FROM detalle_pedido dp
      INNER JOIN producto p ON dp.id_producto = p.id_producto
      WHERE dp.id_pedido = ?
      ORDER BY dp.id_detalle ASC
    `);
    return stmt.all(idPedido) as DetallePedido[];
  }

  listarPedidos(): Pedido[] {
    const stmt = db.prepare(`
      SELECT p.*, u.nombre as cliente_nombre, u.email as cliente_email
      FROM pedido p
      INNER JOIN usuario u ON p.id_usuario = u.id_usuario
      ORDER BY p.id_pedido DESC
    `);
    const pedidos = stmt.all() as Pedido[];
    for (const ped of pedidos) {
      ped.direccion = this.obtenerDireccionPorId(ped.id_direccion);
      ped.detalles = this.obtenerDetalles(ped.id_pedido);
    }
    return pedidos;
  }

  listarPorUsuario(idUsuario: number): Pedido[] {
    const stmt = db.prepare(`
      SELECT p.*, u.nombre as cliente_nombre, u.email as cliente_email
      FROM pedido p
      INNER JOIN usuario u ON p.id_usuario = u.id_usuario
      WHERE p.id_usuario = ?
      ORDER BY p.id_pedido DESC
    `);
    const pedidos = stmt.all(idUsuario) as Pedido[];
    for (const ped of pedidos) {
      ped.direccion = this.obtenerDireccionPorId(ped.id_direccion);
      ped.detalles = this.obtenerDetalles(ped.id_pedido);
    }
    return pedidos;
  }

  actualizarEstado(idPedido: number, estado: EstadoPedido): boolean {
    const stmt = db.prepare('UPDATE pedido SET estado = ? WHERE id_pedido = ?');
    const info = stmt.run(estado, idPedido);
    return info.changes > 0;
  }
}
