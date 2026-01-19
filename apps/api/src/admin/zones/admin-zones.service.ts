import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateDeliveryZoneDto } from './dto/create-delivery-zone.dto';
import { UpdateDeliveryZoneDto } from './dto/update-delivery-zone.dto';

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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const code = dto.code.trim().toUpperCase();
    const name = dto.name.trim();

    if (!code) throw new BadRequestException('Code cannot be empty');
    if (!name) throw new BadRequestException('Name cannot be empty');

    try {
      return await this.prisma.deliveryZone.create({
        data: {
          code,
          name,
          active: dto.active ?? true,
        },
      });
    } catch (e: any) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (e?.code === 'P2002') {
        throw new BadRequestException(
          `Delivery zone with code '${code}' already exists.`,
        );
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

    const data: any = {};
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (dto.name !== undefined) data.name = dto.name.trim();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (dto.active !== undefined) data.active = dto.active;

    if (dto.code !== undefined) {
      const code = dto.code.trim().toUpperCase();
      if (!code) throw new BadRequestException('Code cannot be empty');
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      data.code = code;
    }

    try {
      return await this.prisma.deliveryZone.update({
        where: { id },
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        data,
      });
    } catch (e: any) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (e?.code === 'P2002') {
        throw new BadRequestException(
          `Delivery zone with code '${dto.code}' already exists.`,
        );
      }
      throw e;
    }
  }
}
