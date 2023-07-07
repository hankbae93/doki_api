import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SignUpDto } from './dto/sign-up.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { SignInDto } from './dto/sign-in.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { Response } from '../common/dto/response';
import { Status } from '../common/enum/status.enum';
import { ErrorMessage, Message } from '../common/enum/message.enum';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async signUp(signUpDto: SignUpDto) {
    const { email, password, description, nickname } = signUpDto;

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      description,
      nickname,
    });

    try {
      await this.userRepository.save(user);
      return new Response(Status.CREATED, null, Message.SUCCESS);
    } catch (err) {
      if (err.errno === 1062) {
        throw new ConflictException('Existing User Email');
      }
    }
  }

  async signIn(signInDto: SignInDto) {
    const { email, password } = signInDto;
    const user = await this.userRepository.findOneBy({ email });
    const isCorrectPassword = await bcrypt.compare(password, user.password);

    if (user && isCorrectPassword) {
      const payload = { email };
      const accessToken = await this.jwtService.signAsync(payload);

      return {
        accessToken,
      };
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

    return new Response(Status.OK, null, Message.PASSWORD_UPDATE_SUCCESS);
  }

  async updateProfile(updateProfileDto: UpdateProfileDto, user: User) {
    const newUser = {
      ...user,
      ...updateProfileDto,
    };

    await this.userRepository.save(newUser);

    return new Response(Status.OK, null, Message.USER_UPDATE_SUCCESS);
  }

  async deleteAccount(user: User) {
    const currentUser = await this.userRepository.findOneBy({ id: user.id });

    await this.userRepository.remove(currentUser);

    return new Response(Status.OK, null, Message.DELETE_ACCOUNT);
  }

  async getUserProfile(nickname: string) {
    const user = await this.userRepository.findOne({
      select: ['id', 'nickname', 'description'],
      where: { nickname },
    });

    if (!user) {
      throw new NotFoundException(ErrorMessage.NOT_FOUND_USER);
    }

    return new Response(Status.OK, user, Message.SUCCESS);
  }
}
