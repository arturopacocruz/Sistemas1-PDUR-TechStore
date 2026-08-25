import { Request, Response } from 'express';
import { UsuarioRepository } from '../repositories/UsuarioRepository.js';

export class UsuarioController {
  private usuarioRepository: UsuarioRepository;

  constructor() {
    this.usuarioRepository = new UsuarioRepository();
  }

  listar = (req: Request, res: Response): void => {
    try {
      const usuarios = this.usuarioRepository.listarUsuarios();
      res.json(usuarios);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Error al listar usuarios' });
    }
  };

  obtenerPorId = (req: Request, res: Response): void => {
    try {
      const id = Number(req.params.id);
      const usuario = this.usuarioRepository.buscarPorId(id);
      if (!usuario) {
        res.status(404).json({ error: 'Usuario no encontrado' });
        return;
      }
      res.json(usuario);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Error al obtener usuario' });
    }
  };
}
