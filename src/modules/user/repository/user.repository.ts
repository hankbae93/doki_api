import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class UserRepository extends Repository<User> {
  constructor(private dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }

  setManager(manager?: EntityManager): Repository<User> {
    return manager ? manager.getRepository(User) : this;
  }

  findRawOneByEmail(email: string) {
    return this.createQueryBuilder('user')
      .select('*')
      .where('email = :email', { email })
      .getRawOne();
  }

  updatePassword(userId: number, hashedPassword: string) {
    return this.update({ id: userId }, { password: hashedPassword });
  }

  updateProfile(userId: number, newUser: User) {
    return this.update({ id: userId }, newUser);
  }

  deleteUser(userId: number) {
    return this.update(
      { id: userId },
      {
        retired: true,
      },
    );
  }

  findProfileByNickname(nickname: string) {
    return this.findOne({
      select: ['id', 'nickname', 'description', 'rank', 'createdAt'],
      where: { nickname },
      relations: ['animes'],
    });
  }
}
