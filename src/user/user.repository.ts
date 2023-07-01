import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserRepository {
  private repository: Repository<User>;

  constructor(private readonly dataSource: DataSource) {
    this.repository = this.dataSource.getRepository(User);
  }

  save(user: User | CreateUserDto) {
    return this.repository.save(user);
  }

  getOneById(id: number) {
    return this.repository.findOneBy({ id });
  }

  getOneByEmail(email: string) {
    return this.repository.findOneBy({ email });
  }

  getAll() {
    return this.repository.find();
  }

  remove(user: User) {
    return this.repository.remove(user);
  }
}
