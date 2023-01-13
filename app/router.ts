import { Application } from 'egg';

export default (app: Application) => {
  const { controller, router, middleware } = app;
  const _jwt = middleware.jwtErr(app.config.jwt.secret);

  router.get('/', controller.home.index);
  router.post('/add', controller.home.add);

  router.get('/user', controller.home.user);
  router.post('/addUser', controller.home.addUser);
  router.post('/editUser', controller.home.editUser);
  router.post('/deleteUser', controller.home.deleteUser);

  router.post('/api/user/register', controller.user.register);
  router.post('/api/user/login', controller.user.login);
  router.post('/api/user/getUserInfo', _jwt, controller.user.getUserInfo);
  router.post('/api/user/editUserInfo', _jwt, controller.user.editUserInfo);
  router.post('/api/upload', controller.upload.upload);

  router.post('/api/bill/add', _jwt, controller.bill.add);

  router.post('/api/user/test', _jwt, controller.user.test);
};
