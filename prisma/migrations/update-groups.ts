import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateGroups() {
  try {
    // Get the first admin user or create one if none exists
    const adminUser = await prisma.user.findFirst({
      where: {
        role: 'ADMIN'
      }
    });

    if (!adminUser) {
      console.error('No admin user found');
      return;
    }

    // Update all groups without an owner
    await prisma.group.updateMany({
      where: {
        createdBy: null
      },
      data: {
        createdBy: adminUser.id
      }
    });

    console.log('Successfully updated groups');
  } catch (error) {
    console.error('Error updating groups:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateGroups();
