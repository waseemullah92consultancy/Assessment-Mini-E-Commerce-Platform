import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

const mockUser = {
  _id: '507f1f77bcf86cd799439011',
  email: 'test@example.com',
  name: 'Test User',
  role: 'customer',
  passwordHash: '$2b$12$hashedpassword',
};

const mockUsersService = {
  create: jest.fn(),
  findByEmail: jest.fn(),
  findById: jest.fn(),
  validatePassword: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn().mockReturnValue('mock-jwt-token'),
};

const mockConfigService = {
  get: jest.fn().mockImplementation((key: string) => {
    const config: Record<string, string> = {
      JWT_SECRET: 'test-secret',
      JWT_REFRESH_SECRET: 'test-refresh-secret',
      JWT_EXPIRES_IN: '15m',
    };
    return config[key] ?? null;
  }),
};

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('should register a new user and return access + refresh tokens with user info', async () => {
      mockUsersService.create.mockResolvedValueOnce(mockUser);

      const result = await authService.register({
        email: 'test@example.com',
        password: 'Password1',
        name: 'Test User',
      });

      expect(mockUsersService.create).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'Password1',
        name: 'Test User',
      });
      expect(result).toHaveProperty('accessToken', 'mock-jwt-token');
      expect(result).toHaveProperty('refreshToken', 'mock-jwt-token');
      expect(result.user).toEqual({
        id: mockUser._id,
        email: mockUser.email,
        name: mockUser.name,
        role: mockUser.role,
      });
      // passwordHash must NOT be in the response
      expect(result.user).not.toHaveProperty('passwordHash');
    });

    it('should throw ConflictException when email is already registered', async () => {
      mockUsersService.create.mockRejectedValue(
        new ConflictException('Email already registered'),
      );

      let thrownError: any;
      try {
        await authService.register({
          email: 'existing@example.com',
          password: 'Password1',
          name: 'Existing User',
        });
      } catch (err) {
        thrownError = err;
      }

      expect(thrownError).toBeInstanceOf(ConflictException);
      expect(thrownError.message).toBe('Email already registered');
    });
  });

  describe('login', () => {
    it('should throw UnauthorizedException when password is incorrect', async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      mockUsersService.validatePassword.mockResolvedValue(false);

      let thrownError: any;
      try {
        await authService.login({ email: 'test@example.com', password: 'WrongPass1' });
      } catch (err) {
        thrownError = err;
      }

      expect(thrownError).toBeInstanceOf(UnauthorizedException);
      expect(thrownError.message).toBe('Invalid credentials');
      expect(mockUsersService.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(mockUsersService.validatePassword).toHaveBeenCalledWith(mockUser, 'WrongPass1');
    });
  });
});
