const Sequelize = require('sequelize');
const db = require('../../config/database');

const OrderModel = db.define('Orders', {
  firstName: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  lastName: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  phoneNumber: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  userId: {
    type: Sequelize.INTEGER,
    allowNull: true,
  },
  eventId: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  isPaid: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
  },
  isCancelled: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
  },
  seatId: {
    type: Sequelize.TEXT('long'),
    allowNull: false,
  },
});

module.exports = OrderModel;
