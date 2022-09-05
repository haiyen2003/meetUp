const express = require('express');

const { Group, Membership, User, Venue, GroupImage, sequelize, Event, EventImage } = require('../../db/models');
const { handleValidationErrors } = require('../../utils/validation');
const { setTokenCookie, restoreUser, requireAuth } = require('../../utils/auth');
const router = express.Router();
const { Op } = require('sequelize');
const { check } = require('express-validator');
const membership = require('../../db/models/membership');


//Validators:

const validateGroup = [
    check('name')
        .exists({ checkFalsy: true })
        .isLength({ max: 60 })
        .withMessage('Name must be 60 characters or less'),
    check('about')
        .exists({ checkFalsy: true })
        .isLength({ min: 50 })
        .withMessage('About must be 50 characters or more'),
    check('type')
        .exists({ checkFalsy: true })
        .isIn(['Online', 'In Person', 'online', 'in person', 'In person'])
        .withMessage("Type must be 'Online' or 'In Person'"),
    check('private')
        .exists({ checkFalsy: true })
        .isBoolean({ loose: true })
        .withMessage('Private must be a boolean'),
    check('city')
        .exists({ checkFalsy: true })
        .withMessage('City is required'),
    check('state')
        .exists({ checkFalsy: true })
        .withMessage('State is required'),
    handleValidationErrors
];

const validateVenue = [
    check('address')
        .exists({ checkFalsy: true })
        .withMessage('Street address is required'),
    check('city')
        .exists({ checkFalsy: true })
        .withMessage('City is required'),
    check('state')
        .exists({ checkFalsy: true })
        .withMessage('State is required'),
    check('lat')
        .exists({ checkFalsy: true })
        .withMessage('Latitude is required'),
    check('lng')
        .exists({ checkFalsy: true })
        .withMessage('Longtitude is required'),
    handleValidationErrors
]
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
router.get('/current', requireAuth, async (req, res, next) => {
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

//get details of a group from an id (missing numMember - solved);
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
        return res.json({
            'message': error.message,
            'statusCode': error.status
        });
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

//Get all Events of a group specified by its id
router.get('/:groupId/events', async (req, res, next) => {
    const { groupId } = req.params;

    const thisGroup = await Group.findByPk(groupId);
    if (!thisGroup) {
        const error = new Error("Group couldnt be found");
        error.status = 404;
        return res.json({
            'message': error.message,
            'statusCode': error.status
        });
    }
    const thisGroupEvents = await Event.findAll({
        where: { groupId: groupId },
        attributes: ['id', 'groupId', 'venueId', 'name', 'type', 'startDate', 'endDate'],
        include: [
            {
                model: Group,
                attributes: ['id', 'name', 'city', 'state'],

            },
            {
                model: Venue,
                attributes: ['id', 'city', 'state']
            }
        ]
    });

    for (let event of thisGroupEvents) {
        const attendant = await event.getAttendances({
            attributes: [
                [sequelize.fn('COUNT', sequelize.col('id')), 'numAttending']
            ]
        });
        event.dataValues.numAttending = attendant[0].dataValues.numAttending;
        const previewImage = await EventImage.findOne({
            where: {
                [Op.and]: [
                    { eventId: event.id },
                    { preview: true }
                ]
            }
        });
        if (previewImage) {
            event.dataValues.previewImage = previewImage.dataValues.url
        }
    }
    return res.json({
        'Events': thisGroupEvents
    })

})

//get members of a group by Id

router.get('/:groupId/members', async (req, res, next) => {
    const { groupId } = req.params;

    const thisGroup = await Group.findByPk(groupId);
    if (!thisGroup) {
        const error = new Error("Group couldn't be found");
        error.status = 404;
        return res.json({
            'message': error.message,
            'statusCode': error.status
        });
    }

    if (req.user) {
        if (thisGroup.organizerId === req.user.id) {
            const thisGroupMembers = await User.findAll({
                attributes: ['id', 'firstName', 'lastName'],
                include: [{
                    model: Membership,
                    as: 'Membership',
                    where: {
                        groupId
                    },
                    attributes: ['status'],
                }]
            })

            return res.json({ Members: thisGroupMembers })
        }
        else {
            const thisGroupMembers = await User.findAll({
                attributes: ['id', 'firstName', 'lastName'],
                include: {
                    model: Membership,
                    as: 'Membership',
                    where: {
                        groupId,
                        status: {
                            [Op.notIn]: ['pending'],
                        }
                    },
                    attributes: ['status']
                }
            });
            return res.json({ Members: thisGroupMembers })
        }
    }
})

//create a group
router.post('/', requireAuth, validateGroup, async (req, res, next) => {
    let { name, about, type, private, city, state } = req.body;

    const organizerId = req.user.id;
    if (private === 'true') { private = true };
    if (private === 'false') { private = false }

    let newGroup = await Group.create({
        organizerId,
        name,
        about,
        type,
        private,
        city,
        state
    });

    const newMembership = await Membership.create({
        userId: organizerId,
        groupId: newGroup.id,
        status: 'member',
    })

    return res.json(newGroup);
});

//add an image to a group based on the groups id
router.post('/:groupId/images', requireAuth, async (req, res, next) => {
    let { groupId } = req.params;
    const thisUser = req.user;
    const { url, preview } = req.body;
    if (preview === 'true') { preview = true };
    if (preview === 'false') { preview = false }

    const thisGroup = await Group.findByPk(groupId);
    if (!thisGroup) {
        const error = new Error("Group couldn't be found");
        error.status = 404;
        return res.json({
            'message': error.message,
            'statusCode': error.status
        });
    }
    if (thisGroup.organizerId === thisUser.id) {
        const newImage = await GroupImage.create({
            groupId,
            url,
            preview
        });
        return res.json({
            'id': newImage.id,
            'url': newImage.url,
            'preview': newImage.preview
        })
    }
})

//Create a new venue for a group specified by its id
router.post('/:groupId/venues', requireAuth, validateVenue, async (req, res, next) => {
    let { groupId } = req.params;
    const thisUserId = req.user.id;
    const { address, city, state, lat, lng } = req.body;

    const thisGroup = await Group.findByPk(groupId);
    if (!thisGroup) {
        const error = new Error("Group couldn't be found");
        error.status = 404;
        return res.json({
            'message': error.message,
            'statusCode': error.status
        });
    }

    let newVenue = await Venue.create({
        groupId,
        address,
        city,
        state,
        lat,
        lng
    })

    return res.json({
        'id': newVenue.id,
        'groupId': newVenue.groupId,
        'address': newVenue.address,
        'city': newVenue.city,
        'state': newVenue.state,
        'lat': newVenue.lat,
        'lng': newVenue.lng
    });
})

module.exports = router;
