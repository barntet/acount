import { Application } from 'egg';

export default (app: Application) => {
  const { STRING, INTEGER } = app.Sequelize;

  const bill = app.model.define(
    'bill',
    {
      id: { type: INTEGER, primaryKey: true, autoIncrement: true },
      pay_type: INTEGER,
      amount: INTEGER,
      date: INTEGER,
      type_id: INTEGER,
      type_name: STRING(30),
      user_id: INTEGER,
      remark: STRING(100),
    },
    { freezeTableName: true, timestamps: false, tableName: 'bill' }
  );
  return bill;
};

export type BillType = {
  id: number;
  pay_type: number;
  amount: number;
  date: number;
  type_id: number;
  type_name: string;
  user_id: number;
  remark: string;
};
