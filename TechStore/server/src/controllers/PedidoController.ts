import { Request, Response } from 'express';
import { PedidoService } from '../services/PedidoService.js';

export class PedidoController {
  private pedidoService: PedidoService;

  constructor() {
    this.pedidoService = new PedidoService();
  }

  /**
   * HU-03: Endpoint de validación previa del formulario (UC4 - Validar datos de entrega)
   * Permite al frontend mostrar todos los errores del formulario antes del submit definitivo.
   */
  validarDatosEntrega = (req: Request, res: Response): void => {
    try {
      const { nombre_receptor, direccion, ciudad, telefono } = req.body;
      const resultado = this.pedidoService.validarDatosEntrega({ nombre_receptor, direccion, ciudad, telefono });
      if (!resultado.valido) {
        res.status(422).json({ valido: false, errores: resultado.errores });
        return;
      }
      res.json({ valido: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  /**
   * HU-03: Confirmar pedido (UC7 - Confirmar pedido / UC8 - Generar número)
   * Flujo: validar datos → verificar carrito → verificar stock → crear pedido
   */
  confirmarPedido = (req: Request, res: Response): void => {
    try {
      const { id_usuario, nombre_receptor, direccion, ciudad, telefono } = req.body;
      const idUsuario = Number(id_usuario || 1);

      const nuevoPedido = this.pedidoService.confirmarPedido(idUsuario, {
        nombre_receptor,
        direccion,
        ciudad,
        telefono
      });

      res.status(201).json({
        message: 'Pedido realizado con éxito',
        pedido: nuevoPedido
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Error al procesar el pedido' });
    }
  };

  obtenerPorId = (req: Request, res: Response): void => {
    try {
      const id = Number(req.params.id);
      const pedido = this.pedidoService.obtenerPedidoPorId(id);
      if (!pedido) {
        res.status(404).json({ error: 'Pedido no encontrado' });
        return;
      }
      res.json(pedido);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Error al obtener pedido' });
    }
  };

  obtenerPorNumero = (req: Request, res: Response): void => {
    try {
      const numero = String(req.params.numero);
      const pedido = this.pedidoService.obtenerPedidoPorNumero(numero);
      if (!pedido) {
        res.status(404).json({ error: 'Pedido no encontrado' });
        return;
      }
      res.json(pedido);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Error al obtener pedido' });
    }
  };

  listarAdmin = (req: Request, res: Response): void => {
    try {
      const pedidos = this.pedidoService.listarPedidosAdmin();
      res.json(pedidos);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Error al listar pedidos' });
    }
  };

  listarPorUsuario = (req: Request, res: Response): void => {
    try {
      const idUsuario = Number(req.params.idUsuario || 1);
      const pedidos = this.pedidoService.listarPedidosCliente(idUsuario);
      res.json(pedidos);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Error al listar pedidos de cliente' });
    }
  };

  actualizarEstado = (req: Request, res: Response): void => {
    try {
      const id = Number(req.params.id);
      const { estado } = req.body;
      const ok = this.pedidoService.actualizarEstadoPedido(id, estado);
      if (!ok) {
        res.status(404).json({ error: 'Pedido no encontrado' });
        return;
      }
      res.json({ message: 'Estado del pedido actualizado con éxito' });
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Error al actualizar estado del pedido' });
    }
  };
}
