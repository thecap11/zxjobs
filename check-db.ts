import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function run() {
  const profile = await prisma.candidateProfile.findFirst({
    include: { jobPreference: true, skills: true }
  });
  console.log(JSON.stringify(profile, null, 2));
}
run().catch(console.error).finally(() => prisma.$disconnect());
