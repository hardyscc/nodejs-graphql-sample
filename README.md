# NodeJS GraphQL Backend Tutorial

## Overview

Build a basic CRUD backend application with GraphQL & MySQL.

## Technologies

1. [NodeJS](https://nodejs.org/)
1. [TypeScript](https://www.typescriptlang.org/)
1. [NestJS](https://nestjs.com/)
1. [TypeGraphQL](https://typegraphql.com/)
1. [TypeORM](https://typeorm.io/)
1. [MySQL](https://www.mysql.com/)

## Create an Empty Project

Setup an empty project using [Nest CLI](https://docs.nestjs.com/cli/overview).

```bash
npm install -g @nestjs/cli
nest new nodejs-graphql-sample
cd nodejs-graphql-sample
```

> Please use `npm` as the default package manager for this tutorial.

> For more information, please see [NestJS First Steps](https://docs.nestjs.com/first-steps).

Start the server in watch mode.

```bash
npm run start:dev
```

Goto http://localhost:3000 You should see the `Hello World` message.

## NestJS GraphQL Module

### Install and Config

Install the required packages.

```bash
npm install @nestjs/graphql graphql-tools graphql apollo-server-express type-graphql
```

Update the `src/app.module.ts` as follow.

```ts
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    GraphQLModule.forRoot({
      autoSchemaFile: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

Update the `src/main.ts` to accept the `PORT` environment variable.

```ts
async function bootstrap() {
  ...
  await app.listen(process.env.PORT || 4000);
}
...
```

> Notes that the default backend port has been changed to `4000` as well, to avoid the port conflict with frontend.

### Generate the Skeleton Template for User Module and Resolver

```bash
nest generate module user
nest generate resolver user --no-spec
```

The following folder and files will be created.

```sh
src/user/user.resolver.ts
src/user/user.module.ts
```

Please notes that `src/app.module.ts` also updated automatically as follow.

```ts
...
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ...
    UserModule,
  ],
  ...
})
export class AppModule {}

```

### Create the User Entity and Input Type

Create the following file `src/user/user.entity.ts`.

```ts
import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class User {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  nickName?: string;
}
```

Create the following file `src/user/create-user.input.ts`.

```ts
import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateUserInput {
  @Field()
  name: string;

  @Field({ nullable: true })
  nickName?: string;
}
```

### Implement the User Resolver

Update `src/user/user.resolver.ts` and add the `users` query and `createUser` mutation.

```ts
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreateUserInput } from './create-user.input';
import { User } from './user.entity';

const users: User[] = [];

@Resolver('User')
export class UserResolver {
  @Mutation(() => User)
  createUser(@Args('input') input: CreateUserInput) {
    const user = new User();
    user.name = input.name;
    user.nickName = input.nickName;
    user.id = String(Math.floor(Math.random() * 1000000000));
    users.push(user);
    return user;
  }

  @Query(() => [User])
  users() {
    return users;
  }
}
```

> just temporary keep the users list in memory, will change to use database later.

### Test the GraphQL Endpoint

Start the server instance in watch mode.

```bash
npm run start:dev
```

Goto the GraphQL Playground - http://localhost:4000/graphql.

1. Create a new user

   ```graphql
   mutation {
     createUser(input: { name: "Tommy" }) {
       id
     }
   }
   ```

   Output :

   ```json
   {
     "data": {
       "createUser": {
         "id": "95678594"
       }
     }
   }
   ```

2. Query the users

   ```graphql
   query {
     users {
       id
       name
     }
   }
   ```

   Output :

   ```json
   {
     "data": {
       "users": [
         {
           "id": "95678594",
           "name": "Tommy"
         }
       ]
     }
   }
   ```

## NestJS TypeORM Module

### Install and Config

Install the required packages.

```bash
npm install @nestjs/typeorm typeorm mysql2
```

Add the TypeOrmModule Configuration into `src/app.module.ts` as follow.

```ts
...
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./user/user.entity";
...

const databaseUrl =
  process.env.DATABASE_URL ||
  'mysql://usr:User12345@localhost:3306/development';

@Module({
  imports: [
    ...
    TypeOrmModule.forRoot({
      type: 'mysql',
      url: databaseUrl,
      database: databaseUrl.split('/').pop(),
      entities: [User],
      synchronize: true,
      logging: true,
    }),
    ...
  ]
})
export class AppModule {}
```

Add the TypeOrmModule Configuration into `src/user/user.module.ts` as follow.

```ts
...
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from "./user.entity";
...

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  ...
})
export class UserModule {}
```

> for more information, please see [NestJS Database](https://docs.nestjs.com/techniques/database).

### Add the TypeORM Decorators into User Entity

Update the following file `src/user/user.entity.ts`.

```ts
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@ObjectType()
@Entity()
export class User {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  name: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  nickName?: string;
}
```

### Create an User Service

This is a helper service which using `TypeORM's Repository API` to access the MySQL database.

```
nest generate service user --no-spec
```

Update the generated file `src/user/user.service.ts` as follow.

```ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserInput } from './create-user.input';
import { User } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  create(input: CreateUserInput) {
    const user = this.userRepository.create(input);
    return this.userRepository.save(user);
  }

  findOneById(id: string) {
    return this.userRepository.findOneOrFail(id);
  }

  async delete(id: string) {
    const { affected } = await this.userRepository.delete(id);
    return affected !== 0;
  }

  find() {
    return this.userRepository.find();
  }
}
```

### Update the User Resolver

Update the following file `src/user/user.resolver.ts`.

```ts
import { NotFoundException } from '@nestjs/common';
import { Args, Mutation, Query, Resolver, ID } from '@nestjs/graphql';
import { CreateUserInput } from './create-user.input';
import { User } from './user.entity';
import { UserService } from './user.service';

@Resolver(User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => User)
  async user(@Args({ name: 'id', type: () => ID }) id: string) {
    const user = await this.userService.findOneById(id);
    if (!user) {
      throw new NotFoundException(id);
    }
    return user;
  }

  @Mutation(() => User)
  createUser(@Args('input') input: CreateUserInput) {
    return this.userService.create(input);
  }

  @Mutation(() => ID, { nullable: true })
  async deleteUser(@Args({ name: 'id', type: () => ID }) id: string) {
    return (await this.userService.delete(id)) ? id : null;
  }

  @Query(() => [User])
  users() {
    return this.userService.find();
  }
}
```

### Test the GraphQL Endpoint with TypeORM

Start a MySQL docker instance.

```bash
docker run -d -e "MYSQL_ROOT_PASSWORD=Admin12345" -e "MYSQL_USER=usr" -e "MYSQL_PASSWORD=User12345" -e "MYSQL_DATABASE=development" -p 3306:3306 --name some-mysql bitnami/mysql:5.7.27
```

Start the server instance in watch mode.

```bash
npm run start:dev
```

Goto the GraphQL Playground - http://localhost:4000/graphql.

1. Create some users

   ```graphql
   mutation {
     a: createUser(input: { name: "John" }) {
       id
     }
     b: createUser(input: { name: "Mary" }) {
       id
     }
   }
   ```

   Output:

   ```json
   {
     "data": {
       "a": {
         "id": "6ad2b68d-15a8-4e3e-9062-6343324faa7e"
       },
       "b": {
         "id": "eb777cfa-65d4-4a36-9344-5452284647e6"
       }
     }
   }
   ```

2. Query the users

   ```graphql
   query {
     users {
       id
       name
     }
   }
   ```

   Output :

   ```json
   {
     "data": {
       "users": [
         {
           "id": "6ad2b68d-15a8-4e3e-9062-6343324faa7e",
           "name": "John"
         },
         {
           "id": "eb777cfa-65d4-4a36-9344-5452284647e6",
           "name": "Mary"
         }
       ]
     }
   }
   ```

3. Delete one of the user by the id

   ```graphql
   mutation {
     deleteUser(id: "6ad2b68d-15a8-4e3e-9062-6343324faa7e")
   }
   ```

   Output :

   ```json
   {
     "data": {
       "deleteUser": "6ad2b68d-15a8-4e3e-9062-6343324faa7e"
     }
   }
   ```

4. Test the MySQL database

   Run the mysql command using the same docker instance.

   ```bash
   docker exec -it some-mysql mysql -uroot -p"Admin12345"
   ```

   Select the data from user table.

   ```sql
   mysql> use development;
   mysql> select * from user;
   +--------------------------------------+------+----------+
   | id                                   | name | nickName |
   +--------------------------------------+------+----------+
   | eb777cfa-65d4-4a36-9344-5452284647e6 | Mary | NULL     |
   +--------------------------------------+------+----------+
   ```
