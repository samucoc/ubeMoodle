import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { FastifyRequest } from 'fastify';

/**
 * HTTP-level cache interceptor that caches GET responses in Redis/memory.
 * Use on read-heavy endpoints (course listings, categories, etc.).
 *
 * Usage:
 *   @UseInterceptors(new HttpCacheInterceptor(60))  // 60 seconds TTL
 */
@Injectable()
export class HttpCacheInterceptor implements NestInterceptor {
  private readonly ttlMs: number;

  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
    private readonly ttlSeconds: number = 30,
  ) {
    this.ttlMs = ttlSeconds * 1000;
  }

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest<FastifyRequest>();

    // Only cache GET requests
    if (request.method !== 'GET') {
      return next.handle();
    }

    const cacheKey = `http_cache:${request.url}`;

    const cachedResponse = await this.cacheManager.get(cacheKey);
    if (cachedResponse) {
      return of(cachedResponse);
    }

    return next.handle().pipe(
      tap(async (response) => {
        await this.cacheManager.set(cacheKey, response, this.ttlMs);
      }),
    );
  }
}
