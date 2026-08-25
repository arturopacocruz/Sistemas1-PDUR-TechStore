import { db } from '../database/db.js';
import { Carrito, ItemCarrito, EstadoCarrito } from '../models/types.js';
import { ICarritoRepository } from '../interfaces/ICarritoRepository.js';

export class CarritoRepository implements ICarritoRepository {
  obtenerCarrito(idCarrito: number): Carrito | undefined {
    const stmt = db.prepare('SELECT * FROM carrito WHERE id_carrito = ?');
    const carrito = stmt.get(idCarrito) as Carrito | undefined;
    if (!carrito) return undefined;

    carrito.items = this.obtenerItems(idCarrito);
    const sum = carrito.items.reduce((acc, item) => acc + item.subtotal, 0);
    carrito.total = Math.round(sum * 100) / 100;
    return carrito;
  }

  obtenerPorUsuario(idUsuario: number): Carrito {
    let stmt = db.prepare('SELECT * FROM carrito WHERE id_usuario = ?');
    let carrito = stmt.get(idUsuario) as Carrito | undefined;

    if (!carrito) {
      const insert = db.prepare(`
        INSERT INTO carrito (id_usuario, estado) VALUES (?, 'Vacio')
      `);
      const info = insert.run(idUsuario);
      carrito = this.obtenerCarrito(Number(info.lastInsertRowid))!;
    } else {
      carrito.items = this.obtenerItems(carrito.id_carrito);
      const sum = carrito.items.reduce((acc, item) => acc + item.subtotal, 0);
      carrito.total = Math.round(sum * 100) / 100;
    }

    return carrito;
  }

  obtenerItems(idCarrito: number): ItemCarrito[] {
    const stmt = db.prepare(`
      SELECT 
        ic.*, 
        p.nombre as producto_nombre,
        p.precio as producto_precio,
        p.stock as producto_stock,
        p.imagen as producto_imagen,
        p.estado as producto_estado
      FROM item_carrito ic
      INNER JOIN producto p ON ic.id_producto = p.id_producto
      WHERE ic.id_carrito = ?
      ORDER BY ic.id_item ASC
    `);
    
    const rows = stmt.all(idCarrito) as any[];
    return rows.map(r => ({
      id_item: r.id_item,
      id_carrito: r.id_carrito,
      id_producto: r.id_producto,
      cantidad: r.cantidad,
      precio_unitario: Number(r.precio_unitario.toFixed(2)),
      subtotal: Math.round(r.cantidad * r.precio_unitario * 100) / 100,
      producto: {
        id_producto: r.id_producto,
        nombre: r.producto_nombre,
        precio: Number(r.producto_precio.toFixed(2)),
        stock: r.producto_stock,
        imagen: r.producto_imagen,
        estado: r.producto_estado,
        fecha_creacion: '',
        id_categoria: 0
      }
    }));
  }

  agregarOActualizarItem(idCarrito: number, idProducto: number, cantidad: number, precioUnitario: number): void {
    const existing = db.prepare(`
      SELECT * FROM item_carrito WHERE id_carrito = ? AND id_producto = ?
    `).get(idCarrito, idProducto) as ItemCarrito | undefined;

    if (existing) {
      const nuevaCantidad = existing.cantidad + cantidad;
      const nuevoSubtotal = Math.round(nuevaCantidad * precioUnitario * 100) / 100;
      const update = db.prepare(`
        UPDATE item_carrito 
        SET cantidad = ?, precio_unitario = ?, subtotal = ?
        WHERE id_item = ?
      `);
      update.run(nuevaCantidad, precioUnitario, nuevoSubtotal, existing.id_item);
    } else {
      const subtotal = Math.round(cantidad * precioUnitario * 100) / 100;
      const insert = db.prepare(`
        INSERT INTO item_carrito (id_carrito, id_producto, cantidad, precio_unitario, subtotal)
        VALUES (?, ?, ?, ?, ?)
      `);
      insert.run(idCarrito, idProducto, cantidad, precioUnitario, subtotal);
    }

    this.actualizarEstadoSegunItems(idCarrito);
  }

  modificarCantidad(idCarrito: number, idProducto: number, nuevaCantidad: number, precioUnitario: number): void {
    if (nuevaCantidad <= 0) {
      this.eliminarProducto(idCarrito, idProducto);
      return;
    }

    const subtotal = Math.round(nuevaCantidad * precioUnitario * 100) / 100;
    const stmt = db.prepare(`
      UPDATE item_carrito
      SET cantidad = ?, precio_unitario = ?, subtotal = ?
      WHERE id_carrito = ? AND id_producto = ?
    `);
    stmt.run(nuevaCantidad, precioUnitario, subtotal, idCarrito, idProducto);

    this.actualizarEstadoSegunItems(idCarrito);
  }

  eliminarProducto(idCarrito: number, idProducto: number): void {
    const stmt = db.prepare('DELETE FROM item_carrito WHERE id_carrito = ? AND id_producto = ?');
    stmt.run(idCarrito, idProducto);
    this.actualizarEstadoSegunItems(idCarrito);
  }

  vaciar(idCarrito: number): void {
    const stmt = db.prepare('DELETE FROM item_carrito WHERE id_carrito = ?');
    stmt.run(idCarrito);
    this.actualizarEstado(idCarrito, 'Vacio');
  }

  actualizarEstado(idCarrito: number, estado: EstadoCarrito): void {
    const stmt = db.prepare('UPDATE carrito SET estado = ? WHERE id_carrito = ?');
    stmt.run(estado, idCarrito);
  }

  private actualizarEstadoSegunItems(idCarrito: number): void {
    const itemsCount = db.prepare('SELECT count(*) as count FROM item_carrito WHERE id_carrito = ?').get(idCarrito) as { count: number };
    const nuevoEstado: EstadoCarrito = itemsCount.count > 0 ? 'Con Productos' : 'Vacio';
    this.actualizarEstado(idCarrito, nuevoEstado);
  }
}
