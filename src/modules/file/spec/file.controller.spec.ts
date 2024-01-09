import { Test, TestingModule } from '@nestjs/testing';
import { ScenariosMock } from '../../../common/mock/scenarios.mock';
import { FileController } from '../file.controller';

describe('FileController', () => {
  let fileController: FileController;
  const scenarios = ScenariosMock.getMethodNames(FileController);

  const mockResponse = {
    sendFile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FileController],
    }).compile();

    fileController = module.get<FileController>(FileController);
  });

  describe(scenarios.getStaticFile, () => {
    it('경로로 요청하면 파일을 응답합니다.', () => {
      jest.spyOn(mockResponse, 'sendFile').mockResolvedValue(true);
      fileController.getStaticFile('/test.png', mockResponse);
      expect(mockResponse.sendFile).toHaveBeenCalled();
    });
  });
});
