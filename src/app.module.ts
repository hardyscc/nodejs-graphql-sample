import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user/entity/user.entity';
import { UserModule } from './user/user.module';

const databaseUrl =
  process.env.DATABASE_URL ||
  'mysql://usr:User12345@localhost:3306/development';

@Module({
  imports: [
    GraphQLModule.forRoot({
      autoSchemaFile: true,
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
})
export class AppModule {}
