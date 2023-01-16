import { Service } from 'egg';

export default class User extends Service {
  // 通过用户名获取用户信息
  public async getUserByName(username) {
    const { app } = this;
    try {
      // return await app.mysql.get('user', { username });
      return await app.model.User.findOne({ where: { username } });
    } catch (error) {
      console.log('getUserByName', error);
      throw error;
    }
  }

  //  注册
  public async register(params) {
    const { app } = this;
    try {
      // return await app.mysql.insert('user', params);
      return await app.model.User.create(params);
    } catch (error) {
      console.log('register', error);
      throw error;
    }
  }

  // 修改用户信息
  public async editUserInfo(params) {
    const { app } = this;
    try {
      // return await app.mysql.update(
      //   'user',
      //   {
      //     ...params,
      //   },
      //   { id: params.id }
      // );
      return await app.model.User.update(params, { where: { id: params.id } });
    } catch (error) {
      console.log('editUserInfo', error);
      throw error;
    }
  }
}
