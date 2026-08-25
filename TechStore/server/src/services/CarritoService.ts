import { CarritoRepository } from '../repositories/CarritoRepository.js';
import { ProductoRepository } from '../repositories/ProductoRepository.js';
import { ICarritoRepository } from '../interfaces/ICarritoRepository.js';
import { IProductoRepository } from '../interfaces/IProductoRepository.js';
import { CarritoValidator } from '../validators/CarritoValidator.js';
import { Carrito } from '../models/types.js';

export class CarritoService {
  private carritoRepository: ICarritoRepository;
  private productoRepository: IProductoRepository;

  // Inyección de Dependencias (DIP)
  constructor(
    carritoRepository: ICarritoRepository = new CarritoRepository(),
    productoRepository: IProductoRepository = new ProductoRepository()
  ) {
    this.carritoRepository = carritoRepository;
    this.productoRepository = productoRepository;
  }

  obtenerCarrito(idUsuario: number): Carrito {
    return this.carritoRepository.obtenerPorUsuario(idUsuario);
  }

  validarStock(idProducto: number, cantidadSolicitada: number): { valido: boolean; stockActual: number; mensaje?: string } {
    const producto = this.productoRepository.findById(idProducto);
    const validacion = CarritoValidator.validarDisponibilidad(producto, cantidadSolicitada);
    return {
      valido: validacion.valido,
      stockActual: producto?.stock || 0,
      mensaje: validacion.mensaje
    };
  }

  agregarProducto(idUsuario: number, idProducto: number, cantidad: number): Carrito {
    if (!cantidad || cantidad <= 0) {
      throw new Error('La cantidad debe ser mayor a 0.');
    }

    const producto = this.productoRepository.findById(idProducto);
    if (!producto) {
      throw new Error('Producto no encontrado.');
    }

    const carrito = this.carritoRepository.obtenerPorUsuario(idUsuario);
    const itemExistente = carrito.items?.find(it => it.id_producto === idProducto);
    const cantidadTotal = (itemExistente ? itemExistente.cantidad : 0) + cantidad;

    const validacion = this.validarStock(idProducto, cantidadTotal);
    if (!validacion.valido) {
      throw new Error(validacion.mensaje);
    }

    this.carritoRepository.agregarOActualizarItem(
      carrito.id_carrito,
      idProducto,
      cantidad,
      Number(producto.precio.toFixed(2))
    );
    return this.carritoRepository.obtenerPorUsuario(idUsuario);
  }

  modificarCantidad(idUsuario: number, idProducto: number, nuevaCantidad: number): Carrito {
    const carrito = this.carritoRepository.obtenerPorUsuario(idUsuario);

    if (nuevaCantidad <= 0) {
      this.carritoRepository.eliminarProducto(carrito.id_carrito, idProducto);
      return this.carritoRepository.obtenerPorUsuario(idUsuario);
    }

    const validacion = this.validarStock(idProducto, nuevaCantidad);
    if (!validacion.valido) {
      throw new Error(validacion.mensaje);
    }

    const producto = this.productoRepository.findById(idProducto)!;
    this.carritoRepository.modificarCantidad(
      carrito.id_carrito,
      idProducto,
      nuevaCantidad,
      Number(producto.precio.toFixed(2))
    );
    return this.carritoRepository.obtenerPorUsuario(idUsuario);
  }

  eliminarProducto(idUsuario: number, idProducto: number): Carrito {
    const carrito = this.carritoRepository.obtenerPorUsuario(idUsuario);
    this.carritoRepository.eliminarProducto(carrito.id_carrito, idProducto);
    return this.carritoRepository.obtenerPorUsuario(idUsuario);
  }

  vaciar(idUsuario: number): Carrito {
    const carrito = this.carritoRepository.obtenerPorUsuario(idUsuario);
    this.carritoRepository.vaciar(carrito.id_carrito);
    return this.carritoRepository.obtenerPorUsuario(idUsuario);
  }
}
