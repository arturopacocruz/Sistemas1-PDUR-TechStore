import { db } from '../database/db.js';
import { Usuario } from '../models/types.js';

export class UsuarioRepository {
  listarUsuarios(): Usuario[] {
    const stmt = db.prepare('SELECT * FROM usuario ORDER BY id_usuario ASC');
    return stmt.all() as Usuario[];
  }

  buscarPorId(idUsuario: number): Usuario | undefined {
    const stmt = db.prepare('SELECT * FROM usuario WHERE id_usuario = ?');
    return stmt.get(idUsuario) as Usuario | undefined;
  }

  buscarPorEmail(email: string): Usuario | undefined {
    const stmt = db.prepare('SELECT * FROM usuario WHERE email = ?');
    return stmt.get(email) as Usuario | undefined;
  }
}
