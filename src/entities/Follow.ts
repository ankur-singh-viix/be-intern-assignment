import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  Unique,
  Index,
} from 'typeorm';
import { User } from './User';

@Entity('follows')
@Unique(['follower', 'following'])
@Index(['following', 'createdAt'])
export class Follow {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  follower: User;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  following: User;

  @CreateDateColumn()
  createdAt: Date;
}
