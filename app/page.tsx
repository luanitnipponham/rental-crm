import prisma from '@/lib/prisma';
import RentalDashboard from '@/components/RentalDashboard';

export const dynamic = 'force-dynamic';

export default async function Home() {
  // Fetch initial apartments and projects directly with Prisma
  const [apartments, projects] = await Promise.all([
    prisma.apartment.findMany({
      include: { project: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.project.findMany({
      include: {
        _count: {
          select: { apartments: true },
        },
      },
      orderBy: { name: 'asc' },
    }),
  ]);

  return (
    <RentalDashboard
      initialApartments={JSON.parse(JSON.stringify(apartments))}
      initialProjects={JSON.parse(JSON.stringify(projects))}
    />
  );
}
