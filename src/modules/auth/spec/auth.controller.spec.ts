import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';

import { PassportModule } from '@nestjs/passport';

import { Anime } from '../../anime/entities/anime.entity';
import { Scrap } from '../../scrap/entities/scrap.entity';
import { Review } from '../../review/entities/review.entity';
import { EErrorMessage } from '../../../common/enum/message.enum';
import { SignInDto } from '../dto/sign-in.dto';
import { AuthService } from '../auth.service';
import { AuthController } from '../auth.controller';
import { User } from '../../user/entities/user.entity';
import { UserRank } from '../../user/user.enum';
import { UserRepository } from '../../user/repository/user.repository';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

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

  const mockAuthService = {
    signUp: jest.fn().mockResolvedValue(null),
    signIn: jest.fn().mockImplementation((signInDto: SignInDto) => ({
      user: mockUser,
      accessToken: '',
    })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
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

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
    expect(authService).toBeDefined();
  });

  describe('signUp', () => {
    it('should successfully create a new user account', async () => {
      const result = await authController.signUp({
        nickname: 'irori',
        password: 'test1234',
        email: 'test@gmail.com',
      });

      expect(authService.signUp).toHaveBeenCalled();
      expect(result).toEqual(null);
    });

    it('should handle to validate existed user and return an error', async () => {
      jest
        .spyOn(authService, 'signUp')
        .mockRejectedValue(new Error(EErrorMessage.EXISITING_USER));

      try {
        await authController.signUp({
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
      const result = await authController.signIn({
        password: 'test1234',
        email: 'test@gmail.com',
      });

      expect(authService.signIn).toHaveBeenCalled();
      expect(result).toEqual({ user: mockUser, accessToken: '' });
    });

    it('should handle incorrect password and return an error', async () => {
      jest
        .spyOn(authService, 'signUp')
        .mockRejectedValue(new Error(EErrorMessage.LOGIN_FAILED));

      try {
        await authController.signIn({
          password: 'test1234',
          email: 'test@gmail.com',
        });
      } catch (err) {
        expect(err.message).toEqual(EErrorMessage.LOGIN_FAILED);
      }
    });
  });
});
