import { Controller, Get, UseGuards, Req, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { AuthService } from '@modules/auth/auth.service';

@ApiTags('auth')
@Controller('auth/github')
export class GitHubOAuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  @Get()
  @UseGuards(AuthGuard('github'))
  @ApiOperation({ summary: 'Initiate GitHub OAuth authentication' })
  @ApiResponse({ status: 302, description: 'Redirects to GitHub OAuth' })
  async githubAuth(@Req() req) {
    // Initiates GitHub OAuth flow
  }

  @Get('callback')
  @UseGuards(AuthGuard('github'))
  @ApiOperation({ summary: 'GitHub OAuth callback' })
  @ApiResponse({ status: 302, description: 'Redirects to frontend with JWT token' })
  async githubAuthRedirect(@Req() req, @Res() res: Response) {
    // Handle GitHub OAuth callback
    const jwt = await this.authService.login(req.user);

    // Redirect to frontend with JWT token
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    res.redirect(`${frontendUrl}?token=${jwt.access_token}&provider=github`);
  }
}