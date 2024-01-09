import { Test, TestingModule } from '@nestjs/testing';
import { PassportModule } from '@nestjs/passport';
import { TagController } from '../tag.controller';
import { TagService } from '../tag.service';
import { ScenariosMock } from '../../../common/mock/scenarios.mock';
import { DataMock } from '../../../common/mock/data.mock';
import { EStatusCode } from '../../../common/enum/status.enum';
import { EResponseMessage } from '../../../common/enum/message.enum';

describe('ScrapController', () => {
  let tagController: TagController;
  let tagService: TagService;
  const scenarios = ScenariosMock.getMethodNames(TagController);

  const mockTagService = {
    getTags: jest.fn(),
    findTagsAndCreate: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TagController],
      providers: [
        {
          provide: TagService,
          useValue: mockTagService,
        },
      ],
      imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
    }).compile();

    tagController = module.get<TagController>(TagController);
    tagService = module.get<TagService>(TagService);
  });

  it('should be defined', () => {
    expect(tagController).toBeDefined();
    expect(tagService).toBeDefined();
  });

  describe(scenarios.getTags, () => {
    it('태그 목록을 요청하면 응답해야 합니다.', async () => {
      const tag = DataMock.mockTag();
      const response = DataMock.mockResponse(
        EStatusCode.OK,
        [tag],
        EResponseMessage.SUCCESS,
      );

      jest.spyOn(tagService, 'getTags').mockResolvedValue(response);

      const result = await tagController.getTags();

      expect(tagService.getTags).toHaveBeenCalled();
      expect(result).toEqual(response);
    });
  });

  describe(scenarios.findTagsAndCreate, () => {
    it('문자열 목록을 받으면 태그 목록을 반환해야 합니다.', async () => {
      const list = ['Test', 'Test2'];
      const tag = DataMock.mockTag();

      jest.spyOn(tagService, 'findTagsAndCreate').mockResolvedValue([tag]);

      const result = await tagController.findTagsAndCreate({ tags: list });

      expect(result).toEqual([tag]);
    });
  });
});
