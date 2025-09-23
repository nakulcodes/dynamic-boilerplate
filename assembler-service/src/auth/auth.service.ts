import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserRepository, CreateUserDto } from '@db/repositories/user.repository';
import { User } from '@db/entities/user.entity';

export interface JwtPayload {
  sub: number;
  email: string;
  firstName: string;
  lastName: string;
}

export interface AuthResult {
  user: User;
  token: string;
}

@Injectable()
export class AuthService {
  constructor(
    private userRepository: UserRepository,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateOAuthUser(userData: CreateUserDto): Promise<User> {
    return this.userRepository.findOrCreateUser(userData);
  }

  async generateJwtToken(user: User): Promise<string> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    return this.jwtService.sign(payload);
  }

  async login(user: User): Promise<AuthResult> {
    const token = await this.generateJwtToken(user);

    return {
      user,
      token,
    };
  }

  async validateJwtPayload(payload: JwtPayload): Promise<User | null> {
    return this.userRepository.findOne({ where: { id: payload.sub } });
  }
}