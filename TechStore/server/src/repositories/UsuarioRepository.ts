import { db } from '../database/db.js';
import { Usuario, RolUsuario, EstadoUsuario } from '../models/types.js';

export class UsuarioRepository {
  listarUsuarios(): Usuario[] {
    const stmt = db.prepare('SELECT id_usuario, nombre, email, telefono, rol, estado, fecha_registro FROM usuario ORDER BY id_usuario ASC');
    return stmt.all() as Usuario[];
  }

  buscarPorId(idUsuario: number): Usuario | undefined {
    const stmt = db.prepare('SELECT * FROM usuario WHERE id_usuario = ?');
    return stmt.get(idUsuario) as Usuario | undefined;
  }

  buscarPorEmail(email: string): Usuario | undefined {
    const stmt = db.prepare('SELECT * FROM usuario WHERE LOWER(email) = LOWER(?)');
    return stmt.get(email.trim()) as Usuario | undefined;
  }

  crearUsuario(datos: { nombre: string; email: string; telefono?: string | null; password_hash?: string; rol?: RolUsuario; estado?: EstadoUsuario }): Usuario {
    const insertTransaction = db.transaction(() => {
      const stmt = db.prepare(`
        INSERT INTO usuario (nombre, email, telefono, password_hash, rol, estado)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      const info = stmt.run(
        datos.nombre.trim(),
        datos.email.trim().toLowerCase(),
        datos.telefono ? datos.telefono.trim() : null,
        datos.password_hash || '$2a$12$e8Yk1.K1K7w7oH1x3YFGe.a9GgN5W2WkSjC7zZ7a0P1Q9b8U5j9s6',
        datos.rol || 'CLIENTE',
        datos.estado || 'Activo'
      );
      const idUsuario = Number(info.lastInsertRowid);

      // Crear carrito asociado por defecto si no existe
      const cartStmt = db.prepare(`
        INSERT OR IGNORE INTO carrito (id_usuario, estado) VALUES (?, 'Vacio')
      `);
      cartStmt.run(idUsuario);

      return idUsuario;
    });

    const nuevoId = insertTransaction();
    return this.buscarPorId(nuevoId)!;
  }

  actualizarUsuario(idUsuario: number, datos: { nombre?: string; email?: string; telefono?: string | null; rol?: RolUsuario; estado?: EstadoUsuario; password_hash?: string }): Usuario | undefined {
    const existente = this.buscarPorId(idUsuario);
    if (!existente) return undefined;

    const nombre = datos.nombre !== undefined ? datos.nombre.trim() : existente.nombre;
    const email = datos.email !== undefined ? datos.email.trim().toLowerCase() : existente.email;
    const telefono = datos.telefono !== undefined ? (datos.telefono ? datos.telefono.trim() : null) : existente.telefono;
    const rol = datos.rol !== undefined ? datos.rol : existente.rol;
    const estado = datos.estado !== undefined ? datos.estado : (existente.estado || 'Activo');
    const passwordHash = datos.password_hash !== undefined ? datos.password_hash : existente.password_hash;

    const stmt = db.prepare(`
      UPDATE usuario
      SET nombre = ?, email = ?, telefono = ?, rol = ?, estado = ?, password_hash = ?
      WHERE id_usuario = ?
    `);
    stmt.run(nombre, email, telefono, rol, estado, passwordHash, idUsuario);

    return this.buscarPorId(idUsuario);
  }

  cambiarEstado(idUsuario: number, estado: EstadoUsuario): boolean {
    const stmt = db.prepare('UPDATE usuario SET estado = ? WHERE id_usuario = ?');
    const info = stmt.run(estado, idUsuario);
    return info.changes > 0;
  }
}
