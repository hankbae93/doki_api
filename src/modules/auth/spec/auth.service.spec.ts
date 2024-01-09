import { Test, TestingModule } from '@nestjs/testing';
import { ScenariosMock } from '../../../common/mock/scenarios.mock';
import { UserRepository } from '../../user/repository/user.repository';
import { AuthService } from '../auth.service';
import { JwtService } from '@nestjs/jwt';
import { SignInDto } from '../dto/sign-in.dto';
import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { DataMock } from '../../../common/mock/data.mock';
import { EStatusCode } from '../../../common/enum/status.enum';
import { EResponseMessage } from '../../../common/enum/message.enum';
import { SignUpDto } from '../dto/sign-up.dto';

describe('AuthService', () => {
  let authService: AuthService;
  let userRepository: UserRepository;
  let jwtService: JwtService;
  const scenarios = ScenariosMock.getMethodNames(AuthService);

  const mockUserRepository = {
    findRawOneByEmail: jest.fn(),
    create: jest.fn(),
    insert: jest.fn(),
  };
  const mockJwtService = {
    signAsync: jest.fn().mockResolvedValue('access-token'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: JwtService, useValue: mockJwtService },
        { provide: UserRepository, useValue: mockUserRepository },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    userRepository = module.get<UserRepository>(UserRepository);
  });

  describe(scenarios.signIn, () => {
    it('이메일이 존재하지 않는 회원일 경우 에러를 던집니다', async () => {
      const dto = {
        email: 'ddd',
        password: '1234',
      } as SignInDto;

      jest.spyOn(userRepository, 'findRawOneByEmail').mockResolvedValue(null);

      await expect(authService.signIn(dto)).rejects.toThrowError(
        NotFoundException,
      );
    });

    it('탈퇴한 회원일 경우 에러를 던집니다', async () => {
      const retiredUser = Object.assign(DataMock.mockUser(), { retired: true });
      const dto = {
        email: 'ddd',
        password: '1234',
      } as SignInDto;

      jest
        .spyOn(userRepository, 'findRawOneByEmail')
        .mockResolvedValue(retiredUser);

      await expect(authService.signIn(dto)).rejects.toThrowError(
        ForbiddenException,
      );
    });

    it('탈퇴한 회원일 경우 에러를 던집니다', async () => {
      const retiredUser = Object.assign(DataMock.mockUser(), { retired: true });
      const dto = {
        email: 'ddd',
        password: '1234',
      } as SignInDto;

      jest
        .spyOn(userRepository, 'findRawOneByEmail')
        .mockResolvedValue(retiredUser);

      await expect(authService.signIn(dto)).rejects.toThrowError(
        ForbiddenException,
      );
    });

    it('비밀번호가 일치하지 않을 경우 에러를 던집니다.', async () => {
      const hashedPassword =
        '$2a$10$9BfqAV7gVpeEFJBQCXlm5OWwlvgvRwyGq8xQsjNkJRtdyJsT3Vvva';
      const user = Object.assign(DataMock.mockUser(), {
        password: hashedPassword,
      });
      const dto = {
        email: user.email,
        password: '1234',
      } as SignInDto;

      jest.spyOn(userRepository, 'findRawOneByEmail').mockResolvedValue(user);

      await expect(authService.signIn(dto)).rejects.toThrowError(
        NotFoundException,
      );
    });

    it('이메일과 비밀번호가 일치할 경우 유저 정보와 액세스 토큰을 반환합니다.', async () => {
      const hashedPassword =
        '$2a$10$9BfqAV7gVpeEFJBQCXlm5OWwlvgvRwyGq8xQsjNkJRtdyJsT3Vvva';
      const user = DataMock.mockUser();
      const dto = {
        email: user.email,
        password: 'test1234',
      } as SignInDto;
      const response = DataMock.mockResponse(
        EStatusCode.OK,
        {
          accessToken: 'access-token',
          user: Object.assign(user, { password: null }),
        },
        EResponseMessage.LOGIN_SUCCESS,
      );

      jest.spyOn(userRepository, 'findRawOneByEmail').mockResolvedValue(
        Object.assign(user, {
          password: hashedPassword,
        }),
      );
      jest.spyOn(jwtService, 'signAsync').mockResolvedValue('access-token');

      const result = await authService.signIn(dto);

      expect(result).toEqual(response);
    });

    describe(scenarios.signUp, () => {
      it('회원이 존재할 경우 에러를 던집니다.', async () => {
        const user = DataMock.mockUser();
        const dto = { email: '', password: '', nickname: '' } as SignUpDto;

        jest.spyOn(userRepository, 'findRawOneByEmail').mockResolvedValue(user);

        await expect(authService.signUp(dto)).rejects.toThrowError(
          ConflictException,
        );
      });

      it('회원 가입이 성공하면 응답합니다.', async () => {
        const dto = {
          email: 'test@gmail.com',
          password: '1234',
          nickname: 'test',
        } as SignUpDto;
        const response = DataMock.mockResponse(
          EStatusCode.CREATED,
          null,
          EResponseMessage.SIGN_UP_SUCCESS,
        );

        jest.spyOn(userRepository, 'findRawOneByEmail').mockResolvedValue(null);

        const result = await authService.signUp(dto);
        expect(result).toEqual(response);
      });
    });
  });
});
