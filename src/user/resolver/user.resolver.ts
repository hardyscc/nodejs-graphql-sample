import { NotFoundException } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Resource, Scopes } from 'nest-keycloak-connect';
import { CreateUserInput } from '../dto/create-user.input';
import { User } from '../entity/user.entity';
import { UserService } from '../service/user.service';

@Resolver(User)
@Resource('users')
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Scopes('view')
  @Query(() => User)
  async user(@Args('id') id: string) {
    const user = await this.userService.findOneById(id);
    if (!user) {
      throw new NotFoundException(id);
    }
    return user;
  }

  @Scopes('create')
  @Mutation(() => User)
  createUser(@Args('input') input: CreateUserInput) {
    return this.userService.create(input);
  }

  @Scopes('remove')
  @Mutation(() => Boolean)
  removeUser(@Args('id') id: string) {
    return this.userService.remove(id);
  }

  @Scopes('view')
  @Query(() => [User])
  users() {
    return this.userService.find();
  }
}
