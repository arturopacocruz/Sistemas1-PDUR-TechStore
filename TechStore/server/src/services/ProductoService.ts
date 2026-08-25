import { ProductoRepository } from '../repositories/ProductoRepository.js';
import { IProductoRepository } from '../interfaces/IProductoRepository.js';
import { ProductoValidator } from '../validators/ProductoValidator.js';
import { Producto } from '../models/types.js';

export class ProductoService {
  private productoRepository: IProductoRepository;

  // Inyección de Dependencias (DIP)
  constructor(productoRepository: IProductoRepository = new ProductoRepository()) {
    this.productoRepository = productoRepository;
  }

  consultarCatalogo(params?: { q?: string; categoria?: number }): Producto[] {
    return this.productoRepository.findCatalogo({
      nombre: params?.q,
      idCategoria: params?.categoria
    });
  }

  obtenerTodos(): Producto[] {
    return this.productoRepository.findAll();
  }

  buscar(nombre: string): Producto[] {
    if (!nombre || nombre.trim() === '') {
      return this.obtenerTodos();
    }
    return this.productoRepository.findByNombre(nombre.trim());
  }

  obtenerPorCategoria(idCategoria: number): Producto[] {
    if (!idCategoria || isNaN(idCategoria)) {
      return this.obtenerTodos();
    }
    return this.productoRepository.findByCategoria(idCategoria);
  }

  obtenerPorId(idProducto: number): Producto | undefined {
    return this.productoRepository.findById(idProducto);
  }

  listarProductosAdmin(): Producto[] {
    return this.productoRepository.findAllAdmin();
  }

  verificarDuplicado(nombre: string, excludeId?: number): boolean {
    const existing = this.productoRepository.findByExactNombre(nombre, excludeId);
    return !!existing;
  }

  validarDatos(producto: Partial<Producto>): { valid: boolean; error?: string } {
    return ProductoValidator.validar(producto);
  }

  registrarProducto(datos: Omit<Producto, 'id_producto' | 'fecha_creacion' | 'fecha_actualizacion' | 'categoria_nombre'>): Producto {
    const validacion = ProductoValidator.validar(datos);
    if (!validacion.valid) {
      throw new Error(validacion.error);
    }

    if (this.verificarDuplicado(datos.nombre)) {
      throw new Error('El producto ya existe');
    }

    return this.productoRepository.save({
      ...datos,
      precio: Number(Number(datos.precio).toFixed(2)),
      stock: Number(datos.stock)
    });
  }

  actualizarProducto(idProducto: number, datos: Partial<Producto>): Producto {
    const existente = this.productoRepository.findById(idProducto);
    if (!existente) {
      throw new Error('Producto no encontrado.');
    }

    if (datos.nombre && datos.nombre.trim() !== '') {
      if (this.verificarDuplicado(datos.nombre, idProducto)) {
        throw new Error('El producto ya existe');
      }
    }

    if (datos.precio !== undefined && Number(datos.precio) <= 0) {
      throw new Error('El precio debe ser mayor a 0.');
    }
    if (datos.stock !== undefined && (Number(datos.stock) < 0 || !Number.isInteger(Number(datos.stock)))) {
      throw new Error('El stock debe ser un número entero mayor o igual a 0.');
    }

    const actualizado = this.productoRepository.update(idProducto, {
      ...datos,
      precio: datos.precio !== undefined ? Number(Number(datos.precio).toFixed(2)) : undefined,
      stock: datos.stock !== undefined ? Number(datos.stock) : undefined
    });

    if (!actualizado) {
      throw new Error('No se pudo actualizar el producto.');
    }
    return actualizado;
  }

  actualizarStock(idProducto: number, nuevoStock: number): boolean {
    const validacion = ProductoValidator.validarStock(nuevoStock);
    if (!validacion.valid) {
      throw new Error(validacion.error);
    }
    return this.productoRepository.updateStock(idProducto, nuevoStock);
  }

  desactivarProducto(idProducto: number): boolean {
    return this.productoRepository.deactivate(idProducto);
  }

  reactivarProducto(idProducto: number): boolean {
    return this.productoRepository.reactivate(idProducto);
  }

  obtenerMetricas() {
    const productos = this.productoRepository.findAllAdmin();
    const totalProductos = productos.length;
    const activos = productos.filter(p => p.estado === 'Activo').length;
    const agotados = productos.filter(p => p.estado === 'Agotado' || p.stock === 0).length;
    const inactivos = productos.filter(p => p.estado === 'Inactivo').length;
    const totalStock = productos.reduce((sum, p) => sum + p.stock, 0);
    const bajoStock = productos.filter(p => p.stock > 0 && p.stock <= 10 && p.estado !== 'Inactivo');

    return {
      totalProductos,
      activos,
      agotados,
      inactivos,
      totalStock,
      bajoStock
    };
  }
}
