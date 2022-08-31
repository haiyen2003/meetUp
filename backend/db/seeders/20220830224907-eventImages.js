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
     return queryInterface.bulkInsert('EventImages', [
      {
        eventId: 1,
        url: 'www.event1-img1.com',
        preview: true
      },
      {
        eventId: 1,
        url: 'www.event1-img2.com',
        preview: true
      },
      {
        eventId: 2,
        url: 'www.event2-img1.com',
        preview: false
      },
      {
        eventId: 2,
        url: 'www.event2-img2.com',
        preview: true
      },
      {
        eventId: 3,
        url: 'www.event3-img1.com',
        preview: true
      },
      {
        eventId: 4,
        url: 'www.event4-img1.com',
        preview: true
      },
      {
        eventId: 4,
        url: 'www.event4-img2.com',
        preview: true
      },
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
     return queryInterface.bulkDelete('EventImages', {
      url: { [Op.in]: ['www.event4-img2.com', 'www.event4-img1.com','www.event3-img1.com','www.event2-img2.com','www.event2-img1.com','www.event1-img2.com','www.event1-img1.com'] }
     }, {});
  }
};
