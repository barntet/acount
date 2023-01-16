import { Controller } from 'egg';
import { userInfoType } from '../model/user';

const errorBody = {
  code: 500,
  msg: '接口异常',
  data: false,
};

const voidUserBody = {
  code: 400,
  msg: '账号不存在',
  data: false,
};

const voidUserInfo = (userInfo): boolean => {
  if (!userInfo || !userInfo.id) {
    return true;
  }
  return false;
};

export default class UserController extends Controller {
  public async register() {
    const { ctx } = this;
    const { username, password } = ctx.request.body;
    // 判空
    if (!username || !password) {
      ctx.body = {
        code: 400,
        msg: '账号密码不能为空',
        data: false,
      };
      return;
    }
    try {
      // 验证数据库内是否有改用户名
      const userInfo: userInfoType = await ctx.service.user.getUserByName(
        username
      );

      // 有userInfo且有id
      if (userInfo && userInfo.id) {
        ctx.body = {
          code: 400,
          msg: '账户名已被注册，请重新输入',
          data: false,
        };
        return;
      }

      await ctx.service.user.register({
        username,
        password,
        signature: '开心吗',
        avatar: '1',
        ctime: new Date().valueOf(),
      });
      ctx.body = {
        code: 200,
        msg: '注册成功',
        data: true,
      };
    } catch {
      ctx.body = errorBody;
    }
  }

  public async login() {
    // app为全局属性，相当于所有插件方法都植入到app对象
    const { ctx, app } = this;
    const { username, password } = ctx.request.body;
    // 判空
    if (!username || !password) {
      ctx.body = {
        code: 400,
        msg: '账号密码不能为空',
        data: false,
      };
      return;
    }
    try {
      // 根据用户名到数据库查找相应id的的信息
      const userInfo: userInfoType = await ctx.service.user.getUserByName(
        username
      );

      // 没找到说明没有该用户
      if (!userInfo || voidUserInfo(userInfo)) {
        ctx.body = voidUserBody;
        return;
      }

      // 找到用户，并且判断密码是否正确
      if (password !== userInfo.password) {
        ctx.body = {
          code: 400,
          msg: '密码错误',
          data: false,
        };
        return;
      }
      // 生成token加密, app.jwt.sign() 方法接收两个参数，
      // 第一个参数是对象，对象内是需要加密的内容，
      // 第二个参数是加密字符串，
      const token = app.jwt.sign(
        {
          id: userInfo.id,
          username: userInfo.username,
          exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
        },
        app.config.jwt.secret
      );
      ctx.body = {
        code: 200,
        msg: '登录成功',
        data: { token },
      };
    } catch {
      ctx.body = errorBody;
    }
  }

  // 获取用户信息
  public async getUserInfo() {
    const { ctx, app } = this;
    try {
      const token = ctx.request.header.authorization as string;
      const decode: any = await app.jwt.verify(token, app.config.jwt.secret);
      const userInfo: userInfoType = await ctx.service.user.getUserByName(
        decode.username
      );
      // 没找到说明没有该用户
      if (!userInfo || voidUserInfo(userInfo)) {
        ctx.body = voidUserBody;
        return;
      }

      ctx.body = {
        code: 200,
        msg: '请求成功',
        data: {
          id: userInfo.id,
          username: userInfo.username,
          signature: userInfo.signature || '',
          avatar: userInfo.avatar,
          ctime: userInfo.ctime,
        },
      };
    } catch {
      ctx.body = errorBody;
    }
  }

  //  修改个性签名
  public async editUserInfo() {
    const { ctx, app } = this;
    const { signature = '', avatar = '' } = ctx.request.body;
    try {
      const token = ctx.request.header.authorization as string;
      const decode: any = await app.jwt.verify(token, app.config.jwt.secret);
      const userInfo: userInfoType = await ctx.service.user.getUserByName(
        decode.username
      );
      // 没找到说明没有该用户
      if (!userInfo || voidUserInfo(userInfo)) {
        ctx.body = voidUserBody;
        return;
      }
      const data = {
        id: userInfo.id,
        username: userInfo.username,
        ctime: userInfo.ctime,
        signature,
        avatar,
      };

      await ctx.service.user.editUserInfo(data);
      ctx.body = {
        code: 200,
        msg: '请求成功',
        data,
      };
    } catch {
      ctx.body = errorBody;
    }
  }

  // test get token
  public async test() {
    const { ctx, app } = this;
    const token = ctx.request.header.authorization as string;
    const decode: any = await app.jwt.verify(token, app.config.jwt.secret);
    let data = null;
    if (decode) {
      data = { ...decode };
    }
    ctx.body = {
      code: 200,
      msg: '获取成功',
      data,
    };
  }
}
