const express = require('express');

const { Group, Membership, GroupImage } = require('../../db/models');
const { handleValidationErrors } = require('../../utils/validation');
const { setTokenCookie, restoreUser, requireAuth } = require('../../utils/auth');
const router = express.Router();
const { Op } = require('sequelize');
const membership = require('../../db/models/membership');

//get all Groups

router.get('/', async (req, res, next) => {
    const groups = await Group.findAll({
        include: [
            { model: Membership },
            { model: GroupImage }
        ]
    });
    return res.json(groups);
})

//get all groups by current user (missing numMember)
router.get('/current', restoreUser, async (req, res, next) => {
    const { user } = req;
    if (user) {
        const currentGroups = await Membership.findAll({
            where: { userId: user.id },
            include: {
                model: Group,
                attributes:
                    ['id','organizerId', 'name', 'about', 'type', 'private', 'city', 'state', 'createdAt', 'updatedAt']
            }
        })

        let result = [];
        for (let group of currentGroups) {
            let jsonGroup = group.toJSON();
            const image = await GroupImage.findOne({
                where: {
                    groupId: jsonGroup.groupId
                }
            });
            jsonGroup.Group.previewImage = image.dataValues.url;
            result.push(jsonGroup);
        }
        let resultArr = [];
        result.forEach(a => resultArr.push(a.Group));
        return res.json({
            'Groups': resultArr
        });
    }
})

module.exports = router;
