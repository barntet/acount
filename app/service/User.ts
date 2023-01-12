import { Service } from 'egg';

export default class User extends Service {
  // 通过用户名获取用户信息
  public async getUserByName(username) {
    const { app } = this;
    try {
      return await app.mysql.get('user', { username });
    } catch (error) {
      return error;
    }
  }

  //  注册
  public async register(params) {
    const { app } = this;
    try {
      return await app.mysql.insert('user', params);
    } catch (error) {
      return error;
    }
  }
}
