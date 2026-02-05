import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Follow } from '../entities/Follow';
import { User } from '../entities/User';

export class FollowController {
  private followRepo = AppDataSource.getRepository(Follow);
  private userRepo = AppDataSource.getRepository(User);

  async followUser(req: Request, res: Response) {
  const { followerId, followingId } = req.body;

  if (followerId === followingId) {
    return res.status(400).json({ message: 'Cannot follow yourself' });
  }

  const follower = await this.userRepo.findOneBy({ id: followerId });
  const following = await this.userRepo.findOneBy({ id: followingId });

  if (!follower || !following) {
    return res.status(404).json({ message: 'User not found' });
  }

  const existingFollow = await this.followRepo.findOne({
    where: {
      follower: { id: followerId },
      following: { id: followingId },
    },
  });

  if (existingFollow) {
    return res.status(400).json({ message: 'Already following this user' });
  }

  const follow = this.followRepo.create({ follower, following });
  await this.followRepo.save(follow);

  res.status(201).json({ message: 'Followed successfully' });
}


  async unfollowUser(req: Request, res: Response) {
  const { followerId, followingId } = req.body;

  const result = await this.followRepo.delete({
    follower: { id: followerId },
    following: { id: followingId },
  });

  if (result.affected === 0) {
    return res
      .status(404)
      .json({ message: 'Follow relationship not found' });
  }

  res.status(204)
    .send("`Unfollowed successfully`");

}


  async getFollowers(req: Request, res: Response) {
    const userId = Number(req.params.id);

    const followers = await this.followRepo.find({
      where: { following: { id: userId } },
      relations: ['follower'],
      order: { createdAt: 'DESC' },
    });

    res.json({
      total: followers.length,
      followers: followers.map((f) => f.follower),
    });
  }
}
