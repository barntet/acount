import moment from 'moment';
import { Controller } from 'egg';

type decodeType = {
  id: number;
  username: string;
  exp: number;
  iat: number;
};

type item = {
  date: number | string;
  type_id: number | string;
  amount: number | string;
  pay_type: number | string
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

  // 列表查询
  public async list() {
    const { ctx, app } = this;
    const { date, type_id = 'all' } = ctx.query;
    const page: any = ctx.query.page || 1;
    const page_size: any = ctx.query.page || 5;

    try {
      const token = ctx.request.header.authorization as string;
      const decode = await app.jwt.verify(token, app.config.jwt.secret) as decodeType | string;
      if (!(decode && typeof decode === 'object')) {
        ctx.body = {
          code: 500,
          msg: '接口异常',
          data: false,
        };
        return;
      }
      // 拿到当前用户的数据
      const list = await ctx.service.bill.list(decode.id) as [];

      // 过滤数据
      const _list = list.filter((item: item) => {
        if (type_id !== 'all') {
          return (
            moment(Number(item.date)).format('YYYY-MM') === date &&
            type_id === item.type_id
          );
        }
        return [];
      });
      const listMap = _list
        .reduce((total: any[], current: item) => {
          const date = moment(Number(current.date)).format('YYYY-MM-DD');
          if (
            total &&
            total.length &&
            total.findIndex((item: item) => item.date === date) > -1
          ) {
            const index = total.findIndex((item: item) => item.date === date);
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
        .sort((a, b) => {
          if ((typeof b.date === 'number' && typeof a.date === 'number')) {
            return moment(Number(b.date)).valueOf() - moment(Number(a.date)).valueOf();
          }
          return 0;
        });
      // 分页处理，listMap 为我们格式化后的全部数据，还未分页。
      const filterListMap = listMap.slice(
        (page - 1) * page_size,
        page * page_size,
      );

      // 计算当月总收入和支出
      // 首先获取当月所有账单列表
      const __list = list.filter(
        (item: item) => moment(Number(item.date)).format('YYYY-MM') === date,
      );
      // 累加计算支出
      const totalExpense = __list.reduce((curr, item: item) => {
        if (item.pay_type === 1) {
          curr += Number(item.amount);
          return curr;
        }
        return curr;
      }, 0);
      // 累加计算收入
      const totalIncome = __list.reduce((curr, item: item) => {
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
    } catch {
      ctx.body = {
        code: 500,
        msg: '接口异常',
        data: false,
      };
    }
  }

  // 账单详情
  public async detail() {
    const { ctx, app } = this;
    const { id = '' } = ctx.query;
    if (!id) {
      ctx.body = {
        code: 401,
        msg: '订单id不能为空',
        data: false,
      };
      return;
    }
    const token = ctx.request.header.authorization as string;
    const decode = await app.jwt.verify(token, app.config.jwt.secret) as decodeType | string;
    if (!(decode && typeof decode === 'object')) {
      ctx.body = {
        code: 500,
        msg: '接口异常',
        data: false,
      };
      return;
    }

    try {
      const data = await ctx.service.bill.detail(id, decode.id);
      ctx.body = {
        code: 200,
        msg: '请求成功',
        data,
      };
    } catch { ctx.body = { code: 500, msg: '接口异常', data: false }; }
  }

  // 编辑
  public async update() {
    const { ctx, app } = this;
    const { id, amount, type_id, type_name, date, pay_type, remark = '' } = ctx.request.body;
    if (!amount || !type_id || !type_name || !pay_type) {
      ctx.body = {
        code: 400,
        msg: '参数错误',
        data: false,
      };
      return;
    }

    try {
      const token = ctx.request.header.authorization as string;
      const decode = await app.jwt.verify(token, app.config.jwt.secret) as decodeType | string;
      if (!(decode && typeof decode === 'object')) {
        ctx.body = {
          code: 500,
          msg: '接口异常',
          data: false,
        };
        return;
      }
      await ctx.service.bill.update({
        id,
        amount,
        type_id,
        type_name,
        date: date || moment().format('YYYY-MM-DD HH:mm:ss'),
        pay_type,
        remark,
        user_id: decode.id,
      });

      ctx.body = {
        code: 200,
        mag: '请求成功',
        data: true,
      };
    } catch {
      ctx.body = {
        code: 500,
        msg: '接口异常',
        data: false,
      };
    }
  }

  // 删除
  public async delete() {
    const { ctx, app } = this;
    const { id } = ctx.request.body;
    if (!id) {
      ctx.body = {
        code: 400,
        msg: '参数错误',
        data: false,
      };
      return;
    }

    try {
      const token = ctx.request.header.authorization as string;
      const decode = await app.jwt.verify(token, app.config.jwt.secret) as decodeType | string;
      if (!(decode && typeof decode === 'object')) {
        ctx.body = {
          code: 500,
          msg: '接口异常',
          data: false,
        };
        return;
      }
      await ctx.service.bill.delete(id, decode.id);
      ctx.body = {
        code: 200,
        msg: '删除成功',
        data: true,
      };
    } catch {
      ctx.body = {
        code: 500,
        msg: '接口异常',
        data: false,
      };
    }
  }

  // data
  public async data() {
    const { ctx, app } = this;
    const { date = '' } = ctx.query;
    const token = ctx.request.header.authorization as string;
    const decode = await app.jwt.verify(token, app.config.jwt.secret) as decodeType | string;
    if (!(decode && typeof decode === 'object')) {
      ctx.body = {
        code: 500,
        msg: '接口异常',
        data: false,
      };
      return;
    }
    try {
      const result: any = await ctx.service.bill.list(decode.id);
      // 根据时间参数，筛选出当月所有的账单数据
      const start = moment(date).startOf('month').unix() * 1000;
      const end = moment(date).endOf('month').unix() * 1000;
      const _data = result.filter(item => (Number(item.date) > start && Number(item.date) < end));
      // 总支出
      const total_expense = _data.reduce((total, current) => {
        if (current.pay_type === 1) {
          total += Number(current.amount);
        }
        return total;
      }, 0);
      // 总收入
      const total_income = _data.reduce((total, current) => {
        if (current.pay_type === 2) {
          total + Number(current.amount);
        }
        return total;
      }, 0);

      // 获取收支构成
      let total_data = _data.reduce((total, current) => {
        const index = total.findIndex(item => item.type_id === current.type_id);
        if (index === -1) {
          total.push({
            type_id: current.type_id,
            type_name: current.type_name,
            pay_type: current.type_pay,
            number: Number(current.amount),
          });
        }
        if (index > -1) {
          total[index].number += Number(current.amount);
        }
        return total;
      }, []);
      total_data = total_data.map(item => {
        item.number = Number(Number(item.number).toFixed(2));
        return item;
      });

      ctx.body = {
        code: 200,
        msg: '请求成功',
        data: {
          total_expense: Number(total_expense).toFixed(2),
          total_income: Number(total_income).toFixed(2),
          total_data: total_data || [],
        },
      };

    } catch {
      ctx.body = {
        code: 500,
        msg: '接口异常',
        data: false,
      };
    }
  }
}
