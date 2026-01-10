/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { config } from 'dotenv';
import { join } from 'path';
config({ path: join(process.cwd(), '.env') }); // Load .env from the api folder

import {
  PrismaClient,
  RestaurantStatus,
  Role,
  VoucherType,
} from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
console.log(
  'DATABASE_URL:',
  process.env.DATABASE_URL?.replace(/\/\/.*?:.*?@/, '//***:***@'),
);

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  // 1) Users
  const admin = await prisma.user.upsert({
    where: { username: 'alice' },
    update: { role: Role.ADMIN },
    create: {
      username: 'alice',
      password: 'changeme-alice', // TODO: hash later
      role: Role.ADMIN,
    },
  });

  const owner = await prisma.user.upsert({
    where: { username: 'bob' },
    update: { role: Role.OWNER },
    create: {
      username: 'bob',
      password: 'changeme-bob',
      role: Role.OWNER,
    },
  });

  // optional: normal user
  await prisma.user.upsert({
    where: { username: 'charlie' },
    update: { role: Role.USER },
    create: {
      username: 'charlie',
      password: 'changeme-charlie',
      role: Role.USER,
    },
  });

  // 2) Restaurants (1 pending, 1 active)
  // We can't upsert by name unless name is unique. So we "findFirst" then create if missing.
  const pendingName = 'Bob Burger - Pending';
  const activeName = 'Bob Burger - Active';

  const pendingRestaurant =
    (await prisma.restaurant.findFirst({ where: { name: pendingName } })) ??
    (await prisma.restaurant.create({
      data: {
        name: pendingName,
        ownerId: owner.id,
        status: RestaurantStatus.PENDING,
      },
    }));

  const activeRestaurant =
    (await prisma.restaurant.findFirst({ where: { name: activeName } })) ??
    (await prisma.restaurant.create({
      data: {
        name: activeName,
        ownerId: owner.id,
        status: RestaurantStatus.ACTIVE,
        approvedAt: new Date(),
        decisionById: admin.id,
      },
    }));

  const mockRestaurants = [
    { name: 'Caf\u00e9 Latte', category: 'italian', rating: 4.5 },
    { name: 'Espresso Bar', category: 'fast-food', rating: 4.2 },
    { name: 'Kaffee K\u00f6nig', category: 'fast-food', rating: 3.8 },
    { name: 'Sushi Palace', category: 'asian', rating: 4.7 },
    { name: 'Taco Fiesta', category: 'mexican', rating: 4.1 },
    { name: 'Sushi World', category: 'japan', rating: 4.8 },
    { name: 'Pasta Haus', category: 'italian', rating: 4.5 },
  ];

  for (const restaurant of mockRestaurants) {
    const existing = await prisma.restaurant.findFirst({
      where: { name: restaurant.name },
    });

    if (!existing) {
      await prisma.restaurant.create({
        data: {
          name: restaurant.name,
          category: restaurant.category,
          rating: restaurant.rating,
          ownerId: owner.id,
          status: RestaurantStatus.ACTIVE,
          approvedAt: new Date(),
          decisionById: admin.id,
        },
      });
    }
  }

  // 3) Delivery zones
  const zoneA = await prisma.deliveryZone.upsert({
    where: { code: 'ZONE_A' },
    update: { name: 'Zone A', active: true },
    create: { code: 'ZONE_A', name: 'Zone A', active: true },
  });

  const zoneB = await prisma.deliveryZone.upsert({
    where: { code: 'ZONE_B' },
    update: { name: 'Zone B', active: true },
    create: { code: 'ZONE_B', name: 'Zone B', active: true },
  });

  // 4) Link zones to restaurants (M:N via join table)
  // We use upsert-like behaviour by creating only if not exists (composite key).
  await prisma.restaurantDeliveryZone.upsert({
    where: {
      restaurantId_zoneId: {
        restaurantId: pendingRestaurant.id,
        zoneId: zoneA.id,
      },
    },
    update: {},
    create: { restaurantId: pendingRestaurant.id, zoneId: zoneA.id },
  });

  await prisma.restaurantDeliveryZone.upsert({
    where: {
      restaurantId_zoneId: {
        restaurantId: activeRestaurant.id,
        zoneId: zoneA.id,
      },
    },
    update: {},
    create: { restaurantId: activeRestaurant.id, zoneId: zoneA.id },
  });

  await prisma.restaurantDeliveryZone.upsert({
    where: {
      restaurantId_zoneId: {
        restaurantId: activeRestaurant.id,
        zoneId: zoneB.id,
      },
    },
    update: {},
    create: { restaurantId: activeRestaurant.id, zoneId: zoneB.id },
  });

  // 5) Platform settings (service fee, etc.)
  await prisma.platformSetting.upsert({
    where: { key: 'SERVICE_FEE_PERCENT' },
    update: { value: '10' },
    create: { key: 'SERVICE_FEE_PERCENT', value: '10' },
  });

  // 6) Vouchers
  await prisma.voucher.upsert({
    where: { code: 'WELCOME5' },
    update: { active: true, type: VoucherType.PERCENT, value: 5 },
    create: {
      code: 'WELCOME5',
      active: true,
      type: VoucherType.PERCENT,
      value: 5,
    },
  });

  await prisma.voucher.upsert({
    where: { code: 'SAVE200' },
    update: { active: true, type: VoucherType.FIXED, value: 200 },
    create: {
      code: 'SAVE200',
      active: true,
      type: VoucherType.FIXED,
      value: 200,
    },
  });

  const restaurantIds = [
    'ba0cac90-9aa9-48d8-bf1e-77c788f5367c',
    '55413e9a-3bd5-41cb-b594-fd6d22c2e5c1',
  ];

  // MenuCategories
  const categoriesData = [
    // Kategorien für erstes Restaurant
    { name: 'Vorspeisen', sortOrder: 1, restaurantId: restaurantIds[0] },
    { name: 'Hauptgerichte', sortOrder: 2, restaurantId: restaurantIds[0] },
    { name: 'Salate', sortOrder: 3, restaurantId: restaurantIds[0] },
    { name: 'Desserts', sortOrder: 4, restaurantId: restaurantIds[0] },

    // Kategorien für zweites Restaurant
    { name: 'Vorspeisen', sortOrder: 1, restaurantId: restaurantIds[1] },
    { name: 'Hauptgerichte', sortOrder: 2, restaurantId: restaurantIds[1] },
    { name: 'Salate', sortOrder: 3, restaurantId: restaurantIds[1] },
    { name: 'Desserts', sortOrder: 4, restaurantId: restaurantIds[1] },
  ];

  // Kategorien in DB einfügen
  for (const restaurantId of restaurantIds) {
    for (const category of categoriesData) {
      await prisma.menuCategory.upsert({
        where: {
          restaurantId_name: {
            restaurantId,
            name: category.name,
          },
        },
        update: {
          sortOrder: category.sortOrder,
        },
        create: {
          restaurantId,
          name: category.name,
          sortOrder: category.sortOrder,
        },
      });
    }
  }
  const categories = await prisma.menuCategory.findMany();

  // Hilfsfunktion: Kategorie nach Name und RestaurantId finden
  const getCategoryId = (restaurantId: string, name: string) => {
    return categories.find(
      (c) => c.restaurantId === restaurantId && c.name === name,
    )?.id;
  };

  // Dishes
  const dishes = [
    {
      name: 'Margherita Pizza',
      description:
        'Klassische Pizza mit Tomatensauce, Mozzarella und Basilikum',
      price: BigInt(899),
      restaurantId: restaurantIds[0],
      categoryId: getCategoryId(restaurantIds[0], 'Hauptgerichte'),
      pictureUrl: 'https://example.com/margherita.jpg',
    },
    {
      name: 'Spaghetti Carbonara',
      description: 'Spaghetti mit cremiger Sauce, Speck und Parmesan',
      price: BigInt(1299),
      restaurantId: restaurantIds[0],
      categoryId: getCategoryId(restaurantIds[0], 'Hauptgerichte'),
      pictureUrl: 'https://example.com/carbonara.jpg',
    },
    {
      name: 'Caesar Salad',
      description: 'Frischer Salat mit Hähnchen, Croutons und Caesar-Dressing',
      price: BigInt(799),
      restaurantId: restaurantIds[1],
      categoryId: getCategoryId(restaurantIds[1], 'Salate'),
      pictureUrl: 'https://example.com/caesar.jpg',
    },
    {
      name: 'Cheeseburger',
      description: 'Saftiger Burger mit Käse, Salat, Tomate und Zwiebeln',
      price: BigInt(1099),
      restaurantId: restaurantIds[1],
      categoryId: getCategoryId(restaurantIds[1], 'Hauptgerichte'),
      pictureUrl: 'https://example.com/cheeseburger.jpg',
    },
    {
      name: 'Sushi Platte',
      description: 'Gemischte Sushi Platte mit Lachs, Thunfisch und Avocado',
      price: BigInt(1599),
      restaurantId: restaurantIds[0],
      categoryId: getCategoryId(restaurantIds[0], 'Hauptgerichte'),
      pictureUrl: 'https://example.com/sushi.jpg',
    },
  ];

  for (const restaurantId of restaurantIds) {
    await prisma.dish.deleteMany({
      where: { restaurantId },
    });
  }

  for (const dish of dishes) {
    await prisma.dish.create({
      data: dish,
    });
  }

  console.log('Seed done:', {
    admin: { id: admin.id, username: admin.username },
    owner: { id: owner.id, username: owner.username },
    pendingRestaurant: {
      id: pendingRestaurant.id,
      status: pendingRestaurant.status,
    },
    activeRestaurant: {
      id: activeRestaurant.id,
      status: activeRestaurant.status,
    },
    zones: [zoneA.code, zoneB.code],
  });
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
