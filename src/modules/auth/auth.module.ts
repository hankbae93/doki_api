import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { JwtStrategy } from './jwt.strategy';
import { UserRepository } from '../user/repository/user.repository';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          isGlobal: true,
          secret: configService.get('APP_SECRET'),
          signOptions: { expiresIn: '1d' },
        };
      },
    }),
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, UserRepository],
  exports: [JwtStrategy, PassportModule],
})
export class AuthModule {}
