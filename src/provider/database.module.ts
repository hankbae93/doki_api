import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

interface EnvironmentVariables {
  DB_TYPE: 'mysql' | 'mariadb';
  DB_HOST: string;
  DB_PORT: string;
  DB_USERNAME: string;
  DB_PASSWORD: string;
  DB_SCHEMA: string;
}

export const DatabaseModule = TypeOrmModule.forRootAsync({
  inject: [ConfigService],
  useFactory: async (configService: ConfigService<EnvironmentVariables>) => {
    return {
      type: configService.get('DB_TYPE'),
      host: configService.get('DB_HOST'),
      port: parseInt(configService.get('DB_PORT')),
      username: configService.get('DB_USERNAME'),
      password: configService.get('DB_PASSWORD'),
      database: configService.get('DB_SCHEMA'),
      entities: [__dirname + '/../modules/**/entities/*.entity{.ts,.js}'],
      synchronize: true,
      logging: true,
      namingStrategy: new SnakeNamingStrategy(),
    } as TypeOrmModuleOptions;
  },
});
