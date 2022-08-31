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
    return queryInterface.bulkInsert('Groups', [
      {
        organizerId: 1,
        name: 'Book Lovers',
        about: 'Anyone who loves books',
        type: 'In person',
        private: false,
        city: 'Oakland',
        state: 'CA'
      },
      {
        organizerId: 2,
        name: 'Hiking the Bay',
        about: 'Checking out beautiful hikes in the Bay Area',
        type: 'In person',
        private: true,
        city: 'San Francisco',
        state: 'CA'
      },
      {
        organizerId: 3,
        name: 'Comic-Con',
        about: 'Everything about Comic-Con',
        type: 'In person',
        private: false,
        city: 'San Diego',
        state: 'CA'
      },
      {
        organizerId: 1,
        name: 'App Academy students',
        about: 'A network for App Academy Students and Instructors',
        type: 'In person',
        private: true,
        city: 'New York',
        state: 'NY'
      }
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
    return queryInterface.bulkDelete('Groups', {
      name: { [Op.in]: ['Book Lovers', 'Hiking the Bay', 'Comic-Con', 'App Academy students'] }
    }, {});
  }
};
