import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import * as KeycloakBearerStrategy from 'passport-keycloak-bearer';
import { AuthUser } from '../auth-user.type';

@Injectable()
export class KeycloakStrategy extends PassportStrategy(KeycloakBearerStrategy) {
  constructor() {
    super({
      realm: 'MyDemo',
      url: 'https://keycloak.apps.sysforce.com/auth',
      loggingLevel: 'debug',
    });
  }

  async validate(payload: any): Promise<AuthUser> {
    return {
      name: payload.preferred_username,
      roles: payload.realm_access.roles,
      scope: payload.scope,
    };
  }
}
