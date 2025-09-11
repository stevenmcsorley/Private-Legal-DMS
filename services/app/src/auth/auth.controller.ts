import {
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { AuthService, Session } from './auth.service';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/user.decorator';
import { UserInfo } from './auth.service';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  @Public()
  @Get('login')
  login(
    @Query('redirect') redirect?: string,
    @Res() res?: Response,
  ) {
    const frontendUrl = this.configService.get('FRONTEND_URL', 'http://localhost');
    const redirectUri = `${this.configService.get('API_BASE_URL', 'http://localhost')}/api/auth/callback`;
    const state = redirect ? Buffer.from(redirect).toString('base64') : undefined;
    
    const loginUrl = this.authService.getLoginUrl(redirectUri, state);
    
    if (res) {
      return res.redirect(loginUrl);
    }
    
    return { loginUrl };
  }

  @Public()
  @Get('callback')
  async callback(
    @Query('code') code: string,
    @Query('state') state?: string,
    @Query('error') error?: string,
    @Req() req?: Request,
    @Res() res?: Response,
  ) {
    if (error) {
      this.logger.error('OAuth callback error:', error);
      throw new BadRequestException(`Authentication failed: ${error}`);
    }

    if (!code) {
      throw new BadRequestException('Authorization code is required');
    }

    try {
      const redirectUri = `${this.configService.get('API_BASE_URL', 'http://localhost')}/api/auth/callback`;
      const session = await this.authService.exchangeCodeForTokens(code, redirectUri);
      
      // Store session
      if (req?.session) {
        (req.session as any).auth = session;
      }

      // Determine redirect destination
      let redirectTo = this.configService.get('FRONTEND_URL', 'http://localhost');
      if (state) {
        try {
          const decodedRedirect = Buffer.from(state, 'base64').toString();
          redirectTo = decodedRedirect;
        } catch (e) {
          this.logger.warn('Failed to decode state parameter:', e);
        }
      }

      if (res) {
        return res.redirect(redirectTo);
      }

      return { session, redirectTo };
    } catch (error) {
      this.logger.error('Authentication callback failed:', error);
      throw new UnauthorizedException('Authentication failed');
    }
  }

  @Get('me')
  getProfile(@CurrentUser() user: UserInfo) {
    return {
      user: {
        id: user.sub,
        email: user.email,
        name: user.name || user.preferred_username,
        firstName: user.given_name,
        lastName: user.family_name,
        username: user.preferred_username,
        roles: user.roles,
        firmId: user.firm_id,
        attributes: user.attributes,
      },
    };
  }

  @Get('session')
  getSession(@Req() req: Request) {
    const session = (req.session as any)?.auth as Session;
    if (!session) {
      throw new UnauthorizedException('No active session');
    }

    return {
      user: {
        id: session.user.sub,
        email: session.user.email,
        name: session.user.name || session.user.preferred_username,
        roles: session.user.roles,
        firmId: session.user.firm_id,
      },
      expiresAt: session.expiresAt,
      issuedAt: session.issuedAt,
    };
  }

  @Post('refresh')
  async refreshSession(@Req() req: Request) {
    const currentSession = (req.session as any)?.auth as Session;
    if (!currentSession?.refreshToken) {
      throw new UnauthorizedException('No refresh token available');
    }

    try {
      const newSession = await this.authService.refreshTokens(currentSession.refreshToken);
      (req.session as any).auth = newSession;
      
      return {
        user: {
          id: newSession.user.sub,
          email: newSession.user.email,
          name: newSession.user.name || newSession.user.preferred_username,
          roles: newSession.user.roles,
          firmId: newSession.user.firm_id,
        },
        expiresAt: newSession.expiresAt,
        issuedAt: newSession.issuedAt,
      };
    } catch (error) {
      this.logger.error('Session refresh failed:', error);
      throw new UnauthorizedException('Failed to refresh session');
    }
  }

  @Post('logout')
  logout(
    @Query('redirect') redirect?: string,
    @Req() req?: Request,
    @Res() res?: Response,
  ) {
    // Destroy session
    if (req?.session) {
      req.session.destroy((err) => {
        if (err) {
          this.logger.error('Session destruction failed:', err);
        }
      });
    }

    const frontendUrl = this.configService.get('FRONTEND_URL', 'http://localhost');
    const redirectUri = redirect || frontendUrl;
    const logoutUrl = this.authService.getLogoutUrl(redirectUri);

    if (res) {
      return res.redirect(logoutUrl);
    }

    return { logoutUrl };
  }

  @Public()
  @Get('health')
  health() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      keycloak: {
        realm: this.configService.get('KEYCLOAK_REALM', 'dms'),
        authServerUrl: this.configService.get('KEYCLOAK_AUTH_SERVER_URL', 'http://keycloak:8080'),
      },
    };
  }
}