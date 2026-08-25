import type { Producto, Categoria, Carrito, Pedido, MetricasAdmin, Usuario, DireccionEntrega } from '../types';

const API_BASE = '/api';

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Error en la petición al servidor');
  }
  return data as T;
}

export const api = {
  // Productos (HU-01 & HU-04)
  async getProductos(params?: { q?: string; categoria?: number }): Promise<Producto[]> {
    const query = new URLSearchParams();
    if (params?.q) query.append('q', params.q);
    if (params?.categoria) query.append('categoria', String(params.categoria));
    const url = `${API_BASE}/productos${query.toString() ? '?' + query.toString() : ''}`;
    const res = await fetch(url);
    return handleResponse<Producto[]>(res);
  },

  async getProductosAdmin(): Promise<Producto[]> {
    const res = await fetch(`${API_BASE}/productos/admin`);
    return handleResponse<Producto[]>(res);
  },

  async getProductoDetalle(id: number): Promise<Producto> {
    const res = await fetch(`${API_BASE}/productos/${id}`);
    return handleResponse<Producto>(res);
  },

  async getMetricas(): Promise<MetricasAdmin> {
    const res = await fetch(`${API_BASE}/productos/metricas`);
    return handleResponse<MetricasAdmin>(res);
  },

  async crearProducto(producto: Omit<Producto, 'id_producto' | 'fecha_creacion' | 'fecha_actualizacion' | 'categoria_nombre'>): Promise<Producto> {
    const res = await fetch(`${API_BASE}/productos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(producto)
    });
    return handleResponse<Producto>(res);
  },

  async actualizarProducto(id: number, datos: Partial<Producto>): Promise<Producto> {
    const res = await fetch(`${API_BASE}/productos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos)
    });
    return handleResponse<Producto>(res);
  },

  async actualizarStock(id: number, stock: number): Promise<{ message: string; id_producto: number; nuevoStock: number }> {
    const res = await fetch(`${API_BASE}/productos/${id}/stock`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stock })
    });
    return handleResponse<{ message: string; id_producto: number; nuevoStock: number }>(res);
  },

  async desactivarProducto(id: number): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/productos/${id}/desactivar`, {
      method: 'PATCH'
    });
    return handleResponse<{ message: string }>(res);
  },

  async reactivarProducto(id: number): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/productos/${id}/reactivar`, {
      method: 'PATCH'
    });
    return handleResponse<{ message: string }>(res);
  },

  // Categorías
  async getCategorias(): Promise<Categoria[]> {
    const res = await fetch(`${API_BASE}/categorias`);
    return handleResponse<Categoria[]>(res);
  },

  // Carrito (HU-02)
  async getCarrito(idUsuario: number = 1): Promise<Carrito> {
    const res = await fetch(`${API_BASE}/carrito?idUsuario=${idUsuario}`);
    return handleResponse<Carrito>(res);
  },

  async agregarAlCarrito(idProducto: number, cantidad: number, idUsuario: number = 1): Promise<{ message: string; carrito: Carrito }> {
    const res = await fetch(`${API_BASE}/carrito/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_producto: idProducto, cantidad, id_usuario: idUsuario })
    });
    return handleResponse<{ message: string; carrito: Carrito }>(res);
  },

  async modificarCantidadCarrito(idProducto: number, cantidad: number, idUsuario: number = 1): Promise<{ message: string; carrito: Carrito }> {
    const res = await fetch(`${API_BASE}/carrito/items`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_producto: idProducto, cantidad, id_usuario: idUsuario })
    });
    return handleResponse<{ message: string; carrito: Carrito }>(res);
  },

  async eliminarDelCarrito(idProducto: number, idUsuario: number = 1): Promise<{ message: string; carrito: Carrito }> {
    const res = await fetch(`${API_BASE}/carrito/items/${idProducto}?idUsuario=${idUsuario}`, {
      method: 'DELETE'
    });
    return handleResponse<{ message: string; carrito: Carrito }>(res);
  },

  async vaciarCarrito(idUsuario: number = 1): Promise<{ message: string; carrito: Carrito }> {
    const res = await fetch(`${API_BASE}/carrito/vaciar?idUsuario=${idUsuario}`, {
      method: 'DELETE'
    });
    return handleResponse<{ message: string; carrito: Carrito }>(res);
  },

  // Pedidos (HU-03)
  async checkout(idUsuario: number, datosEntrega: DireccionEntrega): Promise<{ message: string; pedido: Pedido }> {
    const res = await fetch(`${API_BASE}/pedidos/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_usuario: idUsuario,
        nombre_receptor: datosEntrega.nombre_receptor,
        direccion: datosEntrega.direccion,
        ciudad: datosEntrega.ciudad,
        telefono: datosEntrega.telefono
      })
    });
    return handleResponse<{ message: string; pedido: Pedido }>(res);
  },

  async getPedidosAdmin(): Promise<Pedido[]> {
    const res = await fetch(`${API_BASE}/pedidos/admin`);
    return handleResponse<Pedido[]>(res);
  },

  async getPedidosUsuario(idUsuario: number): Promise<Pedido[]> {
    const res = await fetch(`${API_BASE}/pedidos/usuario/${idUsuario}`);
    return handleResponse<Pedido[]>(res);
  },

  // Usuarios
  async getUsuarios(): Promise<Usuario[]> {
    const res = await fetch(`${API_BASE}/usuarios`);
    return handleResponse<Usuario[]>(res);
  }
};
