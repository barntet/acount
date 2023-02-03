import { Application, } from 'egg';
// https://github.com/eggjs/egg-sequelize
// use: app.model.User.

export default (app: Application) => {
  const { STRING, INTEGER, BIGINT } = app.Sequelize;

  const user = app.model.define(
    'user',
    {
      id: { type: INTEGER, primaryKey: true, autoIncrement: true },
      username: STRING(30),
      password: STRING(30),
      signature: STRING(100),
      avatar: STRING(100),
      ctime: BIGINT,
    },
    { freezeTableName: true, timestamps: false, tableName: 'user' }
  );
  return user;
};

export type userInfoType = {
  id: number;
  username: string;
  password: string;
  signature: string;
  avatar: string;
  ctime: number;
} | null | Record<any, any>;
