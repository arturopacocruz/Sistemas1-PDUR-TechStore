import { db } from '../database/db.js';
import { Categoria } from '../models/types.js';

export class CategoriaRepository {
  findAll(): Categoria[] {
    const stmt = db.prepare('SELECT * FROM categoria ORDER BY id_categoria ASC');
    return stmt.all() as Categoria[];
  }

  findById(idCategoria: number): Categoria | undefined {
    const stmt = db.prepare('SELECT * FROM categoria WHERE id_categoria = ?');
    return stmt.get(idCategoria) as Categoria | undefined;
  }
}
