import { PrismaClient } from "@prisma/client";
import { COMPANIES, PROBLEMS, TOPICS } from "./seed-data";

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

  let seededCount = 0;
  for (const problem of PROBLEMS) {
    const existing = await prisma.problem.findUnique({
      where: { slug: problem.slug },
    });

    if (existing) {
      continue;
    }

    const created = await prisma.problem.create({
      data: {
        title: problem.title,
        slug: problem.slug,
        difficulty: problem.difficulty,
        description: problem.description,
        constraints: problem.constraints,
        followUp: problem.followUp ?? null,
        popularity: problem.popularity,
        examples: JSON.stringify(problem.examples),
        starterCode: JSON.stringify({
          cpp: "#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your solution here\n    return 0;\n}",
          java: "import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your solution here\n    }\n}",
          python: "# Read input from stdin\nimport sys\n\ndef main():\n    data = sys.stdin.read().strip().split()\n    # Write your solution here\n\nif __name__ == '__main__':\n    main()",
          javascript: "const fs = require('fs');\n\nconst input = fs.readFileSync(0, 'utf8').trim();\n// Write your solution here\n",
        }),
      },
    });

    const companyIds = await Promise.all(
      problem.companies.map(async (companySlug) => {
        const company = await prisma.company.findUnique({ where: { slug: companySlug } });
        return company?.id;
      })
    );

    for (const companyId of companyIds) {
      if (!companyId) continue;
      await prisma.companyProblem.upsert({
        where: { companyId_problemId: { companyId, problemId: created.id } },
        update: {},
        create: { companyId, problemId: created.id },
      });
    }

    for (const topicName of problem.topics) {
      const topicId = topicMap.get(topicName);
      if (!topicId) continue;
      await prisma.problemTopic.upsert({
        where: { problemId_topicId: { problemId: created.id, topicId } },
        update: {},
        create: { problemId: created.id, topicId },
      });
    }

    for (const [sortOrder, testCase] of problem.sampleTests.entries()) {
      await prisma.testCase.create({
        data: {
          problemId: created.id,
          input: testCase.input,
          expectedOutput: testCase.output,
          isSample: true,
          sortOrder,
        },
      });
    }

    for (const [sortOrder, testCase] of problem.hiddenTests.entries()) {
      await prisma.testCase.create({
        data: {
          problemId: created.id,
          input: testCase.input,
          expectedOutput: testCase.output,
          isSample: false,
          sortOrder,
        },
      });
    }

    seededCount += 1;
  }

  console.log(`Seeded ${COMPANIES.length} companies, ${TOPICS.length} topics, and ${seededCount} problems.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
