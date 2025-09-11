import { Module, Global } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AuthGuard } from './guards/auth.guard';
import { AuthzGuard } from './guards/authz.guard';
import { OpaService } from './opa.service';
import { KeycloakConfig } from '../config/keycloak.config';
import { OpaConfig } from '../config/opa.config';

@Global()
@Module({
  imports: [
    JwtModule.register({
      // JWT configuration - mainly used for internal token operations
      secret: process.env.JWT_SECRET || 'dev-jwt-secret',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  providers: [
    AuthService,
    OpaService,
    KeycloakConfig,
    OpaConfig,
    AuthzGuard,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
  controllers: [AuthController],
  exports: [AuthService, OpaService, KeycloakConfig, OpaConfig, AuthzGuard],
})
export class AuthModule {}