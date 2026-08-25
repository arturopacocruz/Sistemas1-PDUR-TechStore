import { Carrito, ItemCarrito, EstadoCarrito } from '../models/types.js';

export interface ICarritoRepository {
  obtenerCarrito(idCarrito: number): Carrito | undefined;
  obtenerPorUsuario(idUsuario: number): Carrito;
  obtenerItems(idCarrito: number): ItemCarrito[];
  agregarOActualizarItem(idCarrito: number, idProducto: number, cantidad: number, precioUnitario: number): void;
  modificarCantidad(idCarrito: number, idProducto: number, nuevaCantidad: number, precioUnitario: number): void;
  eliminarProducto(idCarrito: number, idProducto: number): void;
  vaciar(idCarrito: number): void;
  actualizarEstado(idCarrito: number, estado: EstadoCarrito): void;
}
