const express = require('express');

const { Group, Membership, User, Venue, GroupImage, sequelize } = require('../../db/models');
const { handleValidationErrors } = require('../../utils/validation');
const { setTokenCookie, restoreUser, requireAuth } = require('../../utils/auth');
const router = express.Router();
const { Op } = require('sequelize');
const membership = require('../../db/models/membership');

//get all Groups
router.get('/', async (req, res, next) => {
    const groups = await Group.findAll();
    for (let group of groups) {
        const members = await group.getMemberships({
            attributes: [
                [sequelize.fn("COUNT", sequelize.col("id")), "numMembers"]
            ]
        });
        group.dataValues.numMembers = members[0].dataValues.numMembers;
        const previewImage = await GroupImage.findOne({
            where: {
                [Op.and]: [
                    { groupId: group.id },
                    { preview: true }
                ]
            }
        });
        if (previewImage) {
            group.dataValues.previewImage = previewImage.dataValues.url
        }
    }
    return res.json({
        'Groups': groups
    });
})


//get all groups by current user (missing numMember - solved)
router.get('/current', restoreUser, async (req, res, next) => {
    const { user } = req;
    if (user) {
        const currentGroups = await Membership.findAll({
            where: { userId: user.id },
            include: {
                model: Group,
                attributes:
                    ['id', 'organizerId', 'name', 'about', 'type', 'private', 'city', 'state', 'createdAt', 'updatedAt']
            }
        });


        let result = [];
        for (let group of currentGroups) {
            let jsonGroup = group.toJSON();
            const image = await GroupImage.findOne({
                where: {
                    groupId: jsonGroup.groupId
                }
            });

            const members = await Membership.findAll({
                where: {
                    groupId: jsonGroup.groupId
                }
            });
            let numMembers = members.length;
            jsonGroup.Group.numMembers = numMembers;
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

//get details of a group from an id (missing numMember);
router.get('/:groupId', async (req, res, next) => {
    let { groupId } = req.params;
    let thisGroup = await Group.findByPk(groupId, {
        include: [
            {
                model: GroupImage,
                attributes: ['id', 'url', 'preview']
            },
            {
                model: User,
                as: 'Organizer',
                attributes: ['id', 'firstName', 'lastName']
            },
            {
                model: Venue,
                attributes: ['id', 'groupId', 'address', 'city', 'state', 'lat', 'lng']
            }
        ]
    });

    if (!thisGroup) {
        const error = new Error("Group couldn't be found");
        error.status = 404;
        return next(error);
    }
    else {
          const members = await thisGroup.getMemberships({
            attributes: [
                [sequelize.fn("COUNT", sequelize.col("id")), "numMembers"]
            ]
        });
        thisGroup.dataValues.numMembers = members[0].dataValues.numMembers;
        return res.json(thisGroup);
    }
})

module.exports = router;
