import { Service } from 'egg';

export default class TypeService extends Service {
  public async list() {
    const { app } = this;

    try {
      return await app.model.Type.findAll({
        attributes: [
          'id',
          'name',
          'type',
          'user_id'
        ]
      })
    } catch (error) {
      console.log('type-list', error);
      throw error
    }
  }
}