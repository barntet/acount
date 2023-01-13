import { Service } from 'egg';

export default class BillService extends Service {
  public async add(params) {
    const { app } = this;
    try {
      return await app.mysql.insert('bill', params);
    } catch (error) {
      return error;
    }
  }
}
