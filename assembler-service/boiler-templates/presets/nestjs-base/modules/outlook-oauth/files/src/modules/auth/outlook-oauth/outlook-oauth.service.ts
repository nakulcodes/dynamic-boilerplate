import { Injectable } from '@nestjs/common';
import { UsersService } from '@modules/users/users.service';

interface MicrosoftUser {
  email: string;
  firstName: string;
  lastName: string;
  picture?: string;
  accessToken: string;
  provider: string;
}

@Injectable()
export class OutlookOAuthService {
  constructor(private usersService: UsersService) {}

  async validateOAuthUser(microsoftUser: MicrosoftUser): Promise<any> {
    const { email, firstName, lastName, picture } = microsoftUser;

    // Check if user exists
    let user = await this.usersService.findByEmail(email);

    if (!user) {
      // Create new user if doesn't exist
      user = await this.usersService.create({
        email,
        username: email.split('@')[0],
        firstName,
        lastName,
        picture,
        isEmailVerified: true, // Microsoft emails are pre-verified
        provider: 'microsoft',
      });
    } else {
      // Update user with Microsoft info if exists
      user = await this.usersService.update(user.id, {
        provider: 'microsoft',
        picture: picture || user.picture,
        isEmailVerified: true,
      });
    }

    return user;
  }
}