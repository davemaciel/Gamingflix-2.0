import winston from 'winston';

// Configuração do logger
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'ggflixbot-backend' },
  transports: [
    // Escreve todos os logs com nível 'error' ou menor para 'error.log'
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    // Escreve todos os logs para 'combined.log'
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

// Se não estamos em produção, também log para o console
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    ),
  }));
}

export { logger };