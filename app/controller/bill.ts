import moment from 'moment';
import { Controller } from 'egg';

type decodeType = {
  id: number;
  username: string;
  exp: number;
  iat: number;
};

export default class BillController extends Controller {
  public async add() {
    const { ctx, app } = this;
    const {
      amount,
      type_id,
      type_name,
      pay_type,
      remark = '',
    } = ctx.request.body;
    if (!amount || !type_id || !type_name || !pay_type) {
      ctx.body = {
        code: 400,
        msg: '参数错误',
        data: null,
      };
      return;
    }
    try {
      const token = ctx.request.header.authorization as string;
      const decode = (await app.jwt.verify(token, app.config.jwt.secret)) as
        | decodeType
        | string;
      if (!(decode && typeof decode === 'object')) {
        ctx.body = {
          code: 500,
          msg: '接口异常',
          data: false,
        };
        return;
      }
      await ctx.service.bill.add({
        amount,
        type_id,
        type_name,
        date: new Date().valueOf(),
        pay_type,
        remark,
        user_id: decode.id,
      });
      ctx.body = {
        code: 200,
        msg: '添加成功',
        data: true,
      };
    } catch (error) {
      return error;
    }
  }

  public async list() {
    const { ctx, app } = this;
    const { date, type_id = 'all' } = ctx.query;
    const page = ctx.query;
    const page_size = ctx.query;

    try {
      const token = ctx.request.header.authorization;
      const decode = await app.jwt.verify(token, app.config.jwt.secret);
      if (!(decode && typeof decode === 'object')) {
        ctx.body = {
          code: 500,
          msg: '接口异常',
          data: false,
        };
        return;
      }
      // 拿到当前用户的数据
      const list = await ctx.service.bill.list(decode.id);

      // 过滤数据
      const _list = list.filter(item => {
        if (type_id !== 'all') {
          return (
            moment(Number(item.date)).format('YYYY-MM') === date &&
            type_id === item.type_id
          );
        }
        return [];
      });
      const listMap = _list
        .reduce((total, current) => {
          const date = moment(Number(current.date)).format('YYYY-MM-DD');
          if (
            total &&
            total.length &&
            total.findIndex(item => item.date === date) > -1
          ) {
            const index = total.findIndex(item => item.date === date);
            total[index].bills.push(current);
          }

          if (
            total &&
            total.length &&
            total.findIndex(item => item.date === date) === -1
          ) {
            total.push({ date, bills: [current] });
          }
          if (!total.length) {
            total.push({
              date,
              bills: [current],
            });
          }
          return total;
        }, [])
        .sort((a, b) => moment(b.date) - moment(a.date));
      // 分页处理，listMap 为我们格式化后的全部数据，还未分页。
      const filterListMap = listMap.slice(
        (page - 1) * page_size,
        page * page_size
      );

      // 计算当月总收入和支出
      // 首先获取当月所有账单列表
      const __list = list.filter(
        item => moment(Number(item.date)).format('YYYY-MM') === date
      );
      // 累加计算支出
      const totalExpense = __list.reduce((curr, item) => {
        if (item.pay_type === 1) {
          curr += Number(item.amount);
          return curr;
        }
        return curr;
      }, 0);
      // 累加计算收入
      const totalIncome = __list.reduce((curr, item) => {
        if (item.pay_type === 2) {
          curr += Number(item.amount);
          return curr;
        }
        return curr;
      }, 0);

      // 返回数据
      ctx.body = {
        code: 200,
        msg: '请求成功',
        data: {
          totalExpense, // 当月支出
          totalIncome, // 当月收入
          totalPage: Math.ceil(listMap.length / page_size), // 总分页
          list: filterListMap || [], // 格式化后，并且经过分页处理的数据
        },
      };
    } catch (error) {
      return error;
    }
  }
}
