import {
  ConflictException,
  Injectable,
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
    return 'SUCCESS';
  }

  async updateProfile(updateProfileDto: UpdateProfileDto, user: User) {
    const newUser = {
      ...user,
      ...updateProfileDto,
    };

    await this.userRepository.save(newUser);
    return 'SUCCESS';
  }

  async deleteAccount() {}
}
