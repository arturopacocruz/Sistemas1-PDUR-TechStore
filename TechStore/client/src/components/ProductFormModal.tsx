import React, { useState, useEffect } from 'react';
import type { Producto, Categoria } from '../types';
import { api } from '../services/api';
import { X, Save, AlertCircle, PackagePlus, DollarSign, Layers, Image, FileText } from 'lucide-react';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  productoParaEditar?: Producto | null;
  categorias: Categoria[];
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  productoParaEditar,
  categorias
}) => {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState<string>('');
  const [stock, setStock] = useState<string>('');
  const [imagen, setImagen] = useState('');
  const [idCategoria, setIdCategoria] = useState<number>(1);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (productoParaEditar) {
      setNombre(productoParaEditar.nombre);
      setDescripcion(productoParaEditar.descripcion || '');
      setPrecio(String(productoParaEditar.precio));
      setStock(String(productoParaEditar.stock));
      setImagen(productoParaEditar.imagen || '');
      setIdCategoria(productoParaEditar.id_categoria);
    } else {
      setNombre('');
      setDescripcion('');
      setPrecio('');
      setStock('0');
      setImagen('');
      setIdCategoria(categorias[0]?.id_categoria || 1);
    }
    setError(null);
  }, [productoParaEditar, isOpen, categorias]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numPrecio = Number(precio);
    const numStock = Number(stock);

    if (!nombre.trim()) {
      setError('El nombre del producto es obligatorio.');
      return;
    }
    if (nombre.trim().length > 100) {
      setError('El nombre no puede exceder 100 caracteres.');
      return;
    }
    if (!descripcion.trim()) {
      setError('La descripción del producto es obligatoria.');
      return;
    }
    if (isNaN(numPrecio) || numPrecio <= 0) {
      setError('El precio debe ser un número mayor a 0.');
      return;
    }
    if (isNaN(numStock) || numStock < 0 || !Number.isInteger(numStock)) {
      setError('El stock debe ser un número entero mayor o igual a 0.');
      return;
    }
    if (!idCategoria) {
      setError('Seleccione una categoría válida.');
      return;
    }

    try {
      setGuardando(true);
      setError(null);

      if (productoParaEditar) {
        await api.actualizarProducto(productoParaEditar.id_producto, {
          nombre: nombre.trim(),
          descripcion: descripcion.trim(),
          precio: numPrecio,
          stock: numStock,
          imagen: imagen.trim() || null,
          id_categoria: idCategoria
        });
      } else {
        await api.crearProducto({
          nombre: nombre.trim(),
          descripcion: descripcion.trim(),
          precio: numPrecio,
          stock: numStock,
          imagen: imagen.trim() || null,
          estado: numStock > 0 ? 'Activo' : 'Agotado',
          id_categoria: idCategoria
        });
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al guardar el producto.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '580px' }}>
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md">
              <PackagePlus size={20} />
            </div>
            <div>
              <span className="badge badge-warning mb-1">HU-04</span>
              <h2 className="text-xl font-bold text-white font-heading">
                {productoParaEditar ? 'Editar Producto' : 'Registrar Nuevo Producto'}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Cerrar"
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="flex items-start gap-2.5 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl p-3.5 mb-6 text-xs">
            <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="input-group">
            <label className="input-label flex items-center gap-1.5">
              <span>Nombre comercial del producto *</span>
            </label>
            <input
              type="text"
              maxLength={100}
              required
              placeholder="Ej. Teclado Mecánico RGB"
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              className="input-field"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="input-group">
              <label className="input-label flex items-center gap-1.5">
                <DollarSign size={13} className="text-cyan-400" />
                <span>Precio (Bs.) *</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="Ej. 450.00"
                value={precio}
                onChange={e => setPrecio(e.target.value)}
                className="input-field"
              />
            </div>

            <div className="input-group">
              <label className="input-label flex items-center gap-1.5">
                <Layers size={13} className="text-cyan-400" />
                <span>Stock inicial *</span>
              </label>
              <input
                type="number"
                min="0"
                step="1"
                required
                placeholder="Ej. 15"
                value={stock}
                onChange={e => setStock(e.target.value)}
                className="input-field"
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label flex items-center gap-1.5">
              <Layers size={13} className="text-cyan-400" />
              <span>Categoría *</span>
            </label>
            <select
              value={idCategoria}
              onChange={e => setIdCategoria(Number(e.target.value))}
              className="select-field"
            >
              {categorias.map(cat => (
                <option key={cat.id_categoria} value={cat.id_categoria}>
                  {cat.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="input-group">
            <label className="input-label flex items-center gap-1.5">
              <Image size={13} className="text-cyan-400" />
              <span>URL de Imagen (Opcional)</span>
            </label>
            <input
              type="url"
              placeholder="https://images.unsplash.com/..."
              value={imagen}
              onChange={e => setImagen(e.target.value)}
              className="input-field"
            />
          </div>

          <div className="input-group">
            <label className="input-label flex items-center gap-1.5">
              <FileText size={13} className="text-cyan-400" />
              <span>Descripción detallada *</span>
            </label>
            <textarea
              required
              placeholder="Especificaciones técnicas, características y compatibilidad..."
              value={descripcion}
              onChange={e => setDescripcion(e.target.value)}
              className="textarea-field"
              rows={3}
            />
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-white/10">
            <button type="button" onClick={onClose} className="btn btn-secondary" disabled={guardando}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={guardando}>
              <Save size={16} />
              <span>{guardando ? 'Guardando...' : productoParaEditar ? 'Guardar Cambios' : 'Registrar Producto'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
