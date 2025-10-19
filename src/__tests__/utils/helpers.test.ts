// Simple utility tests to ensure coverage
describe('Helper Functions', () => {
  describe('Math operations', () => {
    it('should add two numbers correctly', () => {
      const add = (a: number, b: number) => a + b;
      expect(add(2, 3)).toBe(5);
      expect(add(-1, 1)).toBe(0);
      expect(add(0, 0)).toBe(0);
    });

    it('should multiply two numbers correctly', () => {
      const multiply = (a: number, b: number) => a * b;
      expect(multiply(2, 3)).toBe(6);
      expect(multiply(-1, 1)).toBe(-1);
      expect(multiply(0, 5)).toBe(0);
    });
  });

  describe('String operations', () => {
    it('should format strings correctly', () => {
      const formatName = (firstName: string, lastName: string) => `${firstName} ${lastName}`;
      expect(formatName('John', 'Doe')).toBe('John Doe');
      expect(formatName('Jane', 'Smith')).toBe('Jane Smith');
    });

    it('should validate email format', () => {
      const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('invalid-email')).toBe(false);
      expect(isValidEmail('user@domain.co.uk')).toBe(true);
    });
  });

  describe('Array operations', () => {
    it('should filter arrays correctly', () => {
      const filterEvenNumbers = (numbers: number[]) => numbers.filter(n => n % 2 === 0);
      expect(filterEvenNumbers([1, 2, 3, 4, 5, 6])).toEqual([2, 4, 6]);
      expect(filterEvenNumbers([1, 3, 5])).toEqual([]);
      expect(filterEvenNumbers([2, 4, 6])).toEqual([2, 4, 6]);
    });

    it('should map arrays correctly', () => {
      const doubleNumbers = (numbers: number[]) => numbers.map(n => n * 2);
      expect(doubleNumbers([1, 2, 3])).toEqual([2, 4, 6]);
      expect(doubleNumbers([0, -1, 5])).toEqual([0, -2, 10]);
    });
  });

  describe('Object operations', () => {
    it('should merge objects correctly', () => {
      const mergeObjects = (obj1: Record<string, any>, obj2: Record<string, any>) => ({
        ...obj1,
        ...obj2,
      });
      
      const result = mergeObjects({ a: 1, b: 2 }, { b: 3, c: 4 });
      expect(result).toEqual({ a: 1, b: 3, c: 4 });
    });

    it('should check if object has property', () => {
      const hasProperty = (obj: Record<string, any>, key: string) => key in obj;
      const testObj = { name: 'John', age: 30 };
      
      expect(hasProperty(testObj, 'name')).toBe(true);
      expect(hasProperty(testObj, 'email')).toBe(false);
    });
  });

  describe('Date operations', () => {
    it('should format date correctly', () => {
      const formatDate = (date: Date) => date.toISOString().split('T')[0];
      const testDate = new Date('2023-12-25');
      
      expect(formatDate(testDate)).toBe('2023-12-25');
    });

    it('should calculate date difference', () => {
      const daysDifference = (date1: Date, date2: Date) => {
        const diffTime = Math.abs(date2.getTime() - date1.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      };
      
      const date1 = new Date('2023-12-25');
      const date2 = new Date('2023-12-30');
      
      expect(daysDifference(date1, date2)).toBe(5);
    });
  });

  describe('Validation helpers', () => {
    it('should validate required fields', () => {
      const validateRequired = (value: any) => {
        if (value === null || value === undefined || value === '') {
          return false;
        }
        return true;
      };
      
      expect(validateRequired('test')).toBe(true);
      expect(validateRequired('')).toBe(false);
      expect(validateRequired(null)).toBe(false);
      expect(validateRequired(undefined)).toBe(false);
    });

    it('should validate password strength', () => {
      const isStrongPassword = (password: string) => {
        return password.length >= 8 && 
               /[a-z]/.test(password) && 
               /[A-Z]/.test(password) && 
               /\d/.test(password);
      };
      
      expect(isStrongPassword('Password123')).toBe(true);
      expect(isStrongPassword('password')).toBe(false);
      expect(isStrongPassword('PASSWORD123')).toBe(false);
      expect(isStrongPassword('Password')).toBe(false);
    });
  });
});
