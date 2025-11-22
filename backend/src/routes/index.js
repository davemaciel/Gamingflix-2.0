import { steamRoutes } from './steam.routes.js';
import authRoutes from './auth.routes.js';
import gamesRoutes from './games.routes.js';
import subscriptionsRoutes from './subscriptions.routes.js';
import usersRoutes from './users.routes.js';
import steamGuardRoutes from './steamguard.routes.js';
import checkoutRoutes from './checkout.routes.js';
import transactionsRoutes from './transactions.routes.js';
import streamingRoutes from './streaming.routes.js';
import categoriesRoutes from './categories.routes.js';

export function setupRoutes(app) {
  app.use('/api/auth', authRoutes);
  app.use('/api/games', gamesRoutes);
  app.use('/api/subscriptions', subscriptionsRoutes);
  app.use('/api/users', usersRoutes);
  app.use('/api/steam', steamRoutes);
  app.use('/api/steam-guard', steamGuardRoutes);
  app.use('/api/checkout', checkoutRoutes);
  app.use('/api/transactions', transactionsRoutes);
  app.use('/api/streaming', streamingRoutes);
  app.use('/api/categories', categoriesRoutes);

  app.all('/api/whatsapp/*', (req, res) => {
    return res.status(503).json({ success: false, error: 'WhatsApp temporariamente desativado' });
  });
}
