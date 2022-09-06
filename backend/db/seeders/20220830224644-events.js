'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
     return queryInterface.bulkInsert('Events', [
      {
        venueId: 3,
        groupId: 3,
        name: 'Comic Con shenanigans',
        description: 'Events for Comic-con goers',
        type: 'In person',
        capacity: 250,
        price: 15.5,
        startDate: '2022-11-20 16:00:00',
        endDate: '2022-11-20 20:00:00'
      },
      {
        venueId: 1,
        groupId: 1,
        name: 'Book Club',
        description: 'For book lovers in the Bay Area',
        type: 'In person',
        capacity: 25,
        price: 85.5,
        startDate: '2022-10-20 18:00:00',
        endDate: '2022-10-20 20:00:00'
      },
      {
        venueId: 4,
        groupId: 4,
        name: 'a/A Happy Hour',
        description: 'Happy hour for Appacademy student',
        type: 'In person',
        capacity: 50,
        price: 20.3,
        startDate: '2022-9-20 16:00:00',
        endDate: '2022-9-20 19:00:00'
      },
      {
        venueId: 2,
        groupId: 2,
        name: 'Hiking Muir Wood',
        description: 'Hiking Muir Wood meet up',
        type: 'In person',
        capacity: 17,
        price: 0,
        startDate: '2022-12-20 7:00:00',
        endDate: '2022-12-20 11:00:00'
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
     const Op = Sequelize.Op;
     return queryInterface.bulkDelete('Events', {
       name: { [Op.in]: ['Comic Con shenanigans', 'Book Club', 'a/A Happy Hour', 'Hiking Muir Wood'] }
     }, {});
  }
};
