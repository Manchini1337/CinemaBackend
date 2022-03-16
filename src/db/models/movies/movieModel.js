const Sequelize = require('sequelize');
const db = require('../../config/database');

const MovieModel = db.define('Movies', {
  name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  description: {
    type: Sequelize.TEXT('long'),
    allowNull: false,
  },
  trailerUrl: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  genreId: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  poster: {
    type: Sequelize.TEXT('long'),
    allowNull: false,
  },
  background: {
    type: Sequelize.TEXT('long'),
    allowNull: false,
  },
});

module.exports = MovieModel;
