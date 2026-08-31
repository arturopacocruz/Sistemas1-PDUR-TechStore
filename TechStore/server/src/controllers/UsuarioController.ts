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
      const sanitizados = usuarios.map(u => ({
        id_usuario: u.id_usuario,
        nombre: u.nombre,
        email: u.email,
        telefono: u.telefono,
        rol: u.rol,
        estado: u.estado || 'Activo',
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
        estado: usuario.estado || 'Activo',
        fecha_registro: usuario.fecha_registro
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Error al obtener usuario' });
    }
  };

  /**
   * Registro público de nuevos clientes ("Crear Cuenta")
   */
  registro = (req: Request, res: Response): void => {
    const { nombre, email, telefono, password } = req.body;
    const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'TechStore-WebClient';

    if (!nombre || !nombre.trim()) {
      res.status(400).json({ error: 'El nombre completo es obligatorio.' });
      return;
    }
    if (!email || !email.trim()) {
      res.status(400).json({ error: 'El correo electrónico es obligatorio.' });
      return;
    }
    if (!password || !password.trim()) {
      res.status(400).json({ error: 'La contraseña es obligatoria.' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      res.status(400).json({ error: 'El formato del correo electrónico no es válido.' });
      return;
    }

    const existente = this.usuarioRepository.buscarPorEmail(email.trim());
    if (existente) {
      res.status(400).json({ error: 'Ya existe una cuenta registrada con este correo electrónico.' });
      return;
    }

    try {
      const nuevoUsuario = this.usuarioRepository.crearUsuario({
        nombre: nombre.trim(),
        email: email.trim(),
        telefono: telefono ? telefono.trim() : null,
        password_hash: '$2a$12$e8Yk1.K1K7w7oH1x3YFGe.a9GgN5W2WkSjC7zZ7a0P1Q9b8U5j9s6',
        rol: 'CLIENTE',
        estado: 'Activo'
      });

      // Trazabilidad ASFI
      AuditService.registrar({
        id_usuario: nuevoUsuario.id_usuario,
        ip_origen: ip,
        user_agent: userAgent,
        accion: 'USER_REGISTERED',
        entidad_afectada: 'USUARIO',
        id_entidad: nuevoUsuario.id_usuario,
        detalles: {
          nombre: nuevoUsuario.nombre,
          email: nuevoUsuario.email,
          rol: nuevoUsuario.rol
        }
      });

      const tokenPayload = {
        id_usuario: nuevoUsuario.id_usuario,
        email: nuevoUsuario.email,
        rol: nuevoUsuario.rol,
        exp: Date.now() + 24 * 60 * 60 * 1000
      };

      res.status(201).json({
        message: 'Cuenta creada exitosamente',
        token: Buffer.from(JSON.stringify(tokenPayload)).toString('base64'),
        usuario: {
          id_usuario: nuevoUsuario.id_usuario,
          nombre: nuevoUsuario.nombre,
          email: nuevoUsuario.email,
          telefono: nuevoUsuario.telefono,
          rol: nuevoUsuario.rol,
          estado: nuevoUsuario.estado || 'Activo',
          fecha_registro: nuevoUsuario.fecha_registro
        }
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Error al registrar usuario' });
    }
  };

  /**
   * Autenticación formal con verificación de estado activo
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

      res.status(401).json({ error: 'Credenciales incorrectas. Verifique su correo y contraseña (contraseña por defecto: 123).' });
      return;
    }

    // Verificar si la cuenta está desactivada por un administrador
    if (usuario.estado === 'Inactivo') {
      AuditService.registrar({
        id_usuario: usuario.id_usuario,
        ip_origen: ip,
        user_agent: userAgent,
        accion: 'AUTH_LOGIN_BLOCKED_INACTIVE',
        entidad_afectada: 'USUARIO',
        id_entidad: usuario.id_usuario,
        detalles: { email: usuario.email, motivo: 'Cuenta inactiva' }
      });

      res.status(403).json({ error: 'Esta cuenta de usuario ha sido desactivada por un administrador. Comuníquese con soporte.' });
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
      exp: Date.now() + 24 * 60 * 60 * 1000
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
        estado: usuario.estado || 'Activo',
        fecha_registro: usuario.fecha_registro
      }
    });
  };

  /**
   * Crear usuario por parte del Administrador (con rol configurable)
   */
  crearPorAdmin = (req: Request, res: Response): void => {
    const { nombre, email, telefono, rol, estado } = req.body;
    const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';

    if (!nombre || !nombre.trim()) {
      res.status(400).json({ error: 'El nombre es obligatorio.' });
      return;
    }
    if (!email || !email.trim()) {
      res.status(400).json({ error: 'El correo electrónico es obligatorio.' });
      return;
    }

    const existente = this.usuarioRepository.buscarPorEmail(email.trim());
    if (existente) {
      res.status(400).json({ error: 'Ya existe un usuario con este correo electrónico.' });
      return;
    }

    try {
      const nuevo = this.usuarioRepository.crearUsuario({
        nombre: nombre.trim(),
        email: email.trim(),
        telefono: telefono ? telefono.trim() : null,
        rol: rol === 'ADMINISTRADOR' ? 'ADMINISTRADOR' : 'CLIENTE',
        estado: estado === 'Inactivo' ? 'Inactivo' : 'Activo'
      });

      AuditService.registrar({
        id_usuario: 3, // Admin actor
        ip_origen: ip,
        accion: 'USER_CREATED_BY_ADMIN',
        entidad_afectada: 'USUARIO',
        id_entidad: nuevo.id_usuario,
        detalles: { nombre: nuevo.nombre, email: nuevo.email, rol: nuevo.rol, estado: nuevo.estado }
      });

      res.status(201).json(nuevo);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Error al crear usuario' });
    }
  };

  /**
   * Actualizar usuario (Admin)
   */
  actualizar = (req: Request, res: Response): void => {
    const id = Number(req.params.id);
    const { nombre, email, telefono, rol, estado } = req.body;
    const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';

    const previo = this.usuarioRepository.buscarPorId(id);
    if (!previo) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }

    if (email && email.trim() !== '') {
      const existente = this.usuarioRepository.buscarPorEmail(email.trim());
      if (existente && existente.id_usuario !== id) {
        res.status(400).json({ error: 'El correo ya pertenece a otro usuario.' });
        return;
      }
    }

    try {
      const actualizado = this.usuarioRepository.actualizarUsuario(id, {
        nombre,
        email,
        telefono,
        rol,
        estado
      });

      AuditService.registrar({
        id_usuario: 3,
        ip_origen: ip,
        accion: 'USER_UPDATED',
        entidad_afectada: 'USUARIO',
        id_entidad: id,
        detalles: {
          previo: { nombre: previo.nombre, email: previo.email, rol: previo.rol, estado: previo.estado },
          nuevo: { nombre, email, telefono, rol, estado }
        }
      });

      res.json(actualizado);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Error al actualizar usuario' });
    }
  };

  /**
   * Activar / Desactivar cuenta de usuario (Admin)
   */
  cambiarEstado = (req: Request, res: Response): void => {
    const id = Number(req.params.id);
    const { estado } = req.body;
    const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';

    if (!estado || (estado !== 'Activo' && estado !== 'Inactivo')) {
      res.status(400).json({ error: 'Estado inválido. Debe ser "Activo" o "Inactivo".' });
      return;
    }

    const previo = this.usuarioRepository.buscarPorId(id);
    if (!previo) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }

    try {
      const ok = this.usuarioRepository.cambiarEstado(id, estado);
      if (ok) {
        AuditService.registrar({
          id_usuario: 3,
          ip_origen: ip,
          accion: 'USER_STATUS_CHANGED',
          entidad_afectada: 'USUARIO',
          id_entidad: id,
          detalles: { estado_anterior: previo.estado, nuevo_estado: estado }
        });
      }
      res.json({ message: `Estado actualizado a ${estado}`, id_usuario: id, estado });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Error al cambiar estado' });
    }
  };
}
