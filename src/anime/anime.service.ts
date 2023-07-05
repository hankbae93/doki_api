import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAnimeDto } from './dto/create-anime.dto';
import { UpdateAnimeDto } from './dto/update-anime.dto';
import { AnimeErrorText } from './anime.enum';
import { InjectRepository } from '@nestjs/typeorm';
import { Anime } from './entities/anime.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AnimeService {
  constructor(
    @InjectRepository(Anime)
    private animeRepository: Repository<Anime>,
  ) {}
  async createAnime(createAnimeDto: CreateAnimeDto) {
    const { title, author, tag, source } = createAnimeDto;
    // return await this.animeRepository.save(newAnime);
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

  async updateAnime(id: number, updateAnimeDto: UpdateAnimeDto) {
    const anime = await this.animeRepository.findOneBy({ id });
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
    const anime = await this.animeRepository.findOneBy({ id });

    return await this.animeRepository.remove(anime);
  }
}
