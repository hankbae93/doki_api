import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
  constructor(private userRepository: UserRepository) {}

  async createUser(createUserDto: CreateUserDto) {
    return await this.userRepository.save(createUserDto);
  }

  async getAllUser() {
    return await this.userRepository.getAllUser();
  }

  async getUser(id: number) {
    return await this.userRepository.getUserById(id);
  }

  async updateUser(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.getUser(id);
    const newUser: User = {
      ...user,
      ...updateUserDto,
    };

    return await this.userRepository.save(newUser);
  }

  async removeUser(id: number) {
    const user = await this.userRepository.getUserById(id);

    return await this.userRepository.removeUser(user);
  }
}
