import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { User } from '../entities/user.entity';

export interface CreateUserDto {
  email: string;
  googleId: string;
  firstName: string;
  lastName: string;
  picture?: string;
}

@Injectable()
export class UserRepository extends Repository<User> {
  constructor(private readonly dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.findOne({ where: { email } });
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    return this.findOne({ where: { googleId } });
  }

  async createUser(userData: CreateUserDto): Promise<User> {
    const user = this.create(userData);
    return this.save(user);
  }

  async findOrCreateUser(userData: CreateUserDto): Promise<User> {
    // First try to find by Google ID
    let user = await this.findByGoogleId(userData.googleId);

    if (user) {
      // Update user data if needed
      user.firstName = userData.firstName;
      user.lastName = userData.lastName;
      user.picture = userData.picture;
      return this.save(user);
    }

    // Then try to find by email (in case they signed up differently before)
    user = await this.findByEmail(userData.email);

    if (user) {
      // Link Google ID to existing account
      user.googleId = userData.googleId;
      user.firstName = userData.firstName;
      user.lastName = userData.lastName;
      user.picture = userData.picture;
      return this.save(user);
    }

    // Create new user
    return this.createUser(userData);
  }
}