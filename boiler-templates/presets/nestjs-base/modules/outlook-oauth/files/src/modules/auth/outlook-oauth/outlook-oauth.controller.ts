import { Controller, Get, UseGuards, Req, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { AuthService } from '@modules/auth/auth.service';

@ApiTags('auth')
@Controller('auth/microsoft')
export class OutlookOAuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  @Get()
  @UseGuards(AuthGuard('microsoft'))
  @ApiOperation({ summary: 'Initiate Microsoft/Outlook OAuth authentication' })
  @ApiResponse({ status: 302, description: 'Redirects to Microsoft OAuth' })
  async microsoftAuth(@Req() req) {
    // Initiates Microsoft OAuth flow
  }

  @Get('callback')
  @UseGuards(AuthGuard('microsoft'))
  @ApiOperation({ summary: 'Microsoft/Outlook OAuth callback' })
  @ApiResponse({ status: 302, description: 'Redirects to frontend with JWT token' })
  async microsoftAuthRedirect(@Req() req, @Res() res: Response) {
    // Handle Microsoft OAuth callback
    const jwt = await this.authService.login(req.user);

    // Redirect to frontend with JWT token
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    res.redirect(`${frontendUrl}?token=${jwt.access_token}&provider=microsoft`);
  }
}