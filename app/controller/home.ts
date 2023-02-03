import { Controller } from 'egg';

export default class HomeController extends Controller {
  public async index() {
    const { ctx } = this;
    // ctx.body = await ctx.service.test.sayHi('egg');
    // ctx.render默认会去view文件夹下面寻找index.html 这是egg的约定
    await ctx.render('index.html', {
      title: 'barnett',
    });
  }

  // 获取用户信息
  public async user() {
    const { ctx } = this;
    const result = await ctx.service.home.user();
    ctx.body = result;
  }

  // add
  public async add() {
    const { ctx } = this;
    const { title } = ctx.request.body;
    // egg内置了bodyParser中间件， 请求body解析成Object挂载到ctx.request.body
    ctx.body = { title };
  }

  // 添加用户
  public async addUser() {
    const { ctx } = this;
    const { name } = ctx.request.body;
    try {
      await ctx.service.home.addUser(name);
      ctx.body = {
        code: 0,
        msg: '添加成功',
        data: null,
      };
    } catch (error) {
      ctx.body = {
        code: 500,
        msg: '添加失败',
        data: error,
      };
    }
  }

  // 编辑用户
  public async editUser() {
    const { ctx } = this;
    const { id, name } = ctx.request.body;
    try {
      await ctx.service.home.editUser(id, name);
      ctx.body = {
        code: 0,
        msg: '添加成功',
        data: true,
      };
    } catch (error) {
      return error;
    }
  }

  // 删除用户
  public async deleteUser() {
    const { ctx } = this;
    const { id } = ctx.request.body;
    try {
      await ctx.service.home.deleteUser(id);
      ctx.body = {
        code: 0,
        msg: '删除成功',
        data: true,
      };
    } catch (error) {
      ctx.body = {
        code: 500,
        msg: '删除失败',
        data: error,
      };
    }
  }
}
