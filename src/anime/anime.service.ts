import { Injectable } from '@nestjs/common';
import { CreateAnimeDto } from './dto/create-anime.dto';
import { UpdateAnimeDto } from './dto/update-anime.dto';
import { AnimeRepository } from './anime.repository';
import { UserRepository } from '../user/user.repository';

@Injectable()
export class AnimeService {
  constructor(
    private animeRepository: AnimeRepository,
    private userRepository: UserRepository,
  ) {}
  async createAnime(createAnimeDto: CreateAnimeDto) {
    const user = await this.userRepository.getOneByEmail(
      createAnimeDto.userEmail,
    );

    const newAnime = await this.animeRepository.create(user, {
      title: createAnimeDto.title,
      tag: createAnimeDto.tag,
      author: createAnimeDto.author,
      source: createAnimeDto.source,
    });

    return await this.animeRepository.save(newAnime);
  }

  async getAllAnime() {
    return await this.animeRepository.getAll();
  }

  async getAnime(id: number) {
    return await this.animeRepository.getOneById(id);
  }

  async updateAnime(id: number, updateAnimeDto: UpdateAnimeDto) {
    const anime = await this.animeRepository.getOneById(id);
    const newAnime = {
      ...anime,
      title: updateAnimeDto.title,
      author: updateAnimeDto.author,
      tag: updateAnimeDto.tag,
      source: updateAnimeDto.source,
    };

    return await this.animeRepository.save(newAnime);
  }

  async removeAnime(id: number) {
    const anime = await this.animeRepository.getOneById(id);

    return await this.animeRepository.remove(anime);
  }
}
