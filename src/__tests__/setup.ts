import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Global test setup
beforeAll(async () => {
  // Setup test database if needed
});

afterAll(async () => {
  // Cleanup
  await prisma.$disconnect();
});

// Clean up after each test
afterEach(async () => {
  // Clean up test data if needed
});
