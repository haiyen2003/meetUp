'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Membership extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Membership.belongsTo(models.Group, { foreignKey: 'groupId', onDelete: 'CASCADE', hook: true });
      Membership.belongsTo(models.User, { foreignKey: 'userId', as: 'Membership', onDelete: 'CASCADE', hook: true });
    }
  }
  Membership.init({
    // id: {
    //   type: DataTypes.INTEGER,
    //   primaryKey: true
    // },
    userId: { type: DataTypes.INTEGER },
    groupId: { type: DataTypes.INTEGER },
    status: {
      type: DataTypes.ENUM,
      values: ['co-host', 'member', 'pending']
    }
  }, {
    sequelize,
    modelName: 'Membership',
  });
  return Membership;
};
