import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Like } from '../entities/Like';
import { User } from '../entities/User';
import { Post } from '../entities/post';

export class LikeController {
  private likeRepo = AppDataSource.getRepository(Like);
  private userRepo = AppDataSource.getRepository(User);
  private postRepo = AppDataSource.getRepository(Post);

  async likePost(req: Request, res: Response) {
    const { userId, postId } = req.body;

    const user = await this.userRepo.findOneBy({ id: userId });
    const post = await this.postRepo.findOneBy({ id: postId });

    if (!user || !post) {
      return res.status(404).json({ message: 'User or Post not found' });
    }

    const existingLike = await this.likeRepo.findOne({
      where: {
        user: { id: userId },
        post: { id: postId },
      },
    });

    if (existingLike) {
      return res.status(400).json({ message: 'Post already liked' });
    }

    const like = this.likeRepo.create({ user, post });
    await this.likeRepo.save(like);

    res.status(201).json({ message: 'Post liked successfully' });
  }

  async unlikePost(req: Request, res: Response) {
  const { userId, postId } = req.body;

  const like = await this.likeRepo.findOne({
    where: {
      user: { id: userId },
      post: { id: postId },
    },
  });

  if (!like) {
    return res.status(404).json({ message: 'Like not found' });
  }

  await this.likeRepo.remove(like);
  res.status(204).send();
}


  async getPostLikes(req: Request, res: Response) {
    const postId = Number(req.params.id);

    const likes = await this.likeRepo.find({
      where: { post: { id: postId } },
      relations: ['user'],
    });

    res.json({
      total: likes.length,
      users: likes.map((l) => l.user),
    });
  }
}
