'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    const { INTEGER, STRING, BIGINT } = Sequelize;
    await queryInterface.createTable('bill', {
      id: { type: INTEGER, primaryKey: true, autoIncrement: true },
      pay_type: INTEGER,
      amount: INTEGER,
      date: BIGINT,
      type_id: INTEGER,
      type_name: STRING(30),
      user_id: INTEGER,
      remark: STRING(100),
    });
  },

  async down(queryInterface) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.dropTable('bill');
  },
};
