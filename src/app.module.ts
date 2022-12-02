import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/user.entity';
import { UsersModule } from './users/users.module';
import { Article } from './posts/article.entity';
import { PostsModule } from './posts/posts.module';
import { Comment } from './comments/comments.entity';
import { DashboardModule } from './dashboard/dashboard.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { CommentsModule } from './comments/comments.module';
import { Category } from './category/category.entity';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/pictures',
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      username: 'admin',
      port: 3306,
      password: 'qwerty',
      database: 'blog',
      entities: [User, Article, Comment, Category],
      synchronize: true,
      autoLoadEntities: true,
    }),
    ConfigModule.forRoot(),
    UsersModule,
    PostsModule,
    DashboardModule,
    CommentsModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
