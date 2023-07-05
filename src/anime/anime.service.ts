import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAnimeDto } from './dto/create-anime.dto';
import { UpdateAnimeDto } from './dto/update-anime.dto';
import { AnimeErrorText } from './anime.enum';
import { InjectRepository } from '@nestjs/typeorm';
import { Anime } from './entities/anime.entity';
import { Repository } from 'typeorm';
import { User } from '../auth/entities/user.entity';

@Injectable()
export class AnimeService {
  constructor(
    @InjectRepository(Anime)
    private animeRepository: Repository<Anime>,
  ) {}
  async createAnime(createAnimeDto: CreateAnimeDto, user: User) {
    const { title, author, tag, source } = createAnimeDto;

    const anime = this.animeRepository.create({
      title,
      author,
      tag,
      source,
      user,
    });

    return await this.animeRepository.save(anime);
  }

  async getAllAnime() {
    return await this.animeRepository.find();
  }

  async getAnime(id: number) {
    const anime = await this.animeRepository.findOneBy({ id });

    if (!anime) {
      throw new NotFoundException(AnimeErrorText.NOT_FOUND_ANIME);
    }

    return anime;
  }

  async updateAnime(id: number, updateAnimeDto: UpdateAnimeDto, user) {
    const anime = await this.animeRepository.findOne({
      where: {
        id,
      },
      relations: ['user'],
    });

    if (anime.user.id !== user.id) {
      throw new ForbiddenException();
    }

    const newAnime = {
      ...anime,
      ...updateAnimeDto,
    };

    return await this.animeRepository.save(newAnime);
  }

  async removeAnime(id: number, user: User) {
    const anime = await this.animeRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (user.id !== anime.user.id) {
      throw new ForbiddenException();
    }

    return await this.animeRepository.remove(anime);
  }
}
