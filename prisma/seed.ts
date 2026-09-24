import { PrismaClient } from "@prisma/client";
import { COMPANIES, TOPICS } from "./seed-data";

const prisma = new PrismaClient();

function slugifyTopic(name: string) {
  return name.toLowerCase().replace(/\s+/g, "-");
}

async function main() {
  console.log("Seeding CodeTarget database...");

  for (const company of COMPANIES) {
    await prisma.company.upsert({
      where: { slug: company.slug },
      update: {
        name: company.name,
        accentColor: company.accentColor,
      },
      create: {
        name: company.name,
        slug: company.slug,
        accentColor: company.accentColor,
        description: `${company.name} previous-year style coding interview practice.`,
      },
    });
  }

  const topicMap = new Map<string, string>();
  for (const name of TOPICS) {
    const topic = await prisma.topic.upsert({
      where: { slug: slugifyTopic(name) },
      update: { name },
      create: { name, slug: slugifyTopic(name) },
    });
    topicMap.set(name, topic.id);
  }

  console.log(`Seeded ${COMPANIES.length} companies and ${TOPICS.length} topics. No problems were added.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
