import { db } from '../database/db.js';
import { Producto, EstadoProducto } from '../models/types.js';
import { IProductoRepository } from '../interfaces/IProductoRepository.js';

export class ProductoRepository implements IProductoRepository {
  findCatalogo(criterios?: { nombre?: string; idCategoria?: number }): Producto[] {
    let sql = `
      SELECT p.*, c.nombre as categoria_nombre
      FROM producto p
      INNER JOIN categoria c ON p.id_categoria = c.id_categoria
      WHERE p.estado != 'Inactivo' AND c.estado = 'Activa'
    `;
    const params: any[] = [];

    if (criterios?.idCategoria) {
      sql += ` AND p.id_categoria = ?`;
      params.push(criterios.idCategoria);
    }

    if (criterios?.nombre && criterios.nombre.trim() !== '') {
      sql += ` AND LOWER(p.nombre) LIKE LOWER(?)`;
      params.push(`%${criterios.nombre.trim()}%`);
    }

    sql += ` ORDER BY p.id_producto ASC`;

    const stmt = db.prepare(sql);
    return stmt.all(...params) as Producto[];
  }

  findAll(): Producto[] {
    return this.findCatalogo();
  }

  findAllAdmin(): Producto[] {
    const stmt = db.prepare(`
      SELECT p.*, c.nombre as categoria_nombre
      FROM producto p
      INNER JOIN categoria c ON p.id_categoria = c.id_categoria
      ORDER BY p.id_producto ASC
    `);
    return stmt.all() as Producto[];
  }

  findById(idProducto: number): Producto | undefined {
    const stmt = db.prepare(`
      SELECT p.*, c.nombre as categoria_nombre
      FROM producto p
      INNER JOIN categoria c ON p.id_categoria = c.id_categoria
      WHERE p.id_producto = ?
    `);
    return stmt.get(idProducto) as Producto | undefined;
  }

  findByExactNombre(nombre: string, excludeId?: number): Producto | undefined {
    let sql = `
      SELECT p.*, c.nombre as categoria_nombre
      FROM producto p
      INNER JOIN categoria c ON p.id_categoria = c.id_categoria
      WHERE LOWER(TRIM(p.nombre)) = LOWER(TRIM(?))
    `;
    const params: any[] = [nombre];

    if (excludeId) {
      sql += ` AND p.id_producto != ?`;
      params.push(excludeId);
    }

    const stmt = db.prepare(sql);
    return stmt.get(...params) as Producto | undefined;
  }

  findByNombre(nombre: string): Producto[] {
    return this.findCatalogo({ nombre });
  }

  findByCategoria(idCategoria: number): Producto[] {
    return this.findCatalogo({ idCategoria });
  }

  consultarStock(idProducto: number): number {
    const stmt = db.prepare('SELECT stock FROM producto WHERE id_producto = ?');
    const result = stmt.get(idProducto) as { stock: number } | undefined;
    return result ? result.stock : 0;
  }

  save(producto: Omit<Producto, 'id_producto' | 'fecha_creacion' | 'fecha_actualizacion' | 'categoria_nombre'>): Producto {
    const stmt = db.prepare(`
      INSERT INTO producto (nombre, descripcion, precio, stock, imagen, estado, id_categoria)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const info = stmt.run(
      producto.nombre.trim(),
      producto.descripcion?.trim() || null,
      producto.precio,
      producto.stock,
      producto.imagen?.trim() || null,
      producto.estado || (producto.stock > 0 ? 'Activo' : 'Agotado'),
      producto.id_categoria
    );
    return this.findById(Number(info.lastInsertRowid))!;
  }

  update(idProducto: number, producto: Partial<Producto>): Producto | undefined {
    const existing = this.findById(idProducto);
    if (!existing) return undefined;

    const nombre = producto.nombre !== undefined ? producto.nombre.trim() : existing.nombre;
    const descripcion = producto.descripcion !== undefined ? (producto.descripcion ? producto.descripcion.trim() : null) : existing.descripcion;
    const precio = producto.precio !== undefined ? producto.precio : existing.precio;
    const stock = producto.stock !== undefined ? producto.stock : existing.stock;
    const imagen = producto.imagen !== undefined ? (producto.imagen ? producto.imagen.trim() : null) : existing.imagen;
    const id_categoria = producto.id_categoria !== undefined ? producto.id_categoria : existing.id_categoria;
    
    let estado = producto.estado !== undefined ? producto.estado : existing.estado;
    if (!producto.estado && existing.estado !== 'Inactivo') {
      estado = stock > 0 ? 'Activo' : 'Agotado';
    }

    const stmt = db.prepare(`
      UPDATE producto
      SET nombre = ?, descripcion = ?, precio = ?, stock = ?, imagen = ?, estado = ?, id_categoria = ?, fecha_actualizacion = DATE('now')
      WHERE id_producto = ?
    `);
    stmt.run(nombre, descripcion, precio, stock, imagen, estado, id_categoria, idProducto);

    return this.findById(idProducto);
  }

  updateStock(idProducto: number, nuevoStock: number): boolean {
    const existing = this.findById(idProducto);
    if (!existing) return false;

    let nuevoEstado: EstadoProducto = existing.estado;
    if (existing.estado !== 'Inactivo') {
      nuevoEstado = nuevoStock > 0 ? 'Activo' : 'Agotado';
    }

    const stmt = db.prepare(`
      UPDATE producto
      SET stock = ?, estado = ?, fecha_actualizacion = DATE('now')
      WHERE id_producto = ?
    `);
    stmt.run(nuevoStock, nuevoEstado, idProducto);
    return true;
  }

  deactivate(idProducto: number): boolean {
    const stmt = db.prepare(`
      UPDATE producto
      SET estado = 'Inactivo', fecha_actualizacion = DATE('now')
      WHERE id_producto = ?
    `);
    const info = stmt.run(idProducto);
    return info.changes > 0;
  }

  reactivate(idProducto: number): boolean {
    const existing = this.findById(idProducto);
    if (!existing) return false;

    const nuevoEstado = existing.stock > 0 ? 'Activo' : 'Agotado';
    const stmt = db.prepare(`
      UPDATE producto
      SET estado = ?, fecha_actualizacion = DATE('now')
      WHERE id_producto = ?
    `);
    const info = stmt.run(nuevoEstado, idProducto);
    return info.changes > 0;
  }
}
