// backend/routes/api/users.js
const express = require('express');
const { setTokenCookie, requireAuth } = require('../../utils/auth');
const { User } = require('../../db/models');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const router = express.Router();

const validateSignup = [
  check('email')
    .exists({ checkFalsy: true })
    .isEmail()
    .withMessage('Please provide a valid email.'),
  check('username')
    .exists({ checkFalsy: true })
    .isLength({ min: 4 })
    .withMessage('Please provide a username with at least 4 characters.'),
  check('username')
    .not()
    .isEmail()
    .withMessage('Username cannot be an email.'),
  check('password')
    .exists({ checkFalsy: true })
    .isLength({ min: 6 })
    .withMessage('Password must be 6 characters or more.'),

  //Validate Sign-Up with firstName and lastName
  check('firstName')
    .exists({ checkFalsy: true })
    .withMessage('First Name is required.'),
  check('lastName')
    .exists({ checkFalsy: true })
    .withMessage('Last Name is required.'),
  handleValidationErrors
];
// Sign up
router.post(
  '/',
  validateSignup,
  async (req, res) => {
    const { firstName, lastName, email, password, username } = req.body;

    const checkUsername = await User.findOne({ where: { username: username } });
    if (checkUsername) {
      const err = new Error('User already exists');
      err.status = 403;
      err.title = 'Login failed';
      err.errors = ['User with that username already exists'];
      return next(err);
    };

    const checkUserEmail = await User.findOne({ where: { email: email } });
    if (checkUserEmail) {
      const err = new Error('Email already exists');
      err.status = 403;
      err.title = 'Login failed';
      err.errors = ['User with that email already exists'];
      return next(err);
    }
    //   const user = await User.signup({ firstName, lastName, email, username, password });

    // const tokenCookie = await setTokenCookie(res, user);
    // const info = user.toSafeObject();
    // info.tokenCookie = tokenCookie;
    // return res.json({
    //   info
    // });

  const user = await User.signup({ firstName, lastName, email, username, password });

  const token = await setTokenCookie(res, user);
  user.token = token;
  return res.json({
    'id': user.id,
    'firstName': user.firstName,
    'lastName': user.lastName,
    'email': user.email,
    'token': user.token
  });
  }
);


module.exports = router;
