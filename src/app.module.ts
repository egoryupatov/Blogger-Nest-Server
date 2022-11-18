import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/user.entity';
import { UsersModule } from './users/users.module';
import { Article } from './posts/article.entity';
import { PostsModule } from './posts/posts.module';
import { Comments } from './comments/comments.entity';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      username: 'admin',
      port: 3306,
      password: 'qwerty',
      database: 'blog',
      entities: [User, Article, Comments],
      synchronize: true,
    }),
    UsersModule,
    PostsModule,
    DashboardModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
