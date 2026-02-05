import express from 'express';
import dotenv from 'dotenv';
import { userRouter } from './routes/user.routes';
import { AppDataSource } from './data-source';
import postRoutes from './routes/post.routes';
import followRoutes from './routes/follow.routes';
import { FollowController } from './controllers/follow.controller';
import likeRoutes from './routes/like.routes';


dotenv.config();

const app = express();
app.use(express.json());
const followController = new FollowController();

AppDataSource.initialize()
  .then(() => {
    console.log('Data Source has been initialized!');
  })
  .catch((err) => {
    console.error('Error during Data Source initialization:', err);
  });

app.get('/', (req, res) => {
  res.send('Welcome to the Social Media Platform API! Server is running successfully.');
});

app.get(
  '/api/users/:id/followers',
  followController.getFollowers.bind(followController)
);

app.use('/api/users', userRouter);
app.use('/api/posts', postRoutes);
app.use('/api/follows', followRoutes);
app.use('/api/likes', likeRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
