import { PedidoRepository } from '../repositories/PedidoRepository.js';
import { CarritoRepository } from '../repositories/CarritoRepository.js';
import { ProductoRepository } from '../repositories/ProductoRepository.js';
import { IPedidoRepository } from '../interfaces/IPedidoRepository.js';
import { ICarritoRepository } from '../interfaces/ICarritoRepository.js';
import { IProductoRepository } from '../interfaces/IProductoRepository.js';
import { PedidoValidator } from '../validators/PedidoValidator.js';
import { Pedido, DireccionEntrega, EstadoPedido } from '../models/types.js';

export class PedidoService {
  private pedidoRepository: IPedidoRepository;
  private carritoRepository: ICarritoRepository;
  private productoRepository: IProductoRepository;

  // Inyección de Dependencias (DIP)
  constructor(
    pedidoRepository: IPedidoRepository = new PedidoRepository(),
    carritoRepository: ICarritoRepository = new CarritoRepository(),
    productoRepository: IProductoRepository = new ProductoRepository()
  ) {
    this.pedidoRepository = pedidoRepository;
    this.carritoRepository = carritoRepository;
    this.productoRepository = productoRepository;
  }

  validarDatosEntrega(datos: Omit<DireccionEntrega, 'id_direccion' | 'id_usuario'>): { valido: boolean; errores: string[] } {
    return PedidoValidator.validarDireccionEntrega(datos);
  }

  verificarStockCarrito(items: { id_producto: number; cantidad: number; producto?: { nombre?: string } }[]): { ok: boolean; producto?: string } {
    for (const item of items) {
      const stockActual = this.productoRepository.consultarStock(item.id_producto);
      if (stockActual < item.cantidad) {
        const nombre = item.producto?.nombre || `Producto #${item.id_producto}`;
        return { ok: false, producto: nombre };
      }
    }
    return { ok: true };
  }

  confirmarPedido(idUsuario: number, datosEntrega: Omit<DireccionEntrega, 'id_direccion' | 'id_usuario'>): Pedido {
    const validacion = PedidoValidator.validarDireccionEntrega(datosEntrega);
    if (!validacion.valido) {
      throw new Error(validacion.errores[0]);
    }

    const carrito = this.carritoRepository.obtenerPorUsuario(idUsuario);
    if (!carrito.items || carrito.items.length === 0) {
      throw new Error('El carrito está vacío. Agregue productos antes de realizar el pedido.');
    }

    const stockCheck = this.verificarStockCarrito(carrito.items);
    if (!stockCheck.ok) {
      throw new Error(`Producto sin stock: "${stockCheck.producto}"`);
    }

    const total = Math.round(
      carrito.items.reduce((sum, it) => sum + it.precio_unitario * it.cantidad, 0) * 100
    ) / 100;

    const direccion = this.pedidoRepository.guardarDireccion(
      idUsuario,
      datosEntrega.nombre_receptor.trim(),
      datosEntrega.direccion.trim(),
      datosEntrega.ciudad.trim(),
      datosEntrega.telefono.trim()
    );

    const numeroPedido = this.pedidoRepository.generarNumeroPedido();

    const itemsParaGuardar = carrito.items.map(it => ({
      id_producto: it.id_producto,
      cantidad: it.cantidad,
      precio_unitario: Number(it.precio_unitario.toFixed(2)),
      subtotal: Math.round(it.precio_unitario * it.cantidad * 100) / 100
    }));

    const nuevoPedido = this.pedidoRepository.guardar(
      idUsuario,
      direccion.id_direccion!,
      numeroPedido,
      total,
      itemsParaGuardar
    );

    this.carritoRepository.actualizarEstado(carrito.id_carrito, 'Confirmado');

    return nuevoPedido;
  }

  obtenerPedidoPorId(idPedido: number): Pedido | undefined {
    return this.pedidoRepository.buscarPorId(idPedido);
  }

  obtenerPedidoPorNumero(numeroPedido: string): Pedido | undefined {
    return this.pedidoRepository.buscarPorNumero(numeroPedido);
  }

  listarPedidosAdmin(): Pedido[] {
    return this.pedidoRepository.listarPedidos();
  }

  listarPedidosCliente(idUsuario: number): Pedido[] {
    return this.pedidoRepository.listarPorUsuario(idUsuario);
  }

  actualizarEstadoPedido(idPedido: number, estado: string): boolean {
    if (!PedidoValidator.validarEstado(estado)) {
      throw new Error(`Estado inválido: "${estado}". Valores permitidos: ${PedidoValidator.getEstadosPermitidos().join(', ')}.`);
    }
    return this.pedidoRepository.actualizarEstado(idPedido, estado as EstadoPedido);
  }
}
