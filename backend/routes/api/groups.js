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
        .withMessage('Name doesnot exist')
        .isLength({ max: 60 })
        .withMessage('Name must be 60 characters or less'),
    check('about')
        .exists({ checkFalsy: true })
        .withMessage('About doesnot exist')
        .isLength({ min: 50 })
        .withMessage('About must be 50 characters or more'),
    check('type')
        .exists({ checkFalsy: true })
        .withMessage('Type doesnot exist')
        .isIn(['In person', 'Online'])
        .withMessage("Type must be 'Online' or 'In person'"),
    check('private')
        .exists({ checkFalsy: false })
        .withMessage('Private doesnot exist')
        .isBoolean({ loose: true })
        //.isIn([true, false])
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
        .isIn(['Online', 'In person'])
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
    check('endDate')
        .custom((value, { req }) => {
            if (new Date(value) <= new Date(req.body.startDate)) {
                throw new Error('End date is less than start date');
            }
            return true;
        })
        .withMessage("End date is less than start date"),
    handleValidationErrors
];
//get all Groups
router.get('/', async (req, res, next) => {
    const groups = await Group.findAll({
        include: [
            {
                model: User,
                as: 'Organizer'
            }
        ]
    });
    for (let group of groups) {
        const members = await group.getMemberships({
            attributes: [
                [sequelize.fn("COUNT", sequelize.col("id")), "numMembers"]
            ],

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
            if (!image) {
                jsonGroup.Group.previewImage = "no image";
            }
            else { jsonGroup.Group.previewImage = image.dataValues.url }
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
});

// Get all Venues for a group specified by its id
router.get('/:groupId/venues', requireAuth, async (req, res, next) => {
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
    const thisMembership = await Membership.findOne({
        where: { groupId, userId: req.user.id }
    });

    if (!thisMembership) {
        if (thisGroup.organizerId === req.user.id) {
            const thisGroupVenues = await Venue.findAll({
                where: { groupId: thisGroup.id },
                attributes: ['id', 'groupId', 'address', 'city', 'state', 'lat', 'lng']
            })
            res.status(200);
            return res.json({ "Venues": thisGroupVenues });
        }
    } else if (thisMembership.status === 'co-host') {
        const thisGroupVenues = await Venue.findAll({
            where: { groupId: thisGroup.id },
            attributes: ['id', 'groupId', 'address', 'city', 'state', 'lat', 'lng'],
        })
        res.status(200);
        return res.json({ "Venues": thisGroupVenues });
    } else {
        res.status(403);
        return res.json({
            "message": 'Forbidden',
            "statusCode": 403
        })
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
    const thisMembership = await Membership.findOne({
        where: { groupId, userId: req.user.id }
    });

    if (!thisMembership) {
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
        res.status(200);
        return res.json({ Members: thisGroupMembers })
    }

    if (req.user) {
        if (thisGroup.organizerId === req.user.id || thisMembership.status === 'co-host') {
            const thisGroupMembers = await User.findAll({
                attributes: ['id', 'firstName', 'lastName'],
                include: {
                    model: Membership,
                    as: 'Membership',
                    where: {
                        groupId
                    },
                    attributes: ['status'],
                }
            })
            res.status(200)
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
            res.status(200);
            return res.json({ Members: thisGroupMembers })
        }
    }
})

//create a group
router.post('/', requireAuth, validateGroup, async (req, res, next) => {
    let { name, about, type, private, city, state, previewImage } = req.body;

    const organizerId = req.user.id;
    // if (private === 'true') { private = true };
    // if (private === 'false') { private = false }

    let newGroup = await Group.create({
        organizerId,
        name,
        about,
        type,
        private,
        city,
        state,
        //previewImage
    });
    let venue = await Venue.create({
        groupId: newGroup.id,
        address: '901 Jefferson St',
        city: 'San Francisco',
        state: 'CA',
        lat: 90.00,
        lng: 90.00
    })

    if (previewImage) {
        let newImage = await GroupImage.create({
            groupId: newGroup.id,
            preview: true,
            url: previewImage
        })
    }
    //should create a new image in Image table;
    // const newImage = await Membership.create({
    //     userId: organizerId,
    //     groupId: newGroup.id,
    //     status: 'member',
    // })
    res.status(201);
    return res.json(newGroup);
});

//add an image to a group based on the groups id
router.post('/:groupId/images', requireAuth, async (req, res, next) => {
    let { groupId } = req.params;
    const thisUser = req.user;
    const { url, previewImage } = req.body;
    if (previewImage === 'true') { previewImage = true };
    if (previewImage === 'false') { previewImage = false }

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
    if (thisGroup.organizerId === req.user.id) {
        const newImage = await GroupImage.create({
            groupId,
            url,
            preview: previewImage
        })
        return res.json({
            'id': newImage.id,
            'url': newImage.url,
            'preview': newImage.preview
        })
    }
    else {
        res.status(403);
        return res.json({
            "message": 'Forbidden',
            "statusCode": 403
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

    const thisMembership = await Membership.findOne({
        where: { groupId, userId: thisUserId }
    });

    if (!thisMembership) {
        res.status(403);
        return res.json({
            "message": 'Forbidden',
            "statusCode": 403
        })
    }
    if (thisGroup.organizerId === req.user.id || thisMembership.status === 'co-host') {
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
    } else {
        res.status(403);
        return res.json({
            "message": 'Forbidden',
            "statusCode": 403
        })
    }
})

//Create an Event for a Group specified by its Id
router.post('/:groupId/events', requireAuth, validateEvent, async (req, res, next) => {
    let { groupId } = req.params;
    const userId = req.user.id;
    const { venueId, name, type, capacity, price, description, startDate, endDate, previewImage } = req.body;
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
    //need to uncommet this back in
    // const currentStatus = await Membership.findOne({
    //     where: { groupId: groupId, userId: req.user.id }
    // })
    // if (!currentStatus) {
    //     res.status(403);
    //     return res.json({
    //         "message": 'Forbidden - Unauthorized',
    //         "statusCode": 403
    //     })
    // }
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

        const allEvents = await Event.findAll({
            attributes: ['id', 'groupId', 'venueId', 'name', 'description', 'type', 'startDate', 'endDate'],
            include: [
                {
                    model: Group,
                    attributes: ['id', 'name', 'city', 'state'],

                },
                {
                    model: Venue,
                    attributes: ['id', 'city', 'state']
                }
            ],
            where: { id: newEvent.id }
        });

        if (previewImage) {
            let newImage = await EventImage.create({
                eventId: newEvent.id,
                preview: true,
                url: previewImage
            })
        }

        return res.json(allEvents[0]);

        // return res.json({
        //     'id': newEvent.id,
        //     'groupId': newEvent.groupId,
        //     'venueId': newEvent.venueId,
        //     'name': newEvent.name,
        //     'type': newEvent.type,
        //     'capacity': newEvent.capacity,
        //     'price': newEvent.price,
        //     'description': newEvent.description,
        //     'startDate': newEvent.startDate,
        //     'endDate': newEvent.endDate
        // });
    }
})

//Request a Membership for a group based on the group's id

router.post('/:groupId/membership', requireAuth, async (req, res, next) => {
    let { groupId } = req.params;

    const { memberId, status } = req.body;
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

    let currentMembership = await Membership.findOne({
        where: {
            groupId, userId: memberId
        }
    })

    if (currentMembership) {
        if (currentMembership.status === 'pending') {
            const error = new Error("Membership has already been requested");
            error.status = 400;
            res.status(400);
            return res.json({
                'message': error.message,
                'statusCode': error.status
            });
        }
        else if (currentMembership.status === 'member' || currentMembership.status === 'co-host') {
            const error = new Error("User is already a member of the group");
            error.status = 400;
            res.status(400);
            return res.json({
                'message': error.message,
                'statusCode': error.status
            });
        }
    }

    else {
        const userId = req.user.id;
        const newMember = await Membership.create({
            groupId,
            userId: memberId,
            status: 'pending'
        });
        return res.json({
            'groupId': newMember.groupId,
            'memberId': newMember.userId,
            'status': newMember.status
        })
    }
})

//Edit a group based on its Id
router.put('/:groupId', requireAuth, validateGroup, async (req, res, next) => {
    const { groupId } = req.params;
    let { name, about, type, private, city, state } = req.body;
    if (private === 'true') { private = true };
    if (private === 'false') { private = false };
    console.log('GROUP ID FROM BACK END --------', groupId);
    console.log(typeof (+groupId), 'TYPE OF GROUP ID ------')
    const thisGroup = await Group.findByPk(+groupId);
    console.log('THIS GROUP BACKEND ----', thisGroup);

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
        res.status(403);
        return res.json({
            "message": 'Forbidden',
            "statusCode": 403
        })
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

//Change the status of a membership for a group specified by id
router.put('/:groupId/membership', requireAuth, async (req, res, next) => {
    const { groupId } = req.params;
    const { memberId, status } = req.body;
    const { user } = req;
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

    const thisUser = await User.findByPk(memberId);
    if (!thisUser) {
        res.status(400);
        const error = new Error("User couldn't be found");
        error.status = 400;
        return res.json({
            'message': "Validation Error",
            'statusCode': 400,
            "errors": {
                "memberId": "User couldn't be found"
            }
        });
    }

    let thisMembership = await Membership.findOne({
        where: {
            userId: thisUser.id,
            groupId
        }
    });

    if (!thisMembership) {
        res.status(404);
        const error = new Error("Membership between the user and the group does not exits");
        error.status = 404;
        return res.json({
            'message': error.message,
            'statusCode': error.status
        });
    }

    if (status === 'pending') {
        res.status(400);
        const error = new Error("Cannot change a membership status to pending");
        error.status = 400;
        return res.json({
            'message': error.message,
            'statusCode': error.status
        });
    }
    let currentStatus = await Membership.findOne({
        where: { userId: user.id, groupId: groupId }
    });

    if (!currentStatus) {
        res.status(403);
        return res.json({
            "message": 'Forbidden',
            "statusCode": 403
        })
    }
    if (thisGroup.organizerId === user.id) {
        thisMembership.status = status;
        await thisMembership.save();
        return res.json({
            'id': thisMembership.id,
            'groupId': thisMembership.groupId,
            'memberId': thisMembership.userId,
            'status': thisMembership.status
        });
    }
    if (status === 'member') {
        if (thisGroup.organizerId !== user.id || currentStatus.status !== 'co-host') {
            res.status(400);
            const error = new Error("Current User must be the organizer or a co-host to change status");
            error.status = 400;
            return res.json({
                'message': error.message,
                'statusCode': error.status
            });
        }
    } else if (status === 'co-host') {
        if (thisGroup.organizerId !== user.id) {
            res.status(400);
            const error = new Error("Current User must be the organizer or a co-host to change status");
            error.status = 400;
            return res.json({
                'message': error.message,
                'statusCode': error.status
            });
        }
    }
    else {
        thisMembership.status = status;
        await thisMembership.save();
        return res.json(thisMembership);
    }
})

//Delete membership to a group specified by id
router.delete('/:groupId/membership', requireAuth, async (req, res, next) => {
    let { groupId } = req.params;
    let { memberId } = req.body;

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
    const thisUser = await User.findByPk(memberId);
    if (!thisUser) {
        res.status(400);
        const error = new Error("User couldn't be found");
        error.status = 400;
        return res.json({
            'message': "Validation Error",
            'statusCode': error.status,
            'errors': {
                'memberId': "User couldn't be found"
            }
        });
    }
    const thisMembership = await Membership.findOne({
        where: { groupId: groupId, userId: memberId }
    });

    if (!thisMembership) {
        res.status(404);
        const error = new Error("Membership does not exist for this User");
        error.status = 404;
        return res.json({
            'message': error.message,
            'statusCode': error.status
        });
    }
    if (thisUser.id === thisGroup.organizerId || thisUser.id === thisMembership.userId) {
        await thisMembership.destroy();
        res.status(200);
        return res.json({
            'message': 'Successfully deleted membership from group',
            'statusCode': 200
        })
    }
});

//Delete a group
router.delete('/:groupId', requireAuth, async (req, res, next) => {
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
    const thisUser = await User.findByPk(req.user.id);
    if (thisGroup.organizerId !== thisUser.id) {
        res.status(403);
        return res.json({
            "message": 'Forbidden',
            "statusCode": 403
        })
    }
    else {
        await thisGroup.destroy();
        res.status(200);
        return res.json({
            'message': 'Successfully deleted',
            'statusCode': 200
        })
    }
})
module.exports = router;
