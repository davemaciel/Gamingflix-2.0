import { createClient } from '@supabase/supabase-js';
import { logger } from '../utils/logger.js';

const supabaseUrl =
  process.env.SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  process.env.SUPABASE_PROJECT_URL; // fallback naming
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabaseAdmin = null;

if (supabaseUrl && supabaseServiceRoleKey) {
  supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
} else {
  logger.warn(
    '[adminAuth] Variáveis SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY não detectadas; proteção de rota administrativa indisponível.'
  );
}

const adminCache = new Map();
const CACHE_TTL_MS = 60 * 1000;

export async function requireAdmin(req, res, next) {
  if (!supabaseAdmin) {
    return res.status(500).json({
      success: false,
      error: 'Proteção de admin indisponível - configure SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no backend.',
    });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Token de autenticação ausente.',
    });
  }

  const token = authHeader.slice(7).trim();
  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Token de autenticação inválido.',
    });
  }

  try {
    const cached = adminCache.get(token);
    const now = Date.now();

    if (cached && cached.expiresAt > now) {
      req.user = cached.user;
      return next();
    }

    const {
      data: { user },
      error: getUserError,
    } = await supabaseAdmin.auth.getUser(token);

    if (getUserError || !user) {
      logger.warn(`[adminAuth] Token inválido ou expirado: ${getUserError?.message}`);
      return res.status(401).json({
        success: false,
        error: 'Sessão expirada. Faça login novamente.',
      });
    }

    const { data: roleRow, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (roleError) {
      logger.error(`[adminAuth] Erro ao verificar role: ${roleError.message}`);
      return res.status(500).json({
        success: false,
        error: 'Erro ao validar permissões administrativas.',
      });
    }

    if (!roleRow) {
      logger.warn(`[adminAuth] Acesso negado para usuário ${user.id}`);
      return res.status(403).json({
        success: false,
        error: 'Acesso restrito a administradores.',
      });
    }

    const safeUser = { id: user.id, email: user.email, metadata: user.user_metadata };
    adminCache.set(token, { user: safeUser, expiresAt: now + CACHE_TTL_MS });
    req.user = safeUser;
    return next();
  } catch (error) {
    logger.error(`[adminAuth] Erro inesperado: ${error.message}`);
    return res.status(500).json({
      success: false,
      error: 'Erro interno ao validar sessão.',
    });
  }
}
