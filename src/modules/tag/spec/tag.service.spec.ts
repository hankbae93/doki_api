import { Test, TestingModule } from '@nestjs/testing';
import { ScenariosMock } from '../../../common/mock/scenarios.mock';
import { TagService } from '../tag.service';
import { TagRepository } from '../repository/tag.repository';
import { DataMock } from '../../../common/mock/data.mock';
import { EStatusCode } from '../../../common/enum/status.enum';
import { EResponseMessage } from '../../../common/enum/message.enum';

describe('TagService', () => {
  let tagService: TagService;
  let tagRepository: TagRepository;
  const scenarios = ScenariosMock.getMethodNames(TagService);

  const mockTagRepository = {
    find: jest.fn(),
    findTagsByName: jest.fn(),
    createTag: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TagService,
        { provide: TagRepository, useValue: mockTagRepository },
      ],
    }).compile();

    tagService = module.get<TagService>(TagService);
    tagRepository = module.get<TagRepository>(TagRepository);
  });

  describe(scenarios.getTags, () => {
    it('태그 전체 목록을 반환합니다.', async () => {
      const tag = DataMock.mockTag();
      const response = DataMock.mockResponse(
        EStatusCode.OK,
        [tag],
        EResponseMessage.SUCCESS,
      );

      jest.spyOn(tagRepository, 'find').mockResolvedValue([tag]);

      const result = await tagService.getTags();

      expect(tagRepository.find).toHaveBeenCalled();
      expect(result).toEqual(response);
    });
  });

  describe(scenarios.findTagsAndCreate, () => {
    it('문자열 목록을 받으면 태그 목록을 반환해야 합니다.', async () => {
      const tag = DataMock.mockTag();
      const list = [tag.name];

      jest.spyOn(tagRepository, 'findTagsByName').mockResolvedValue([tag]);

      const result = await tagService.findTagsAndCreate(list);

      expect(result).toEqual([tag]);
    });

    it('존재하지 않는 태그라면 생성해서라도 태그 목록을 반환합니다.', async () => {
      const tag = DataMock.mockTag();
      const tag2 = Object.assign(tag, { name: 'test' });
      const list = [tag.name, tag2.name];

      jest.spyOn(tagRepository, 'findTagsByName').mockResolvedValue([tag]);
      jest.spyOn(tagRepository, 'createTag').mockResolvedValue([tag2]);

      const result = await tagService.findTagsAndCreate(list);

      expect(result).toEqual([tag, tag2]);
    });

    it('빈 배열을 받으면 빈 배열을 반환해야 합니다.', async () => {
      const result = await tagService.findTagsAndCreate([]);

      expect(result).toEqual([]);
    });
  });
});
