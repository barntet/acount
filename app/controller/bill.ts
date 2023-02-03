import moment from 'moment';
import { Controller } from 'egg';

type item = {
  date: number;
  type_id: number | string;
  amount: number | string;
  pay_type: number | string;
};

const ParamError = {
  code: 400,
  msg: '参数错误',
  data: false,
};

const InterfaceError = {
  code: 500,
  msg: '接口异常',
  data: false,
};

const PayTypeEnum = {
  Expense: 1,
  Income: 2,
};

const getBalance = (data: [], type: number): number => {
  return data.reduce((total, current: any) => {
    if (current.pay_type === type) {
      total += Number(current.amount);
    }
    return total;
  }, 0);

}

export default class BillController extends Controller {
  public async add() {
    const { ctx, app } = this;
    const {
      amount,
      type_id,
      type_name,
      pay_type,
      date = moment().valueOf(),
      remark = '',
    } = ctx.request.body;

    //  判空
    if (!amount || !type_id || !type_name || !pay_type) {
      ctx.body = ParamError;
      return;
    }
    try {
      const token = ctx.request.header['x-access-token'] as string;
      const decode: any = await app.jwt.verify(token, app.config.jwt.secret);

      await ctx.service.bill.add({
        amount,
        type_id,
        type_name,
        date,
        pay_type,
        remark,
        user_id: decode.id,
      });
      ctx.body = {
        code: 0,
        msg: '添加成功',
        data: true,
      };
    } catch {
      ctx.body = InterfaceError;
    }
  }

  // 列表查询
  public async list() {
    const { ctx, app } = this;
    const { date, type_id } = ctx.query;
    const page: any = Number(ctx.query.page) || 1;
    const page_size: any = Number(ctx.query.page_size) || 10;

    //  判空
    if (!date || !type_id) {
      ctx.body = ParamError;
      return;
    }

    try {
      const token = ctx.request.header['x-access-token'] as string;
      const decode: any = await app.jwt.verify(token, app.config.jwt.secret);
      const formatDate = moment(Number(date)).format('YYYY-MM');

      // 拿到当前用户的数据
      const list = (await ctx.service.bill.list(decode.id)) as [];
      // 过滤数据
      const _list = list.filter((item: item) => {
        if (type_id !== 'all') {
          return (
            moment(item.date).format('YYYY-MM') === formatDate &&
            type_id == item.type_id // 这里typeid传入的是数字，但是接收到的是字符串
          );
        }
        return moment(item.date).format('YYYY-MM') === formatDate
      });

      const listMap = _list
        .reduce((total: any[], current: item) => {
          const dateValue = moment(current.date).format('YYYY-MM-DD');
          if (
            total &&
            total.length &&
            total.findIndex(
              (item: item) =>
                moment(item.date).format('YYYY-MM-DD') === dateValue
            ) > -1
          ) {
            const index = total.findIndex(
              (item: item) =>
                moment(item.date).format('YYYY-MM-DD') === dateValue
            );
            total[index].bills.push(current);
          }

          if (
            total &&
            total.length &&
            total.findIndex(item => (moment(item.date).format('YYYY-MM-DD') === dateValue)) === -1
          ) {
            total.push({ date: current.date, bills: [current] }); // 这里可以格式化时间
          }
          if (!total.length) {
            total.push({
              date: current.date,
              bills: [current],
            });
          }
          return total;
        }, [])
        .sort((a, b) => moment(b.date).valueOf() - moment(a.date).valueOf());
      // 分页处理，listMap 为我们格式化后的全部数据，还未分页。
      const filterListMap = listMap.slice(
        (page - 1) * page_size,
        page * page_size
      );

      listMap.slice((page - 1) * page_size, page * page_size)

      // 计算当月总收入和支出
      // 首先获取当月所有账单列表
      const __list = list.filter(
        (item: item) => moment(item.date).format('YYYY-MM') === formatDate
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
        code: 0,
        msg: '请求成功',
        data: {
          totalExpense, // 当月支出
          totalIncome, // 当月收入
          totalPage: Math.ceil(listMap.length / page_size), // 总分页
          list: filterListMap || [], // 格式化后，并且经过分页处理的数据
        },
      };
    } catch {
      ctx.body = InterfaceError;
    }
  }

