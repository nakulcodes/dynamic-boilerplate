import { Injectable } from '@nestjs/common';
import { UsersService } from '@modules/users/users.service';

interface GitHubUser {
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  picture?: string;
  accessToken: string;
  provider: string;
}

@Injectable()
export class GitHubOAuthService {
  constructor(private usersService: UsersService) {}

  async validateOAuthUser(githubUser: GitHubUser): Promise<any> {
    const { email, username, firstName, lastName, picture } = githubUser;

    // Check if user exists
    let user = await this.usersService.findByEmail(email);

    if (!user) {
      // Create new user if doesn't exist
      user = await this.usersService.create({
        email,
        username: username || email.split('@')[0],
        firstName,
        lastName,
        picture,
        isEmailVerified: true, // GitHub emails are pre-verified
        provider: 'github',
      });
    } else {
      // Update user with GitHub info if exists
      user = await this.usersService.update(user.id, {
        provider: 'github',
        picture: picture || user.picture,
        isEmailVerified: true,
      });
    }

    return user;
  }
}