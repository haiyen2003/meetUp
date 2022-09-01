// backend/routes/api/session.js
const express = require('express')
const router = express.Router();
const { setTokenCookie, restoreUser } = require('../../utils/auth');
const { User } = require('../../db/models');

const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const validateLogin = [
  check('credential')
    .exists({ checkFalsy: true })
    .notEmpty()
    .withMessage('Please provide a valid email or username.'),
  check('password')
    .exists({ checkFalsy: true })
    .withMessage('Please provide a password.'),
  handleValidationErrors
];

// Log in
router.post(
  '/',
  validateLogin,
  async (req, res, next) => {
    const { credential, password } = req.body;

    if (!credential || !password) {
      res.status(400);
      return res.json({
        "message": "Validation error",
        "statusCode": 400,
        "errors": {
          "email": "Email is required",
          "password": "Password is required"
        }
      })
    }
    const user = await User.login({ credential, password });

    if (!user) {
      // const err = new Error('Login failed');
      // err.status = 401;
      // err.title = 'Login failed';
      // err.errors = ['The provided credentials were invalid.'];
      // return next(err);
      res.status(401);
      return res.json({
        'message': 'Invalid credentials',
        'statusCode': 401
      })
    }

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

// Log out
router.delete(
  '/',
  (_req, res) => {
    res.clearCookie('token');
    return res.json({ message: 'success' });
  }
);

// Restore session user
router.get(
  '/',
  restoreUser,
  async (req, res) => {
    const { user } = req;
    if (user) {
      let userOjb = await User.findOne({
        where: {id: user.id}
      });

     const token = await setTokenCookie(res, userOjb);
     userOjb.token = token;
     return res.json({
       'id': user.id,
       'firstName': user.firstName,
       'lastName': user.lastName,
       'email': user.email
     });
    } else return res.json({});
  }
);

module.exports = router;
