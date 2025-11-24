import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding robots...');

  const robots = [
    {
      name: 'Tensrai1',
      status: 'MISSION',
      x: 10,
      y: 10,
      theta: 0,
      battery: 100,
    },
    {
      name: 'Tensrai2',
      status: 'MISSION',
      x: 15,
      y: 15,
      theta: 1.57,
      battery: 95,
    },
  ];

  for (const robot of robots) {
    const existingRobot = await prisma.robot.findUnique({
      where: { name: robot.name },
    });

    if (existingRobot) {
      console.log(`Robot already exists: ${robot.name}`);
    } else {
      await prisma.robot.create({
        data: robot,
      });
      console.log(`Created robot: ${robot.name}`);
    }
  }

  console.log('Seeding finished.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
