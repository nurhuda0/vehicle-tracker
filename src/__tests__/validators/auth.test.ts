import { z } from 'zod';
import { loginSchema, registerSchema, refreshTokenSchema } from '../../validators/auth';

describe('Auth Validators', () => {
  describe('loginSchema', () => {
    it('should validate correct login data', () => {
      const validData = {
        body: {
          email: 'test@example.com',
          password: 'password123',
        },
      };

      const result = loginSchema.parse(validData);
      expect(result.body.email).toBe('test@example.com');
      expect(result.body.password).toBe('password123');
    });

    it('should throw error for missing email', () => {
      const invalidData = {
        body: {
          password: 'password123',
        },
      };

      expect(() => loginSchema.parse(invalidData)).toThrow();
    });

    it('should throw error for missing password', () => {
      const invalidData = {
        body: {
          email: 'test@example.com',
        },
      };

      expect(() => loginSchema.parse(invalidData)).toThrow();
    });

    it('should throw error for invalid email format', () => {
      const invalidData = {
        body: {
          email: 'invalid-email',
          password: 'password123',
        },
      };

      expect(() => loginSchema.parse(invalidData)).toThrow();
    });

    it('should throw error for empty password', () => {
      const invalidData = {
        body: {
          email: 'test@example.com',
          password: '',
        },
      };

      expect(() => loginSchema.parse(invalidData)).toThrow();
    });
  });

  describe('registerSchema', () => {
    it('should validate correct registration data', () => {
      const validData = {
        body: {
          email: 'newuser@example.com',
          password: 'Password123',
          name: 'New User',
          role: 'USER',
        },
      };

      const result = registerSchema.parse(validData);
      expect(result.body.email).toBe('newuser@example.com');
      expect(result.body.name).toBe('New User');
      expect(result.body.role).toBe('USER');
    });

    it('should validate registration data with ADMIN role', () => {
      const validData = {
        body: {
          email: 'admin@example.com',
          password: 'AdminPassword123',
          name: 'Admin User',
          role: 'ADMIN',
        },
      };

      const result = registerSchema.parse(validData);
      expect(result.body.email).toBe('admin@example.com');
      expect(result.body.role).toBe('ADMIN');
    });

    it('should throw error for missing email', () => {
      const invalidData = {
        body: {
          password: 'Password123',
          name: 'New User',
          role: 'USER',
        },
      };

      expect(() => registerSchema.parse(invalidData)).toThrow();
    });

    it('should throw error for missing password', () => {
      const invalidData = {
        body: {
          email: 'newuser@example.com',
          name: 'New User',
          role: 'USER',
        },
      };

      expect(() => registerSchema.parse(invalidData)).toThrow();
    });

    it('should throw error for missing name', () => {
      const invalidData = {
        body: {
          email: 'newuser@example.com',
          password: 'Password123',
          role: 'USER',
        },
      };

      expect(() => registerSchema.parse(invalidData)).toThrow();
    });

    it('should throw error for invalid email format', () => {
      const invalidData = {
        body: {
          email: 'invalid-email',
          password: 'Password123',
          name: 'New User',
          role: 'USER',
        },
      };

      expect(() => registerSchema.parse(invalidData)).toThrow();
    });

    it('should throw error for weak password', () => {
      const invalidData = {
        body: {
          email: 'newuser@example.com',
          password: '123',
          name: 'New User',
          role: 'USER',
        },
      };

      expect(() => registerSchema.parse(invalidData)).toThrow();
    });

    it('should throw error for invalid role', () => {
      const invalidData = {
        body: {
          email: 'newuser@example.com',
          password: 'Password123',
          name: 'New User',
          role: 'INVALID_ROLE',
        },
      };

      expect(() => registerSchema.parse(invalidData)).toThrow();
    });

    it('should throw error for empty name', () => {
      const invalidData = {
        body: {
          email: 'newuser@example.com',
          password: 'Password123',
          name: '',
          role: 'USER',
        },
      };

      expect(() => registerSchema.parse(invalidData)).toThrow();
    });
  });

  describe('refreshTokenSchema', () => {
    it('should validate correct refresh token data', () => {
      const validData = {
        body: {
          refreshToken: 'valid-refresh-token',
        },
      };

      const result = refreshTokenSchema.parse(validData);
      expect(result.body.refreshToken).toBe('valid-refresh-token');
    });

    it('should throw error for missing refresh token', () => {
      const invalidData = {
        body: {},
      };

      expect(() => refreshTokenSchema.parse(invalidData)).toThrow();
    });

    it('should throw error for empty refresh token', () => {
      const invalidData = {
        body: {
          refreshToken: '',
        },
      };

      expect(() => refreshTokenSchema.parse(invalidData)).toThrow();
    });

    it('should throw error for non-string refresh token', () => {
      const invalidData = {
        body: {
          refreshToken: 123,
        },
      };

      expect(() => refreshTokenSchema.parse(invalidData)).toThrow();
    });
  });
});
