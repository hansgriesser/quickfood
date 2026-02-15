import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { User, Prisma } from '../../generated/prisma/client';
import { AuthService } from 'src/auth/auth.service';

const PRISMA_ERROR_UNIQUE_CONSTRAINT = 'P2002';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
  ) {}

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({
      data,
    });
  }

  async findAll() {
    return await this.prisma.user.findMany();
  }

  findOne(id: number) {
    return this.prisma.user.findUnique({ where: { id: id } });
  }

  findByUsername(username: string) {
    return this.prisma.user.findUnique({ where: { username: username } });
  }

  getFull(id: number) {
    return this.prisma.user.findUnique({
      where: { id: id },
      select: {
        username: true,
        id: true,
        createdAt: true,
        role: true,
        isSuspended: true,
        suspendedUntil: true,
      },
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    let passwordHash = '';
    if (updateUserDto.password) {
      passwordHash = await this.authService.hashPassword(
        updateUserDto.password,
      );
    }

    if (updateUserDto.username) {
      const existing = await this.findByUsername(updateUserDto.username);
      if (existing && existing.id !== id) {
        throw new ConflictException('Username existiert bereits');
      }
    }

    try {
      const updated = await this.prisma.user.update({
        where: { id: id },
        data: {
          username: updateUserDto.username,
          ...(passwordHash && { password: passwordHash }),
        },
        select: {
          id: true,
          username: true,
          role: true,
          createdAt: true,
          isSuspended: true,
        },
      });
      return updated;
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === PRISMA_ERROR_UNIQUE_CONSTRAINT) {
          throw new ConflictException('Benutzername existiert bereits');
        }
      } else if (e instanceof Prisma.PrismaClientValidationError) {
        throw new BadRequestException('Ungültige Daten');
      }
      throw new InternalServerErrorException('Update fehlgeschlagen');
    }
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
