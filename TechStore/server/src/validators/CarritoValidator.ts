import { Producto } from '../models/types.js';

export class CarritoValidator {
  /**
   * Valida cantidad y disponibilidad de stock para operaciones del carrito (SRP)
   */
  static validarDisponibilidad(producto: Producto | undefined, cantidadSolicitada: number): { valido: boolean; mensaje?: string } {
    if (!producto) {
      return { valido: false, mensaje: 'El producto no existe.' };
    }

    if (producto.estado === 'Inactivo') {
      return { valido: false, mensaje: 'Producto no disponible' };
    }

    if (producto.stock === 0 || producto.estado === 'Agotado') {
      return { valido: false, mensaje: 'Producto agotado' };
    }

    if (!Number.isInteger(cantidadSolicitada) || cantidadSolicitada <= 0) {
      return { valido: false, mensaje: 'La cantidad debe ser mayor a 0.' };
    }

    if (cantidadSolicitada > producto.stock) {
      return { valido: false, mensaje: 'Cantidad no disponible' };
    }

    return { valido: true };
  }
}
