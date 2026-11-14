import { pino, type Logger } from 'pino';

import type { AppConfig } from '../../config/env.js';

const redactPaths = [
  'req.headers.authorization',
  'req.headers.cookie',
  'res.headers["set-cookie"]',
  'password',
  'passwordHash',
  'secret',
  'token',
  'apiKey',
];

export function createLogger(config: AppConfig): Logger {
  if (config.NODE_ENV === 'development') {
    return pino({
      level: config.LOG_LEVEL,
      redact: { paths: redactPaths, censor: '[REDACTED]' },
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      },
    });
  }

  return pino({
    level: config.LOG_LEVEL,
    redact: { paths: redactPaths, censor: '[REDACTED]' },
  });
}
