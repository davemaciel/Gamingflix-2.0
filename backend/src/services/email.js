import Imap from 'imap';
import { simpleParser } from 'mailparser';
import { logger } from '../utils/logger.js';
import dotenv from 'dotenv';

dotenv.config();

// tempo máximo (em minutos) para aceitar um código como válido
// REDUZIDO para 5 minutos - códigos Steam Guard expiram rápido
const MAX_AGE_MIN = parseInt(process.env.STEAM_CODE_MAX_AGE_MIN || '5', 10);

// configuração do email
const emailConfig = {
  user: process.env.EMAIL_USER,
  password: process.env.EMAIL_PASSWORD,
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT, 10),
  tls: process.env.EMAIL_TLS === 'true',
  tlsOptions: { rejectUnauthorized: false },
  authTimeout: 10000,
};

/**
 * Busca o código Steam Guard no email e devolve o mais recente disponível.
 */
export async function findSteamCode() {
  return new Promise((resolve, reject) => {
    let imap;
    try {
      imap = new Imap(emailConfig);
    } catch (error) {
      return reject(error);
    }

    const safeReject = (message) => {
      logger.error(message);
      if (imap.state !== 'disconnected') {
        try {
          imap.end();
        } catch (_) {
          /* noop */
        }
      }
      reject(new Error(message));
    };

    imap.once('ready', () => {
      imap.openBox(process.env.EMAIL_MAILBOX || 'INBOX', true, (err) => {
        if (err) {
          return safeReject(`Erro ao abrir caixa de entrada: ${err.message}`);
        }

        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const configuredSubject = process.env.STEAM_EMAIL_SUBJECT || 'Steam Guard';

        const primaryCriteria = [
          ['SINCE', yesterday],
          [
            'OR',
            ['HEADER', 'SUBJECT', configuredSubject],
            ['OR', ['HEADER', 'FROM', 'noreply@steampowered.com'], ['HEADER', 'FROM', 'no-reply@steampowered.com']],
          ],
        ];

        const searchEmails = (criteria, isFallback = false) => {
          imap.search(criteria, (searchErr, results) => {
            if (searchErr) {
              return safeReject(`Erro na busca de emails: ${searchErr.message}`);
            }

            if (!results || results.length === 0) {
              if (!isFallback) {
                return searchEmails([['SINCE', yesterday]], true);
              }
              return safeReject('Nenhum email do Steam Guard encontrado');
            }

            const sorted = results.sort((a, b) => b - a).slice(0, 20);
            const fetch = imap.fetch(sorted, { bodies: '', struct: true });

            let resolved = false;
            let fetchEnded = false;
            let pendingParses = 0;
            let bestCandidate = null;

            const maybeFinalize = () => {
              if (resolved) return;
              if (!fetchEnded || pendingParses > 0) return;

              if (bestCandidate) {
                logger.info(`Código encontrado (mais recente): ${bestCandidate.code}`);
                resolved = true;
                imap.end();
                return resolve(bestCandidate.code);
              }

              if (!isFallback) {
                return searchEmails([['SINCE', yesterday]], true);
              }

              safeReject(
                `Nenhum email do Steam Guard recente encontrado (<= ${MAX_AGE_MIN} minutos). Tente novamente em alguns instantes.`
              );
            };

            fetch.on('message', (msg) => {
              msg.on('body', (stream) => {
                pendingParses += 1;
                simpleParser(stream, (parseErr, parsed) => {
                  pendingParses -= 1;
                  if (resolved) return;

                  if (parseErr) {
                    logger.error(`Erro ao analisar email: ${parseErr.message}`);
                    maybeFinalize();
                    return;
                  }

                  const emailText = (parsed.text || parsed.html || '').toString();
                  const codeRegex = new RegExp(process.env.STEAM_CODE_REGEX || '([A-Z0-9]{5})');
                  const match = emailText.match(codeRegex);

                  const from = (parsed.from && parsed.from.text) || '';
                  const subject = parsed.subject || '';
                  const msgDate = parsed.date ? new Date(parsed.date) : new Date();

                  const looksLikeSteam =
                    /steam/i.test(from) || /steampowered\.com/i.test(from) || /steam guard/i.test(subject);

                  const ageMs = Date.now() - msgDate.getTime();
                  const isFresh = ageMs <= MAX_AGE_MIN * 60_000;

                  if (match && match[1] && (isFallback ? looksLikeSteam : true)) {
                    const code = match[1];
                    if (!isFresh) {
                      logger.debug(`Código ignorado por idade (${Math.round(ageMs / 1000)}s): ${code}`);
                    } else {
                      // SEMPRE pegar o código MAIS NOVO por timestamp
                      // Códigos Steam Guard são de uso único - não reutilizar
                      const candidate = {
                        code,
                        messageTimestamp: msgDate.getTime(),
                      };

                      // Substituir se for mais recente
                      if (!bestCandidate || candidate.messageTimestamp > bestCandidate.messageTimestamp) {
                        bestCandidate = candidate;
                        logger.debug(`Novo melhor candidato: ${code} (${Math.round(ageMs / 1000)}s atrás)`);
                      }
                    }
                  }

                  maybeFinalize();
                });
              });
            });

            fetch.once('error', (fetchErr) => {
              if (!resolved) {
                safeReject(`Erro ao buscar email: ${fetchErr.message}`);
              }
            });

            fetch.once('end', () => {
              fetchEnded = true;
              maybeFinalize();
            });
          });
        };

        searchEmails(primaryCriteria);
      });
    });

    imap.once('error', (err) => {
      safeReject(`Erro de conexão com servidor de email: ${err.message}`);
    });

    imap.once('end', () => {
      logger.debug('Conexão IMAP encerrada');
    });

    setTimeout(() => {
      if (imap.state !== 'disconnected') {
        imap.end();
        reject(new Error('Timeout ao buscar código - operação excedeu 45 segundos'));
      }
    }, 45_000);

    imap.connect();
  });
}
