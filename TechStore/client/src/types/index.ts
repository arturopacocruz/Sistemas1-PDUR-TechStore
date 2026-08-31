export type RolUsuario = 'CLIENTE' | 'ADMINISTRADOR';
export type EstadoUsuario = 'Activo' | 'Inactivo';

export interface Usuario {
  id_usuario: number;
  nombre: string;
  email: string;
  telefono?: string | null;
  rol: RolUsuario;
  estado?: EstadoUsuario;
  fecha_registro: string;
}

export type EstadoCategoria = 'Activa' | 'Inactiva';

export interface Categoria {
  id_categoria: number;
  nombre: string;
  descripcion?: string | null;
  estado: EstadoCategoria;
}

export type EstadoProducto = 'Activo' | 'Agotado' | 'Inactivo';

export interface Producto {
  id_producto: number;
  nombre: string;
  descripcion?: string | null;
  precio: number;
  stock: number;
  imagen?: string | null;
  estado: EstadoProducto;
  fecha_creacion: string;
  fecha_actualizacion?: string | null;
  id_categoria: number;
  categoria_nombre?: string;
}

export type EstadoCarrito = 'Vacio' | 'Con Productos' | 'Confirmado';

export interface ItemCarrito {
  id_item: number;
  id_carrito: number;
  id_producto: number;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  producto?: Producto;
}

export interface Carrito {
  id_carrito: number;
  id_usuario: number;
  fecha_creacion: string;
  estado: EstadoCarrito;
  items: ItemCarrito[];
  total: number;
}

export interface DireccionEntrega {
  id_direccion?: number;
  id_usuario?: number;
  nombre_receptor: string;
  direccion: string;
  ciudad: string;
  telefono: string;
  nit_ci?: string | null;
  razon_social?: string | null;
}

export type EstadoPedido = 'Pendiente' | 'Confirmado' | 'Preparando' | 'Entregado' | 'Rechazado';

export interface DetallePedido {
  id_detalle: number;
  id_pedido: number;
  id_producto: number;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  producto_nombre?: string;
}

export interface Pedido {
  id_pedido: number;
  numero_pedido: string;
  id_usuario: number;
  id_direccion: number;
  fecha: string;
  estado: EstadoPedido;
  total: number;
  hash_integridad?: string;
  nit_ci?: string | null;
  razon_social?: string | null;
  cliente_nombre?: string;
  cliente_email?: string;
  direccion?: DireccionEntrega;
  detalles?: DetallePedido[];
}

export interface MetricasAdmin {
  totalProductos: number;
  activos: number;
  agotados: number;
  inactivos: number;
  totalStock: number;
  bajoStock: Producto[];
}

export interface LogAuditoria {
  id_log: number;
  id_usuario?: number | null;
  ip_origen: string;
  user_agent?: string | null;
  accion: string;
  entidad_afectada: string;
  id_entidad?: string | null;
  detalles?: any;
  hash_integridad: string;
  fecha_utc: string;
  usuario_nombre?: string;
}
