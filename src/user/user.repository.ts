import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserRepository {
  private userRepository: Repository<User>;

  constructor(private readonly dataSource: DataSource) {
    this.userRepository = this.dataSource.getRepository(User);
  }

  async save(user: User | CreateUserDto) {
    return await this.userRepository.save(user);
  }

  async getUserById(id: number) {
    return await this.userRepository.findOneBy({ id });
  }

  async getAllUser() {
    return await this.userRepository.find();
  }

  async removeUser(user: User) {
    return await this.userRepository.remove(user);
  }
}
