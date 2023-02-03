import { Controller } from 'egg';

const InterfaceError = {
  code: 500,
  msg: '接口异常',
  data: false,
};

export default class TypeController extends Controller {
  public async list() {
    const { ctx } = this;

    try {
      // const token = ctx.request.header['x-access-token'] as string;
      // const decode: any = await app.jwt.verify(token, app.config.jwt.secret);

      const list = await ctx.service.type.list() as [];
      ctx.body = {
        code: 0,
        msg: '请求成功',
        data: { list }
      }

    } catch {
      ctx.body = InterfaceError

    }
  }
}