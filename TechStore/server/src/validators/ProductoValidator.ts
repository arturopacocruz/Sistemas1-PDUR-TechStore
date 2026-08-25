import { Producto } from '../models/types.js';

export class ProductoValidator {
  /**
   * Valida la estructura y restricciones de negocio de un producto (SRP)
   */
  static validar(producto: Partial<Producto>): { valid: boolean; error?: string } {
    if (!producto.nombre || producto.nombre.trim() === '') {
      return { valid: false, error: 'El nombre del producto es obligatorio.' };
    }
    if (producto.nombre.trim().length > 100) {
      return { valid: false, error: 'El nombre no puede exceder 100 caracteres.' };
    }

    if (!producto.descripcion || producto.descripcion.trim() === '') {
      return { valid: false, error: 'La descripción del producto es obligatoria.' };
    }

    if (producto.precio === undefined || isNaN(Number(producto.precio)) || Number(producto.precio) <= 0) {
      return { valid: false, error: 'El precio debe ser un número mayor a 0.' };
    }

    if (producto.stock === undefined || isNaN(Number(producto.stock)) || Number(producto.stock) < 0 || !Number.isInteger(Number(producto.stock))) {
      return { valid: false, error: 'El stock debe ser un número entero mayor o igual a 0.' };
    }

    if (!producto.id_categoria || Number(producto.id_categoria) <= 0) {
      return { valid: false, error: 'Debe seleccionar una categoría válida.' };
    }

    return { valid: true };
  }

  static validarStock(stock: number): { valid: boolean; error?: string } {
    if (isNaN(stock) || stock < 0 || !Number.isInteger(stock)) {
      return { valid: false, error: 'El stock debe ser un número entero mayor o igual a 0.' };
    }
    return { valid: true };
  }
}
