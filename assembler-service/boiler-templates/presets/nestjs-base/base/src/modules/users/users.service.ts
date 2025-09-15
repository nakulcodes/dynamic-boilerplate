import { Injectable } from '@nestjs/common';
import { User } from '@db/entities/user.entity';
import { UserRepository } from '@db/repositories/user.repository';

export interface CreateUserDto {
  username: string;
  email: string;
  password: string;
}

@Injectable()
export class UsersService {
  constructor(
    private readonly userRepository: UserRepository,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    return this.userRepository.createUser(createUserDto);
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.findAll();
  }

  async findOne(id: number): Promise<User | null> {
    return this.userRepository.findById(id);
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.userRepository.findByUsername(username);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email);
  }

  async remove(id: number): Promise<boolean> {
    return this.userRepository.deleteUser(id);
  }
}