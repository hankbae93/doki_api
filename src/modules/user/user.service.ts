import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcryptjs';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ResponseDto } from '../../common/dto/response.dto';
import { EStatusCode } from '../../common/enum/status.enum';
import {
  EErrorMessage,
  EResponseMessage,
} from '../../common/enum/message.enum';
import { UserRankName } from './user.enum';
import { UserRepository } from './repository/user.repository';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

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

  async changePassword(changePasswordDto: ChangePasswordDto, user: User) {
    const { password } = changePasswordDto;
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    await this.userRepository.updatePassword(user.id, hashedPassword);

    return new ResponseDto(
      EStatusCode.OK,
      null,
      EResponseMessage.PASSWORD_UPDATE_SUCCESS,
    );
  }

  async updateProfile(updateProfileDto: UpdateProfileDto, user: User) {
    const newUser: User = Object.assign(user, updateProfileDto);
    const updatedUser = await this.userRepository.save(newUser);

    return new ResponseDto(
      EStatusCode.OK,
      updatedUser,
      EResponseMessage.USER_UPDATE_SUCCESS,
    );
  }

  async deleteAccount(user: User) {
    await this.userRepository.deleteUser(user.id);

    return new ResponseDto(
      EStatusCode.OK,
      null,
      EResponseMessage.DELETE_ACCOUNT,
    );
  }
}
