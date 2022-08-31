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
     return queryInterface.bulkInsert('GroupImages', [
      {
        groupId: 1,
        url: 'www.url1.com',
        preview: true
      },
      {
        groupId: 2,
        url: 'www.url2.com',
        preview: true
      },
      {
        groupId: 3,
        url: 'www.url3.com',
        preview: true
      },
      {
        groupId: 4,
        url: 'www.url4.com',
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
     return queryInterface.bulkDelete('GroupImages', {
       url: { [Op.in]: ['www.url1.com', 'www.url2.com', 'www.url3.com', 'www.url4.com'] }
     }, {});
  }
};
