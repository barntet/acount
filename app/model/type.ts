import { Application } from 'egg';

export default (app: Application) => {
  const { STRING, INTEGER } = app.Sequelize;

  const type = app.model.define(
    'type',
    {
      id: { type: INTEGER, primaryKey: true, autoIncrement: true },
      name: STRING(100),
      type: INTEGER,
      user_id: INTEGER,
    },
    { freezeTableName: true, timestamps: false, tableName: 'type' }
  );
  return type;
};

export type Type = {
  id: number;
  name: string;
  type: number;
  user_id: number;
};
