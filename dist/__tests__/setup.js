"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
beforeAll(async () => {
});
afterAll(async () => {
    await prisma.$disconnect();
});
afterEach(async () => {
});
//# sourceMappingURL=setup.js.map