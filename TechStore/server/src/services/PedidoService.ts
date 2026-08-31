import { PedidoRepository } from '../repositories/PedidoRepository.js';
import { CarritoRepository } from '../repositories/CarritoRepository.js';
import { ProductoRepository } from '../repositories/ProductoRepository.js';
import { IPedidoRepository } from '../interfaces/IPedidoRepository.js';
import { ICarritoRepository } from '../interfaces/ICarritoRepository.js';
import { IProductoRepository } from '../interfaces/IProductoRepository.js';
import { PedidoValidator } from '../validators/PedidoValidator.js';
import { AuditService } from './AuditService.js';
import { CryptoUtil } from '../utils/crypto.js';
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

  confirmarPedido(
    idUsuario: number,
    datosEntrega: Omit<DireccionEntrega, 'id_direccion' | 'id_usuario'>,
    ipOrigen = '127.0.0.1',
    userAgent = 'TechStore-Client'
  ): Pedido {
    const validacion = PedidoValidator.validarDireccionEntrega(datosEntrega);
    if (!validacion.valido) {
      AuditService.registrar({
        id_usuario: idUsuario,
        ip_origen: ipOrigen,
        user_agent: userAgent,
        accion: 'ORDER_VALIDATION_FAILED',
        entidad_afectada: 'PEDIDO',
        detalles: { error: validacion.errores[0] }
      });
      throw new Error(validacion.errores[0]);
    }

    const carrito = this.carritoRepository.obtenerPorUsuario(idUsuario);
    if (!carrito.items || carrito.items.length === 0) {
      throw new Error('El carrito está vacío. Agregue productos antes de realizar el pedido.');
    }

    const stockCheck = this.verificarStockCarrito(carrito.items);
    if (!stockCheck.ok) {
      AuditService.registrar({
        id_usuario: idUsuario,
        ip_origen: ipOrigen,
        user_agent: userAgent,
        accion: 'ORDER_STOCK_REJECTED',
        entidad_afectada: 'PRODUCTO',
        detalles: { producto: stockCheck.producto, motivo: 'Stock insuficiente al checkout' }
      });
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
      datosEntrega.telefono.trim(),
      datosEntrega.nit_ci,
      datosEntrega.razon_social
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
      itemsParaGuardar,
      datosEntrega.nit_ci,
      datosEntrega.razon_social
    );

    this.carritoRepository.actualizarEstado(carrito.id_carrito, 'Confirmado');

    // Registro Inmutable en Logs de Auditoría (Normativa ASFI)
    AuditService.registrar({
      id_usuario: idUsuario,
      ip_origen: ipOrigen,
      user_agent: userAgent,
      accion: 'ORDER_CREATED',
      entidad_afectada: 'PEDIDO',
      id_entidad: nuevoPedido.numero_pedido,
      detalles: {
        numero_pedido: nuevoPedido.numero_pedido,
        total: nuevoPedido.total,
        articulos_count: itemsParaGuardar.length,
        hash_integridad: nuevoPedido.hash_integridad,
        receptor_mask: CryptoUtil.maskPhone(datosEntrega.telefono),
        facturacion: datosEntrega.nit_ci ? { nit: datosEntrega.nit_ci, razon: datosEntrega.razon_social } : 'Sin factura'
      }
    });

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

  actualizarEstadoPedido(idPedido: number, estado: string, idAdmin = 3, ipOrigen = '127.0.0.1'): boolean {
    if (!PedidoValidator.validarEstado(estado)) {
      throw new Error(`Estado inválido: "${estado}". Valores permitidos: ${PedidoValidator.getEstadosPermitidos().join(', ')}.`);
    }
    const pedido = this.pedidoRepository.buscarPorId(idPedido);
    const ok = this.pedidoRepository.actualizarEstado(idPedido, estado as EstadoPedido);

    if (ok) {
      AuditService.registrar({
        id_usuario: idAdmin,
        ip_origen: ipOrigen,
        accion: 'ORDER_STATUS_CHANGED',
        entidad_afectada: 'PEDIDO',
        id_entidad: pedido ? pedido.numero_pedido : String(idPedido),
        detalles: {
          estado_anterior: pedido?.estado,
          nuevo_estado: estado
        }
      });
    }
    return ok;
  }
}
