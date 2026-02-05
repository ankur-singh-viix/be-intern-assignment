import { Request, Response } from 'express';
import { User } from '../entities/User';
import { AppDataSource } from '../data-source';
import { Post } from '../entities/post';
import { Like } from '../entities/Like';
import { Follow } from '../entities/Follow';
import { Hashtag } from '../entities/Hashtag';

export class UserController {
  private userRepository = AppDataSource.getRepository(User);
  private postRepository = AppDataSource.getRepository(Post);
  private likeRepository = AppDataSource.getRepository(Like);
  private followRepository = AppDataSource.getRepository(Follow);
  private hashtagRepository = AppDataSource.getRepository(Hashtag);


  async getAllUsers(req: Request, res: Response) {
    try {
      const users = await this.userRepository.find();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching users', error });
    }
  }

  async getUserById(req: Request, res: Response) {
    try {
      const user = await this.userRepository.findOneBy({
        id: parseInt(req.params.id),
      });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching user', error });
    }
  }

  async createUser(req: Request, res: Response) {
      try {
        const user = this.userRepository.create(req.body);
        const result = await this.userRepository.save(user);
        res.status(201).json(result);
      } 
      catch (error: any) {
        if (error.code === 'SQLITE_CONSTRAINT') {
          return res.status(400).json({ message: 'Email already exists' });
        }
        res.status(500).json({ message: 'Error creating user' });
      }
}

  async updateUser(req: Request, res: Response) {
    try {
      const user = await this.userRepository.findOneBy({
        id: parseInt(req.params.id),
      });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      this.userRepository.merge(user, req.body);
      const result = await this.userRepository.save(user);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: 'Error updating user', error });
    }
  }

  async deleteUser(req: Request, res: Response) {
    try {
      const result = await this.userRepository.delete(parseInt(req.params.id));
      if (result.affected === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Error deleting user', error });
    }
  }


  async getUserActivity(req: Request, res: Response) {
    const userId = Number(req.params.id);
    const limit = Number(req.query.limit) || 10;
    const offset = Number(req.query.offset) || 0;

    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user id' });
    }

    // Posts created by user
    const posts = await this.postRepository.find({
      where: { author: { id: userId } },
      order: { createdAt: 'DESC' },
    });

    //  Likes given by user
    const likes = await this.likeRepository.find({
      where: { user: { id: userId } },
      relations: ['post'],
      order: { createdAt: 'DESC' },
    });

    // Users followed by user
    const follows = await this.followRepository.find({
      where: { follower: { id: userId } },
      relations: ['following'],
      order: { createdAt: 'DESC' },
    });

    //Merge everything into a single timeline
    const activity = [
      ...posts.map((post) => ({
        type: 'post',
        createdAt: post.createdAt,
        data: {
          postId: post.id,
          content: post.content,
        },
      })),
      ...likes.map((like) => ({
        type: 'like',
        createdAt: like.createdAt,
        data: {
          postId: like.post.id,
        },
      })),
      ...follows.map((follow) => ({
        type: 'follow',
        createdAt: follow.createdAt,
        data: {
          followingUserId: follow.following.id,
        },
      })),
    ];

    // Sort + paginate
    const sorted = activity
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
      )
      .slice(offset, offset + limit);

    res.json(sorted);
  }
}
