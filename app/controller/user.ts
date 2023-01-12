import { Controller } from 'egg';

export default class UserController extends Controller {
  public async register() {
    const { ctx } = this;
    const { username, password } = ctx.request.body;
    // 判空
    if (!username || !password) {
      ctx.body = {
        code: 500,
        msg: '账号密码不能为空',
        data: false,
      };
      return;
    }
    // 验证数据库内是否有改用户名
    const userInfo = await ctx.service.user.getUserByName(username);

    // 判断是否已经存在该用户
    if (userInfo) {
      ctx.body = {
        code: 500,
        msg: '账户名已被注册，请重新输入',
        data: false,
      };
      return;
    }
    const result = await ctx.service.user.register({
      username,
      password,
      signature: '开心吗',
      avatar: '1',
      ctime: new Date().valueOf(),
    });
    console.log(result);
    if (result) {
      ctx.body = {
        code: 200,
        msg: '注册成功',
        data: true,
      };
    } else {
      ctx.body = {
        code: 500,
        msg: '注册失败',
        data: false,
      };
    }
  }
}
