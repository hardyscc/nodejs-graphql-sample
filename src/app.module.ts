import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { User } from './user/entity/user.entity';
import { UserModule } from './user/user.module';

const databaseUrl =
  process.env.DATABASE_URL ||
  'mysql://usr:User12345@localhost:3306/development';

@Module({
  imports: [
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
    AuthModule,
  ],
})
export class AppModule {}
