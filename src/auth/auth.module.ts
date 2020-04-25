import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { KeycloakStrategy } from './strategies/keycloak.strategy';

@Module({
  imports: [PassportModule],
  providers: [KeycloakStrategy],
})
export class AuthModule {}
