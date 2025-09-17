import { Module, Global, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AuthGuard } from './guards/auth.guard';
import { AuthzGuard } from './guards/authz.guard';
import { OpaService } from './opa.service';
import { KeycloakConfig } from '../config/keycloak.config';
import { OpaConfig } from '../config/opa.config';
import { User, SystemSettings } from '../common/entities';
import { AdminModule } from '../modules/admin/admin.module';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([User, SystemSettings]),
    JwtModule.register({
      // JWT configuration - mainly used for internal token operations
      secret: process.env.JWT_SECRET || 'dev-jwt-secret',
      signOptions: { expiresIn: '1h' },
    }),
    forwardRef(() => AdminModule),
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