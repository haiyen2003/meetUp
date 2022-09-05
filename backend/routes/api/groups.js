const express = require('express');

const { Group, Membership, User, Venue, GroupImage, sequelize, Event, EventImage } = require('../../db/models');
const { handleValidationErrors } = require('../../utils/validation');
const { setTokenCookie, restoreUser, requireAuth } = require('../../utils/auth');
const router = express.Router();
const { Op } = require('sequelize');
const { check } = require('express-validator');
const membership = require('../../db/models/membership');
const group = require('../../db/models/group');


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

const validateEvent = [
    check('venueId')
        .exists({ checkFalsy: true })
        .withMessage('Venue does not exist'),
    check('name')
        .isLength({ min: 5 })
        .withMessage('Name must be at least 5 characters'),
    check('type')
        .exists({ checkFalsy: true })
        //  .isIn(['Online', 'In Person', 'online', 'in person', 'In person'])
        .withMessage("Type must be 'Online' or 'In person'"),
    check('capacity')
        .exists({ checkFalsy: true })
        .isInt()
        .withMessage("Capacity must be an integer"),
    check('price')
        .exists({ checkFalsy: true })
        .isDecimal()
        .withMessage("Price is invalid"),
    check('description')
        .exists({ checkFalsy: true })
        .withMessage("Description is required"),
    check('startDate')
        .exists({ checkFalsy: true })
        .isAfter()
        .withMessage("Start date must be in the future"),
    check('endDate').custom((value, { req }) => {
        if (new Date(value) <= new Date(req.body.startDate)) {
            throw new Error('End date is less than start date');
        }
        return true;
    })
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
        res.status(404);
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
        res.status(404);
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
        res.status(404);
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
        res.status(404);
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

//Create an Event for a Group specified by its Id
router.post('/:groupId/events', requireAuth, validateEvent, async (req, res, next) => {
    let { groupId } = req.params;
    const userId = req.user.id;
    const { venueId, name, type, capacity, price, description, startDate, endDate } = req.body;
    const thisGroup = await Group.findByPk(groupId);
    if (!thisGroup) {
        res.status(404);
        const error = new Error("Group couldn't be found");
        error.status = 404;
        return res.json({
            'message': error.message,
            'statusCode': error.status
        });
    }

    const currentStatus = await Membership.findOne({
        where: { groupId, userId }
    })
    if (!currentStatus) {
        throw new Error('Unauthorized');
    }
    if (thisGroup.organizerId === userId || currentStatus.status === 'co-host') {
        let newEvent = await Event.create({
            groupId,
            venueId,
            name,
            type,
            capacity,
            price,
            description,
            startDate,
            endDate
        })

        return res.json({
            'id': newEvent.id,
            'groupId': newEvent.groupId,
            'venueId': newEvent.venueId,
            'name': newEvent.name,
            'type': newEvent.type,
            'capacity': newEvent.capacity,
            'price': newEvent.price,
            'description': newEvent.description,
            'startDate': newEvent.startDate,
            'endDate': newEvent.endDate
        });
    }
})

//Request a Membership for a group based on the group's id

router.post('/:groupId/membership', requireAuth, async (req, res, next) => {
    let { groupId } = req.params;
    const thisGroup = await Group.findByPk(groupId);

    if (!thisGroup) {
        res.status(404);
        const error = new Error("Group couldn't be found");
        error.status = 404;
        return res.json({
            'message': error.message,
            'statusCode': error.status
        });
    }

    const thisGroupIds = await Membership.findAll({
        attributes: ['userId', 'status'],
        where: { groupId }
    })

    let thisGroupArr = [];
    thisGroupIds.forEach(user => {
        thisGroupArr.push([user.dataValues.userId, user.dataValues.status]);
    })

    for (let id of thisGroupArr) {
        if (id[0] === req.user.id) {
            if (id[1] === 'pending') {
                const error = new Error("Membership has already been requested");
                error.status = 400;
                return res.json({
                    'message': error.message,
                    'statusCode': error.status
                });
            }
            else if (id[1] === 'member' || id[1] === 'co-host') {
                const error = new Error("User is already a member of the group");
                error.status = 400;
                return res.json({
                    'message': error.message,
                    'statusCode': error.status
                });
            }
        }
    }
    const userId = req.user.id;
    const newMember = await Membership.create({
        groupId,
        userId,
        status: 'pending'
    });
    return res.json({
        'groupId': newMember.groupId,
        'memberId': newMember.userId,
        'status': newMember.status
    })
})
router.put('/:groupId', requireAuth, validateGroup, async (req, res, next) => {
    const { groupId } = req.params;
    let { name, about, type, private, city, state } = req.body;
    if (private === 'true') { private = true };
    if (private === 'false') { private = false };

    const thisGroup = await Group.findByPk(groupId);
    if (!thisGroup) {
        res.status(404);
        const error = new Error("Group couldn't be found");
        error.status = 404;
        return res.json({
            'message': error.message,
            'statusCode': error.status
        });
    }

    const thisUser = await User.findByPk(req.user.id);
    if (thisGroup.organizerId !== thisUser.id) {
        throw new Error('Unauthorized');
    } else {
        if (name) thisGroup.name = name;
        if (about) thisGroup.about = about;
        if (type) thisGroup.type = type;
        if (private !== undefined) thisGroup.private = private;
        if (city) thisGroup.city = city;
        if (state) thisGroup.state = state;
        await thisGroup.save();
        return res.json(thisGroup);
    }
})
module.exports = router;
