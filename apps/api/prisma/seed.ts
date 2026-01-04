import { config } from 'dotenv';
config({ path: 'apps/api/.env' }); // <-- adjust if your env file is elsewhere

import {
  PrismaClient,
  Restaurant,
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
