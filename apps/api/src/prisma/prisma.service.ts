/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error(
        'DATABASE_URL is not set (load your .env before Nest starts)',
      );
    }

    // Optional: quick sanity check that password exists in the URL
    // (prevents the SCRAM "password must be a string" confusion)
    if (/^postgres(ql)?:\/\/[^:@/]+@/.test(url)) {
      throw new Error(
        'DATABASE_URL has no password (expected user:password@host)',
      );
    }

    const pool = new Pool({ connectionString: url });
    super({ adapter: new PrismaPg(pool) });
  }
}