  // 账单详情
  public async detail() {
    const { ctx, app } = this;
    const { id = '' } = ctx.query;

    if (!id) {
      ctx.body = ParamError;
      return;
    }
    try {
      const token = ctx.request.header['x-access-token'] as string;
      const decode: any = await app.jwt.verify(token, app.config.jwt.secret);
      const data = await ctx.service.bill.detail(id, decode.id);
      ctx.body = {
        code: 0,
        msg: '请求成功',
        data,
      };
    } catch {
      ctx.body = InterfaceError;
    }
  }

  // 编辑
  public async update() {
    const { ctx, app } = this;
    const {
      id,
      amount,
      type_id,
      type_name,
      pay_type,
      date = moment().valueOf(),
      remark = '',
    } = ctx.request.body;

    // 判空
    if (!amount || !type_id || !type_name || !pay_type || !id) {
      ctx.body = ParamError;
      return;
    }

    try {
      const token = ctx.request.header['x-access-token'] as string;
      const decode: any = await app.jwt.verify(token, app.config.jwt.secret);
      await ctx.service.bill.update({
        id,
        amount,
        type_id,
        type_name,
        date,
        pay_type,
        remark,
        user_id: decode.id,
      });

      ctx.body = {
        code: 0,
        mag: '请求成功',
        data: true,
      };
    } catch {
      ctx.body = InterfaceError;
    }
  }

  // 删除
  public async delete() {
    const { ctx, app } = this;
    const { id } = ctx.request.body;
    if (!id) {
      ctx.body = ParamError;
      return;
    }

    try {
      const token = ctx.request.header['x-access-token'] as string;
      const decode: any = await app.jwt.verify(token, app.config.jwt.secret);
      await ctx.service.bill.delete(id, decode.id);
      ctx.body = {
        code: 0,
        msg: '删除成功',
        data: true,
      };
    } catch {
      ctx.body = InterfaceError;
    }
  }

  // data
  public async data() {
    const { ctx, app } = this;
    const { date } = ctx.query;
    //  判空
    if (!date) {
      ctx.body = ParamError;
      return;
    }

    try {
      const token = ctx.request.header['x-access-token'] as string;
      const decode: any = await app.jwt.verify(token, app.config.jwt.secret);

      const data = await ctx.service.bill.list(decode.id) as [];
      // 根据时间参数，筛选出当月所有的账单数据
      const start = moment(Number(date)).startOf('month').unix() * 1000;
      const end = moment(Number(date)).endOf('month').unix() * 1000;
      const _data = data.filter((item: any) => item.date > start && item.date < end) as []
      // 总支出
      const totalExpense = getBalance(_data, PayTypeEnum.Expense)
      // const totalExpense = _data.reduce((total, current: any) => {
      //   if (current.pay_type === PayTypeEnum.Expense) {
      //     total += Number(current.amount);
      //   }
      //   return total;
      // }, 0);
      // 总收入
      const totalIncome = getBalance(_data, PayTypeEnum.Income)
      // const totalIncome = _data.reduce((total, current: any) => {
      //   if (current.pay_type === PayTypeEnum.Income) {
      //     total += Number(current.amount);
      //   }
      //   return total;
      // }, 0);

      // 获取收支构成
      let total_data = _data.reduce((total: any, current: any) => {
        const index = total.findIndex((item: any) => item.type_id === current.type_id);
        if (index === -1) {
          total.push({
            type_id: current.type_id,
            type_name: current.type_name,
            pay_type: current.pay_type,
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
      console.log(335, total_data)

      ctx.body = {
        code: 0,
        msg: '请求成功',
        data: {
          totalExpense: Number(totalExpense).toFixed(2),
          totalIncome: Number(totalIncome).toFixed(2),
          list: total_data || [],
        },
      };
    } catch {
      ctx.body = InterfaceError;
    }
  }
}
