import { Request, Response } from 'express';
import { CategoriaRepository } from '../repositories/CategoriaRepository.js';

export class CategoriaController {
  private categoriaRepository: CategoriaRepository;

  constructor() {
    this.categoriaRepository = new CategoriaRepository();
  }

  listar = (req: Request, res: Response): void => {
    try {
      const categorias = this.categoriaRepository.findAll();
      res.json(categorias);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Error al listar categorías' });
    }
  };
}
