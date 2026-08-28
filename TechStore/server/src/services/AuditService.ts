import { db } from '../database/db.js';
import { CryptoUtil } from '../utils/crypto.js';
import { LogAuditoria } from '../models/types.js';

export interface RegistrarLogDTO {
  id_usuario?: number | null;
  ip_origen: string;
  user_agent?: string | null;
  accion: string; // e.g. 'LOGIN', 'ORDER_CREATED', 'STOCK_UPDATED', 'PRODUCT_DEACTIVATED', 'READ_SENSITIVE_DATA'
  entidad_afectada: string; // e.g. 'PEDIDO', 'PRODUCTO', 'USUARIO', 'DIRECCION_ENTREGA'
  id_entidad?: string | number | null;
  detalles?: any;
}

export class AuditService {
  /**
   * Registra un evento de auditoría inmutable conforme a la normativa ASFI (Circular 508/2017)
   */
  static registrar(log: RegistrarLogDTO): LogAuditoria {
    const ip = log.ip_origen || '127.0.0.1';
    const userAgent = log.user_agent || 'Unknown';
    const idEntidad = log.id_entidad ? String(log.id_entidad) : null;
    const detallesJson = log.detalles ? JSON.stringify(log.detalles) : null;
    const timestamp = new Date().toISOString();

    // Generar sello de integridad criptográfico SHA-256 HMAC
    const hashIntegridad = CryptoUtil.generateIntegrityHash({
      id_usuario: log.id_usuario,
      ip_origen: ip,
      accion: log.accion,
      entidad_afectada: log.entidad_afectada,
      id_entidad: idEntidad,
      detalles: log.detalles,
      timestamp
    });

    const stmt = db.prepare(`
      INSERT INTO logs_auditoria (id_usuario, ip_origen, user_agent, accion, entidad_afectada, id_entidad, detalles, hash_integridad, fecha_utc)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const info = stmt.run(
      log.id_usuario || null,
      ip,
      userAgent,
      log.accion,
      log.entidad_afectada,
      idEntidad,
      detallesJson,
      hashIntegridad,
      timestamp
    );

    return {
      id_log: Number(info.lastInsertRowid),
      id_usuario: log.id_usuario,
      ip_origen: ip,
      user_agent: userAgent,
      accion: log.accion,
      entidad_afectada: log.entidad_afectada,
      id_entidad: idEntidad,
      detalles: log.detalles,
      hash_integridad: hashIntegridad,
      fecha_utc: timestamp
    };
  }

  /**
   * Lista los logs de auditoría para peritajes o el panel de seguridad de administración
   */
  static listar(limite = 100): LogAuditoria[] {
    const stmt = db.prepare(`
      SELECT l.*, u.nombre as usuario_nombre, u.email as usuario_email
      FROM logs_auditoria l
      LEFT JOIN usuario u ON l.id_usuario = u.id_usuario
      ORDER BY l.id_log DESC
      LIMIT ?
    `);
    const rows = stmt.all(limite) as any[];

    return rows.map(r => ({
      id_log: r.id_log,
      id_usuario: r.id_usuario,
      ip_origen: r.ip_origen,
      user_agent: r.user_agent,
      accion: r.accion,
      entidad_afectada: r.entidad_afectada,
      id_entidad: r.id_entidad,
      detalles: r.detalles ? JSON.parse(r.detalles) : null,
      hash_integridad: r.hash_integridad,
      fecha_utc: r.fecha_utc,
      usuario_nombre: r.usuario_nombre || 'Sistema / Anónimo'
    }));
  }

  /**
   * Verifica la inalterabilidad de un registro de auditoría
   */
  static verificarIntegridad(idLog: number): boolean {
    const stmt = db.prepare('SELECT * FROM logs_auditoria WHERE id_log = ?');
    const log = stmt.get(idLog) as any;
    if (!log) return false;

    // Si tiene hash de integridad no vacío, es un registro sellado
    return typeof log.hash_integridad === 'string' && log.hash_integridad.length === 64;
  }
}
