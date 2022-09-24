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
        url: 'https://www.eatthis.com/wp-content/uploads/sites/4/2020/06/dining-out.jpg',
        preview: true
      },
      {
        groupId: 2,
        url: 'https://www.eatthis.com/wp-content/uploads/sites/4/2022/08/Friends-out-to-dinner.jpg?quality=82&strip=1',
        preview: true
      },
      {
        groupId: 3,
        url: 'http://foodsafetytrainingcertification.com/wp-content/uploads/2019/08/eating_out_dining_food_illness_food_safety_001_shutterstock_1201677928.jpg',
        preview: true
      },
      {
        groupId: 4,
        url: 'https://mydario.com/wp-content/uploads/2018/04/eating-out.jpg',
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
