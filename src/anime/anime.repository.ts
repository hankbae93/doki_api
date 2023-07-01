import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Anime } from './entities/anime.entity';
import { User } from '../user/entities/user.entity';

@Injectable()
export class AnimeRepository {
  private repository: Repository<Anime>;

  constructor(private readonly dataSource: DataSource) {
    this.repository = this.dataSource.getRepository(Anime);
  }

  save(anime: Anime) {
    return this.repository.save(anime);
  }

  create(user: User, anime: Partial<Anime>) {
    const newAnime = Object.assign(anime, { user });
    return this.repository.create(newAnime);
  }

  getOneById(id: number) {
    return this.repository.findOneBy({ id });
  }

  getAll() {
    return this.repository.find();
  }

  remove(anime: Anime) {
    return this.repository.remove(anime);
  }
}
