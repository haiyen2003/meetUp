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
        url: 'https://st2.depositphotos.com/2444995/5628/i/450/depositphotos_56283159-stock-photo-fish-tacoes-on-wooden-background.jpg',
        preview: true
      },
      {
        eventId: 1,
        url: 'https://images.squarespace-cdn.com/content/v1/52d3fafee4b03c7eaedee15f/c523fb53-2812-4cf3-8ef6-9b8036d04914/after-7576.jpg',
        preview: true
      },
      {
        eventId: 2,
        url: 'https://hips.hearstapps.com/hmg-prod.s3.amazonaws.com/images/pasta-salad-horizontal-jpg-1522265695.jpg',
        preview: false
      },
      {
        eventId: 2,
        url: 'https://media-cldnry.s-nbcnews.com/image/upload/newscms/2020_25/1581912/ribeye-salad-today-061920-tease.jpg',
        preview: true
      },
      {
        eventId: 3,
        url: 'https://media-cldnry.s-nbcnews.com/image/upload/newscms/2020_25/1581912/ribeye-salad-today-061920-tease.jpg',
        preview: true
      },
      {
        eventId: 4,
        url: 'https://media-cldnry.s-nbcnews.com/image/upload/newscms/2020_25/1581912/ribeye-salad-today-061920-tease.jpg',
        preview: true
      },
      {
        eventId: 4,
        url: 'https://i.imgur.com/3dnih4O.jpg',
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
