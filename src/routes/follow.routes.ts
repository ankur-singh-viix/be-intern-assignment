import { Router } from 'express';
import { FollowController } from '../controllers/follow.controller';

const router = Router();
const controller = new FollowController();

router.post('/', controller.followUser.bind(controller));
router.delete('/', controller.unfollowUser.bind(controller));

export default router;
