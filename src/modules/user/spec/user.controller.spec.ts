import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from '../user.controller';
import { UserService } from '../user.service';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from '../repository/user.repository';
import { PassportModule } from '@nestjs/passport';
import { User } from '../entities/user.entity';
import { UserRank, UserRankName } from '../user.enum';
import { Anime } from '../../anime/entities/anime.entity';
import { Scrap } from '../../scrap/entities/scrap.entity';
import { Review } from '../../review/entities/review.entity';
import { Agenda } from '../../agenda/entities/agenda.entity';
import { AgendaVote } from '../../agenda/entities/agenda-vote.entity';
import { AgendaCandidateVote } from '../../agenda/entities/agenda-canidate-vote.entity';
import { EErrorMessage } from '../../../common/enum/message.enum';
import { SignInDto } from '../../auth/dto/sign-in.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { UpdateProfileDto } from '../dto/update-profile.dto';

describe('UserController', () => {
  let userController: UserController;
  let userService: UserService;

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
    agendas: [] as Agenda[],
    agendaVotes: [] as AgendaVote[],
    agendaCandidateVotes: [] as AgendaCandidateVote[],
  };

  const mockUserService = {
    // getUserInfo,
    getUserInfo: jest.fn().mockImplementation((user: User) => user),
    getUserProfile: jest.fn().mockImplementation((nickname: string) => ({
      id: mockUser.id,
      nickname: mockUser.nickname,
      description: mockUser.description,
      rank: UserRankName[mockUser.rank],
      createdAt: mockUser.createdAt,
      animes: mockUser.animes,
    })),
    signUp: jest.fn().mockResolvedValue(null),
    signIn: jest.fn().mockImplementation((signInDto: SignInDto) => ({
      user: mockUser,
      accessToken: '',
    })),
    changePassword: jest
      .fn()
      .mockImplementation(
        (changePasswordDto: ChangePasswordDto, user: User) => null,
      ),
    updateProfile: jest
      .fn()
      .mockImplementation(
        (updateProfileDto: UpdateProfileDto, user: User) => null,
      ),
    deleteAccount: jest.fn().mockImplementation((user: User) => null),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: JwtService,
          useValue: {},
        },
        {
          provide: UserRepository,
          useValue: {},
        },
      ],
      imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
    }).compile();

    userController = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(userController).toBeDefined();
    expect(userService).toBeDefined();
  });

  it('should get current user information', async () => {
    const result = await userController.getUserInfo(mockUser);

    expect(userService.getUserInfo).toHaveBeenCalled();
    expect(result).toEqual(mockUser);
  });

  it('should get user information by nickname', async () => {
    const result = await userController.getUserProfile('irori');

    expect(userService.getUserProfile).toHaveBeenCalled();
    expect(result).toEqual({
      id: 7,
      nickname: 'irori',
      description: null,
      rank: '이세계 난민',
      createdAt: new Date('2024-01-01'),
      animes: [],
    });
  });

  describe('signUp', () => {
    it('should successfully create a new user account', async () => {
      const result = await userController.signUp({
        nickname: 'irori',
        password: 'test1234',
        email: 'test@gmail.com',
      });

      expect(userService.signUp).toHaveBeenCalled();
      expect(result).toEqual(null);
    });

    it('should handle to validate existed user and return an error', async () => {
      jest
        .spyOn(userService, 'signUp')
        .mockRejectedValue(new Error(EErrorMessage.EXISITING_USER));

      try {
        await userController.signUp({
          nickname: 'irori',
          password: 'test1234',
          email: 'test@gmail.com',
        });
      } catch (err) {
        expect(err.message).toEqual(EErrorMessage.EXISITING_USER);
      }
    });
  });

  describe('signIn', () => {
    it('should successfully sign in an existing user', async () => {
      const result = await userController.signIn({
        password: 'test1234',
        email: 'test@gmail.com',
      });

      expect(userService.signIn).toHaveBeenCalled();
      expect(result).toEqual({ user: mockUser, accessToken: '' });
    });

    it('should handle incorrect password and return an error', async () => {
      jest
        .spyOn(userService, 'signUp')
        .mockRejectedValue(new Error(EErrorMessage.LOGIN_FAILED));

      try {
        await userController.signIn({
          password: 'test1234',
          email: 'test@gmail.com',
        });
      } catch (err) {
        expect(err.message).toEqual(EErrorMessage.LOGIN_FAILED);
      }
    });
  });

  describe('changePassword', () => {
    it("should successfully change the user's password", async () => {
      const result = await userController.changePassword(
        {
          password: 'test1234',
        },
        mockUser,
      );

      expect(userService.changePassword).toHaveBeenCalled();
      expect(result).toEqual(null);
    });
  });

  describe('updateProfile', () => {
    it("should successfully update the user's profile", async () => {
      const result = await userController.updateProfile(
        {
          nickname: 'iro',
          description: mockUser.description,
          rank: mockUser.rank,
          profile: mockUser.profile,
        },
        mockUser,
      );

      expect(userService.updateProfile).toHaveBeenCalled();
      expect(result).toEqual(null);
    });
  });

  describe('deleteAccount', () => {
    it("should successfully delete the user's account", async () => {
      const result = await userController.deleteAccount(mockUser);

      expect(userService.deleteAccount).toHaveBeenCalled();
      expect(result).toEqual(null);
    });
  });
});
