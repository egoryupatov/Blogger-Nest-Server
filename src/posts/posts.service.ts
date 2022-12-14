import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BlogPost } from './blogPost.entity';
import { Not, In, Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { Category } from '../category/category.entity';
import { Like } from 'typeorm';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(BlogPost) private postsRepository: Repository<BlogPost>,
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async getAllPostsWithoutBanned(userId: number): Promise<BlogPost[]> {
    const user = await this.userRepository.findOneOrFail({
      relations: {
        hiddenBlogPosts: true,
      },
      where: {
        id: userId,
      },
    });

    const posts = await this.postsRepository.find({
      relations: {
        bannedByUsers: true,
        user: true,
        category: true,
        comments: true,
      },
      where: {
        id: Not(In(user.hiddenBlogPosts.map((article) => article.id))),
      },
    });

    return posts;
  }

  async getBannedPosts(userId: number): Promise<BlogPost[]> {
    const user = await this.userRepository.findOneOrFail({
      relations: {
        hiddenBlogPosts: true,
      },
      where: {
        id: userId,
      },
    });

    const posts = await this.postsRepository.find({
      relations: {
        bannedByUsers: true,
        user: true,
        category: true,
      },
      where: {
        id: In(user.hiddenBlogPosts.map((article) => article.id)),
      },
    });

    return posts;
  }

  async getSinglePost(id: number): Promise<BlogPost> {
    const post = await this.postsRepository.findOne({
      where: {
        id: id,
      },
      relations: {
        category: true,
        user: true,
        comments: true,
      },
    });

    return post;
  }

  async addPost(post: BlogPost) {
    await this.postsRepository.save(post);
  }

  /* async editPost(id: number, data: Article) {
    const updatedPost = await this.postsRepository.findOne({
      relations: {
        category: true,
        author: true,
        comments: true,
      },
      where: { id: id },
    });

    return this.postsRepository.update(updatedPost.id, data);
  }*/

  async deletePost(id: number) {
    await this.postsRepository.delete(id);
  }

  async incrementRating(id: number) {
    const post = await this.postsRepository.findOne({
      relations: {
        user: true,
      },
      where: {
        id: id,
      },
    });

    const user = await this.userRepository.findOne({
      where: { id: post.user.id },
    });

    await this.postsRepository.increment({ id: post.id }, 'rating', 1);
    await this.userRepository.increment({ id: user.id }, 'rating', 1);
  }

  async decrementRating(id: number) {
    const post = await this.postsRepository.findOne({
      relations: {
        user: true,
      },
      where: {
        id: id,
      },
    });

    const user = await this.userRepository.findOne({
      where: { id: post.user.id },
    });

    await this.postsRepository.decrement({ id: post.id }, 'rating', 1);
    await this.userRepository.decrement({ id: user.id }, 'rating', 1);
  }

  async getPostsByCategory(postCategory: string): Promise<BlogPost[]> {
    const category = await this.categoryRepository.findOne({
      where: {
        name: postCategory,
      },
    });

    const posts = await this.postsRepository.find({
      relations: {
        category: true,
        comments: true,
        user: true,
      },
      where: {
        category: category,
      },
    });

    return posts;
  }

  async getSearchResults(searchQuery: string) {
    const searchResults = await this.postsRepository.find({
      where: { title: Like(`%${searchQuery}%`) },
      relations: ['category', 'author', 'comments'],
    });

    return searchResults;
  }
}
