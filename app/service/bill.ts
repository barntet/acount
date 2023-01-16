import { Service } from 'egg';

export default class BillService extends Service {
  public async add(params) {
    const { app } = this;
    try {
      // return await app.mysql.insert('bill', params);
      return await app.model.Bill.create(params);
    } catch (error) {
      console.log('bill-add', error);
      throw error;
    }
  }

  public async list(id) {
    const { app } = this;
    // const QUERY_STR = 'id, pay_type, amount, date, type_id,type_name, remark';
    // const sql = `select ${QUERY_STR} from bill where user_id = ${id}`;
    try {
      // return await app.mysql.query(sql);
      return await app.model.Bill.findAll({
        attributes: [
          'id',
          'pay_type',
          'amount',
          'date',
          'type_id',
          'type_name',
          'remark',
        ],
        where: {
          user_id: [id],
        },
      });
    } catch (error) {
      console.log('bill-list', error);
      throw error;
    }
  }

  public async detail(id, user_id) {
    const { app } = this;
    try {
      // return await app.mysql.get('bill', { id, user_id });
      return await app.model.Bill.findOne({ where: { id, user_id } });
    } catch (error) {
      console.log('bill-detail', error);
      throw error;
    }
  }

  public async update(params) {
    const { app } = this;
    try {
      // const result = await app.mysql.update(
      //   'bill',
      //   {
      //     ...params,
      //   },
      //   {
      //     id: params.id,
      //     user_id: params.user_id,
      //   }
      // );
      // return result;
      return await app.model.Bill.update(params, {
        where: { id: params.id, user_id: params.user_id },
      });
    } catch (error) {
      console.log('bill-update', error);
      throw error;
    }
  }

  public async delete(id, user_id) {
    const { app } = this;
    try {
      // return await app.mysql.delete('bill', { id, user_id });
      return await app.model.Bill.destroy({ where: { id, user_id } });
    } catch (error) {
      console.log('bill-delete', error);
      throw error;
    }
  }
}
