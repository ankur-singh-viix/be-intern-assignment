import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Post } from '../entities/post';
import { User } from '../entities/User';

export class PostController {
  private postRepository = AppDataSource.getRepository(Post);
  private userRepository = AppDataSource.getRepository(User);

  async getAllPosts(req: Request, res: Response) {
    const posts = await this.postRepository.find({
      relations: ['author'],
      order: { createdAt: 'DESC' },
    });
    res.json(posts);
  }

  async getPostById(req: Request, res: Response) {
    const post = await this.postRepository.findOne({
      where: { id: Number(req.params.id) },
      relations: ['author'],
    });

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.json(post);
  }

  async createPost(req: Request, res: Response) {
    const { content, authorId } = req.body;

    const author = await this.userRepository.findOneBy({ id: authorId });
    if (!author) {
      return res.status(404).json({ message: 'Author not found' });
    }

    const post = this.postRepository.create({
      content,
      author,
    });

    const result = await this.postRepository.save(post);
    res.status(201).json(result);
  }

  async updatePost(req: Request, res: Response) {
    const post = await this.postRepository.findOneBy({
      id: Number(req.params.id),
    });

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    this.postRepository.merge(post, req.body);
    const result = await this.postRepository.save(post);
    res.json(result);
  }

  async deletePost(req: Request, res: Response) {
    const result = await this.postRepository.delete(Number(req.params.id));

    if (result.affected === 0) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.status(204).send();
  }
}
