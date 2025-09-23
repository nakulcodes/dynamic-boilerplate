import { Controller, Get, Req, Res, UseGuards, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Response, Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { GoogleOAuthGuard } from './google-oauth.guard';
import { AuthService } from './auth.service';
import { User } from '@db/entities/user.entity';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {}

  @Get('google')
  @UseGuards(GoogleOAuthGuard)
  @ApiOperation({ summary: 'Initiate Google OAuth flow' })
  @ApiResponse({ status: 302, description: 'Redirects to Google OAuth' })
  async googleAuth() {
    // The AuthGuard will handle the redirect to Google
    this.logger.log('Initiating Google OAuth');
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Handle Google OAuth callback' })
  @ApiResponse({ status: 302, description: 'Redirects to frontend with result' })
  async googleCallback(
    @Req() req: Request & { user: User },
    @Res() res: Response,
  ) {
    try {
      const user = req.user;

      this.logger.log(`Google OAuth callback for user: ${user.email}`);

      // Generate JWT token
      const authResult = await this.authService.login(user);

      // Construct success redirect URL
      const frontendUrl = this.configService.get<string>('FRONTEND_URL');
      const successUrl = new URL('/auth/callback', frontendUrl);
      successUrl.searchParams.set('token', authResult.token);
      successUrl.searchParams.set('status', 'success');

      this.logger.log(`Redirecting to: ${successUrl.toString()}`);

      return res.redirect(successUrl.toString());

    } catch (error) {
      this.logger.error('Google OAuth callback failed:', error);

      // Construct error redirect URL
      const frontendUrl = this.configService.get<string>('FRONTEND_URL');
      const errorUrl = new URL('/auth/callback', frontendUrl);
      errorUrl.searchParams.set('error', error.message || 'OAuth failed');
      errorUrl.searchParams.set('status', 'error');

      return res.redirect(errorUrl.toString());
    }
  }
}