import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { UserRepository } from './repository/user.repository';
import { jwtConfig } from '../config/jwt.config';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync(jwtConfig),
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [UserController],
  providers: [UserService, JwtStrategy, UserRepository],
  exports: [JwtStrategy, PassportModule],
})
export class UserModule {}
