import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { User, Prisma } from '../../generated/prisma/client';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.UserCreateInput) : Promise<User> {
    return this.prisma.user.create({
      data,
    });
  }

  async findAll() {
    return await this.prisma.user.findMany();
  }

  findOne(id: number) {
    return this.prisma.user.findUnique({ where: { id:id }, });
  }

  findByUsername(username: string) {
    return this.prisma.user.findUnique({ where: { username:username }, });
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
