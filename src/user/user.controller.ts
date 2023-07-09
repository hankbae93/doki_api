import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { AuthGuard } from '@nestjs/passport';
import { ChangePasswordDto } from './dto/change-password.dto';
import { GetUser } from './get-user.decorator';
import { User } from './entities/user.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { StatusCodeEnum } from '../common/enum/status.enum';
import {
  ErrorMessageEnum,
  ResponseMessageEnum,
} from '../common/enum/message.enum';

@Controller('user')
@ApiTags('USER & AUTH')
export class UserController {
  constructor(private authService: UserService) {}

  @Get(':nickname')
  @ApiOperation({
    summary: '해당 유저 정보 조회',
  })
  @ApiParam({
    name: 'nickname',
    required: true,
    description: '유저의 닉네임',
    type: String,
  })
  @ApiResponse({
    status: StatusCodeEnum.OK,
    description: ResponseMessageEnum.SUCCESS,
  })
  @ApiResponse({
    status: StatusCodeEnum.NOT_FOUND,
    description: ErrorMessageEnum.NOT_FOUND_USER,
  })
  getUserProfile(@Param('nickname') nickname) {
    return this.authService.getUserProfile(nickname);
  }

  @Post('signup')
  @ApiOperation({
    summary: '회원가입',
  })
  signUp(@Body() signUpDto: SignUpDto) {
    return this.authService.signUp(signUpDto);
  }

  @Post('signin')
  @ApiOperation({
    summary: '로그인',
  })
  signIn(@Body() signInDto: SignInDto) {
    return this.authService.signIn(signInDto);
  }

  @Post('password')
  @ApiOperation({
    summary: '비밀번호 변경',
  })
  @ApiResponse({
    status: StatusCodeEnum.FORBIDEN,
  })
  @ApiResponse({
    status: StatusCodeEnum.CREATED,
    description: ResponseMessageEnum.SUCCESS,
  })
  @UseGuards(AuthGuard())
  changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @GetUser() user: User,
  ) {
    return this.authService.changePassword(changePasswordDto, user);
  }

  @Post('profile')
  @ApiOperation({
    summary: '사용자 프로필 정보 변경',
  })
  @ApiResponse({
    status: StatusCodeEnum.FORBIDEN,
  })
  @ApiResponse({
    status: StatusCodeEnum.CREATED,
    description: ResponseMessageEnum.SUCCESS,
  })
  @UseGuards(AuthGuard())
  updateProfile(
    @Body() updateProfileDto: UpdateProfileDto,
    @GetUser() user: User,
  ) {
    return this.authService.updateProfile(updateProfileDto, user);
  }

  @Delete('delete')
  @ApiOperation({
    summary: '회원 탈퇴',
  })
  @ApiResponse({
    status: StatusCodeEnum.FORBIDEN,
  })
  @ApiResponse({
    status: StatusCodeEnum.OK,
    description: ResponseMessageEnum.DELETE_ACCOUNT,
  })
  @UseGuards(AuthGuard())
  deleteAccount(@GetUser() user: User) {
    return this.authService.deleteAccount(user);
  }
}
