import { Application } from 'egg';

export default function ModelUser(app: Application) {
  const { STRING, INTEGER, DATE } = app.Sequelize;

  const user = app.model.define('user', {
    id: { type: INTEGER, primaryKey: true, autoIncrement: true },
    username: STRING(30),
    password: STRING(30),
    signature: STRING(100),
    avatar: STRING(100),
    ctime: DATE,
  }, { freezeTableName: true, timestamps: false, tableName: 'user' });
  return user;
}
