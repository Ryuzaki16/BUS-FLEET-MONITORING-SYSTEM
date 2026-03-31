import { busAPI, lostItemAPI, routeAPI } from './api';

export const seedDatabase = async () => {
  try {
    console.log('Seeding database...');

    // Seed buses
    const buses = [
      {
        id: 'bus1',
        plateNumber: 'ABC 1234',
        driver: 'Juan Dela Cruz',
        route: 'Dasmariñas - Alabang',
        status: 'active',
        currentPassengers: 0,
        maxCapacity: 18,
        location: {
          lat: 14.5995,
          lng: 120.9842,
          lastUpdated: new Date().toISOString(),
        },
        qrCodeId: 'QR-ABC1234-F8E9D2',
      },
      {
        id: 'bus2',
        plateNumber: 'XYZ 5678',
        driver: 'Maria Santos',
        route: 'Dasmariñas - Alabang',
        status: 'active',
        currentPassengers: 0,
        maxCapacity: 18,
        location: {
          lat: 14.6042,
          lng: 120.9822,
          lastUpdated: new Date().toISOString(),
        },
        qrCodeId: 'QR-XYZ5678-A3B7C1',
      },
      {
        id: 'bus3',
        plateNumber: 'DEF 9012',
        driver: 'Pedro Reyes',
        route: 'City Center - Barangay Hall',
        status: 'idle',
        currentPassengers: 0,
        maxCapacity: 18,
        location: {
          lat: 14.5935,
          lng: 120.9862,
          lastUpdated: new Date().toISOString(),
        },
        qrCodeId: 'QR-DEF9012-D4E6F8',
      },
      {
        id: 'bus4',
        plateNumber: 'GHI 3456',
        driver: 'Ana Cruz',
        route: 'Market - Terminal',
        status: 'maintenance',
        currentPassengers: 0,
        maxCapacity: 18,
        location: {
          lat: 14.5895,
          lng: 120.9802,
          lastUpdated: new Date().toISOString(),
        },
        qrCodeId: 'QR-GHI3456-B2C9E5',
      },
    ];

    for (const bus of buses) {
      await busAPI.create(bus);
    }
    console.log('Buses seeded');

    // Seed routes
    const routes = [
      {
        id: 'route1',
        name: 'Route 1: Dasmariñas - Alabang',
        origin: 'Dasmarias Terminal',
        destination: 'Alabang Terminal',
        stops: [
          'Dasmarias Terminal',
          'SM City Dasmariñas',
          'Aguinaldo Highway',
          'Salitran',
          'Zapote Junction',
          'Alabang Town Center',
          'Alabang Terminal',
        ],
        baseFare: 15,
        estimatedDuration: 45,
      },
      {
        id: 'route2',
        name: 'Route 2: Market - Terminal',
        origin: 'Public Market',
        destination: 'Transport Terminal',
        stops: ['Public Market', 'Church Plaza', 'City Hall', 'Main Street', 'Transport Terminal'],
        baseFare: 15,
        estimatedDuration: 30,
      },
      {
        id: 'route3',
        name: 'Route 3: City Center - Barangay Hall',
        origin: 'City Center Terminal',
        destination: 'Barangay Hall',
        stops: ['City Center Terminal', 'Main Street', 'Market Area', 'Church Plaza', 'School Zone', 'Barangay Hall'],
        baseFare: 15,
        estimatedDuration: 45,
      },
    ];

    for (const route of routes) {
      await routeAPI.create(route);
    }
    console.log('Routes seeded');

    // Seed lost items
    const lostItems = [
      {
        id: 'lf1',
        itemName: 'Samsung Galaxy Phone',
        description: 'Black Samsung phone with cracked screen protector, blue case',
        category: 'electronics',
        dateFound: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
        busPlateNumber: 'ABC 1234',
        route: 'Dasmariñas - Alabang',
        foundBy: 'Juan Dela Cruz',
        status: 'unclaimed',
        location: 'Under seat near the back door',
      },
      {
        id: 'lf2',
        itemName: 'Black Backpack',
        description: 'Black Jansport backpack with school books and notebook inside',
        category: 'bag',
        dateFound: new Date(Date.now() - 86400000 * 5).toISOString(), // 5 days ago
        busPlateNumber: 'XYZ 5678',
        route: 'Dasmariñas - Alabang',
        foundBy: 'Maria Santos',
        status: 'unclaimed',
        location: 'Left on passenger seat',
      },
      {
        id: 'lf3',
        itemName: 'Blue Umbrella',
        description: 'Foldable blue umbrella with floral pattern',
        category: 'accessories',
        dateFound: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        busPlateNumber: 'ABC 1234',
        route: 'Dasmariñas - Alabang',
        foundBy: 'Juan Dela Cruz',
        status: 'unclaimed',
        location: 'Near the entrance',
      },
      {
        id: 'lf4',
        itemName: 'Brown Wallet',
        description: 'Brown leather wallet with ID cards (name withheld for security)',
        category: 'accessories',
        dateFound: new Date(Date.now() - 86400000 * 3).toISOString(), // 3 days ago
        busPlateNumber: 'DEF 9012',
        route: 'City Center - Barangay Hall',
        foundBy: 'Pedro Reyes',
        status: 'claimed',
        claimedBy: 'Owner verified via ID',
        claimedDate: new Date(Date.now() - 86400000).toISOString(),
        location: 'Between seats',
      },
    ];

    for (const item of lostItems) {
      await lostItemAPI.create(item);
    }
    console.log('Lost items seeded');

    console.log('Database seeded successfully!');
    return true;
  } catch (error) {
    console.error('Error seeding database:', error);
    return false;
  }
};
