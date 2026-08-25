import { Producto, EstadoProducto } from '../models/types.js';

export interface IStockReader {
  consultarStock(idProducto: number): number;
}

export interface IStockUpdater {
  updateStock(idProducto: number, nuevoStock: number): boolean;
}

export interface IProductoRepository extends IStockReader, IStockUpdater {
  findCatalogo(criterios?: { nombre?: string; idCategoria?: number }): Producto[];
  findAll(): Producto[];
  findAllAdmin(): Producto[];
  findById(idProducto: number): Producto | undefined;
  findByExactNombre(nombre: string, excludeId?: number): Producto | undefined;
  findByNombre(nombre: string): Producto[];
  findByCategoria(idCategoria: number): Producto[];
  save(producto: Omit<Producto, 'id_producto' | 'fecha_creacion' | 'fecha_actualizacion' | 'categoria_nombre'>): Producto;
  update(idProducto: number, producto: Partial<Producto>): Producto | undefined;
  deactivate(idProducto: number): boolean;
  reactivate(idProducto: number): boolean;
}
