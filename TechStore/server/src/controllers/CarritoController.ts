import { Request, Response } from 'express';
import { CarritoService } from '../services/CarritoService.js';

export class CarritoController {
  private carritoService: CarritoService;

  constructor() {
    this.carritoService = new CarritoService();
  }

  consultarCarrito = (req: Request, res: Response): void => {
    try {
      const idUsuario = Number(req.query.idUsuario || 1); // Default to user 1 for MVP
      const carrito = this.carritoService.obtenerCarrito(idUsuario);
      res.json(carrito);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Error al consultar el carrito' });
    }
  };

  agregarProducto = (req: Request, res: Response): void => {
    try {
      const { id_producto, cantidad, id_usuario } = req.body;
      const idUsuario = Number(id_usuario || 1);
      const idProducto = Number(id_producto);
      const cant = Number(cantidad || 1);

      const carritoActualizado = this.carritoService.agregarProducto(idUsuario, idProducto, cant);
      res.json({
        message: 'Producto agregado al carrito con éxito',
        carrito: carritoActualizado
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Error al agregar producto al carrito' });
    }
  };

  modificarCantidad = (req: Request, res: Response): void => {
    try {
      const { id_producto, cantidad, id_usuario } = req.body;
      const idUsuario = Number(id_usuario || 1);
      const idProducto = Number(id_producto);
      const nuevaCantidad = Number(cantidad);

      const carritoActualizado = this.carritoService.modificarCantidad(idUsuario, idProducto, nuevaCantidad);
      res.json({
        message: 'Cantidad modificada con éxito',
        carrito: carritoActualizado
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Error al modificar cantidad' });
    }
  };

  eliminarProducto = (req: Request, res: Response): void => {
    try {
      const idProducto = Number(req.params.idProducto);
      const idUsuario = Number(req.query.idUsuario || 1);

      const carritoActualizado = this.carritoService.eliminarProducto(idUsuario, idProducto);
      res.json({
        message: 'Producto eliminado del carrito',
        carrito: carritoActualizado
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Error al eliminar producto' });
    }
  };

  vaciarCarrito = (req: Request, res: Response): void => {
    try {
      const idUsuario = Number(req.query.idUsuario || 1);
      const carritoActualizado = this.carritoService.vaciar(idUsuario);
      res.json({
        message: 'Carrito vaciado con éxito',
        carrito: carritoActualizado
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Error al vaciar el carrito' });
    }
  };
}
