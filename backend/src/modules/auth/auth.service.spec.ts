import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';

// Mocks
const mockUsersService = {
  findByUsername: jest.fn(),
  findByEmail: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  updateRefreshToken: jest.fn(),
  updateLastLogin: jest.fn(),
};

const mockJwtService = {
  signAsync: jest.fn().mockResolvedValue('mocked-jwt-token'),
};

const mockConfigService = {
  get: jest.fn((key: string, fallback?: any) => {
    const map: Record<string, any> = {
      JWT_SECRET: 'test-jwt-secret-key-with-32-chars-min',
      JWT_REFRESH_SECRET: 'test-jwt-refresh-secret-key-32-chars',
      JWT_EXPIRATION: '15m',
      JWT_REFRESH_EXPIRATION: '7d',
    };
    return map[key] ?? fallback;
  }),
};

const mockLoginThrottle = {
  isLockedOut: jest.fn().mockResolvedValue(false),
  recordFailedAttempt: jest.fn(),
  clearAttempts: jest.fn(),
  getRemainingLockoutSeconds: jest.fn().mockReturnValue(300),
};

const mockUserRepository = {
  findOne: jest.fn(),
  find: jest.fn(),
  update: jest.fn(),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: 'UsersService', useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: 'LoginThrottleService', useValue: mockLoginThrottle },
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    const loginDto = { identity: 'testuser', password: 'Password@123' };

    it('should throw UnauthorizedException for non-existent user', async () => {
      mockUsersService.findByUsername.mockResolvedValue(null);
      mockUsersService.findByEmail.mockResolvedValue(null);

      await expect(service.login(loginDto, '127.0.0.1')).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockLoginThrottle.recordFailedAttempt).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      const user = {
        id: 'uuid-1',
        username: 'testuser',
        email: 'test@test.com',
        password: await bcrypt.hash('different-password', 10),
        isActive: true,
        roleNames: ['student'],
      };
      mockUsersService.findByUsername.mockResolvedValue(user);

      await expect(service.login(loginDto, '127.0.0.1')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should return tokens on valid credentials', async () => {
      const hashedPassword = await bcrypt.hash('Password@123', 10);
      const user = {
        id: 'uuid-1',
        username: 'testuser',
        email: 'test@test.com',
        password: hashedPassword,
        firstName: 'Test',
        lastName: 'User',
        isActive: true,
        roleNames: ['student'],
        avatarUrl: null,
      };
      mockUsersService.findByUsername.mockResolvedValue(user);

      const result = await service.login(loginDto, '127.0.0.1');

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.username).toBe('testuser');
      expect(mockLoginThrottle.clearAttempts).toHaveBeenCalled();
    });

    it('should throw when account is locked', async () => {
      mockLoginThrottle.isLockedOut.mockResolvedValue(true);

      await expect(service.login(loginDto, '127.0.0.1')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('changePassword', () => {
    it('should throw BadRequestException for incorrect current password', async () => {
      const user = {
        id: 'uuid-1',
        password: await bcrypt.hash('old-password', 10),
      };
      mockUserRepository.findOne.mockResolvedValue(user);

      await expect(
        service.changePassword('uuid-1', 'wrong-password', 'NewPass@1234'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should change password with correct current password', async () => {
      const user = {
        id: 'uuid-1',
        username: 'testuser',
        password: await bcrypt.hash('OldPass@123', 10),
      };
      mockUserRepository.findOne.mockResolvedValue(user);
      mockUserRepository.update.mockResolvedValue({});

      const result = await service.changePassword(
        'uuid-1',
        'OldPass@123',
        'NewPass@1234',
      );

      expect(result.message).toBe('Password changed successfully');
      expect(mockUserRepository.update).toHaveBeenCalledWith(
        'uuid-1',
        expect.objectContaining({ password: expect.any(String) }),
      );
    });
  });

  describe('verifyEmail', () => {
    it('should throw for invalid token', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.verifyEmail('bad-token')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should verify email with valid token', async () => {
      const user = { id: 'uuid-1', email: 'test@test.com', emailVerificationToken: 'valid' };
      mockUserRepository.findOne.mockResolvedValue(user);
      mockUserRepository.update.mockResolvedValue({});

      const result = await service.verifyEmail('valid');

      expect(result.message).toBe('Email verified successfully');
      expect(mockUserRepository.update).toHaveBeenCalledWith('uuid-1', {
        isEmailVerified: true,
        emailVerificationToken: null,
      });
    });
  });
});
