import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreateAnimeDto } from '../dto/create-anime.dto';
import { UpdateAnimeDto } from '../dto/update-anime.dto';
import { DataSource, EntityManager } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { ResponseDto } from '../../../common/dto/response.dto';
import { EStatusCode } from '../../../common/enum/status.enum';
import { EResponseMessage } from '../../../common/enum/message.enum';
import { AnimeRepository } from '../repository/anime.repository';
import { ScrapRepository } from '../../scrap/repository/scrap.repository';
import { ReviewRepository } from '../../review/repository/review.repository';
import { FileRepository } from '../../file/repository/file.repository';
import { TagRepository } from '../../tag/repository/tag.repository';
import { TransactionHandler } from '../../../common/handler/transaction.handler';
import { cleanObject } from '../../../common/utils/data.utils';
import { TagService } from '../../tag/tag.service';

@Injectable()
export class AnimeWriteService {
  constructor(
    private animeRepository: AnimeRepository,
    private scrapRepository: ScrapRepository,
    private reviewRepository: ReviewRepository,
    private fileRepository: FileRepository,
    private tagRepository: TagRepository,
    private tagService: TagService,
    private dataSource: DataSource,
  ) {}

  async createAnime(
    createAnimeDto: CreateAnimeDto,
    files: {
      video?: Express.Multer.File[];
      file?: Express.Multer.File[];
    },
    user: User,
  ) {
    const {
      title,
      author = null,
      crew,
      tags = [],
      source,
      description,
      series = '',
    } = createAnimeDto;

    const result = await TransactionHandler.transaction(
      this.dataSource,
      async (entityManager: EntityManager) => {
        const animeRepository = this.animeRepository.setManager(entityManager);
        const fileRepository = this.fileRepository.setManager(entityManager);

        let animeParentId: number | null = null;
        if (series) {
          const originAnime = await animeRepository.getAnimeBySeriesName(
            series,
          );
          animeParentId = originAnime ? originAnime.id : null;
        }

        const tagData = await this.tagService.findTagsAndCreate(
          tags,
          entityManager,
        );

        const newAnime = await animeRepository.createAnime({
          title,
          author,
          source,
          averageScore: 0,
          animeParentId,
          thumbnail: files.file[0].path,
          description,
          crew,
          tags: tagData.length === 0 ? null : tagData,
          user,
        });

        await fileRepository.createFiles(
          files.file.map((file) => ({
            anime: newAnime,
            fileName: file.path,
          })),
        );

        return newAnime;
      },
    );

    return new ResponseDto(
      EStatusCode.CREATED,
      result,
      EResponseMessage.SUCCESS,
    );
  }

  async updateAnime(id: number, updateAnimeDto: UpdateAnimeDto, user: User) {
    const { tags } = updateAnimeDto;

    const result = await TransactionHandler.transaction(
      this.dataSource,
      async (entityManager) => {
        const animeRepository = this.animeRepository.setManager(entityManager);
        const anime = await animeRepository.findAnimeWithUserById(id);

        if (user.id !== anime.user.id) {
          throw new ForbiddenException();
        }

        const tagData = await this.tagService.findTagsAndCreate(
          tags,
          entityManager,
        );

        const updatedColumns = cleanObject(
          Object.assign(updateAnimeDto, { tags: undefined }),
        );

        return await animeRepository.updateAnime(
          anime.id,
          Object.assign(anime, updatedColumns, { tags: tagData }),
        );
      },
    );

    return new ResponseDto(
      EStatusCode.CREATED,
      result,
      EResponseMessage.SUCCESS,
    );
  }

  async deleteAnime(id: number, user: User) {
    await TransactionHandler.transaction(
      this.dataSource,
      async (entityManager) => {
        const animeRepository = this.animeRepository.setManager(entityManager);
        const reviewRepository =
          this.reviewRepository.setManager(entityManager);

        const anime = await animeRepository.getAnimeToDeleteById(id);

        if (user.id !== anime.user.id) {
          throw new ForbiddenException();
        }

        await reviewRepository.deleteReviews(
          anime.reviews.map((review) => review.id),
        );
        await animeRepository.deleteAnime(anime.id);
      },
    );

    return new ResponseDto(EStatusCode.OK, null, EResponseMessage.DELETE_ITEM);
  }
}
