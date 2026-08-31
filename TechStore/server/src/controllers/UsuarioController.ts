import { Request, Response } from 'express';
import { UsuarioRepository } from '../repositories/UsuarioRepository.js';
import { AuditService } from '../services/AuditService.js';
import { CryptoUtil } from '../utils/crypto.js';

export class UsuarioController {
  private usuarioRepository: UsuarioRepository;

  constructor() {
    this.usuarioRepository = new UsuarioRepository();
  }

  listar = (req: Request, res: Response): void => {
    try {
      const usuarios = this.usuarioRepository.listarUsuarios();
      // Omitir password_hash de la respuesta pública
      const sanitizados = usuarios.map(u => ({
        id_usuario: u.id_usuario,
        nombre: u.nombre,
        email: u.email,
        telefono: u.telefono,
        rol: u.rol,
        fecha_registro: u.fecha_registro
      }));
      res.json(sanitizados);
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
      res.json({
        id_usuario: usuario.id_usuario,
        nombre: usuario.nombre,
        email: usuario.email,
        telefono: usuario.telefono,
        rol: usuario.rol,
        fecha_registro: usuario.fecha_registro
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Error al obtener usuario' });
    }
  };

  /**
   * Endpoint de autenticación formal (Login con contraseña '123' y auditoría ASFI)
   */
  login = (req: Request, res: Response): void => {
    const { email, password } = req.body;
    const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'TechStore-WebClient';

    if (!email || !password) {
      res.status(400).json({ error: 'El correo electrónico y la contraseña son obligatorios.' });
      return;
    }

    const usuario = this.usuarioRepository.buscarPorEmail(email.trim().toLowerCase());

    // Regla: La contraseña para todos los usuarios registrados es '123'
    const passwordValida = password === '123' || (usuario && usuario.password_hash && password === '123');

    if (!usuario || !passwordValida) {
      AuditService.registrar({
        id_usuario: null,
        ip_origen: ip,
        user_agent: userAgent,
        accion: 'AUTH_LOGIN_FAILED',
        entidad_afectada: 'USUARIO',
        detalles: { email_intentado: email, motivo: 'Credenciales inválidas' }
      });

      res.status(401).json({ error: 'Credenciales incorrectas. Verifique su correo electrónico y contraseña (contraseña por defecto: 123).' });
      return;
    }

    // Registrar Login exitoso en auditoría ASFI
    AuditService.registrar({
      id_usuario: usuario.id_usuario,
      ip_origen: ip,
      user_agent: userAgent,
      accion: 'AUTH_LOGIN_SUCCESS',
      entidad_afectada: 'USUARIO',
      id_entidad: usuario.id_usuario,
      detalles: { email: usuario.email, rol: usuario.rol }
    });

    const tokenPayload = {
      id_usuario: usuario.id_usuario,
      email: usuario.email,
      rol: usuario.rol,
      exp: Date.now() + 24 * 60 * 60 * 1000 // 24 horas
    };

    res.json({
      message: 'Inicio de sesión exitoso',
      token: Buffer.from(JSON.stringify(tokenPayload)).toString('base64'),
      usuario: {
        id_usuario: usuario.id_usuario,
        nombre: usuario.nombre,
        email: usuario.email,
        telefono: usuario.telefono,
        rol: usuario.rol,
        fecha_registro: usuario.fecha_registro
      }
    });
  };
}
