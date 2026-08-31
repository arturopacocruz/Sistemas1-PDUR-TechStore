import { Router } from 'express';
import { ProductoController } from '../controllers/ProductoController.js';
import { CarritoController } from '../controllers/CarritoController.js';
import { PedidoController } from '../controllers/PedidoController.js';
import { CategoriaController } from '../controllers/CategoriaController.js';
import { UsuarioController } from '../controllers/UsuarioController.js';

const router = Router();

const productoController = new ProductoController();
const carritoController = new CarritoController();
const pedidoController = new PedidoController();
const categoriaController = new CategoriaController();
const usuarioController = new UsuarioController();

// HU-01 & HU-04: Productos
router.get('/productos', productoController.listarProductos);
router.get('/productos/admin', productoController.listarAdmin);
router.get('/productos/metricas', productoController.obtenerMetricas);
router.get('/productos/:id', productoController.obtenerDetalle);
router.post('/productos', productoController.registrarProducto);
router.put('/productos/:id', productoController.actualizarProducto);
router.patch('/productos/:id/stock', productoController.actualizarStock);
router.patch('/productos/:id/desactivar', productoController.desactivarProducto);
router.patch('/productos/:id/reactivar', productoController.reactivarProducto);

// Categorías
router.get('/categorias', categoriaController.listar);

// HU-02: Carrito
router.get('/carrito', carritoController.consultarCarrito);
router.post('/carrito/items', carritoController.agregarProducto);
router.put('/carrito/items', carritoController.modificarCantidad);
router.delete('/carrito/items/:idProducto', carritoController.eliminarProducto);
router.delete('/carrito/vaciar', carritoController.vaciarCarrito);

// HU-03: Pedidos
router.post('/pedidos/validar', pedidoController.validarDatosEntrega);
router.post('/pedidos/checkout', pedidoController.confirmarPedido);
router.get('/pedidos/admin', pedidoController.listarAdmin);
router.get('/pedidos/usuario/:idUsuario', pedidoController.listarPorUsuario);
router.get('/pedidos/numero/:numero', pedidoController.obtenerPorNumero);
router.get('/pedidos/:id', pedidoController.obtenerPorId);
router.patch('/pedidos/:id/estado', pedidoController.actualizarEstado);

// Usuarios y Autenticación
router.get('/usuarios', usuarioController.listar);
router.get('/usuarios/:id', usuarioController.obtenerPorId);
router.post('/auth/login', usuarioController.login);
router.post('/usuarios/login', usuarioController.login);

// Auditoría ASFI / Seguridad
import { AuditService } from '../services/AuditService.js';
router.get('/audit/logs', (req, res) => {
  try {
    const logs = AuditService.listar(100);
    res.json(logs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/audit/verificar/:idLog', (req, res) => {
  try {
    const id = Number(req.params.idLog);
    const esValido = AuditService.verificarIntegridad(id);
    res.json({ id_log: id, inalterado: esValido });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
