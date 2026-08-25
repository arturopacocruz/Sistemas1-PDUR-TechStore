import { Pedido, DetallePedido, DireccionEntrega, EstadoPedido } from '../models/types.js';

export interface IPedidoRepository {
  generarNumeroPedido(): string;
  guardarDireccion(idUsuario: number, nombreReceptor: string, direccion: string, ciudad: string, telefono: string): DireccionEntrega;
  obtenerDireccionPorId(idDireccion: number): DireccionEntrega | undefined;
  obtenerDireccionesPorUsuario(idUsuario: number): DireccionEntrega[];
  guardar(idUsuario: number, idDireccion: number, numeroPedido: string, total: number, items: { id_producto: number; cantidad: number; precio_unitario: number; subtotal: number }[]): Pedido;
  buscarPorId(idPedido: number): Pedido | undefined;
  buscarPorNumero(numeroPedido: string): Pedido | undefined;
  obtenerDetalles(idPedido: number): DetallePedido[];
  listarPedidos(): Pedido[];
  listarPorUsuario(idUsuario: number): Pedido[];
  actualizarEstado(idPedido: number, estado: EstadoPedido): boolean;
}
