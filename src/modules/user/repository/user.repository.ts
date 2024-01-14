import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { UserRank } from '../user.enum';

@Injectable()
export class UserRepository extends Repository<User> {
  constructor(private dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }

  setManager(manager?: EntityManager) {
    if (!manager) return this;

    const allProperties = Object.getOwnPropertyNames(
      Object.getPrototypeOf(this),
    );

    // 'setManager' 제외하고 필터링
    const methodsToExtend = allProperties.filter((property) => {
      return typeof this[property] === 'function' && property !== 'setManager';
    });

    // extend 메소드에 전달할 객체 생성
    const methods = methodsToExtend.reduce((obj, method) => {
      obj[method] = this[method];
      return obj;
    }, {}) as UserRepository;

    return manager.getRepository(User).extend(methods);
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

  updateUserRank(userId: number, rank: UserRank) {
    return this.update(userId, { rank });
  }
}
