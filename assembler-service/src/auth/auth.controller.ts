import { Controller, Get, Query, Req, Res, UseGuards, Logger, BadRequestException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { Response, Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { GitHubUser } from './github-oauth.strategy';
import { GitHubOAuthGuard } from './github-oauth.guard';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly configService: ConfigService) {}

  @Get('github')
  @UseGuards(GitHubOAuthGuard)
  @ApiOperation({ summary: 'Initiate GitHub OAuth flow' })
  @ApiQuery({
    name: 'userId',
    required: true,
    description: 'User ID to associate with GitHub account'
  })
  @ApiQuery({
    name: 'redirect',
    required: false,
    description: 'Frontend redirect URL after OAuth completion'
  })
  @ApiResponse({ status: 302, description: 'Redirects to GitHub OAuth' })
  async githubAuth(
    @Query('userId') userId: string,
    @Req() req: Request,
    @Query('redirect') redirectUrl?: string,
  ) {
    if (!userId) {
      throw new BadRequestException('userId parameter is required');
    }

    // The AuthGuard will handle the redirect to GitHub with the state parameter
    // This is handled automatically by Passport with our custom guard
    this.logger.log(`Initiating GitHub OAuth for user: ${userId}`);
  }

  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  @ApiOperation({ summary: 'Handle GitHub OAuth callback' })
  @ApiResponse({ status: 302, description: 'Redirects to frontend with result' })
  async githubCallback(
    @Req() req: Request & { user: { user: GitHubUser; userId: string; state: string } },
    @Res() res: Response,
  ) {
    try {
      const { user, userId, state } = req.user;

      this.logger.log(`GitHub OAuth callback for user: ${userId}, GitHub user: ${user.username}`);

      // Parse state to get redirect URL
      let redirectUrl = this.configService.get<string>('FRONTEND_URL');

      if (state) {
        try {
          const stateData = JSON.parse(Buffer.from(state, 'base64').toString());
          redirectUrl = stateData.redirectUrl || redirectUrl;
        } catch (error) {
          this.logger.warn('Failed to parse state in callback:', error);
        }
      }

      // Construct success redirect URL
      const successUrl = new URL('/github/oauth/success', redirectUrl);
      successUrl.searchParams.set('userId', userId);
      successUrl.searchParams.set('username', user.username);
      successUrl.searchParams.set('status', 'success');

      this.logger.log(`Redirecting to: ${successUrl.toString()}`);

      return res.redirect(successUrl.toString());

    } catch (error) {
      this.logger.error('GitHub OAuth callback failed:', error);

      // Construct error redirect URL
      const frontendUrl = this.configService.get<string>('FRONTEND_URL');
      const errorUrl = new URL('/github/oauth/error', frontendUrl);
      errorUrl.searchParams.set('error', error.message || 'OAuth failed');
      errorUrl.searchParams.set('status', 'error');

      return res.redirect(errorUrl.toString());
    }
  }
}