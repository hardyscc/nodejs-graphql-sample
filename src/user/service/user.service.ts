import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserInput } from '../dto/create-user.input';
import { User } from '../entity/user.entity';

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

  async remove(id: string) {
    const { affected } = await this.userRepository.delete(id);
    return affected !== 0;
  }

  find() {
    return this.userRepository.find();
  }
}
