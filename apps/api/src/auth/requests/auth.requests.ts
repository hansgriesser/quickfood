import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class JwtPayload {
  @IsNumber()
  @IsNotEmpty()
  sub!: number;
  @IsString()
  @IsNotEmpty()
  username!: string;
  @IsString()
  @IsNotEmpty()
  role!: string;
}
export class AuthenticatedRequest extends Request {
  @IsNotEmpty()
  @IsEnum(JwtPayload)
  user!: JwtPayload;
}
