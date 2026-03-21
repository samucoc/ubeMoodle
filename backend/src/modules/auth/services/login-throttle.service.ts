import { Injectable, Logger } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

/**
 * Tracks failed login attempts per IP/identity to prevent brute force attacks.
 * Uses the cache (Redis if configured) for distributed environments.
 */
@Injectable()
export class LoginThrottleService {
  private readonly logger = new Logger(LoginThrottleService.name);

  private static readonly MAX_ATTEMPTS = 5;
  private static readonly LOCKOUT_SECONDS = 900; // 15 minutes
  private static readonly ATTEMPT_WINDOW_SECONDS = 600; // 10 minutes

  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  private getKey(identity: string, ip: string): string {
    return `login_attempts:${identity}:${ip}`;
  }

  /**
   * Check if the identity+IP combination is currently locked out.
   */
  async isLockedOut(identity: string, ip: string): Promise<boolean> {
    const key = this.getKey(identity, ip);
    const attempts = await this.cacheManager.get<number>(key);
    return (attempts ?? 0) >= LoginThrottleService.MAX_ATTEMPTS;
  }

  /**
   * Record a failed login attempt.
   * Returns the number of remaining attempts.
   */
  async recordFailedAttempt(identity: string, ip: string): Promise<number> {
    const key = this.getKey(identity, ip);
    const current = (await this.cacheManager.get<number>(key)) ?? 0;
    const newCount = current + 1;

    const ttl = newCount >= LoginThrottleService.MAX_ATTEMPTS
      ? LoginThrottleService.LOCKOUT_SECONDS * 1000
      : LoginThrottleService.ATTEMPT_WINDOW_SECONDS * 1000;

    await this.cacheManager.set(key, newCount, ttl);

    if (newCount >= LoginThrottleService.MAX_ATTEMPTS) {
      this.logger.warn(
        `Account locked: ${identity} from IP ${ip} after ${newCount} failed attempts`,
      );
    }

    return Math.max(0, LoginThrottleService.MAX_ATTEMPTS - newCount);
  }

  /**
   * Clear failed login attempts on successful login.
   */
  async clearAttempts(identity: string, ip: string): Promise<void> {
    const key = this.getKey(identity, ip);
    await this.cacheManager.del(key);
  }

  /**
   * Get seconds remaining on a lockout.
   */
  getRemainingLockoutSeconds(): number {
    return LoginThrottleService.LOCKOUT_SECONDS;
  }
}
