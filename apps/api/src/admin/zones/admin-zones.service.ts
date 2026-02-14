import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateDeliveryZoneDto } from './dto/create-delivery-zone.dto';
import { UpdateDeliveryZoneDto } from './dto/update-delivery-zone.dto';
import { Prisma } from '@generated/prisma/client';
import { DeliveryZoneUpdateInput } from '@generated/prisma/models';

const PRISMA_ERROR_UNIQUE_CONSTRAINT_VIOLATION = 'P2002';

@Injectable()
export class AdmiZonesService {
  constructor(private readonly prisma: PrismaService) {}

  list(active?: boolean) {
    return this.prisma.deliveryZone.findMany({
      where: active === undefined ? undefined : { active },
      orderBy: [{ active: 'desc' }, { code: 'asc' }],
    });
  }

  async create(dto: CreateDeliveryZoneDto) {
    const code = dto.code.trim().toUpperCase();
    const name = dto.name.trim();

    const min = Number(dto.typicalDeliveryMin);
    const max = Number(dto.typicalDeliveryMax);

    if (!code) throw new BadRequestException('Code cannot be empty');
    if (!name) throw new BadRequestException('Name cannot be empty');

    if (!Number.isFinite(min) || !Number.isFinite(max)) {
      throw new BadRequestException('typicalDeliveryMin/Max must be numbers');
    }

    if (min <= 0 || max <= 0 || min > max) {
      throw new BadRequestException(
        'typicalDeliveryMin must be <= typicalDeliveryMax and both > 0',
      );
    }

    try {
      return await this.prisma.deliveryZone.create({
        data: {
          code,
          name,
          active: dto.active ?? true,
          typicalDeliveryMin: min,
          typicalDeliveryMax: max,
        },
      });
    } catch (e: any) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e?.code === PRISMA_ERROR_UNIQUE_CONSTRAINT_VIOLATION) {
          throw new BadRequestException(
            `Delivery zone with code '${code}' already exists.`,
          );
        }
      }
      throw e;
    }
  }

  async update(id: string, dto: UpdateDeliveryZoneDto) {
    const existing = await this.prisma.deliveryZone.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException('Delivery zone not found');
    }

    const data: DeliveryZoneUpdateInput = {};

    if (dto.name !== undefined) data.name = dto.name.trim();
    if (dto.active !== undefined) data.active = dto.active;

    if (dto.code !== undefined) {
      const code = dto.code.trim().toUpperCase();
      if (!code) throw new BadRequestException('Code cannot be empty');
      data.code = code;
    }

    const min =
      dto.typicalDeliveryMin !== undefined
        ? Number(dto.typicalDeliveryMin)
        : existing.typicalDeliveryMin;

    const max =
      dto.typicalDeliveryMax !== undefined
        ? Number(dto.typicalDeliveryMax)
        : existing.typicalDeliveryMax;

    if (!Number.isFinite(min) || !Number.isFinite(max)) {
      throw new BadRequestException('typicalDeliveryMin/Max must be numbers');
    }

    if (min <= 0 || max <= 0 || min > max) {
      throw new BadRequestException(
        'typicalDeliveryMin must be <= typicalDeliveryMax and both > 0',
      );
    }

    if (dto.typicalDeliveryMin !== undefined) data.typicalDeliveryMin = min;
    if (dto.typicalDeliveryMax !== undefined) data.typicalDeliveryMax = max;

    try {
      return await this.prisma.deliveryZone.update({
        where: { id },
        data,
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e?.code === PRISMA_ERROR_UNIQUE_CONSTRAINT_VIOLATION) {
          throw new BadRequestException(
            `Delivery zone with code '${dto.code}' already exists.`,
          );
        }
      }
      throw e;
    }
  }
}
