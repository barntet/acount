export default function jwtErr(secret) {
  return async (ctx, next) => {
    const token = ctx.request.header.authorization;
    if (token) {
      try {
        ctx.app.jwt.verify(token, secret);
        await next();
      } catch (error) {
        ctx.status = 200;
        ctx.body = {
          msg: 'token已经过期，请重新登录',
          code: 401,
        };
        return;
      }
    } else {
      ctx.status = 200;
      ctx.body = {
        code: 401,
        msg: 'token不存在',
      };
    }
  };
}
