// // backend/routes/api/index.js
// const router = require('express').Router();
// const { restoreUser } = require('../../utils/auth.js');
// // backend/routes/api/index.js
// // ...

// router.use(restoreUser);

// router.get(
//   '/restore-user',
//   (req, res) => {
//     return res.json(req.user);
//   }
// );

// router.post('/test', function(req, res) {
//     res.json({ requestBody: req.body });
//   });

//   // ...
//   // backend/routes/api/index.js
// // ...

// // GET /api/set-token-cookie
// const { setTokenCookie } = require('../../utils/auth.js');
// const { User } = require('../../db/models');
// router.get('/set-token-cookie', async (_req, res) => {
//   const user = await User.findOne({
//       where: {
//         username: 'Demo-lition'
//       }
//     });
//   setTokenCookie(res, user);
//   return res.json({ user });
// });

// // ...
// // GET /api/restore-user




// // ...
// const { requireAuth } = require('../../utils/auth.js');
// router.get(
//   '/require-auth',
//   requireAuth,
//   (req, res) => {
//     return res.json(req.user);
//   }
// );
// module.exports = router;

// backend/routes/api/index.js
const router = require("express").Router();
const sessionRouter = require('./session.js');
const usersRouter = require('./users.js');
// const spotRouter = require('./spots.js');
// const reviewRouter = require('./reviews.js');
// const bookingRouter = require('./bookings.js');
// const imageRouter = require('./images.js');
const { restoreUser } = require("../../utils/auth.js");

// Connect restoreUser middleware to the API router
  // If current user session is valid, set req.user to the user in the database
  // If current user session is not valid, set req.user to null
router.use(restoreUser);
router.use('/session', sessionRouter);
router.use('/users', usersRouter);
// router.use('/spots', spotRouter);
// router.use('/bookings', bookingRouter);
// router.use('/reviews', reviewRouter);
// router.use('/images', imageRouter);
router.post('/test', (req, res) => {
  res.json({ requestBody: req.body });
});
module.exports = router;
