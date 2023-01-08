'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class movie extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      models.movie.belongsToMany(models.user, {through:'users_movies'})
      models.movie.hasMany(models.comment)
    }
  }
  movie.init({
    title: DataTypes.STRING,
    year: DataTypes.STRING,
    imdbID: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'movie',
  });
  return movie;
};