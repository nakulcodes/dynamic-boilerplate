import { Injectable } from '@nestjs/common';
import { UsersService } from '../../users/users.service';

export interface GoogleUser {
  email: string;
  firstName: string;
  lastName: string;
  picture: string;
  accessToken: string;
}

@Injectable()
export class GoogleOAuthService {
  constructor(private usersService: UsersService) {}

  async validateOAuthUser(googleUser: GoogleUser) {
    // Check if user exists
    let user = await this.usersService.findByEmail(googleUser.email);

    if (!user) {
      // Create new user if doesn't exist
      user = await this.usersService.create({
        username: googleUser.email.split('@')[0],
        email: googleUser.email,
        password: '', // OAuth users don't need passwords
      });
    }

    return user;
  }

  async linkGoogleAccount(userId: number, googleUser: GoogleUser) {
    // In a real implementation, you'd store the Google user data
    // in a separate table linked to the user
    return {
      userId,
      googleEmail: googleUser.email,
      linked: true,
    };
  }
}