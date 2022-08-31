const express = require('express');

const {Group, Membership, GroupImage} = require('../../db/models');
const { handleValidationErrors } = require('../../utils/validation');
const { setTokenCookie, restoreUser, requireAuth } = require('../../utils/auth');
const router = express.Router();
const { Op } = require('sequelize');
const membership = require('../../db/models/membership');

//get all Groups

router.get('/', async(req, res, next) =>{
    const groups = await Group.findAll({
        include:[
            {model: Membership},
            {model: GroupImage}
        ]
    });
    return res.json(groups);
})







module.exports = router;
