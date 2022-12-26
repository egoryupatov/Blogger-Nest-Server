import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { Article } from '../posts/article.entity';
import { Comment } from '../comments/comments.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    @InjectRepository(Article) private postsRepository: Repository<Article>,
    @InjectRepository(Comment) private commentsRepository: Repository<Comment>,
  ) {}

  async findByLogin(login: string): Promise<User | undefined> {
    return this.usersRepository.findOneByOrFail({ login: login });
  }

  async findById(id: number): Promise<User | undefined> {
    return this.usersRepository.findOneByOrFail({ id: id });
  }

  async getLoggedUserInfo(userId): Promise<Partial<User> | undefined> {
    const user = await this.usersRepository.findOne({
      where: {
        id: userId,
      },
      relations: {
        comments: {
          article: {
            category: true,
          },
          author: true,
        },
        articles: {
          category: true,
          author: true,
          comments: true,
        },
        bannedArticles: true,
        subscriptions: true,
        subscribers: true,
      },
    });

    const { password, ...securedUser } = user;
    return securedUser;
  }

  async hidePost(data) {
    const user = await this.usersRepository.findOneOrFail({
      where: { id: data.userId },
      relations: {
        bannedArticles: true,
      },
    });

    const article = await this.postsRepository.findOneOrFail({
      where: { id: data.postId },
      relations: {
        bannedByUsers: true,
      },
    });

    user.bannedArticles = [...user.bannedArticles, article];

    await this.usersRepository.save(user);
  }

  async unHidePost(data) {
    const user = await this.usersRepository.findOneOrFail({
      where: { id: data.userId },
      relations: {
        bannedArticles: true,
      },
    });

    user.bannedArticles = user.bannedArticles.filter((e) => {
      return e.id !== data.postId;
    });

    await this.usersRepository.save(user);
  }

  async subscribeToUser(userId: number, subId: number) {
    const user = await this.usersRepository.findOne({
      where: {
        id: userId,
      },
      relations: {
        subscriptions: true,
      },
    });

    const subscribedTo = await this.usersRepository.findOne({
      where: {
        id: subId,
      },
      relations: {
        subscribers: true,
      },
    });

    user.subscriptions = [...user.subscriptions, subscribedTo];
    subscribedTo.subscribers = [...subscribedTo.subscribers, user];

    await this.usersRepository.save(user);
    await this.usersRepository.save(subscribedTo);
  }

  async unsubscribeFromUser(userId: number, subId: number) {
    const user = await this.usersRepository.findOne({
      where: {
        id: userId,
      },
      relations: {
        subscriptions: true,
      },
    });

    const subscribedTo = await this.usersRepository.findOne({
      where: {
        id: subId,
      },
      relations: {
        subscribers: true,
      },
    });

    user.subscriptions = user.subscriptions.filter((sub) => {
      return sub.id !== subscribedTo.id;
    });

    subscribedTo.subscribers = subscribedTo.subscribers.filter((sub) => {
      return sub.id !== user.id;
    });

    await this.usersRepository.save(user);
    await this.usersRepository.save(subscribedTo);
  }
}
