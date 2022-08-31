'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Event extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Event.hasMany(models.EventImage, { foreignKey: 'eventId', onDelete: 'CASCADE', hooks:true });
      Event.hasMany(models.Attendance, { foreignKey: 'eventId', onDelete: 'CASCADE', hooks:true  });
      Event.belongsTo(models.Venue, {foreignKey: 'venueId'});
      Event.belongsTo(models.Group, {foreignKey: 'groupId'});
    }
  }
  Event.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    venueId: {
      type: DataTypes.INTEGER
    },
    groupId: {
      type: DataTypes.INTEGER
    },
    name: {
      type: DataTypes.STRING
    },
    description: {
      type: DataTypes.TEXT
    },
    type: {
      type: DataTypes.ENUM,
      values: ['In person', 'online']
    },
    capacity: {
      type: DataTypes.INTEGER
    },
    price: {
      type: DataTypes.INTEGER
    },
    startDate: {
      type: DataTypes.DATE
    },
    endDate: {
      type: DataTypes.DATE
    }
  }, {
    sequelize,
    modelName: 'Event',
  });
  return Event;
};
