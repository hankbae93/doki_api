# ❤️‍🔥ドキドキ 漫画部!!! ❤️‍🔥 api-server

## introduction

애니메이션 커뮤니티 게시판 서비스
1. 유저
- 유저는 애니메이션 정보를 등록할 수 있다.
- 유저는 등록한 애니메이션 개수, 리뷰 수에 따라 등급이 나뉜다.
- 유저는 선호하거나 나중에 참고할 애니메이션을 스크랩해 자신의 페이지에서 따로 조회할 수 있다.

2. 애니메이션
- 애니메이션은 사용자들이 코멘트와 리뷰 점수를 등록하면 그에 따라 평점이 매겨진다.
- 같은 IP의 애니메이션들은 시리즈라는 이름으로 묶여 조회할 수 있다.
- 애니메이션은 필터링하여 조회할 수 있다.


## stacks

database: mariaDB
tools: typeORM, dbeaver, docker, erd-cloud, postman, swagger

## config
```ts
// app.module.ts
@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: ENV === 'production' ? `.env.${ENV}` : '.env',
        }),
        TypeOrmModule.forRootAsync(typeOrmConfig),
        MulterModule.register({
            dest: './files',
        }),
        AuthModule,
        UserModule,
        AnimeModule,
        TagModule,
        ReviewModule,
        ScrapModule,
    ],
})
export class AppModule {}
```


```json
{
    "build": "nest build",
    "start": "NODE_ENV=development nest start",
    "start:dev": "NODE_ENV=development nest start --watch",
    "start:prod": "NODE_ENV=production node dist/main",
}
```

@nestjs/config 모듈을 활용하여 스크립트 실행 시 NODE_ENV args에 따라 동적으로 env가 반영되도록 구성했습니다.

```ts
// config/typeorm.config.ts
export const typeOrmConfig: TypeOrmModuleAsyncOptions = {
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: async (): Promise<TypeOrmModuleOptions> => {
        return {
            type: 'mariadb',
            host: process.env.DB_HOST,
            port: parseInt(process.env.DB_PORT),
            username: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            database: 'doki_db',
            entities: [User, Anime, Review, Tag, Scrap, Image],
            synchronize: true,
            logging: true,
            namingStrategy: new SnakeNamingStrategy(),
        };
    },
};
```

AppModule에서 선언되는 config들은 config 폴더에서 관리되며 케이스에 따라 ConfigModule을 주입받습니다.

## module


## auth
