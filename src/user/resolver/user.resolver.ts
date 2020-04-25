import { NotFoundException, UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { GqlAuthGuard } from 'src/auth/guards/gql-auth.guard';
import { CreateUserInput } from '../dto/create-user.input';
import { User } from '../entity/user.entity';
import { UserService } from '../service/user.service';

@UseGuards(GqlAuthGuard)
@Resolver(User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => User)
  async user(@Args('id') id: string) {
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

  @Mutation(() => Boolean)
  removeUser(@Args('id') id: string) {
    return this.userService.remove(id);
  }

  @Query(() => [User])
  users(@CurrentUser() user: User) {
    console.log('User', user);
    return this.userService.find();
  }
}
