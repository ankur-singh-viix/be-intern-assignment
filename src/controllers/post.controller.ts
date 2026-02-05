import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Post } from '../entities/post';
import { User } from '../entities/User';
import { Hashtag } from '../entities/Hashtag';

export class PostController {
  private postRepository = AppDataSource.getRepository(Post);
  private userRepository = AppDataSource.getRepository(User);
  private hashtagRepo = AppDataSource.getRepository(Hashtag);

  async getAllPosts(req: Request, res: Response) {
    const posts = await this.postRepository.find({
      relations: ['author'],
      order: { createdAt: 'DESC' },
    });
    res.json(posts);
  }

  async getPostById(req: Request, res: Response) {
    const postId = Number(req.params.id);

    if (isNaN(postId)) {
         return res.status(400).json({ message: 'Invalid post id' });
        }

    const post = await this.postRepository.findOne({
        where: { id: postId },
        relations: ['author'],
    });

    if (!post) {
        return res.status(404).json({ message: 'Post not found' });
    }

    res.json(post);
  }


  async createPost(req: Request, res: Response) {
    const { content, authorId , hashtags = []} = req.body;

    const author = await this.userRepository.findOneBy({ id: authorId });
    if (!author) {
      return res.status(404).json({ message: 'Author not found' });
    }

    const hashtagEntities = [];

    for (const tag of hashtags) {
        const normalized = tag.toLowerCase();

        let hashtag = await this.hashtagRepo.findOne({
          where: { name: normalized },
    });

    if (!hashtag) {
      hashtag = this.hashtagRepo.create({ name: normalized });
      await this.hashtagRepo.save(hashtag);
    }

       hashtagEntities.push(hashtag);
    }
    const post = this.postRepository.create({
      content,
      author,
      hashtags: hashtagEntities,
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

  async getPostsByHashtag(req: Request, res: Response) {
    const tag = req.params.tag.toLowerCase();

    const posts = await this.postRepository
        .createQueryBuilder('post')
        .leftJoinAndSelect('post.author', 'author')
        .leftJoinAndSelect('post.hashtags', 'hashtag')
        .where('hashtag.name = :tag', { tag })
        .orderBy('post.createdAt', 'DESC')
        .getMany();
        res.json(posts);
    }

    async getFeed(req: Request, res: Response) {
        const userId = Number(req.query.userId);
        const limit = Number(req.query.limit) || 10;
        const offset = Number(req.query.offset) || 0;

        if (!userId) {
            return res.status(400).json({ message: 'userId is required' });
        }

        const posts = await this.postRepository
            .createQueryBuilder('post')
            .innerJoin(
                'follows',
                'follow',
                'follow.followingId = post.authorId'
            )
            .leftJoinAndSelect('post.author', 'author')
            .leftJoinAndSelect('post.hashtags', 'hashtag')
            .leftJoin('post.likes', 'like')
            .where('follow.followerId = :userId', { userId })
            .orderBy('post.createdAt', 'DESC')
            .skip(offset)
            .take(limit)
            .loadRelationCountAndMap('post.likeCount', 'post.likes')
            .getMany();
        res.json(posts);
    }
}
