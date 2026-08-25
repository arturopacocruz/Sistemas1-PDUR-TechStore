import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const isSupabaseConfigured = Boolean(
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
);

// Supabase Client instance
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});

// Database helper queries for the 8 entities
export const dbService = {
  // 1. Productos
  async getProductos(categoriaId?: number, search?: string) {
    let query = supabase
      .from('producto')
      .select('*, categoria:categoria(nombre)')
      .neq('estado', 'Inactivo');

    if (categoriaId) {
      query = query.eq('id_categoria', categoriaId);
    }
    if (search) {
      query = query.ilike('nombre', `%${search}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getProductoById(id: number) {
    const { data, error } = await supabase
      .from('producto')
      .select('*, categoria:categoria(nombre)')
      .eq('id_producto', id)
      .single();

    if (error) throw error;
    return data;
  },

  // 2. Categorías
  async getCategorias() {
    const { data, error } = await supabase
      .from('categoria')
      .select('*')
      .eq('estado', 'Activa')
      .order('id_categoria', { ascending: true });

    if (error) throw error;
    return data;
  },

  // 3. Carrito e Items
  async getCarritoByUsuario(idUsuario: number) {
    const { data, error } = await supabase
      .from('carrito')
      .select('*, items:item_carrito(*, producto:producto(*))')
      .eq('id_usuario', idUsuario)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  // 4. Pedidos
  async getPedidosByUsuario(idUsuario: number) {
    const { data, error } = await supabase
      .from('pedido')
      .select('*, detalles:detalle_pedido(*, producto:producto(nombre)), direccion:direccion_entrega(*)')
      .eq('id_usuario', idUsuario)
      .order('id_pedido', { ascending: false });

    if (error) throw error;
    return data;
  }
};
