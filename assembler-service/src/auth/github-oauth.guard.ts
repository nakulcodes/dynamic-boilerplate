import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

@Injectable()
export class GitHubOAuthGuard extends AuthGuard('github') {
  getAuthenticateOptions(context: ExecutionContext): any {
    const request = context.switchToHttp().getRequest<Request>();
    const { userId, redirect } = request.query;

    // Create state parameter with user information
    const state = {
      userId: userId as string,
      redirectUrl: (redirect as string) || 'http://localhost:5173',
      timestamp: Date.now(),
    };

    // Encode state as base64
    const encodedState = Buffer.from(JSON.stringify(state)).toString('base64');

    return {
      state: encodedState,
    };
  }
}