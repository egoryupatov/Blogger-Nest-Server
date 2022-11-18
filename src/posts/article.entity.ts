import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Comments } from '../comments/comments.entity';

@Entity()
export class Article {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.articles)
  author: User;

  @ManyToMany(() => User, (user) => user.bannedArticles)
  bannedByUsers: User[];

  @Column()
  category: string;

  @Column()
  time: string;

  @Column()
  categoryImage: string;

  @Column()
  postImage: string;

  @Column()
  title: string;

  @Column()
  description: string;

  @OneToMany(() => Comments, (comments) => comments.article)
  comments: Comments[];

  @Column()
  numberOfComments: number;

  @Column()
  rating: number;

  @Column('text')
  text: string;
}
