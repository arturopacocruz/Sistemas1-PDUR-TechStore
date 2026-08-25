export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      usuario: {
        Row: {
          id_usuario: number
          nombre: string
          email: string
          telefono: string | null
          rol: 'CLIENTE' | 'ADMINISTRADOR'
          fecha_registro: string
        }
        Insert: {
          id_usuario?: number
          nombre: string
          email: string
          telefono?: string | null
          rol?: 'CLIENTE' | 'ADMINISTRADOR'
          fecha_registro?: string
        }
        Update: {
          id_usuario?: number
          nombre?: string
          email?: string
          telefono?: string | null
          rol?: 'CLIENTE' | 'ADMINISTRADOR'
          fecha_registro?: string
        }
      }
      categoria: {
        Row: {
          id_categoria: number
          nombre: string
          descripcion: string | null
          estado: 'Activa' | 'Inactiva'
        }
        Insert: {
          id_categoria?: number
          nombre: string
          descripcion?: string | null
          estado?: 'Activa' | 'Inactiva'
        }
        Update: {
          id_categoria?: number
          nombre?: string
          descripcion?: string | null
          estado?: 'Activa' | 'Inactiva'
        }
      }
      producto: {
        Row: {
          id_producto: number
          nombre: string
          descripcion: string | null
          precio: number
          stock: number
          imagen: string | null
          estado: 'Activo' | 'Agotado' | 'Inactivo'
          fecha_creacion: string
          fecha_actualizacion: string | null
          id_categoria: number
        }
        Insert: {
          id_producto?: number
          nombre: string
          descripcion?: string | null
          precio: number
          stock?: number
          imagen?: string | null
          estado?: 'Activo' | 'Agotado' | 'Inactivo'
          fecha_creacion?: string
          fecha_actualizacion?: string | null
          id_categoria: number
        }
        Update: {
          id_producto?: number
          nombre?: string
          descripcion?: string | null
          precio?: number
          stock?: number
          imagen?: string | null
          estado?: 'Activo' | 'Agotado' | 'Inactivo'
          fecha_creacion?: string
          fecha_actualizacion?: string | null
          id_categoria?: number
        }
      }
      carrito: {
        Row: {
          id_carrito: number
          id_usuario: number
          fecha_creacion: string
          estado: 'Vacio' | 'Con Productos' | 'Confirmado'
        }
        Insert: {
          id_carrito?: number
          id_usuario: number
          fecha_creacion?: string
          estado?: 'Vacio' | 'Con Productos' | 'Confirmado'
        }
        Update: {
          id_carrito?: number
          id_usuario?: number
          fecha_creacion?: string
          estado?: 'Vacio' | 'Con Productos' | 'Confirmado'
        }
      }
      item_carrito: {
        Row: {
          id_item: number
          id_carrito: number
          id_producto: number
          cantidad: number
          precio_unitario: number
          subtotal: number
        }
        Insert: {
          id_item?: number
          id_carrito: number
          id_producto: number
          cantidad: number
          precio_unitario: number
          subtotal: number
        }
        Update: {
          id_item?: number
          id_carrito?: number
          id_producto?: number
          cantidad?: number
          precio_unitario?: number
          subtotal?: number
        }
      }
      direccion_entrega: {
        Row: {
          id_direccion: number
          id_usuario: number
          nombre_receptor: string
          direccion: string
          ciudad: string
          telefono: string
        }
        Insert: {
          id_direccion?: number
          id_usuario: number
          nombre_receptor: string
          direccion: string
          ciudad: string
          telefono: string
        }
        Update: {
          id_direccion?: number
          id_usuario?: number
          nombre_receptor?: string
          direccion?: string
          ciudad?: string
          telefono?: string
        }
      }
      pedido: {
        Row: {
          id_pedido: number
          numero_pedido: string
          id_usuario: number
          id_direccion: number
          fecha: string
          estado: 'Pendiente' | 'Confirmado' | 'Preparando' | 'Entregado' | 'Rechazado'
          total: number
        }
        Insert: {
          id_pedido?: number
          numero_pedido: string
          id_usuario: number
          id_direccion: number
          fecha?: string
          estado?: 'Pendiente' | 'Confirmado' | 'Preparando' | 'Entregado' | 'Rechazado'
          total?: number
        }
        Update: {
          id_pedido?: number
          numero_pedido?: string
          id_usuario?: number
          id_direccion?: number
          fecha?: string
          estado?: 'Pendiente' | 'Confirmado' | 'Preparando' | 'Entregado' | 'Rechazado'
          total?: number
        }
      }
      detalle_pedido: {
        Row: {
          id_detalle: number
          id_pedido: number
          id_producto: number
          cantidad: number
          precio_unitario: number
          subtotal: number
        }
        Insert: {
          id_detalle?: number
          id_pedido: number
          id_producto: number
          cantidad: number
          precio_unitario: number
          subtotal: number
        }
        Update: {
          id_detalle?: number
          id_pedido?: number
          id_producto?: number
          cantidad?: number
          precio_unitario?: number
          subtotal?: number
        }
      }
    }
  }
}
