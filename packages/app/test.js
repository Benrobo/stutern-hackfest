const prisma = require("@prisma/client");

const { PrismaClient } = prisma;

const prismaClient = new PrismaClient();

async function main() {
  const result = await prismaClient.users.findMany();
  console.log(result);
}
main();
