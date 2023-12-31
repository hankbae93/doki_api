import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../user.service';
import { UserRepository } from '../repository/user.repository';
import { User } from '../entities/user.entity';
import { UserRank, UserRankName } from '../user.enum';
import { Anime } from '../../anime/entities/anime.entity';
import { Scrap } from '../../scrap/entities/scrap.entity';
import { Review } from '../../review/entities/review.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ResponseDto } from '../../../common/dto/responseDto';
import { EStatusCode } from '../../../common/enum/status.enum';
import {
  EErrorMessage,
  EResponseMessage,
} from '../../../common/enum/message.enum';
import { NotFoundException } from '@nestjs/common';

describe('UserService', () => {
  let userService: UserService;
  let userRepository: UserRepository;

  const mockUser: User = {
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
  };

  const mockUserRepository = {
    findRawOneByEmail: jest.fn(),
    findProfileByNickname: jest.fn(),
    updatePassword: jest.fn(),
    save: jest.fn(),
    deleteUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(UserRepository),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    userRepository = module.get<UserRepository>(UserRepository);
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  describe('getUserInfo', () => {
    it('should find current user information', async () => {
      const result = await userService.getUserInfo(mockUser);

      expect(result).toEqual(
        new ResponseDto(EStatusCode.OK, mockUser, EResponseMessage.SUCCESS),
      );
    });
  });

  describe('getUserProfile', () => {
    it('should find user information with animes by nickname', async () => {
      jest.spyOn(userRepository, 'findProfileByNickname').mockResolvedValue({
        ...mockUser,
        animes: [],
      });

      const result = await userService.getUserProfile(mockUser.nickname);

      expect(userRepository.findProfileByNickname).toHaveBeenCalledWith(
        mockUser.nickname,
      );

      expect(result).toEqual(
        new ResponseDto(
          EStatusCode.OK,
          Object.assign(mockUser, {
            rank: UserRankName[mockUser.rank],
            animes: [],
          }),
          EResponseMessage.SUCCESS,
        ),
      );
    });

    it('should throw NotFoundException if user is not found', async () => {
      jest
        .spyOn(userRepository, 'findProfileByNickname')
        .mockResolvedValue(null);

      try {
        await userService.getUserProfile(mockUser.nickname);
      } catch (err) {
        await expect(
          userService.getUserProfile(mockUser.nickname),
        ).rejects.toThrow(NotFoundException);

        expect(err.message).toEqual(EErrorMessage.NOT_FOUND_USER);
      }
    });
  });

  describe('changePassword', () => {
    it('should update user password by nickname', async () => {
      const mockPassword = '1234';
      const result = await userService.changePassword(
        { password: mockPassword },
        mockUser,
      );

      expect(userRepository.updatePassword).toHaveBeenCalled();

      expect(result).toEqual(
        new ResponseDto(
          EStatusCode.OK,
          null,
          EResponseMessage.PASSWORD_UPDATE_SUCCESS,
        ),
      );
    });
  });

  describe('updateProfile', () => {
    it('should update user information', async () => {
      const newNickname = 'TESTER';
      const updateProfileDto = {
        nickname: newNickname,
        description: undefined,
        profile: undefined,
      };
      const newUser = Object.assign(mockUser, { nickname: newNickname });

      jest.spyOn(userRepository, 'save').mockResolvedValue(newUser);

      const result = await userService.updateProfile(
        updateProfileDto,
        mockUser,
      );

      expect(userRepository.save).toHaveBeenCalledWith(newUser);

      expect(result).toEqual(
        new ResponseDto(
          EStatusCode.OK,
          newUser,
          EResponseMessage.USER_UPDATE_SUCCESS,
        ),
      );
    });
  });

  describe('deleteAccount', () => {
    it('should delete user information', async () => {
      jest.spyOn(userRepository, 'deleteUser').mockResolvedValue(null);

      const result = await userService.deleteAccount(mockUser);

      expect(userRepository.deleteUser).toHaveBeenCalledWith(mockUser.id);

      expect(result).toEqual(
        new ResponseDto(EStatusCode.OK, null, EResponseMessage.DELETE_ACCOUNT),
      );
    });
  });
});
