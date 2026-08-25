import { Request, Response } from 'express';
import { ProductoService } from '../services/ProductoService.js';

export class ProductoController {
  private productoService: ProductoService;

  constructor() {
    this.productoService = new ProductoService();
  }

  listarProductos = (req: Request, res: Response): void => {
    try {
      const { q, categoria } = req.query;
      const queryStr = typeof q === 'string' ? q.trim() : undefined;
      const catId = categoria ? Number(categoria) : undefined;

      const productos = this.productoService.consultarCatalogo({
        q: queryStr,
        categoria: catId
      });
      res.json(productos);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Error al listar productos' });
    }
  };

  listarAdmin = (req: Request, res: Response): void => {
    try {
      const productos = this.productoService.listarProductosAdmin();
      res.json(productos);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Error al listar productos de administración' });
    }
  };

  obtenerDetalle = (req: Request, res: Response): void => {
    try {
      const id = Number(req.params.id);
      const producto = this.productoService.obtenerPorId(id);
      if (!producto) {
        res.status(404).json({ error: 'Producto no encontrado' });
        return;
      }
      res.json(producto);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Error al obtener detalle del producto' });
    }
  };

  registrarProducto = (req: Request, res: Response): void => {
    try {
      const { nombre, descripcion, precio, stock, imagen, id_categoria } = req.body;
      const nuevo = this.productoService.registrarProducto({
        nombre,
        descripcion,
        precio: Number(precio),
        stock: Number(stock),
        imagen,
        estado: Number(stock) > 0 ? 'Activo' : 'Agotado',
        id_categoria: Number(id_categoria)
      });
      res.status(201).json(nuevo);
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Error al registrar producto' });
    }
  };

  actualizarProducto = (req: Request, res: Response): void => {
    try {
      const id = Number(req.params.id);
      const actualizado = this.productoService.actualizarProducto(id, req.body);
      res.json(actualizado);
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Error al actualizar producto' });
    }
  };

  actualizarStock = (req: Request, res: Response): void => {
    try {
      const id = Number(req.params.id);
      const { stock } = req.body;
      if (stock === undefined || Number(stock) < 0) {
        res.status(400).json({ error: 'El stock debe ser un número mayor o igual a 0' });
        return;
      }
      const ok = this.productoService.actualizarStock(id, Number(stock));
      if (!ok) {
        res.status(404).json({ error: 'Producto no encontrado' });
        return;
      }
      res.json({ message: 'Stock actualizado con éxito', id_producto: id, nuevoStock: Number(stock) });
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Error al actualizar stock' });
    }
  };

  desactivarProducto = (req: Request, res: Response): void => {
    try {
      const id = Number(req.params.id);
      const ok = this.productoService.desactivarProducto(id);
      if (!ok) {
        res.status(404).json({ error: 'Producto no encontrado' });
        return;
      }
      res.json({ message: 'Producto desactivado exitosamente (Soft-Delete)' });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Error al desactivar producto' });
    }
  };

  reactivarProducto = (req: Request, res: Response): void => {
    try {
      const id = Number(req.params.id);
      const ok = this.productoService.reactivarProducto(id);
      if (!ok) {
        res.status(404).json({ error: 'Producto no encontrado' });
        return;
      }
      res.json({ message: 'Producto reactivado exitosamente' });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Error al reactivar producto' });
    }
  };

  obtenerMetricas = (req: Request, res: Response): void => {
    try {
      const metricas = this.productoService.obtenerMetricas();
      res.json(metricas);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Error al obtener métricas' });
    }
  };
}
