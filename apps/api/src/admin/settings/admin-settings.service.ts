import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateServiceFeeDto } from './dto/update-service-fee.dto';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { UpdateVoucherDto } from './dto/update-voucher.dto';
import { Prisma } from '@generated/prisma/client';
import { VoucherUpdateInput } from '@generated/prisma/models';

const SERVICE_FEE_KEY = 'SERVICE_FEE_PERCENT';
const PRISMA_ERROR_UNIQUE_CONSTRAINT = 'P2002';

@Injectable()
export class AdminSettingService {
  constructor(private readonly prisma: PrismaService) {}

  //SERVICE FEE

  async getServiceFee() {
    const row = await this.prisma.platformSetting.findUnique({
      where: { key: SERVICE_FEE_KEY },
    });

    const percent = row ? Number(row.value) : 0;

    return {
      key: SERVICE_FEE_KEY,
      percent: Number.isFinite(percent) ? percent : 0,
    };
  }

  async updateServiceFee(dto: UpdateServiceFeeDto) {
    const percent = Number(dto.percent);

    if (!Number.isFinite(percent) || percent < 0 || percent > 100) {
      throw new BadRequestException(
        'percent must be a number between 0 and 100',
      );
    }

    return this.prisma.platformSetting.upsert({
      where: { key: SERVICE_FEE_KEY },
      update: { value: String(percent) },
      create: { key: SERVICE_FEE_KEY, value: String(percent) },
    });
  }

  //VOUCHERS

  async listVouchers() {
    return this.prisma.voucher.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async createVoucher(dto: CreateVoucherDto) {
    const code = dto.code?.trim().toUpperCase();
    if (!code) throw new BadRequestException('code cannot be empty');

    const value = Number(dto.value);
    if (!Number.isFinite(value) || value <= 0) {
      throw new BadRequestException('value must be a positive number');
    }

    if (dto.type === 'PERCENT' && value > 100) {
      throw new BadRequestException('PERCENT voucher value cannot exceed 100');
    }

    const usageLimit =
      dto.usageLimit === undefined ? undefined : Number(dto.usageLimit);

    if (
      usageLimit !== undefined &&
      (!Number.isFinite(usageLimit) || usageLimit <= 0)
    ) {
      throw new BadRequestException('usageLimit must be a positive number');
    }

    const validFrom = dto.validFrom ? new Date(dto.validFrom) : undefined;
    const validTo = dto.validTo ? new Date(dto.validTo) : undefined;

    if (
      (validFrom && Number.isNaN(validFrom.getTime())) ||
      (validTo && Number.isNaN(validTo.getTime()))
    ) {
      throw new BadRequestException(
        'validFrom and validTo must be a valid ISO date string',
      );
    }

    if (validFrom && validTo && validFrom > validTo) {
      throw new BadRequestException('validFrom must be <= validTo');
    }

    try {
      return await this.prisma.voucher.create({
        data: {
          code,
          type: dto.type,
          value: Math.trunc(value),
          active: dto.active ?? true,
          validFrom,
          validTo,
          usageLimit,
        },
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e?.code === PRISMA_ERROR_UNIQUE_CONSTRAINT) {
          throw new BadRequestException(
            `Voucher code '${code}' already exists`,
          );
        }
      }
      throw e;
    }
  }

  async updateVoucher(id: string, dto: UpdateVoucherDto) {
    const existing = await this.prisma.voucher.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('voucher not found');

    const data: VoucherUpdateInput = {};

    if (dto.code !== undefined) {
      const code = dto.code.trim().toUpperCase();
      if (!code) throw new BadRequestException('code cannot be empty');
      data.code = code;
    }

    if (dto.type !== undefined) data.type = dto.type;

    if (dto.value !== undefined) {
      const value = Number(dto.value);
      if (!Number.isFinite(value) || value <= 0) {
        throw new BadRequestException('value must be a positive number');
      }
      if ((dto.type ?? existing.type) === 'PERCENT' && value > 100) {
        throw new BadRequestException(
          'PERCENT voucher value cannot exceed 100',
        );
      }
      data.value = Math.trunc(value);
    }

    // set active only when provided in DTO
    if (dto.active !== undefined) data.active = dto.active;

    if (dto.usageLimit !== undefined) {
      const usageLimit = Number(dto.usageLimit);
      if (!Number.isFinite(usageLimit) || usageLimit <= 0) {
        throw new BadRequestException('usageLimit must be a positive number');
      }

      data.usageLimit = Math.trunc(usageLimit);
    }

    if (dto.validFrom !== undefined) {
      const d = dto.validFrom ? new Date(dto.validFrom) : null;
      if (d && Number.isNaN(d.getTime())) {
        throw new BadRequestException(
          'validFrom must be a valid ISO date string',
        );
      }

      data.validFrom = d;
    }

    const nextValidFrom =
      data.validFrom === undefined ? existing.validFrom : data.validFrom;

    const nextValidTo =
      data.validTo === undefined ? existing.validTo : data.validTo;

    if (nextValidFrom && nextValidTo && nextValidFrom > nextValidTo) {
      throw new BadRequestException('validFrom must be <= validTo');
    }

    try {
      return await this.prisma.voucher.update({
        where: { id },
        data,
      });
    } catch (e: any) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e?.code === PRISMA_ERROR_UNIQUE_CONSTRAINT) {
          throw new BadRequestException(
            `Voucher code '${dto.code}' already exists`,
          );
        }
      }
      throw e;
    }
  }
}
