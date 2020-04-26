import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KeycloakConnectModule } from 'nest-keycloak-connect';
import { GqlAuthGuard } from './auth/gql-auth.guard';
import { GqlResourceGuard } from './auth/gql-resource.guard';
import { User } from './user/entity/user.entity';
import { UserModule } from './user/user.module';

const databaseUrl =
  process.env.DATABASE_URL ||
  'mysql://usr:User12345@localhost:3306/development';

@Module({
  imports: [
    KeycloakConnectModule.register({
      authServerUrl: 'https://keycloak.apps.sysforce.com/auth',
      realm: 'MyDemo',
      clientId: 'nodejs-graphql-sample',
      secret: '791863e7-12ce-4bbc-baf2-4a981296736d',
    }),
    GraphQLModule.forRoot({
      autoSchemaFile: true,
      context: ({ req }) => ({ req }),
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      url: databaseUrl,
      database: databaseUrl.split('/').pop(),
      entities: [User],
      synchronize: true,
      logging: true,
    }),
    UserModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: GqlAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: GqlResourceGuard,
    },
  ],
})
export class AppModule {}
