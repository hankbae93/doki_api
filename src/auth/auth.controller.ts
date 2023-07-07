import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { AuthGuard } from '@nestjs/passport';
import { ChangePasswordDto } from './dto/change-password.dto';
import { GetUser } from './get-user.decorator';
import { User } from './entities/user.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('/user/:nickname')
  getUserProfile(@Param('nickname') nickname) {
    return this.authService.getUserProfile(nickname);
  }

  @Post('/signup')
  signUp(@Body(ValidationPipe) signUpDto: SignUpDto) {
    return this.authService.signUp(signUpDto);
  }

  @Post('/signin')
  signIn(@Body() signInDto: SignInDto) {
    return this.authService.signIn(signInDto);
  }

  @Post('/password')
  @UseGuards(AuthGuard())
  changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @GetUser() user: User,
  ) {
    return this.authService.changePassword(changePasswordDto, user);
  }

  @Post('/profile')
  @UseGuards(AuthGuard())
  updateProfile(
    @Body() updateProfileDto: UpdateProfileDto,
    @GetUser() user: User,
  ) {
    return this.authService.updateProfile(updateProfileDto, user);
  }

  @Post('/delete_account')
  @UseGuards(AuthGuard())
  deleteAccount(@GetUser() user: User) {
    return this.authService.deleteAccount(user);
  }
}
