import { Router } from 'express';
import { PostController } from '../controllers/post.controller';

const router = Router();
const controller = new PostController();

router.get('/', controller.getAllPosts.bind(controller));
router.get('/:id', controller.getPostById.bind(controller));
router.post('/', controller.createPost.bind(controller));
router.put('/:id', controller.updatePost.bind(controller));
router.delete('/:id', controller.deletePost.bind(controller));

export default router;
