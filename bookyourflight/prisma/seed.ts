import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const testAdminClerkId = 'user_test_admin_001';
  const testUserClerkId = 'user_test_user_001';

  const admin = await prisma.user.upsert({
    where: { clerkId: testAdminClerkId },
    update: {},
    create: {
      clerkId: testAdminClerkId,
      email: 'admin@bookyourflight.com',
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
    },
  });

  console.log('✅ Admin user created:', admin.email);

  const user = await prisma.user.upsert({
    where: { clerkId: testUserClerkId },
    update: {},
    create: {
      clerkId: testUserClerkId,
      email: 'user@bookyourflight.com',
      firstName: 'Test',
      lastName: 'User',
      role: 'USER',
    },
  });

  console.log('✅ Regular user created:', user.email);

  const flights = [
    {
      name: 'Vol Paris-Londres AF1234',
      description: 'Vol direct Paris Charles de Gaulle vers Londres Heathrow',
      type: 'FLIGHT',
      availableSlots: 150,
      maxSlots: 180,
      priceInCents: 12900,
      currency: 'EUR',
      metadata: {
        flightNumber: 'AF1234',
        origin: 'CDG',
        destination: 'LHR',
        departureTime: '2026-02-15T10:00:00Z',
        arrivalTime: '2026-02-15T11:30:00Z',
        airline: 'Air France',
      },
    },
    {
      name: 'Vol Paris-New York AF001',
      description: 'Vol transatlantique Paris CDG vers New York JFK',
      type: 'FLIGHT',
      availableSlots: 200,
      maxSlots: 250,
      priceInCents: 45900,
      currency: 'EUR',
      metadata: {
        flightNumber: 'AF001',
        origin: 'CDG',
        destination: 'JFK',
        departureTime: '2026-02-20T14:00:00Z',
        arrivalTime: '2026-02-20T17:30:00Z',
        airline: 'Air France',
      },
    },
    {
      name: 'Vol Paris-Tokyo AF275',
      description: 'Vol long-courrier Paris CDG vers Tokyo Narita',
      type: 'FLIGHT',
      availableSlots: 180,
      maxSlots: 220,
      priceInCents: 78900,
      currency: 'EUR',
      metadata: {
        flightNumber: 'AF275',
        origin: 'CDG',
        destination: 'NRT',
        departureTime: '2026-03-01T11:45:00Z',
        arrivalTime: '2026-03-02T07:15:00Z',
        airline: 'Air France',
      },
    },
    {
      name: 'Vol Paris-Barcelone VY8001',
      description: 'Vol low-cost Paris Orly vers Barcelone El Prat',
      type: 'FLIGHT',
      availableSlots: 120,
      maxSlots: 150,
      priceInCents: 5900,
      currency: 'EUR',
      metadata: {
        flightNumber: 'VY8001',
        origin: 'ORY',
        destination: 'BCN',
        departureTime: '2026-02-18T07:30:00Z',
        arrivalTime: '2026-02-18T09:15:00Z',
        airline: 'Vueling',
      },
    },
    {
      name: 'Vol Paris-Rome AF1404',
      description: 'Vol direct Paris CDG vers Rome Fiumicino',
      type: 'FLIGHT',
      availableSlots: 140,
      maxSlots: 170,
      priceInCents: 15900,
      currency: 'EUR',
      metadata: {
        flightNumber: 'AF1404',
        origin: 'CDG',
        destination: 'FCO',
        departureTime: '2026-02-22T09:00:00Z',
        arrivalTime: '2026-02-22T11:15:00Z',
        airline: 'Air France',
      },
    },
    {
      name: 'Vol Paris-Dubai EK073',
      description: 'Vol Paris CDG vers Dubai International',
      type: 'FLIGHT',
      availableSlots: 220,
      maxSlots: 260,
      priceInCents: 52900,
      currency: 'EUR',
      metadata: {
        flightNumber: 'EK073',
        origin: 'CDG',
        destination: 'DXB',
        departureTime: '2026-03-05T13:30:00Z',
        arrivalTime: '2026-03-05T23:00:00Z',
        airline: 'Emirates',
      },
    },
    {
      name: 'Vol Paris-Montréal AC870',
      description: 'Vol transatlantique Paris CDG vers Montréal Trudeau',
      type: 'FLIGHT',
      availableSlots: 160,
      maxSlots: 200,
      priceInCents: 42900,
      currency: 'EUR',
      metadata: {
        flightNumber: 'AC870',
        origin: 'CDG',
        destination: 'YUL',
        departureTime: '2026-02-25T12:00:00Z',
        arrivalTime: '2026-02-25T14:15:00Z',
        airline: 'Air Canada',
      },
    },
    {
      name: 'Vol Paris-Lisbonne TP440',
      description: 'Vol direct Paris CDG vers Lisbonne Portela',
      type: 'FLIGHT',
      availableSlots: 110,
      maxSlots: 140,
      priceInCents: 11900,
      currency: 'EUR',
      metadata: {
        flightNumber: 'TP440',
        origin: 'CDG',
        destination: 'LIS',
        departureTime: '2026-02-28T08:30:00Z',
        arrivalTime: '2026-02-28T10:45:00Z',
        airline: 'TAP Air Portugal',
      },
    },
    {
      name: 'Vol Paris-Berlin AF1234',
      description: 'Vol direct Paris CDG vers Berlin Brandenburg',
      type: 'FLIGHT',
      availableSlots: 130,
      maxSlots: 160,
      priceInCents: 13900,
      currency: 'EUR',
      metadata: {
        flightNumber: 'AF1234',
        origin: 'CDG',
        destination: 'BER',
        departureTime: '2026-03-10T10:15:00Z',
        arrivalTime: '2026-03-10T12:30:00Z',
        airline: 'Air France',
      },
    },
    {
      name: 'Vol Paris-Singapour SQ336',
      description: 'Vol long-courrier Paris CDG vers Singapour Changi',
      type: 'FLIGHT',
      availableSlots: 190,
      maxSlots: 230,
      priceInCents: 82900,
      currency: 'EUR',
      metadata: {
        flightNumber: 'SQ336',
        origin: 'CDG',
        destination: 'SIN',
        departureTime: '2026-03-12T23:30:00Z',
        arrivalTime: '2026-03-13T18:00:00Z',
        airline: 'Singapore Airlines',
      },
    },
  ];

  console.log('✈️  Creating flights...');

  for (const flight of flights) {
    const created = await prisma.resource.upsert({
      where: { id: `flight_${flight.metadata.flightNumber}` },
      update: {},
      create: {
        id: `flight_${flight.metadata.flightNumber}`,
        ...flight,
      },
    });
    console.log(`  ✅ ${created.name}`);
  }

  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
