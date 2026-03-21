import { ConsoleLogger, Injectable, LogLevel } from '@nestjs/common';

/**
 * Structured logger that outputs JSON in production and readable text in development.
 * Drop-in replacement for the default NestJS Logger — no extra dependencies needed.
 */
@Injectable()
export class StructuredLogger extends ConsoleLogger {
  private readonly isProduction: boolean;

  constructor() {
    super();
    this.isProduction = process.env.APP_ENV === 'production';

    // Set log levels based on environment
    const levels: LogLevel[] = this.isProduction
      ? ['error', 'warn', 'log']
      : ['error', 'warn', 'log', 'debug', 'verbose'];
    this.setLogLevels(levels);
  }

  log(message: any, context?: string) {
    if (this.isProduction) {
      this.printJson('info', message, context);
    } else {
      super.log(message, context);
    }
  }

  error(message: any, trace?: string, context?: string) {
    if (this.isProduction) {
      this.printJson('error', message, context, { trace });
    } else {
      super.error(message, trace, context);
    }
  }

  warn(message: any, context?: string) {
    if (this.isProduction) {
      this.printJson('warn', message, context);
    } else {
      super.warn(message, context);
    }
  }

  debug(message: any, context?: string) {
    if (this.isProduction) {
      this.printJson('debug', message, context);
    } else {
      super.debug(message, context);
    }
  }

  verbose(message: any, context?: string) {
    if (this.isProduction) {
      this.printJson('verbose', message, context);
    } else {
      super.verbose(message, context);
    }
  }

  private printJson(
    level: string,
    message: any,
    context?: string,
    extra?: Record<string, any>,
  ) {
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      context: context || this.context || 'Application',
      message: typeof message === 'string' ? message : JSON.stringify(message),
      ...extra,
    };
    // Use stdout for all levels (structured log collectors prefer a single stream)
    process.stdout.write(JSON.stringify(entry) + '\n');
  }
}
