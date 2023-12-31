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
import { ApiTags } from '@nestjs/swagger';

@Controller('user')
@ApiTags('USER & AUTH')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('/info')
  @UseGuards(AuthGuard())
  getUserInfo(@GetUser() user: User) {
    return this.userService.getUserInfo(user);
  }

  @Get('/:nickname')
  getUserProfile(@Param('nickname') nickname) {
    return this.userService.getUserProfile(nickname);
  }

  @Post('/signup')
  signUp(@Body() signUpDto: SignUpDto) {
    return this.userService.signUp(signUpDto);
  }

  @Post('/signin')
  signIn(@Body() signInDto: SignInDto) {
    return this.userService.signIn(signInDto);
  }

  @Post('/password')
  @UseGuards(AuthGuard())
  changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @GetUser() user: User,
  ) {
    return this.userService.changePassword(changePasswordDto, user);
  }

  @Post('/profile')
  @UseGuards(AuthGuard())
  updateProfile(
    @Body() updateProfileDto: UpdateProfileDto,
    @GetUser() user: User,
  ) {
    return this.userService.updateProfile(updateProfileDto, user);
  }

  @Delete('/delete')
  @UseGuards(AuthGuard())
  deleteAccount(@GetUser() user: User) {
    return this.userService.deleteAccount(user);
  }
}
