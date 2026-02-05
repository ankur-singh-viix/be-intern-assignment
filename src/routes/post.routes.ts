import { Router } from 'express';
import { PostController } from '../controllers/post.controller';

const router = Router();
const controller = new PostController();

// Static routes FIRST
router.get('/feed', controller.getFeed.bind(controller));
router.get('/hashtag/:tag', controller.getPostsByHashtag.bind(controller));

// Collection routes
router.get('/', controller.getAllPosts.bind(controller));
router.post('/', controller.createPost.bind(controller));

// Dynamic routes LAST
router.get('/:id', controller.getPostById.bind(controller));
router.put('/:id', controller.updatePost.bind(controller));
router.delete('/:id', controller.deletePost.bind(controller));

export default router;
