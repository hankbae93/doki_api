import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SignUpDto } from './dto/sign-up.dto';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcryptjs';
import { SignInDto } from './dto/sign-in.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ResponseDto } from '../common/dto/responseDto';
import { EStatusCode } from '../common/enum/status.enum';
import { EErrorMessage, EResponseMessage } from '../common/enum/message.enum';
import { UserRankName } from './user.enum';
import { UserRepository } from './repository/user.repository';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private jwtService: JwtService,
  ) {}

  getUserInfo(user: User) {
    return new ResponseDto(EStatusCode.OK, user, EResponseMessage.SUCCESS);
  }

  async getUserProfile(nickname: string) {
    const user = await this.userRepository.findProfileByNickname(nickname);

    if (!user) {
      throw new NotFoundException(EErrorMessage.NOT_FOUND_USER);
    }

    return new ResponseDto(
      EStatusCode.OK,
      { ...user, rank: UserRankName[user.rank] },
      EResponseMessage.SUCCESS,
    );
  }

  async signUp(signUpDto: SignUpDto) {
    const { email, password, nickname } = signUpDto;

    const isUser = await this.userRepository.findRawOneByEmail(email);
    if (isUser) {
      throw new ConflictException(EErrorMessage.EXISITING_USER);
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      nickname,
    });

    await this.userRepository.insert(user);
    return new ResponseDto(
      EStatusCode.CREATED,
      null,
      EResponseMessage.SIGN_UP_SUCCESS,
    );
  }

  async signIn(signInDto: SignInDto) {
    const { email, password } = signInDto;
    const user = await this.userRepository.findRawOneByEmail(email);

    if (!user) {
      throw new NotFoundException(EErrorMessage.LOGIN_FAILED);
    }

    if (user.retired) {
      throw new NotFoundException('Retired Account, please contact FAQ pages');
    }

    const isCorrectPassword = await bcrypt.compare(password, user.password);
    if (!isCorrectPassword) {
      throw new UnauthorizedException(EErrorMessage.LOGIN_FAILED);
    }

    const payload = { email };
    const accessToken = await this.jwtService.signAsync(payload);
    const userInfo: User = Object.assign(user, {
      rank: UserRankName[user.rank],
    });

    return new ResponseDto(
      EStatusCode.OK,
      { accessToken, user: userInfo },
      EResponseMessage.LOGIN_SUCCESS,
    );
  }

  async changePassword(changePasswordDto: ChangePasswordDto, user: User) {
    const { password } = changePasswordDto;
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    await this.userRepository.update(
      { id: user.id },
      { password: hashedPassword },
    );

    return new ResponseDto(
      EStatusCode.OK,
      null,
      EResponseMessage.PASSWORD_UPDATE_SUCCESS,
    );
  }

  async updateProfile(updateProfileDto: UpdateProfileDto, user: User) {
    const newUser: User = Object.assign(user, updateProfileDto);
    await this.userRepository.update({ id: user.id }, newUser);

    return new ResponseDto(
      EStatusCode.OK,
      null,
      EResponseMessage.USER_UPDATE_SUCCESS,
    );
  }

  async deleteAccount(user: User) {
    await this.userRepository.update(
      { id: user.id },
      {
        retired: true,
      },
    );

    return new ResponseDto(
      EStatusCode.OK,
      null,
      EResponseMessage.DELETE_ACCOUNT,
    );
  }
}
