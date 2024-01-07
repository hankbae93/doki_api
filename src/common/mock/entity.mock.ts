import { Provider } from '@nestjs/common';
import { User } from '../../modules/user/entities/user.entity';
import { UserRank } from '../../modules/user/user.enum';
import { Anime } from '../../modules/anime/entities/anime.entity';
import { Scrap } from '../../modules/scrap/entities/scrap.entity';
import { Review } from '../../modules/review/entities/review.entity';
import { AnimeSource } from '../../modules/anime/anime.enum';
import { Tag } from '../../modules/tag/entities/tag.entity';

export class EntityMock {
  static mockProviders(providers: Provider[]) {
    return providers.map((provider) => {
      return {
        provide: provider,
        useValue: {},
      };
    }) as Provider[];
  }

  static mockUser() {
    return {
      id: 7,
      email: 'irori@gmail.com',
      nickname: 'irori',
      description: null,
      profile: null,
      retired: false,
      rank: UserRank.d,
      createdAt: new Date('2024-01-01'),
      password: '',
      animes: [] as Anime[],
      scraps: [] as Scrap[],
      reviews: [] as Review[],
    } as User;
  }

  static mockScrap() {
    return {
      id: 1,
      anime: this.mockAnime(),
      user: this.mockUser(),
    } as Scrap;
  }

  static mockAnime() {
    return {
      id: 1,
      title: '귀멸의 칼날',
      source: AnimeSource.MANGA,
      description: 'test',
      animeParentId: null,
      crew: '유포터블',
      author: '고요루 사토하루',
      thumbnail: null,
      averageScore: 0,
      deleted: false,
      scraps: [] as Scrap[],
      reviews: [] as Review[],
      tags: [] as Tag[],
      user: this.mockUser(),
      files: [],
    } as Anime;
  }

  static mockTag() {
    return {
      id: 1,
      name: '스릴러',
      animes: [this.mockAnime()],
    } as Tag;
  }
}
