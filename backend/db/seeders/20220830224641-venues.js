'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
    return queryInterface.bulkInsert('Venues', [
      {
        groupId: 1,
        address: '901 Jefferson',
        city: 'Oakland',
        state: 'CA',
        lat: 12.3,
        lng: 111.5
      },
      {
        groupId: 2,
        address: '999 Muir Wood Dr',
        city: 'Oakland',
        state: 'CA',
        lat: 120.3,
        lng: 278.5
      },
      {
        groupId: 3,
        address: '111 W Harbor Dr',
        city: 'San Diego',
        state: 'CA',
        lat: 234.3,
        lng: 111.5
      },
      {
        groupId: 4,
        address: '90 5th St',
        city: 'New York',
        state: 'NY',
        lat: 190.6,
        lng: 781.5
      },
    ], {});
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
     const Op = Sequelize.Op;
     return queryInterface.bulkDelete('Venues', {
       address: { [Op.in]: ['901 Jefferson', '999 Muir Wood Dr', '111 W Harbor Dr', '90 5th St'] }
     }, {});
  }
};
