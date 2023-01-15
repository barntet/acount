import { Controller } from 'egg';

type userInfoType = {
  id: number;
  username: string;
  signature: string;
  avatar: string;
};

type decodeType = {
  id: number;
  username: string;
  exp: number;
  iat: number;
};
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
    const result: any = await ctx.service.user.register({
      username,
      password,
      signature: '开心吗',
      avatar: '1',
      ctime: new Date().valueOf(),
    });
    console.log(12344, result);
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

  public async login() {
    // app为全局属性，相当于所有插件方法都植入到app对象
    const { ctx, app } = this;
    // const app: any = this.app;
    const { username, password } = ctx.request.body;
    // 根据用户名到数据库查找相应id的的信息
    const userInfo: any = await ctx.service.user.getUserByName(username);
      console.log(1212, userInfo)
    // 没找到说明没有该用户
    if (!userInfo || !userInfo?.id) {
      ctx.body = {
        code: 500,
        msg: '账号不存在',
        data: false,
      };
      return;
    }

    // 找到用户，并且判断密码是否正确
    if (userInfo && password !== userInfo.password) {
      ctx.body = {
        code: 500,
        msg: '密码错误',
        data: null,
      };
      return;
    }
    // 生成token加密, app.jwt.sign() 方法接收两个参数，第一个参数是对象，对象内是需要加密的内容，第二个参数是加密字符串，
    const token = app.jwt.sign(
      {
        id: userInfo.id,
        username: userInfo.username,
        exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
      },
      app.config.jwt.secret,
    );
    ctx.body = {
      code: 200,
      msg: '登录成功',
      data: { token },
    };
  }

  // 获取用户信息
  public async getUserInfo() {
    const { ctx, app } = this;
    const token = (ctx.request.header.authorization as string) || '';
    const decode = (await app.jwt.verify(token, app.config.jwt.secret)) as
      | decodeType
      | string;
    const isDecode = decode && typeof decode === 'object';
    const userInfo: userInfoType | null = isDecode
      ? ((await ctx.service.user.getUserByName(
        decode.username,
      )) as userInfoType)
      : null;
    if (!userInfo || !isDecode) {
      ctx.body = {
        code: 500,
        msg: '用户信息不存在',
        data: null,
      };
      return;
    }

    ctx.body = {
      code: 200,
      msg: 'success',
      data: {
        id: userInfo.id,
        username: userInfo.username,
        signature: userInfo.signature || '',
        avatar: userInfo.avatar,
      },
    };
    return;
  }

  //  修改个性签名
  public async editUserInfo() {
    const { ctx, app } = this;
    const { signature = '', avatar = '' } = ctx.request.body;
    try {
      const token = ctx.request.header.authorization as string;
      const decode = (await app.jwt.verify(token, app.config.jwt.secret)) as
        | decodeType
        | string;
      const isDecode = decode && typeof decode === 'object';
      const userInfo: userInfoType | null = isDecode
        ? ((await ctx.service.user.getUserByName(
          decode.username,
        )) as userInfoType)
        : null;
      if (!userInfo || !isDecode) {
        ctx.body = {
          code: 500,
          msg: '用户信息不存在',
          data: null,
        };
        return;
      }
      await ctx.service.user.editUserInfo({
        ...userInfo,
        signature,
        avatar,
      });
      ctx.body = {
        code: 200,
        msg: '请求成功',
        data: {
          id: decode.id,
          username: userInfo.username,
          signature,
          avatar,
        },
      };
    } catch (error) {
      return error;
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
