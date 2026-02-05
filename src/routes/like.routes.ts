import { Router } from 'express';
import { LikeController } from '../controllers/like.controller';

const router = Router();
const controller = new LikeController();

router.post('/', controller.likePost.bind(controller));
router.delete('/', controller.unlikePost.bind(controller));
router.get('/posts/:id/likes', controller.getPostLikes.bind(controller));

export default router;
