import { DireccionEntrega, EstadoPedido } from '../models/types.js';

export class PedidoValidator {
  private static readonly ESTADOS_VALIDOS: EstadoPedido[] = ['Pendiente', 'Confirmado', 'Preparando', 'Entregado', 'Rechazado'];

  /**
   * Valida los datos obligatorios de la dirección de entrega según DD §4.6
   */
  static validarDireccionEntrega(datos: Omit<DireccionEntrega, 'id_direccion' | 'id_usuario'>): { valido: boolean; errores: string[] } {
    const errores: string[] = [];

    if (!datos.nombre_receptor || datos.nombre_receptor.trim() === '') {
      errores.push('El nombre del receptor es obligatorio.');
    } else if (datos.nombre_receptor.trim().length > 100) {
      errores.push('El nombre del receptor no puede superar 100 caracteres.');
    }

    if (!datos.direccion || datos.direccion.trim() === '') {
      errores.push('La dirección física de entrega es obligatoria.');
    } else if (datos.direccion.trim().length > 255) {
      errores.push('La dirección no puede superar 255 caracteres.');
    }

    if (!datos.ciudad || datos.ciudad.trim() === '') {
      errores.push('La ciudad de entrega es obligatoria.');
    } else if (datos.ciudad.trim().length > 100) {
      errores.push('La ciudad no puede superar 100 caracteres.');
    }

    if (!datos.telefono || datos.telefono.trim() === '') {
      errores.push('El teléfono de contacto es obligatorio.');
    } else if (datos.telefono.trim().length > 20) {
      errores.push('El teléfono no puede superar 20 caracteres.');
    }

    return { valido: errores.length === 0, errores };
  }

  static validarEstado(estado: string): boolean {
    return this.ESTADOS_VALIDOS.includes(estado as EstadoPedido);
  }

  static getEstadosPermitidos(): EstadoPedido[] {
    return [...this.ESTADOS_VALIDOS];
  }
}
