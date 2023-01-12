'use strict';
import { Service } from 'egg';

export default class Home extends Service {
  public async user() {
    /**
    // 假设从数据库取来的信息
    // return {
    //   name: '帽子',
    //   slogen: '今天开心吗',
    // };
    */
    const { app } = this;
    const QUERY_SRR = 'id, name';
    const sql = `select ${QUERY_SRR} from list`; // 获取id的sql语句
    try {
      const result = await app.mysql.query(sql); // mysql实例已经挂在app对象上，可通过app.mysql获取到
      return result;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  // 新增
  public async addUser(name) {
    const { app } = this;
    try {
      const result = await app.mysql.insert('list', { name }); // 给list表，新增一条数据
      return result;
    } catch (error) {
      return error;
    }
  }

  // 编辑
  public async editUser(id, name) {
    const { app } = this;
    try {
      const result = await app.mysql.update(
        'list',
        { name },
        {
          where: {
            id,
          },
        }
      );

      return result;
    } catch (error) {
      return error;
    }
  }

  // 删除
  public async deleteUser(id) {
    const { app } = this;
    try {
      return await app.mysql.delete('list', { id });
    } catch (error) {
      return error;
    }
  }
}
