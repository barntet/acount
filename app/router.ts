import { Application } from 'egg';

export default (app: Application) => {
  const { controller, router } = app;

  router.get('/', controller.home.index);
  router.post('/add', controller.home.add);

  router.get('/user', controller.home.user);
  router.post('/addUser', controller.home.addUser);
  router.post('/editUser', controller.home.editUser);
  router.post('/deleteUser', controller.home.deleteUser);

  router.post('/api/user/register', controller.user.register);
};
