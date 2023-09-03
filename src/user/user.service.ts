import {
  ConflictException,
  HttpException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SignUpDto } from './dto/sign-up.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { DataSource, Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { SignInDto } from './dto/sign-in.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ResponseDto } from '../common/dto/responseDto';
import { StatusCodeEnum } from '../common/enum/status.enum';
import { Request } from 'express';
import {
  ErrorMessageEnum,
  ResponseMessageEnum,
} from '../common/enum/message.enum';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private dataSource: DataSource,
  ) {}

  getUserFromRequest(request: Request): User {
    const authHeader = request.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token) {
      return this.jwtService.decode(token) as User;
    }
    return null;
  }

  async signUp(signUpDto: SignUpDto) {
    const { email, password, nickname } = signUpDto;

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      nickname,
      description: '',
    });

    try {
      await this.userRepository.save(user);
      return new ResponseDto(
        StatusCodeEnum.CREATED,
        null,
        ResponseMessageEnum.SUCCESS,
      );
    } catch (err) {
      if (err.errno === 1062) {
        throw new ConflictException('Existing User Email');
      }
      throw new ConflictException('Server Error');
    }
  }

  async signIn(signInDto: SignInDto) {
    const { email, password } = signInDto;

    const user = await this.dataSource
      .getRepository(User)
      .createQueryBuilder('user')
      .select('*')
      .where('email = :email', { email: email })
      .getRawOne();

    if (!user) {
      throw new NotFoundException('login Failed');
    }

    const isCorrectPassword = await bcrypt.compare(password, user.password);

    if (user && isCorrectPassword) {
      const payload = { email };
      const accessToken = await this.jwtService.signAsync(payload);
      const newUser = {
        ...user,
      };

      delete newUser.password;

      return new ResponseDto(
        StatusCodeEnum.OK,
        { accessToken, user: newUser },
        ResponseMessageEnum.LOGIN_SUCCESS,
      );
    } else {
      throw new UnauthorizedException('login Failed');
    }
  }

  async changePassword(changePasswordDto: ChangePasswordDto, user: User) {
    const password = changePasswordDto.password;
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = {
      ...user,
      password: hashedPassword,
    };

    await this.userRepository.save(newUser);

    return new ResponseDto(
      StatusCodeEnum.OK,
      null,
      ResponseMessageEnum.PASSWORD_UPDATE_SUCCESS,
    );
  }

  async updateProfile(updateProfileDto: UpdateProfileDto, user: User) {
    const newUser = {
      ...user,
      ...updateProfileDto,
    };

    await this.userRepository.save(newUser);

    return new ResponseDto(
      StatusCodeEnum.OK,
      null,
      ResponseMessageEnum.USER_UPDATE_SUCCESS,
    );
  }

  async deleteAccount(user: User) {
    const currentUser = await this.userRepository.findOneBy({ id: user.id });

    await this.userRepository.remove(currentUser);

    return new ResponseDto(
      StatusCodeEnum.OK,
      null,
      ResponseMessageEnum.DELETE_ACCOUNT,
    );
  }

  async getUserProfile(nickname: string) {
    const user = await this.userRepository.findOne({
      select: ['id', 'nickname', 'description'],
      where: { nickname },
      relations: ['animes'],
    });

    if (!user) {
      throw new NotFoundException(ErrorMessageEnum.NOT_FOUND_USER);
    }

    return new ResponseDto(
      StatusCodeEnum.OK,
      user,
      ResponseMessageEnum.SUCCESS,
    );
  }
}
