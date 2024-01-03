import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { SignInDto } from './dto/sign-in.dto';
import {
  EErrorMessage,
  EResponseMessage,
} from '../../common/enum/message.enum';
import { User } from '../user/entities/user.entity';
import { UserRankName } from '../user/user.enum';
import { ResponseDto } from '../../common/dto/response.dto';
import { EStatusCode } from '../../common/enum/status.enum';
import { UserRepository } from '../user/repository/user.repository';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { SignUpDto } from './dto/sign-up.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private jwtService: JwtService,
  ) {}
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
}
