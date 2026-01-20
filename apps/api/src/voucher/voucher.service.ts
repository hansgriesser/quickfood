import { Injectable } from '@nestjs/common';
import { VoucherDto } from './voucher.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class VoucherService {
  constructor(private readonly prismaClient: PrismaService) {}
  async validateVoucher(id: string): Promise<VoucherDto | null> {
    const voucher = await this.prismaClient.voucher.findUnique({
      where: { code: id },
    });

    if (!voucher) return null;

    // Mapping auf DTO
    return {
      code: voucher.code,
      type: voucher.type,
      amount: Number(voucher.value), // Prisma kann BigInt zurückgeben
      validFrom: voucher.validFrom?.toISOString() ?? null,
      validTo: voucher.validTo?.toISOString() ?? null,
      active: voucher.active,
    };
  }
}
